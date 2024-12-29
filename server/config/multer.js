import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'uploads',
      resource_type: 'auto' // this allows both images and audio files
    },
  });
  const upload = multer({ storage });

  export default upload