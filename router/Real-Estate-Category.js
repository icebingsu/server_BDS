const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/Real-Estate-Category');

// Lấy danh sách tất cả danh mục
router.get('/', categoryController.getAll);

// Lấy chi tiết danh mục theo ID
router.get('/:id', categoryController.getOne);

// Tạo mới danh mục
router.post('/', categoryController.create);

// Cập nhật danh mục
router.put('/:id', categoryController.update);

// Xoá danh mục
router.delete('/:id', categoryController.delete);



module.exports = router;
