import cloudinary from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret:process.env.SECRET_KEY
})


export const uploadToCloudinary = async (file) => {
    if (!file) {
      throw new Error('No file provided for upload.');
    }
  
    try {
      // Extract file details
      const { createReadStream, filename, mimetype } = await file;
  
      // Validate mimetype
      if (!mimetype.startsWith('image') && !mimetype.startsWith('audio')) {
        throw new Error(`Unsupported file type: ${mimetype}. Only images and audio files are allowed.`);
      }
  
      // Extract file extension and original name
      const fileExtension = filename.split('.').pop();
      const originalFileName = filename.replace(`.${fileExtension}`, ''); // Remove extension from the name
  
      // Determine resource type
      const resourceType = mimetype.startsWith('image') ? 'image' : 'raw'; // Audio files fall under 'raw'
  
      // Generate a public ID
      const publicId = originalFileName;
  
      // Upload the file to Cloudinary
      return new Promise((resolve, reject) => {
        const stream = createReadStream();
  
        const cloudinaryStream = cloudinary.uploader.upload_stream(
          {
            folder: 'iweohun',  // Folder name in Cloudinary
            resource_type: resourceType, // Resource type (image or raw)
            public_id: publicId, // File name without extension
          },
          (error, result) => {
            if (error) {
              console.error(`Cloudinary upload error for file ${filename}:`, error);
              return reject(new Error(`Cloudinary upload failed for ${filename}: ${error.message}`));
            }
  
            console.log(`File ${filename} uploaded successfully.`);
            resolve({
              secureUrl: result.secure_url, 
              publicId: result.public_id,
              resourceType: result.resource_type, 
            });
          }
        );
  
        // Pipe the file stream to Cloudinary
        stream.pipe(cloudinaryStream);
      });
    } catch (err) {
      console.error('Error in file upload process:', err);
      throw new Error(`File upload process failed: ${err.message}`);
    }
  };
  

  export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
      throw new Error('Public ID is required for deletion.');
    }
  
    try {
      // Call Cloudinary's destroy method
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
  
