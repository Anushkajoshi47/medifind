const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'medifind_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { token: generateToken(user.id), user: { id: user.id, name: user.name, email: user.email } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      data: { token: generateToken(user.id), user: { id: user.id, name: user.name, email: user.email } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { type, id } = req.body; // type: 'doctor' or 'hospital'
    const user = await User.findByPk(req.userId);
    const field = type === 'doctor' ? 'bookmarked_doctors' : 'bookmarked_hospitals';
    let list = user[field] || [];

    if (list.includes(id)) {
      list = list.filter((b) => b !== id);
    } else {
      list = [...list, id];
    }

    await user.update({ [field]: list });
    res.json({ success: true, data: { bookmarked: !user[field].includes(id), list } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
