import { NextRequest, NextResponse } from 'next/server';
import { generateImageInstructions } from '@/lib/image-processing/gemini-service';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Function to clamp a number between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Function to convert Gemini's output to our thumbnail configuration
function convertGeminiToThumbnailConfig(geminiOutput: any) {
  // Enforce filter limits
  const filters = geminiOutput.enhancements.filters?.map((filter: any) => ({
    ...filter,
    value: clamp(
      filter.value,
      0.9,  // min
      1.1   // max (10% increase)
    )
  })) || [];

  // Add padding to text positions
  const overlays = geminiOutput.enhancements.overlays?.map((overlay: any) => ({
    ...overlay,
    position: {
      x: clamp(overlay.position.x, 100, geminiOutput.base.size.width - 100),
      y: clamp(overlay.position.y, 100, geminiOutput.base.size.height - 100)
    },
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
  })) || [];

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
      filters
    },
    overlays,
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

async function createThumbnailFromInstructions(config: any, imageBuffer: Buffer, outputPath: string) {
  // Create canvas with thumbnail dimensions and padding
  const PADDING = 100;
  const canvas = createCanvas(config.base.size.width + PADDING * 2, config.base.size.height + PADDING * 2);
  const ctx = canvas.getContext('2d');

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const colors = config.background.gradient.colors;
  colors.forEach((color: string, index: number) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load and draw the base image with padding
  const image = await loadImage(imageBuffer);
  const aspectRatio = image.width / image.height;
  let drawWidth = config.base.size.width;
  let drawHeight = config.base.size.width / aspectRatio;
  
  if (drawHeight < config.base.size.height) {
    drawHeight = config.base.size.height;
    drawWidth = config.base.size.height * aspectRatio;
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

  // Add text overlays with padding adjustment
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

      // Adjust position for padding
      const adjustedX = overlay.position.x + PADDING;
      const adjustedY = overlay.position.y + PADDING;

      // Draw text outline
      if (overlay.style.outline) {
        ctx.strokeStyle = overlay.style.outline;
        ctx.lineWidth = overlay.style.outlineWidth || 2;
        ctx.strokeText(overlay.content, adjustedX, adjustedY);
      }

      // Draw text
      ctx.fillStyle = overlay.style.color;
      ctx.fillText(overlay.content, adjustedX, adjustedY);

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

  // Apply image filters using Sharp with enforced limits
  let processedBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  let processor = sharp(processedBuffer);

  // Apply filters if any
  if (config.image.filters?.length) {
    for (const filter of config.image.filters) {
      const value = clamp(filter.value, 0.9, 1.1);
      switch (filter.type) {
        case 'contrast':
          processor = processor.modulate({ brightness: value });
          break;
        case 'brightness':
          processor = processor.modulate({ brightness: value });
          break;
        case 'saturation':
          processor = processor.modulate({ saturation: value });
          break;
      }
    }
  }

  // Crop the padding before saving
  processor = processor
    .extract({
      left: PADDING,
      top: PADDING,
      width: config.base.size.width,
      height: config.base.size.height
    });

  // Save the final image
  await processor
    .toFormat('jpeg', { quality: 95 })
    .toFile(outputPath);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const instruction = formData.get('instruction') as string;

    if (!image || !instruction) {
      return NextResponse.json(
        { error: 'Image and instruction are required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();

    // Generate unique filename
    const filename = `thumbnail-${Date.now()}.jpg`;
    const outputDir = path.join(process.cwd(), 'public', 'processed');
    const outputPath = path.join(outputDir, filename);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get processing instructions from Gemini
    const geminiOutput = await generateImageInstructions(
      imageBuffer,
      instruction,
      {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'jpeg'
      }
    );

    // Convert Gemini output to our thumbnail configuration
    const thumbnailConfig = convertGeminiToThumbnailConfig(geminiOutput);

    // Create the thumbnail
    await createThumbnailFromInstructions(thumbnailConfig, imageBuffer, outputPath);

    // Return the URL of the processed image
    return NextResponse.json({
      thumbnailUrl: `/processed/${filename}`,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: fs.statSync(outputPath).size
      }
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 