const { RealEstate, RealEstateImage, RealEstateType, RealEstateCategory, sequelize ,Category    } = require('../models');
const { Op, fn, col, where } = require('sequelize');
exports.getAll = async (req, res) => {
  try {
    const estates = await RealEstate.findAll({
      include: [
        { model: RealEstateImage, as: 'images' },
        { model: RealEstateType, as: 'type' },
        { model: Category, as: 'category' },
      ]
    });
    res.json({ message: 'Lấy danh sách BĐS thành công', data: estates });
  } catch (error) {
    console.error('❌ Lỗi getAll:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách BĐS', error: error.message });
  }
};
// Lấy chi tiết 1 BĐS
exports.getOne = async (req, res) => {
  try {
    const estate = await RealEstate.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: RealEstateImage, as: 'images' },
        { model: RealEstateType, as: 'type' },
        { model: Category, as: 'category' } 
      ]
    });
    if (!estate) {
      return res.status(404).json({ message: 'Không tìm thấy BĐS' });
    }

    res.json({ message: 'Lấy chi tiết BĐS thành công', data: estate });
  } catch (error) {
    console.error('❌ Lỗi getOne:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết BĐS', error: error.message });
  }
};
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  const uploadedImages = [];
  const uploadedPublicIds = [];
  const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'real_estates',
          resource_type: 'image',
          use_filename: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(fileBuffer);
    });
  };

  try {
    let estateData = req.body;
    if (typeof estateData === 'string') {
      estateData = JSON.parse(estateData);
    }

    const allowed = [
      'title', 'slug', 'description', 'price', 'discount_price',
      'area', 'bedrooms', 'bathrooms', 'floors', 'direction', 'legal_status',
      'furniture', 'type_id', 'category_id', 'status', 'contact_id', 'address',
      'ward', 'district', 'city', 'posted_at', 'is_favorite', 'latitude',
      'longitude', 'cadastral', 'amenities'
    ];

    const safeData = {};
    for (const k of allowed) {
      if (estateData[k] !== undefined) safeData[k] = estateData[k];
    }
    if (!safeData.slug?.trim()) {
      await t.rollback();
      return res.status(400).json({ message: 'Slug là bắt buộc.' });
    }
    const exists = await RealEstate.findOne({
      where: { slug: safeData.slug },
      transaction: t,
    });

    if (exists) {
      await t.rollback();
      return res.status(400).json({ message: `Slug "${safeData.slug}" đã tồn tại.` });
    }
    const newEstate = await RealEstate.create(safeData, { transaction: t });

    // ✅ Upload ảnh nếu có
    if (req.files?.length) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer);

          uploadedPublicIds.push(result.public_id);
          uploadedImages.push({
            real_estate_id: newEstate.id,
            url: result.secure_url,
            public_id: result.public_id,
            created_at: new Date(),
          });

          console.log('📸 Uploaded:', result.public_id);
        } catch (err) {
          console.error('⚠️ Lỗi upload ảnh:', err);
        }
      }
      if (uploadedImages.length) {
        try {
          await RealEstateImage.bulkCreate(uploadedImages, { transaction: t });
        } catch (imgErr) {
          await Promise.allSettled(
            uploadedPublicIds.map((pid) => cloudinary.uploader.destroy(pid))
          );
          await t.rollback();
          return res.status(500).json({
            message: 'Tạo BĐS thành công nhưng lỗi lưu ảnh.',
            error: imgErr.message,
          });
        }
      }
    }
    await t.commit();
    return res.status(201).json({
      message: 'Tạo BĐS thành công',
      data: newEstate,
    });
  } catch (err) {
    try {
      await t.rollback();
    } catch {}
    if (uploadedPublicIds.length) {
      await Promise.allSettled(
        uploadedPublicIds.map((pid) => cloudinary.uploader.destroy(pid))
      );
    }
    console.error('❌ Lỗi tạo BĐS:', err);

    if (
      err.name === 'SequelizeUniqueConstraintError' &&
      err.errors?.some((e) => e.path === 'slug')
    ) {
      return res.status(400).json({ message: `Slug "${req.body.slug}" đã tồn tại.` });
    }

    return res.status(500).json({ message: 'Lỗi khi tạo BĐS', error: err.message });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const estate = await RealEstate.findByPk(id);
    if (!estate) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy BĐS' });
    }

    let updateData = req.body;
    console.log('➡️ updateData:', updateData);
    if (typeof updateData === 'string') {
      try {
        updateData = JSON.parse(updateData);
      } catch (err) {
        await t.rollback();
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ (JSON parse lỗi).' });
      }
    }
    if (updateData.slug) {
      const existed = await RealEstate.findOne({
        where: { slug: updateData.slug, id: { [Op.ne]: id } },
        attributes: ['id'],
      });

      if (existed) {
        await t.rollback();
        return res.status(400).json({
          message: `Slug "${updateData.slug}" đã được sử dụng.`,
        });
      }
    }
    console.log('🆕 Update data:', updateData);

    await estate.update(updateData, { transaction: t });

    await estate.reload(); 
    await t.commit();

    return res.json({ message: 'Cập nhật BĐS thành công', data: estate });
  } catch (error) {
    await t.rollback();
    console.error('❌ Lỗi cập nhật:', error);
    return res.status(500).json({
      message: 'Lỗi khi cập nhật BĐS',
      error: error.message,
    });
  }
};
exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const estate = await RealEstate.findByPk(req.params.id, {
      transaction: t,
      attributes: ['id'],
    });
    if (!estate) return res.status(404).json({ message: 'Không tìm thấy BĐS' });
    const images = await RealEstateImage.findAll({
      where: { real_estate_id: estate.id },
      transaction: t,
    });
    for (const img of images) {
      if (img.public_id) {
        try {
          const result = await cloudinary.uploader.destroy(img.public_id, { invalidate: true });
          console.log(`🗑️ Đã xóa Cloudinary (${img.public_id}):`, result);
        } catch (err) {
          console.warn(`⚠️ Không xoá được ảnh Cloudinary (${img.public_id}):`, err.message);
        }
      }
    }
    await RealEstateImage.destroy({ where: { real_estate_id: estate.id }, transaction: t });
    await estate.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Xóa BĐS thành công' });
  } catch (error) {
    await t.rollback();
    console.error('❌ Lỗi xoá:', error);
    res.status(500).json({ message: 'Lỗi khi xóa BĐS', error: error.message });
  }
};
// controllers/realEstate.controller.js
const removeVietnameseTones = (str = '') => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};
exports.search = async (req, res) => {
  try {
    const dynamicQs = Object.entries(req.query)
      .filter(([key]) => /^q\d*$/.test(key))
      .map(([, value]) => String(value).trim())
      .filter(Boolean);
    const queryKeyword = req.query.q?.trim();
    const keyword = queryKeyword || dynamicQs.join(" ");
    if (!keyword) {
      return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm.' });
    }

    const plainKeyword = removeVietnameseTones(keyword.toLowerCase());

    // Check xem có phải đang tìm theo tên danh mục không
    const matchingCategory = await Category.findOne({
      where: {
        name: { [Op.like]: `%${keyword}%` }
      }
    });

    let prioritizedEstates = [];
    if (matchingCategory) {
      prioritizedEstates = await RealEstate.findAll({
        where: {
          category_id: matchingCategory.id
        },
        include: [
          { model: RealEstateImage, as: 'images' },
          { model: RealEstateType, as: 'type' },
          { model: Category, as: 'category' }
        ],
        order: [['posted_at', 'DESC']],
        limit: 20
      });
    }

    const estates = await RealEstate.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } },
          { address: { [Op.like]: `%${keyword}%` } },
          { district: { [Op.like]: `%${keyword}%` } },
          { city: { [Op.like]: `%${keyword}%` } },
          { cadastral: { [Op.like]: `%${keyword}%` } },
          { furniture: { [Op.like]: `%${keyword}%` } }
        ]
      },
      include: [
        { model: RealEstateImage, as: 'images' },
        { model: RealEstateType, as: 'type' },
        { model: Category, as: 'category' }
      ],
      order: [['posted_at', 'DESC']],
      limit: 100
    });

    // Gộp và loại bỏ trùng lặp theo id
    const allEstates = [...prioritizedEstates, ...estates];
    const uniqueEstatesMap = new Map();
    for (const estate of allEstates) {
      uniqueEstatesMap.set(estate.id, estate);
    }
    const combinedEstates = Array.from(uniqueEstatesMap.values());

    const filtered = combinedEstates.filter((estate) => { 
      const fields = [
        estate.title,
        estate.description,
        estate.address,
        estate.district,
        estate.city,
        estate.cadastral,
        estate.furniture,
        estate.category?.name
      ];
      return fields.some(field =>
        removeVietnameseTones((field || '').toLowerCase()).includes(plainKeyword)
      );
    });

    if (!filtered.length) {
      return res.status(404).json({ message: 'Không tìm thấy BĐS phù hợp.' });
    }

    return res.json({
      message: `Tìm thấy ${filtered.length} kết quả phù hợp.`,
      count: filtered.length,
      data: filtered
    });

  } catch (error) {
    console.error('❌ Lỗi khi tìm kiếm bất động sản:', error);
    return res.status(500).json({
      message: 'Đã xảy ra lỗi khi tìm kiếm bất động sản.',
      error: error.message
    });
  }
};

exports.searchMulti = async (req, res) => {
  try {
    const queries = Object.entries(req.query)
      .filter(([key]) => key.startsWith("q"))
      .map(([, value]) => value.trim())
      .filter(Boolean);

    if (queries.length === 0) {
      return res.status(400).json({ message: "Vui lòng truyền ít nhất một từ khóa q1, q2, ..." });
    }
    const resultsByQuery = {};
    for (const rawQ of queries) {
      const q = rawQ.toLowerCase();
      const plainQ = removeVietnameseTones(q);

      const estates = await RealEstate.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } },
            { address: { [Op.like]: `%${q}%` } },
            { district: { [Op.like]: `%${q}%` } },
            { city: { [Op.like]: `%${q}%` } },
            { cadastral: { [Op.like]: `%${q}%` } },
            { furniture: { [Op.like]: `%${q}%` } },
          ],
        },
        include: [
          { model: RealEstateImage, as: "images" },
          { model: RealEstateType, as: "type" },
          { model: Category, as: "category" },
        ],
        order: [["posted_at", "DESC"]],
        limit: 100,
      });
      const filteredForQ = estates.filter((estate) => {
        const combinedFields = [
          estate.title,
          estate.description,
          estate.address,
          estate.district,
          estate.city,
          estate.cadastral,
          estate.furniture,
        ]
          .map((f) => removeVietnameseTones((f || "").toLowerCase()))
          .join(" ");
        return combinedFields.includes(plainQ);
      });

      if (filteredForQ.length > 0) {
        resultsByQuery[q] = filteredForQ;
      }
    }

    // Gộp tất cả kết quả lại thành 1 mảng
    const allResults = Object.values(resultsByQuery).flat();

    // Loại trùng theo id (nếu cần)
    const uniqueResultsMap = new Map();
    allResults.forEach(item => uniqueResultsMap.set(item.id, item));
    const filtered = Array.from(uniqueResultsMap.values());

    if (filtered.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bất động sản phù hợp với các từ khóa." });
    }

    return res.json({
      message: `Tìm thấy ${filtered.length} kết quả phù hợp.`,
      count: filtered.length,
      data: filtered
    });

  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm multi:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi tìm kiếm bất động sản.",
      error: error.message,
    });
  }
};



exports.price = async (req, res) => {
  try {
    let { p1, p2 } = req.query;
    const minPrice = p1 ? Number(p1) : 0;
    const maxPrice = p2 ? Number(p2) : Number.MAX_SAFE_INTEGER;
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({ message: "Giá p1 hoặc p2 không hợp lệ." });
    }

    if (minPrice > maxPrice) {
      return res.status(400).json({ message: "p1 phải nhỏ hơn hoặc bằng p2." });
    }
    const estates = await RealEstate.findAll({
      where: {
        price: {
          [Op.gte]: minPrice,
          [Op.lte]: maxPrice,
        },
      },
      include: [
        { model: RealEstateImage, as: "images" },
        { model: RealEstateType, as: "type" },
        { model: Category, as: "category" },
      ],
      order: [["posted_at", "DESC"]],
      limit: 100,
    });
    return res.json({
      message: `Tìm thấy ${estates.length} bất động sản trong khoảng giá từ ${minPrice} đến ${maxPrice}.`,
      count: estates.length,
      data: estates,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lọc theo giá:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lọc bất động sản theo giá.",
      error: error.message,
    });
  }
};


exports.filterByStructure = async (req, res) => {
  try {
    const {
      bedMin,
      bedMax,
      bathMin,
      bathMax,
      floorMin,
      floorMax
    } = req.query;
    const where = {};
    const bedroomMin = bedMin ? Number(bedMin) : 0;
    const bedroomMax = bedMax ? Number(bedMax) : Number.MAX_SAFE_INTEGER;
    if (isNaN(bedroomMin) || isNaN(bedroomMax)) {
      return res.status(400).json({ message: "Tham số bedMin hoặc bedMax không hợp lệ." });
    }
    where.bedrooms = { [Op.between]: [bedroomMin, bedroomMax] };
    const bathroomMin = bathMin ? Number(bathMin) : 0;
    const bathroomMax = bathMax ? Number(bathMax) : Number.MAX_SAFE_INTEGER;
    if (isNaN(bathroomMin) || isNaN(bathroomMax)) {
      return res.status(400).json({ message: "Tham số bathMin hoặc bathMax không hợp lệ." });
    }
    where.bathrooms = { [Op.between]: [bathroomMin, bathroomMax] };
    const floorMinNum = floorMin ? Number(floorMin) : 0;
    const floorMaxNum = floorMax ? Number(floorMax) : Number.MAX_SAFE_INTEGER;
    if (isNaN(floorMinNum) || isNaN(floorMaxNum)) {
      return res.status(400).json({ message: "Tham số floorMin hoặc floorMax không hợp lệ." });
    }
    where.floors = { [Op.between]: [floorMinNum, floorMaxNum] };
    const estates = await RealEstate.findAll({
      where,
      include: [
        { model: RealEstateImage, as: "images" },
        { model: RealEstateType, as: "type" },
        { model: Category, as: "category" },
      ],
      order: [["posted_at", "DESC"]],
      limit: 100,
    });
    return res.json({
      message: `Tìm thấy ${estates.length} bất động sản phù hợp.`,
      count: estates.length,
      data: estates,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lọc theo cấu trúc:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lọc bất động sản theo cấu trúc.",
      error: error.message,
    });
  }
};

