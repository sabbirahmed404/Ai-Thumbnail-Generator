import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageProcessingInstruction } from "@/types/image-processing";
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

const createPromptTemplate = (props: { addEmoji?: boolean } = {}) => `
You are a professional thumbnail design assistant. Analyze the user's request and generate processing instructions in this exact JSON format:

{
  "base": {
    "size": {
      "width": 1280,
      "height": 720
    },
    "format": "jpg"
  },
  "enhancements": {
    "filters": [],
    "overlays": [
      {
        "type": "text",
        "content": "string (generate an engaging title based on user's request)",
        "position": { 
          "x": 640, 
          "y": 360
        },
        "style": {
          "font": "Arial Bold",
          "size": 48,
          "color": "#FFFFFF",
          "outline": "#000000",
          "outlineWidth": 2,
          "weight": "bold"
        }
      }${props.addEmoji ? `,
      {
        "type": "emoji",
        "content": "string (select ONE mood emoji from: 😑😍😁😃🤨🤔😲😊🔥💩❤️ that best matches the context)",
        "position": {
          "x": "number (choose a value between 100-1180, but NOT between 440-840 to avoid text overlap)",
          "y": "number (choose a value between 100-620, but NOT between 260-460 to avoid text overlap)"
        },
        "style": {
          "size": 180
        }
      }` : ''}
    ]
  }
}

Rules:
1. Always generate at least one text overlay with engaging content based on user's request
2. Position text in the center (x: 640, y: 360)
3. Do not add any filters unless explicitly requested
4. If filters are requested, use these strict limits:
   - Saturation: max 1.1 (10% increase)
   - Brightness: between 0.9 and 1.1 (±10%)
   - Contrast: between 0.9 and 1.1 (±10%)
5. Keep text centered and readable
6. If emoji is requested:
   - Choose ONE mood emoji from: 😑😍😁😃🤨🤔😲😊🔥💩❤️
   - Select the emoji that best matches the context and mood
   - Position it in a random location that doesn't overlap with the text:
     * x: 100-440 or 840-1180 (avoid center 440-840)
     * y: 100-260 or 460-620 (avoid center 260-460)
   - Make it large and visible (size: 180)
7. Only output valid JSON, no additional text

User Request: {USER_INPUT}
Image Metadata: {WIDTH}x{HEIGHT} {FORMAT}
${props.addEmoji ? 'Include Emoji: Yes' : ''}
`;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a retryable error
      if (error.message.includes('503 Service Unavailable') || 
          error.message.includes('overloaded')) {
        console.log(`Attempt ${attempt + 1} failed, retrying in ${initialDelayMs}ms...`);
        await delay(initialDelayMs);
        initialDelayMs *= 2; // Exponential backoff
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

export async function generateImageInstructions(
  imageBuffer: Buffer,
  userInstruction: string,
  metadata: { width: number; height: number; format: string },
  props: { addEmoji?: boolean } = {}
): Promise<ImageProcessingInstruction> {
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = createPromptTemplate(props)
      .replace("{USER_INPUT}", userInstruction)
      .replace("{WIDTH}", metadata.width.toString())
      .replace("{HEIGHT}", metadata.height.toString())
      .replace("{FORMAT}", metadata.format);

    try {
      console.log('Sending prompt to Gemini:', prompt);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Gemini response:', text);
      
      try {
        const jsonResponse = JSON.parse(text);
        // Validate the response structure
        if (!jsonResponse.base || !jsonResponse.enhancements) {
          throw new Error('Invalid response structure');
        }
        return jsonResponse as ImageProcessingInstruction;
      } catch (error: any) {
        console.error('Failed to parse Gemini response:', error);
        console.error('Raw response:', text);
        throw new Error(`Failed to parse Gemini response: ${error?.message || 'Invalid JSON'}`);
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API Error: ${error?.message || 'Unknown error'}`);
    }
  });
} 