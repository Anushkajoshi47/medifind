/**
 * authController.js
 *
 * OOSE Concept: Encapsulation
 *   - Uses User.toSafeObject() to hide the password field from API responses.
 *   - Business logic (JWT generation) is encapsulated in generateToken().
 */
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User } = require('../models');

// Encapsulated token generator
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'medifind_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await new User({ name, email, password: hashed }).save();

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { token: generateToken(user._id), user: user.toSafeObject() },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      data: { token: generateToken(user._id), user: user.toSafeObject() },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { type, id } = req.body;
    const user  = await User.findById(req.userId);
    const field = type === 'doctor' ? 'bookmarked_doctors' : 'bookmarked_hospitals';
    const list  = user[field].map(String);

    if (list.includes(String(id))) {
      user[field] = user[field].filter((b) => String(b) !== String(id));
    } else {
      user[field].push(id);
    }

    await user.save();
    res.json({ success: true, data: { bookmarked: !list.includes(String(id)), list: user[field] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
