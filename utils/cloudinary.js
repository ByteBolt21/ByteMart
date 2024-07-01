// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_CLOUD_NAME="dlbosbdnm"
const CLOUDINARY_API_KEY="592494649379364"
const CLOUDINARY_API_SECRET="iqXXWl-Ba21U3vq5EQ5RX4A6ijE"
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary;
