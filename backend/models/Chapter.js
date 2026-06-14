const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  manga: { type: mongoose.Schema.Types.ObjectId, ref: 'Manga', required: true },
  number: { type: Number, required: true },
  title: { type: String, default: '' },
  volume: { type: Number, default: 0 },
  pages: [{
    pageNumber: Number,
    imageUrl: String,
    width: Number,
    height: Number
  }],
  views: { type: Number, default: 0 },
  source: { type: String, default: 'manual' },
  sourceUrl: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

chapterSchema.index({ manga: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', chapterSchema);
