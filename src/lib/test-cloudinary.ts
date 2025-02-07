import { uploadBuffer } from './cloudinary';
import fs from 'fs';
import path from 'path';

async function testCloudinaryUpload() {
  try {
    console.log('Testing Cloudinary integration...');

    // Read test image
    const imagePath = path.join(process.cwd(), 'Docs', 'Test', 'japan.jpg');
    const imageBuffer = fs.readFileSync(imagePath);

    console.log('Uploading test image to Cloudinary...');
    const url = await uploadBuffer(imageBuffer, 'test');

    console.log('✅ Upload successful!');
    console.log('Image URL:', url);
    
    return url;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

// Run the test if this file is being executed directly
if (require.main === module) {
  testCloudinaryUpload();
} 