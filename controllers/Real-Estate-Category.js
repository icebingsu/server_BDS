const { Category, RealEstate, Sequelize } = require('../models')

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        'id',
        'name',
        'is_homepage',
        'can_delete', // ✅ Thêm dòng này
        [
          Sequelize.fn("COUNT", Sequelize.col("real_estates.id")),
          "property_count"
        ]
      ],
      include: [
        {
          model: RealEstate,
          as: "real_estates",
          attributes: []
        }
      ],
      group: ["Category.id", "Category.name", "Category.is_homepage", "Category.can_delete"],
      order: [["id", "ASC"]]
    });

    return res.status(200).json({
      message: "Lấy danh sách danh mục thành công",
      data: categories
    });
  } catch (error) {
    console.error("Lỗi getAll categories:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách danh mục",
      error: error.message
    });
  }
};

// GET: Chi tiết 1 danh mục theo ID
exports.getOne = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    res.json({
      message: 'Lấy chi tiết danh mục thành công',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi lấy chi tiết danh mục',
      error: error.message,
    });
  }
};

// POST: Tạo mới danh mục
exports.create = async (req, res) => {
  try {
    let { name, is_homepage } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        message: 'Tên danh mục không hợp lệ. Vui lòng gửi \"name\" là một chuỗi hợp lệ.'
      });
    }

    // Ép kiểu boolean từ các giá trị hợp lệ (kể cả string 'true', '1', 'on')
    const isHomepageBoolean = ['true', '1', 'on', true, 1].includes(is_homepage);

    console.log('[DEBUG] Đang tạo danh mục:', {
      name: name.trim(),
      is_homepage: isHomepageBoolean
    });

    const newCategory = await Category.create({
      name: name.trim(),
      is_homepage: isHomepageBoolean
    });

    return res.status(201).json({
      message: 'Tạo danh mục thành công',
      data: newCategory,
    });
  } catch (error) {
    console.error('[ERROR] Tạo danh mục thất bại:', error);
    return res.status(500).json({
      message: 'Đã xảy ra lỗi khi tạo danh mục',
      error: error?.message || 'Lỗi không xác định',
    });
  }
};
// PUT: Cập nhật danh mục
exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    const { name, is_homepage } = req.body;
    const updateData = {};
    if (name && typeof name === 'string' && name.trim() !== '') {
      updateData.name = name.trim();
    }
    if (typeof is_homepage === 'boolean') {
      updateData.is_homepage = is_homepage;
    }

    await category.update(updateData);

    res.json({
      message: 'Cập nhật danh mục thành công',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi cập nhật danh mục',
      error: error.message,
    });
  }
};
// DELETE: Xoá danh mục
exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    if (!category.can_delete) {
      return res.status(403).json({
        message: 'Danh mục này không được phép xóa.',
      });
    }
    await category.destroy();
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi xóa danh mục',
      error: error.message,
    });
  }
};

