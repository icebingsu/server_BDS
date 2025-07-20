const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Xác định loại media
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    // Loại không hỗ trợ thì từ chối
    if (!isImage && !isVideo) {
      throw new Error('File không được hỗ trợ (chỉ hỗ trợ ảnh và video)');
    }

    return {
      folder: 'real_estates',
      resource_type: 'auto',
    };
  }
});

module.exports = { cloudinary, storage };
