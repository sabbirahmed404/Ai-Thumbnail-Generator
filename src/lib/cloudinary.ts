import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Configure Cloudinary using URL
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
  throw new Error('CLOUDINARY_URL is not set in environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log configuration (without sensitive data)
console.log('Cloudinary Configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  configured: !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

// Helper function to upload buffer to Cloudinary
export async function uploadBuffer(buffer: Buffer, folder: string = 'thumbnails'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    );

    uploadStream.end(buffer);
  });
}

// Helper function to delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
} 