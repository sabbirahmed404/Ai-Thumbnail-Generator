import { uploadBuffer, deleteImage } from './cloudinary';
import fs from 'fs';
import path from 'path';

async function testCloudinaryUpload() {
  try {
    console.log('Starting Cloudinary integration test...');

    // Verify environment variables
    console.log('Checking environment variables...');
    const requiredVars = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing environment variable: ${varName}`);
      }
      console.log(`✓ ${varName} is set`);
    }

    // Read test image
    console.log('\nReading test image...');
    const imagePath = path.join(process.cwd(), 'Docs', 'Test', 'japan.jpg');
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Test image not found at: ${imagePath}`);
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('✓ Test image loaded:', {
      size: `${(imageBuffer.length / 1024).toFixed(2)} KB`,
      path: imagePath
    });

    // Upload to Cloudinary
    console.log('\nUploading to Cloudinary...');
    const url = await uploadBuffer(imageBuffer, 'test');

    console.log('\n✅ Test completed successfully!');
    console.log('Image URL:', url);
    
    return url;
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Run the test if this file is being executed directly
if (require.main === module) {
  testCloudinaryUpload()
    .catch(() => process.exit(1));
} 