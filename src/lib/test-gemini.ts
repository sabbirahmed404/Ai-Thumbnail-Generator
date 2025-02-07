import { generateImageInstructions } from './image-processing/gemini-service';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

export async function testGeminiIntegration() {
  try {
    // Verify API key is loaded
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    console.log('API Key loaded:', apiKey.substring(0, 8) + '...');

    // Read test image and instructions
    const imageBuffer = fs.readFileSync(path.join(process.cwd(), 'Docs', 'Test', 'japan.jpg'));
    const instructions = fs.readFileSync(path.join(process.cwd(), 'Docs', 'Test', 'instructions.txt'), 'utf-8');

    // Get image metadata using Sharp
    const metadata = await sharp(imageBuffer).metadata();

    console.log('Image Metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    });

    console.log('\nTest Instructions:', instructions);

    // Generate processing instructions using Gemini
    const result = await generateImageInstructions(
      imageBuffer,
      instructions,
      {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'jpeg'
      }
    );

    console.log('\nGemini Response:');
    console.log(JSON.stringify(result, null, 2));

    // Validate the response structure
    console.log('\nValidation:');
    console.log('✓ Has base settings:', !!result.base);
    console.log('✓ Has size:', !!result.base.size);
    console.log('✓ Has format:', !!result.base.format);
    console.log('✓ Has enhancements:', !!result.enhancements);

    return result;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Only run the test if this file is being executed directly
if (require.main === module) {
  testGeminiIntegration();
} 