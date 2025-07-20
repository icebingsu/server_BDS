const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Assuming you have a storage config file

const upload = multer({ storage });

module.exports = upload;
