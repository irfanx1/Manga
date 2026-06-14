const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  alternativeTitles: [String],
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  type: { type: String, enum: ['manga', 'manhwa', 'manhua', 'webtoon'], default: 'manga' },
  status: { type: String, enum: ['ongoing', 'completed', 'hiatus', 'cancelled'], default: 'ongoing' },
  genres: [String],
  authors: [String],
  artists: [String],
  rating: { type: Number, default: 0, min: 0, max: 10 },
  totalRatings: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  chapterCount: { type: Number, default: 0 },
  latestChapter: { type: Number, default: 0 },
  source: { type: String, default: 'manual' },
  sourceId: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  slug: { type: String, unique: true },
  isPublished: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

mangaSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

mangaSchema.index({ title: 'text', alternativeTitles: 'text', genres: 1, status: 1, type: 1 });

module.exports = mongoose.model('Manga', mangaSchema);
