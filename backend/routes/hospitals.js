const express = require('express');
const router = express.Router();
const { getHospitalById, getAllHospitals } = require('../controllers/hospitalController');

router.get('/', getAllHospitals);
router.get('/:id', getHospitalById);

module.exports = router;
