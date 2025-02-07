import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Validate environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Missing Cloudinary credentials. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env.local'
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

// Helper function to upload buffer to Cloudinary with better error handling
export async function uploadBuffer(buffer: Buffer, folder: string = 'thumbnails'): Promise<string> {
  try {
    // Verify configuration before upload
    const config = cloudinary.config();
    console.log('Cloudinary Config:', {
      cloud_name: config.cloud_name,
      hasApiKey: !!config.api_key,
      hasApiSecret: !!config.api_secret
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          unique_filename: true,
          format: 'jpg',
          transformation: [
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          } else if (!result?.secure_url) {
            reject(new Error('Upload succeeded but no URL returned'));
          } else {
            console.log('Upload successful:', {
              publicId: result.public_id,
              format: result.format,
              size: result.bytes,
              url: result.secure_url
            });
            resolve(result.secure_url);
          }
        }
      );

      // Handle stream errors
      uploadStream.on('error', (error) => {
        console.error('Stream error:', error);
        reject(new Error(`Stream error: ${error.message}`));
      });

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Helper function to delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Delete result:', result);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

export default cloudinary; 