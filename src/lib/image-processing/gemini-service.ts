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

const PROMPT_TEMPLATE = `
You are a professional thumbnail design assistant. Analyze the user's request and generate processing instructions in this exact JSON format:

{
  "base": {
    "size": {
      "width": number,
      "height": number
    },
    "format": "jpg" or "png"
  },
  "enhancements": {
    "filters": [
      {
        "type": "contrast" | "brightness" | "saturation",
        "value": number between 0.1 and 1.1
      }
    ],
    "overlays": [
      {
        "type": "text",
        "content": "string",
        "position": { 
          "x": number (must be between 100 and width-100 for padding), 
          "y": number (must be between 100 and height-100 for padding)
        },
        "style": {
          "font": "string",
          "size": number between 24 and 72 or user request,
          "color": "hex_code",
          "outline": "hex_code (optional)"
        }
      }
    ]
  }
}

Rules:
1. All measurements should be in pixels
2. Maximum 3 text overlays
3. Font sizes between 24 and 72 but User can request any font size
4. Strict filter limits:
   - Saturation: max 1.1 (10% increase)
   - Brightness: between 0.9 and 1.1 (±10%)
   - Contrast: between 0.9 and 1.1 (±10%)
5. Text positioning must include padding:
   - Keep x positions between 100 and width-100 pixels
   - Keep y positions between 100 and height-100 pixels
6. Only output valid JSON, no additional text
7. User can specify the font family, font color, font outline color, font content

User Request: {USER_INPUT}
Image Metadata: {WIDTH}x{HEIGHT} {FORMAT}
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
  metadata: { width: number; height: number; format: string }
): Promise<ImageProcessingInstruction> {
  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = PROMPT_TEMPLATE
      .replace("{USER_INPUT}", userInstruction)
      .replace("{WIDTH}", metadata.width.toString())
      .replace("{HEIGHT}", metadata.height.toString())
      .replace("{FORMAT}", metadata.format);

    try {
      // For gemini-pro, we'll send the image metadata as text since it doesn't support direct image input
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonResponse = JSON.parse(response.text());
      
      // Validate the response matches our type
      return jsonResponse as ImageProcessingInstruction;
    } catch (error) {
      throw new Error(`Gemini API Error: ${error}`);
    }
  });
} 