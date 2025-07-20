const { RealEstateImage } = require("../models");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "real_estates",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

exports.updateImages = async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;
    const filesMap = {};

    // Map files theo index
    for (const file of files) {
      const match = file.fieldname.match(/images\[(\d+)\]\[file\]/);
      if (match) {
        const index = match[1];
        filesMap[index] = file;
      }
    }

    const updates = [];
    // Process từng ảnh
    for (let i = 0; i < formData.images.length; i++) {
      const { id, public_id } = formData.images[i];
      const file = filesMap[i];
      if (!file) continue;
      const result = await uploadToCloudinary(file.buffer);
      if (public_id) {
        await cloudinary.uploader.destroy(public_id);
      }
      // Cập nhật DB
      await RealEstateImage.update(
        {
          url: result.secure_url,
          public_id: result.public_id,
        },
        {
          where: { id: parseInt(id, 10) },
        }
      );
      updates.push({
        id: parseInt(id, 10),
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    return res.json({
      success: true,
      message: "Cập nhật ảnh thành công",
      data: updates,
    });
  } catch (err) {
    console.error("❌ Lỗi cập nhật ảnh:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
exports.addImage = async (req, res) => {
  try {
    const { real_estate_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Thiếu file ảnh!" });
    }
    if (!real_estate_id) {
      return res.status(400).json({ message: "Thiếu real_estate_id!" });
    }

    const results = [];

    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer);
      const newImage = await RealEstateImage.create({
        real_estate_id: parseInt(real_estate_id),
        url: result.secure_url,
        public_id: result.public_id,
        created_at: new Date(),
      });
      results.push(newImage);
    }

    return res.status(201).json({
      message: "Thêm ảnh thành công",
      data: results,
    });
  } catch (err) {
    console.error("❌ Lỗi thêm ảnh:", err);
    return res.status(500).json({
      message: "Lỗi server khi thêm ảnh",
      error: err.message,
    });
  }
};

