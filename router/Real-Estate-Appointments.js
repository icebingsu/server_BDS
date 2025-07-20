const express = require('express');
const router = express.Router();
const RealEstateAppointment = require('../controllers/realEstateAppointmentController');

router.post('/', RealEstateAppointment.create);
router.get('/real-estate/:real_estate_id', RealEstateAppointment.getByRealEstate);
router.get('/user/:id_user', RealEstateAppointment.getRealEstateByUser);
router.patch('/:id/status', RealEstateAppointment.updateStatus);


module.exports = router;
