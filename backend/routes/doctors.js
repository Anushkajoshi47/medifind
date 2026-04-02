const express = require('express');
const router = express.Router();
const { recommendDoctors, getDoctorById, getAllDoctors } = require('../controllers/doctorController');

router.post('/recommend', recommendDoctors);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

module.exports = router;
