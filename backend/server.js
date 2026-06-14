require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/manga', require('./routes/manga'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Connect DB and start
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mangaflux')
  .then(async () => {
    console.log('MongoDB connected');

    // Create default admin if not exists
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'owner' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@mangaflux.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'owner'
      });
      console.log('Default admin created');
    }

    // Start scraper
    if (process.env.AUTO_SCRAPE !== 'false') {
      const ScraperService = require('./services/scraper');
      ScraperService.start();
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
