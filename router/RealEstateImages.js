const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // Đọc FormData có file

const realEstateImageController = require("../controllers/RealEstateImageController.js");

router.post("/", upload.any(), realEstateImageController.updateImages);
// Đọc nhiều ảnh
router.post("/add", upload.array("images"), realEstateImageController.addImage);

module.exports = router;    
