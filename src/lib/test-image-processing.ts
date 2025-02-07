import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ImageProcessingInstruction } from '@/types/image-processing';

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
    const outputPath = path.join(outputDir, 'test-output.jpg');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Start with Sharp processing
    console.log('Processing with Sharp...');
    let processor = sharp(inputPath)
      .resize(
        sampleInstructions.base.size.width,
        sampleInstructions.base.size.height,
        {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      );

    // Apply filters if any
    if (sampleInstructions.enhancements.filters?.length) {
      console.log('Applying filters...');
      
      for (const filter of sampleInstructions.enhancements.filters) {
        switch (filter.type) {
          case 'contrast':
            processor = processor.modulate({ brightness: filter.value });
            break;
          case 'brightness':
            processor = processor.modulate({ brightness: filter.value });
            break;
          case 'saturation':
            processor = processor.modulate({ saturation: filter.value });
            break;
        }
      }
    }

    // Add text overlays using Sharp's composite
    if (sampleInstructions.enhancements.overlays?.length) {
      console.log('Adding text overlays...');
      
      for (const overlay of sampleInstructions.enhancements.overlays) {
        if (overlay.type === 'text') {
          // Create SVG text
          const svg = `
            <svg width="${sampleInstructions.base.size.width}" height="${sampleInstructions.base.size.height}">
              <style>
                .title { 
                  font-family: Arial; 
                  font-size: ${overlay.style.size}px; 
                  fill: ${overlay.style.color};
                  ${overlay.style.outline ? `stroke: ${overlay.style.outline}; stroke-width: 2;` : ''}
                }
              </style>
              <text 
                x="${overlay.position.x}" 
                y="${overlay.position.y}" 
                class="title"
              >${overlay.content}</text>
            </svg>`;

          // Add text overlay
          processor = processor.composite([
            {
              input: Buffer.from(svg),
              top: 0,
              left: 0
            }
          ]);
        }
      }
    }

    // Save the final image
    await processor
      .toFormat(sampleInstructions.base.format)
      .toFile(outputPath);

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
  }
}

// Run the test
testImageProcessing(); 