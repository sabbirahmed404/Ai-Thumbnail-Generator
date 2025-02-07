import { generateImageInstructions } from './image-processing/gemini-service';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Function to convert Gemini's output to our thumbnail configuration
function convertGeminiToThumbnailConfig(geminiOutput: any) {
  return {
    base: {
      size: {
        width: 1280,
        height: 720
      },
      format: geminiOutput.base.format
    },
    background: {
      gradient: {
        colors: ["#FF6B6B", "#4ECDC4"],
        angle: 45
      },
      opacity: 0.7
    },
    image: {
      filters: geminiOutput.enhancements.filters || []
    },
    overlays: geminiOutput.enhancements.overlays?.map((overlay: any) => ({
      ...overlay,
      style: {
        ...overlay.style,
        alignment: "center",
        shadow: {
          color: "rgba(0,0,0,0.5)",
          blur: 10,
          offsetX: 5,
          offsetY: 5
        }
      }
    })) || [],
    effects: {
      vignette: {
        strength: 0.3
      },
      noise: {
        opacity: 0.02
      }
    }
  };
}

async function createThumbnailFromInstructions(config: any, inputPath: string, outputPath: string) {
  // Create canvas with thumbnail dimensions
  const canvas = createCanvas(config.base.size.width, config.base.size.height);
  const ctx = canvas.getContext('2d');

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const colors = config.background.gradient.colors;
  colors.forEach((color: string, index: number) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load and draw the base image
  const image = await loadImage(inputPath);
  const aspectRatio = image.width / image.height;
  let drawWidth = canvas.width;
  let drawHeight = canvas.width / aspectRatio;
  
  if (drawHeight < canvas.height) {
    drawHeight = canvas.height;
    drawWidth = canvas.height * aspectRatio;
  }

  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;
  
  ctx.globalAlpha = 1 - config.background.opacity;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.globalAlpha = 1;

  // Add vignette effect
  const vignetteGradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width
  );
  vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
  vignetteGradient.addColorStop(1, `rgba(0,0,0,${config.effects.vignette.strength})`);
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add text overlays
  for (const overlay of config.overlays) {
    if (overlay.type === 'text') {
      // Set font
      ctx.font = `${overlay.style.size}px ${overlay.style.font}`;
      ctx.textAlign = overlay.style.alignment as CanvasTextAlign;
      ctx.textBaseline = 'middle';

      // Add shadow
      if (overlay.style.shadow) {
        ctx.shadowColor = overlay.style.shadow.color;
        ctx.shadowBlur = overlay.style.shadow.blur;
        ctx.shadowOffsetX = overlay.style.shadow.offsetX;
        ctx.shadowOffsetY = overlay.style.shadow.offsetY;
      }

      // Draw text outline
      if (overlay.style.outline) {
        ctx.strokeStyle = overlay.style.outline;
        ctx.lineWidth = overlay.style.outlineWidth || 2;
        ctx.strokeText(overlay.content, overlay.position.x, overlay.position.y);
      }

      // Draw text
      ctx.fillStyle = overlay.style.color;
      ctx.fillText(overlay.content, overlay.position.x, overlay.position.y);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  // Add noise effect
  if (config.effects.noise) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const noise = config.effects.noise.opacity;

    for (let i = 0; i < data.length; i += 4) {
      const random = (Math.random() - 0.5) * noise * 255;
      data[i] = Math.min(255, Math.max(0, data[i] + random));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + random));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + random));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Apply image filters using Sharp
  let imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  let processor = sharp(imageBuffer);

  // Apply filters if any
  if (config.image.filters?.length) {
    for (const filter of config.image.filters) {
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

  // Save the final image
  await processor
    .toFormat('jpeg', { quality: 95 })
    .toFile(outputPath);
}

async function main() {
  try {
    // Get user instructions from command line arguments
    const instructions = process.argv.slice(2).join(' ');
    
    if (!instructions) {
      console.error('❌ Please provide instructions for the thumbnail.');
      console.error('Usage: npm run create-thumbnail "Your instructions here"');
      process.exit(1);
    }

    console.log('Starting thumbnail creation with your instructions...\n');
    console.log('Instructions:', instructions);

    // Use the test image
    const inputPath = path.join(process.cwd(), 'Docs', 'Test', 'japan.jpg');
    const outputDir = path.join(process.cwd(), 'public', 'processed');
    const outputPath = path.join(outputDir, `thumbnail-${Date.now()}.jpg`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log('\nImage metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    });

    console.log('\nSending to Gemini...');

    // Get processing instructions from Gemini
    const geminiOutput = await generateImageInstructions(
      fs.readFileSync(inputPath),
      instructions,
      {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'jpeg'
      }
    );

    console.log('\nGemini suggested these settings:', JSON.stringify(geminiOutput, null, 2));

    // Convert Gemini output to our thumbnail configuration
    const thumbnailConfig = convertGeminiToThumbnailConfig(geminiOutput);

    // Create the thumbnail
    console.log('\nCreating your thumbnail...');
    await createThumbnailFromInstructions(thumbnailConfig, inputPath, outputPath);

    console.log('\n✅ Thumbnail created successfully!');
    console.log('Saved to:', outputPath);

    // Get and display final image metadata
    const finalMetadata = await sharp(outputPath).metadata();
    console.log('\nFinal image metadata:', {
      width: finalMetadata.width,
      height: finalMetadata.height,
      format: finalMetadata.format,
      size: fs.statSync(outputPath).size
    });

  } catch (error) {
    console.error('\n❌ Thumbnail creation failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the program
main(); 