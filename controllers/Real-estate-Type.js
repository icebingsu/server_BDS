const { RealEstateType, RealEstate, Sequelize } = require('../models')
const { fn, col } = Sequelize
// Lấy tất cả loại hình BĐS

exports.getAll = async (req, res) => {
  try {
    const types = await RealEstateType.findAll({
      attributes: {
        include: [
          [fn("COUNT", col("real_estates.id")), "property_count"]
        ]
      },
      include: [
        {
          model: RealEstate,
          as: "real_estates",
          attributes: [], 
        }
      ],
      group: ["RealEstateType.id"],
    })

    res.json({
      message: 'Lấy danh sách loại hình BĐS thành công',
      data: types,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi lấy danh sách',
      error: error.message,
    })
  }
}
// Lấy chi tiết theo ID
exports.getOne = async (req, res) => {
  try {
    const type = await RealEstateType.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Không tìm thấy loại hình BĐS' });
    }
    res.json({
      message: 'Lấy chi tiết loại hình BĐS thành công',
      data: type
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi lấy chi tiết',
      error: error.message
    });
  }
};

// Tạo mới loại hình
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Tên loại hình không hợp lệ' });
    }

    const newType = await RealEstateType.create({ name: name.trim() });

    res.status(201).json({
      message: 'Tạo loại hình BĐS thành công',
      data: newType
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi tạo loại hình BĐS',
      error: error.message
    });
  }
};

// Cập nhật loại hình
exports.update = async (req, res) => {
  try {
    const type = await RealEstateType.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Không tìm thấy loại hình BĐS' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Tên loại hình không hợp lệ' });
    }

    await type.update({ name: name.trim() });

    res.json({
      message: 'Cập nhật loại hình BĐS thành công',
      data: type
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi cập nhật loại hình',
      error: error.message
    });
  }
};

// Xoá loại hình
exports.delete = async (req, res) => {
  try {
    const type = await RealEstateType.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Không tìm thấy loại hình BĐS' });
    }

    await type.destroy();

    res.json({ message: 'Xóa loại hình BĐS thành công' });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi xoá loại hình',
      error: error.message
    });
  }
};
