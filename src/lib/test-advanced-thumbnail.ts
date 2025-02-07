import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ImageProcessingInstruction } from '@/types/image-processing';

// Sample YouTube-style thumbnail configuration
const thumbnailConfig = {
  "base": {
    "size": {
      "width": 1280,
      "height": 720
    },
    "format": "jpg"
  },
  "background": {
    "gradient": {
      "colors": ["#FF6B6B", "#4ECDC4"],
      "angle": 45
    },
    "opacity": 0.7
  },
  "image": {
    "filters": [
      {
        "type": "contrast",
        "value": 1.2
      },
      {
        "type": "brightness",
        "value": 1.1
      },
      {
        "type": "saturation",
        "value": 1.3
      }
    ]
  },
  "overlays": [
    {
      "type": "text",
      "content": "JAPAN TRAVEL VLOG",
      "position": {
        "x": 640,
        "y": 200
      },
      "style": {
        "font": "Impact",
        "size": 72,
        "color": "#FFFFFF",
        "outline": "#000000",
        "outlineWidth": 4,
        "alignment": "center",
        "shadow": {
          "color": "rgba(0,0,0,0.5)",
          "blur": 10,
          "offsetX": 5,
          "offsetY": 5
        }
      }
    },
    {
      "type": "text",
      "content": "AMAZING PLACES YOU MUST VISIT!",
      "position": {
        "x": 640,
        "y": 300
      },
      "style": {
        "font": "Arial",
        "size": 36,
        "color": "#FFD700",
        "outline": "#000000",
        "outlineWidth": 2,
        "alignment": "center",
        "shadow": {
          "color": "rgba(0,0,0,0.3)",
          "blur": 5,
          "offsetX": 3,
          "offsetY": 3
        }
      }
    }
  ],
  "effects": {
    "vignette": {
      "strength": 0.3
    },
    "noise": {
      "opacity": 0.02
    }
  }
};

async function createAdvancedThumbnail() {
  try {
    console.log('Starting advanced thumbnail creation...');

    // Read the test image
    const inputPath = path.join(process.cwd(), 'Docs', 'Test', 'japan.jpg');
    const outputDir = path.join(process.cwd(), 'public', 'processed');
    const outputPath = path.join(outputDir, 'advanced-thumbnail.jpg');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create canvas with thumbnail dimensions
    const canvas = createCanvas(thumbnailConfig.base.size.width, thumbnailConfig.base.size.height);
    const ctx = canvas.getContext('2d');

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const colors = thumbnailConfig.background.gradient.colors;
    colors.forEach((color, index) => {
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
    
    ctx.globalAlpha = 1 - thumbnailConfig.background.opacity;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    ctx.globalAlpha = 1;

    // Add vignette effect
    const vignetteGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGradient.addColorStop(1, `rgba(0,0,0,${thumbnailConfig.effects.vignette.strength})`);
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text overlays
    for (const overlay of thumbnailConfig.overlays) {
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
          ctx.lineWidth = overlay.style.outlineWidth;
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
    if (thumbnailConfig.effects.noise) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const noise = thumbnailConfig.effects.noise.opacity;

      for (let i = 0; i < data.length; i += 4) {
        const random = (Math.random() - 0.5) * noise * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + random));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + random));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + random));
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // Save the final image
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
    await sharp(buffer)
      .toFormat('jpeg', { quality: 95 })
      .toFile(outputPath);

    console.log('✅ Advanced thumbnail created successfully!');
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
    console.error('❌ Thumbnail creation failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
createAdvancedThumbnail(); 