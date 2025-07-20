const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const express = require('express');
const router = express.Router();
const RealEstateController = require('../controllers/Real-Estate');

router.get('/search/multi', RealEstateController.searchMulti);
router.get('/filterByStructure', RealEstateController.filterByStructure);
router.get('/price', RealEstateController.price);
router.get('/search/keyword', RealEstateController.search);
router.get('/', RealEstateController.getAll);
router.get('/:slug', RealEstateController.getOne);
router.post('/', upload.array('images'), RealEstateController.create);
router.put('/:id', RealEstateController.update);
router.delete('/:id', RealEstateController.delete);



module.exports = router;
