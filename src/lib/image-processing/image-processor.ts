import sharp from 'sharp';
import { ImageProcessingInstruction, ProcessedImage } from '@/types/image-processing';
import { uploadBuffer } from '../cloudinary';

// Import Jimp using require since it doesn't support ES modules well
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Jimp = require('jimp');

export class ImageProcessor {
  async process(
    imageBuffer: Buffer,
    instructions: ImageProcessingInstruction
  ): Promise<ProcessedImage> {
    try {
      // Start with Sharp for basic processing
      const processor = sharp(imageBuffer);

      // Apply base settings
      processor.resize(
        instructions.base.size.width,
        instructions.base.size.height,
        {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      );

      // Apply filters if any
      if (instructions.enhancements.filters?.length) {
        for (const filter of instructions.enhancements.filters) {
          switch (filter.type) {
            case 'contrast':
              processor.modulate({ brightness: filter.value });
              break;
            case 'brightness':
              processor.modulate({ brightness: filter.value });
              break;
            case 'saturation':
              processor.modulate({ saturation: filter.value });
              break;
          }
        }
      }

      // Process with Sharp first
      const processedBuffer = await processor.toBuffer();

      // Use Jimp for text overlays if needed
      if (instructions.enhancements.overlays?.length) {
        const jimpImage = await Jimp.read(processedBuffer);

        for (const overlay of instructions.enhancements.overlays) {
          if (overlay.type === 'text') {
            // Load font based on size
            const fontSize = Math.min(Math.max(overlay.style.size, 24), 72);
            const font = await Jimp.loadFont(
              fontSize <= 32 
                ? Jimp.FONT_SANS_32_WHITE 
                : Jimp.FONT_SANS_64_WHITE
            );

            jimpImage.print(
              font,
              overlay.position.x,
              overlay.position.y,
              overlay.content
            );
          }
        }

        // Convert back to buffer
        const finalBuffer = await new Promise<Buffer>((resolve, reject) => {
          jimpImage.getBuffer(Jimp.MIME_PNG, (err: Error | null, buffer: Buffer) => {
            if (err) reject(err);
            else resolve(buffer);
          });
        });
        
        // Upload to Cloudinary with optimizations
        const url = await uploadBuffer(finalBuffer, 'thumbnails');

        // Get metadata for response
        const metadata = await sharp(finalBuffer).metadata();

        return {
          url,
          metadata: {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || '',
            size: metadata.size || 0
          },
          instructions
        };
      }

      // If no text overlays, upload the Sharp-processed buffer directly
      const url = await uploadBuffer(processedBuffer, 'thumbnails');
      const metadata = await sharp(processedBuffer).metadata();

      return {
        url,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || '',
          size: metadata.size || 0
        },
        instructions
      };
    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 