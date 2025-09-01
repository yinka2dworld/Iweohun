import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.SECRET_KEY) {
  throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
}


export const uploadToCloudinary = async (file) => {
  if (!file || !file.buffer || !file.mimetype) {
    throw new Error('Invalid file object provided.');
  }

  const bufferStream = new Readable();
  bufferStream.push(file.buffer);
  bufferStream.push(null);

  const resourceType = file.mimetype.startsWith('image') ? 'image' : 'raw';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'iweohun',
        resource_type: resourceType,
        public_id: file.originalname.split('.')[0], // strip extension
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );

    bufferStream.pipe(stream);
  });
};


const extractPublicId = (url) => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname; // e.g., /directories/gallery/252/large_4875d7cc3a057af74dafef6cb66f9d62.jpg
    const withoutExt = path.replace(/\.[^/.]+$/, ''); // remove file extension
    return withoutExt.slice(1); // remove leading slash
  } catch (err) {
    throw new Error('Invalid URL format for extracting public ID.');
  }
};


export const deleteFromCloudinary = async (input) => {
  if (!input) {
    throw new Error('Public ID or URL is required for deletion.');
  }

  const publicId = input.startsWith('http') ? extractPublicId(input) : input;

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      throw new Error(`Failed to delete file with Public ID: ${publicId}. Result: ${result.result}`);
    }

    console.log(`File with Public ID: ${publicId} deleted successfully.`);
    return { success: true, message: `File with Public ID: ${publicId} deleted successfully.` };
  } catch (error) {
    console.error(`Error deleting file with Public ID: ${publicId}`, error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};
