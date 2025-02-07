import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ImageProcessingInstruction } from '@/types/image-processing';

// Import Jimp using require
const Jimp = require('jimp');

// Sample JSON output from Gemini (for testing)
const sampleInstructions: ImageProcessingInstruction = {
  "base": {
    "size": {
      "width": 1280,
      "height": 720
    },
    "format": "jpg"
  },
  "enhancements": {
    "filters": [
      {
        "type": "contrast",
        "value": 1.2
      }
    ],
    "overlays": [
      {
        "type": "text",
        "content": "Japan Travel Vlog",
        "position": {
          "x": 50,
          "y": 50
        },
        "style": {
          "font": "Arial",
          "size": 36,
          "color": "#ffffff",
          "outline": "#000000"
        }
      }
    ]
  }
};

async function testImageProcessing() {
  try {
    console.log('Starting image processing test...');

    // Read the test image
    const inputPath = path.join(process.cwd(), 'Docs', 'Test', 'japan.jpg');
    const outputDir = path.join(process.cwd(), 'public', 'processed');
    const outputPath = path.join(outputDir, 'test-output-jimp.jpg');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Start with Sharp processing for basic operations
    console.log('Processing with Sharp...');
    const resizedBuffer = await sharp(inputPath)
      .resize(
        sampleInstructions.base.size.width,
        sampleInstructions.base.size.height,
        {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      )
      .toBuffer();

    // Initialize Jimp
    console.log('Initializing Jimp...');
    const image = await Jimp.read(resizedBuffer);

    // Apply filters if any
    if (sampleInstructions.enhancements.filters?.length) {
      console.log('Applying filters with Jimp...');
      
      for (const filter of sampleInstructions.enhancements.filters) {
        switch (filter.type) {
          case 'contrast':
            image.contrast(filter.value);
            break;
          case 'brightness':
            image.brightness(filter.value - 1); // Jimp uses -1 to 1 range
            break;
          case 'saturation':
            image.color([{ apply: 'saturate', params: [filter.value * 100] }]);
            break;
        }
      }
    }

    // Add text overlays
    if (sampleInstructions.enhancements.overlays?.length) {
      console.log('Adding text overlays with Jimp...');
      
      for (const overlay of sampleInstructions.enhancements.overlays) {
        if (overlay.type === 'text') {
          // Determine font size and load appropriate font
          const fontSize = Math.min(Math.max(overlay.style.size, 24), 72);
          let font;
          try {
            if (fontSize <= 32) {
              font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            } else {
              font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            }

            // Print text
            image.print(
              font,
              overlay.position.x,
              overlay.position.y,
              {
                text: overlay.content,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
              }
            );
          } catch (error) {
            console.warn(`Failed to load font: ${error}. Using fallback...`);
            // Use a fallback font if the preferred one fails
            font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
          }
        }
      }
    }

    // Save the final image
    console.log('Saving final image...');
    await image.writeAsync(outputPath);

    console.log('✅ Image processing test completed!');
    console.log('Output saved to:', outputPath);

    // Get and display final image metadata
    const finalMetadata = await sharp(outputPath).metadata();
    console.log('\nFinal image metadata:', {
      width: finalMetadata.width,
      height: finalMetadata.height,
      format: finalMetadata.format,
      size: fs.statSync(outputPath).size
    });

  } catch (error) {
    console.error('❌ Image processing test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testImageProcessing(); 