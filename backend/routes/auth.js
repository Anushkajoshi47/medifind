const express = require('express');
const router = express.Router();
const { register, login, getMe, bookmarkDoctor, bookmarkHospital } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/bookmark/doctor/:id', protect, bookmarkDoctor);
router.post('/bookmark/hospital/:id', protect, bookmarkHospital);

module.exports = router;
