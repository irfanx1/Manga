const express = require('express');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// GET all manga with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, status, type, sort = '-lastUpdated', search, featured } = req.query;
    const query = { isPublished: true };
    if (genre) query.genres = genre;
    if (status) query.status = status;
    if (type) query.type = type;
    if (featured) query.featured = true;
    if (search) query.$text = { $search: search };

    const total = await Manga.countDocuments(query);
    const manga = await Manga.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('title coverImage type status genres rating views bookmarkCount chapterCount latestChapter lastUpdated slug featured');

    res.json({ manga, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single manga
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.slug, isPublished: true });
    if (!manga) return res.status(404).json({ message: 'Manga not found' });
    manga.views += 1;
    await manga.save();
    const chapters = await Chapter.find({ manga: manga._id, isPublished: true })
      .sort('-number')
      .select('number title views uploadedAt');
    res.json({ manga, chapters });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET chapter
router.get('/:slug/chapter/:number', optionalAuth, async (req, res) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.slug }).select('title slug coverImage');
    if (!manga) return res.status(404).json({ message: 'Manga not found' });
    const chapter = await Chapter.findOne({ manga: manga._id, number: req.params.number });
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    chapter.views += 1;
    await chapter.save();
    const prev = await Chapter.findOne({ manga: manga._id, number: Number(req.params.number) - 1 }).select('number');
    const next = await Chapter.findOne({ manga: manga._id, number: Number(req.params.number) + 1 }).select('number');
    res.json({ manga, chapter, prev, next });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Create manga
router.post('/', protect, restrictTo('admin', 'owner'), async (req, res) => {
  try {
    const manga = await Manga.create(req.body);
    res.status(201).json({ manga });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Update manga
router.patch('/:id', protect, restrictTo('admin', 'owner'), async (req, res) => {
  try {
    const manga = await Manga.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ manga });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Delete manga
router.delete('/:id', protect, restrictTo('admin', 'owner'), async (req, res) => {
  try {
    await Manga.findByIdAndDelete(req.params.id);
    await Chapter.deleteMany({ manga: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN: Add chapter
router.post('/:id/chapters', protect, restrictTo('admin', 'owner'), async (req, res) => {
  try {
    const chapter = await Chapter.create({ ...req.body, manga: req.params.id });
    await Manga.findByIdAndUpdate(req.params.id, {
      $inc: { chapterCount: 1 },
      $max: { latestChapter: chapter.number },
      lastUpdated: new Date()
    });
    res.status(201).json({ chapter });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
