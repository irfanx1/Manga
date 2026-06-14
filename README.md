# MangaFlux 📚

A full-stack manga/manhwa reading platform with online reader, user accounts, auto-scraping from MangaDex, and admin panel.

## Features

- 📖 Online manga reader (scroll + page modes)
- 🔐 User authentication (register, login, bookmarks, history)
- 🔍 Search with instant results
- 🎨 Dark theme, mobile-first UI
- ⚡ Auto-scraping from MangaDex every 6 hours
- 🛡 Admin panel (manage manga, users, scraper)
- 📱 Fully responsive with bottom navigation

## Tech Stack

- **Frontend**: React 18, React Router v6
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Auth**: JWT tokens
- **Scraping**: MangaDex API

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
node server.js
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

### 3. Production Build

```bash
cd frontend
npm run build
# Then serve from backend (NODE_ENV=production)
```

## Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mangaflux
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@mangaflux.com
ADMIN_PASSWORD=admin123
AUTO_SCRAPE=true
```

## Default Admin

After first run, login with:
- Email: `admin@mangaflux.com`
- Password: `admin123`

**Change the password immediately after first login!**

## Admin Panel Features

- Dashboard with stats (users, manga, chapters, active today)
- Add manga manually
- Manage users (ban/unban, roles)
- Control auto-scraper (toggle on/off, manual run)
- Top manga by views

## Deployment

Deploy backend to Railway/Render, frontend to Vercel/Netlify, MongoDB to MongoDB Atlas.
