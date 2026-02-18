const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chatvibe/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
  }
});

// Storage for message images
const messageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chatvibe/messages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
  }
});

// Multer upload middleware
const uploadProfile = multer({ 
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadMessage = multer({ 
  storage: messageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = {
  cloudinary,
  uploadProfile,
  uploadMessage
};
