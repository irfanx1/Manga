const express = require('express');
const User = require('../models/User');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

router.use(protect, restrictTo('admin', 'owner'));

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, manga, chapters, activeToday] = await Promise.all([
      User.countDocuments(),
      Manga.countDocuments(),
      Chapter.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 86400000) } })
    ]);
    const topManga = await Manga.find().sort('-views').limit(5).select('title views coverImage slug');
    res.json({ users, manga, chapters, activeToday, topManga });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Users list
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
    const users = await User.find(query).sort('-createdAt').limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ban/unban user
router.patch('/users/:id/ban', restrictTo('owner'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: req.body.isBanned }, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set user role
router.patch('/users/:id/role', restrictTo('owner'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle scraper
router.post('/scraper/toggle', restrictTo('owner'), async (req, res) => {
  try {
    const ScraperService = require('../services/scraper');
    if (req.body.enabled) {
      ScraperService.start();
    } else {
      ScraperService.stop();
    }
    res.json({ enabled: req.body.enabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Trigger manual scrape
router.post('/scraper/run', restrictTo('owner'), async (req, res) => {
  try {
    const ScraperService = require('../services/scraper');
    ScraperService.runNow(req.body.source || 'mangadex');
    res.json({ message: 'Scraper started' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
