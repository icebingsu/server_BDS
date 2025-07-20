const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Không có ảnh nào được gửi' });

  res.status(200).json({
    message: 'Tải ảnh thành công',
    url: req.file.path,
    public_id: req.file.filename
  });
};

module.exports = {
  upload,
  uploadImage
};
