const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Username or email already taken' });
    const user = await User.create({ username, email, password });
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isBanned) return res.status(403).json({ message: 'Account banned' });
    const token = signToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['username', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f]) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bookmark/:mangaId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.bookmarks.indexOf(req.params.mangaId);
    if (idx === -1) {
      user.bookmarks.push(req.params.mangaId);
    } else {
      user.bookmarks.splice(idx, 1);
    }
    await user.save();
    res.json({ bookmarked: idx === -1, bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
