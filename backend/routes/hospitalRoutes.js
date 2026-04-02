const express = require('express');
const router = express.Router();
const { getHospitalById, getAllHospitals, getSymptomMap } = require('../controllers/hospitalController');

router.get('/symptoms', getSymptomMap);
router.get('/', getAllHospitals);
router.get('/:id', getHospitalById);

module.exports = router;
