import { NextRequest, NextResponse } from 'next/server';
import { generateImageInstructions } from '@/lib/image-processing/gemini-service';
import { ImageProcessor } from '@/lib/image-processing/image-processor';
import sharp from 'sharp';

interface ProcessedResult {
  thumbnailUrl: string;
  metadata: {
    width: number | undefined;
    height: number | undefined;
    format: string | undefined;
    size: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ProcessedResult | { error: string }>> {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const instruction = formData.get('instruction') as string | null;

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

    // Process the image
    const imageProcessor = new ImageProcessor();
    const result = await imageProcessor.process(imageBuffer, geminiOutput);

    // Return the Cloudinary URL and metadata
    return NextResponse.json({
      thumbnailUrl: result.url,
      metadata: {
        width: result.metadata.width,
        height: result.metadata.height,
        format: result.metadata.format,
        size: result.metadata.size
      }
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
} 