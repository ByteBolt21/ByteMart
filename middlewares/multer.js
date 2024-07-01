// middlewares/multer.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Folder name in Cloudinary
    format: async (req, file) => 'jpeg', // Supports promises as well
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Generate a unique ID for each image
  },
});

const parser = multer({ storage: storage });

export default parser;
