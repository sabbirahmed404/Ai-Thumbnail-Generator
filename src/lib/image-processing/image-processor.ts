import sharp from 'sharp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Jimp = require('jimp');
import { ImageProcessingInstruction, ProcessedImage } from '@/types/image-processing';
import { uploadBuffer } from '../cloudinary';

export class ImageProcessor {
  async process(
    imageBuffer: Buffer,
    instructions: ImageProcessingInstruction
  ): Promise<ProcessedImage> {
    try {
      // Start with Sharp for basic processing
      let processor = sharp(imageBuffer);

      // Apply base settings
      processor = processor.resize(
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

      // Process with Sharp first
      let processedBuffer = await processor.toBuffer();

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
              {
                text: overlay.content,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
              }
            );
          }
        }

        // Convert back to buffer
        processedBuffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG);
      }

      // Get metadata before upload
      const metadata = await sharp(processedBuffer).metadata();

      // Upload to Cloudinary
      const url = await uploadBuffer(processedBuffer);

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
      throw new Error(`Image processing failed: ${error}`);
    }
  }
} 