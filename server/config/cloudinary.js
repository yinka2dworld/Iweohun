import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});

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



  export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
      throw new Error('Public ID is required for deletion.');
    }
  
    try {
      const result = await cloudinary.uploader.destroy(publicId);
  
      // Check if the deletion was successful
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
  
