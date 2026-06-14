const axios = require('axios');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');

const MANGADEX_API = 'https://api.mangadex.org';
const COVERS_BASE = 'https://uploads.mangadex.org/covers';

async function fetchPopularManga(limit = 20) {
  try {
    const resp = await axios.get(`${MANGADEX_API}/manga`, {
      params: {
        limit,
        order: { followedCount: 'desc' },
        includes: ['cover_art', 'author', 'artist'],
        availableTranslatedLanguage: ['en'],
        contentRating: ['safe', 'suggestive']
      },
      timeout: 10000
    });
    return resp.data.data || [];
  } catch (e) {
    console.error('[MangaDex] Fetch error:', e.message);
    return [];
  }
}

async function fetchChapters(mangadexId, limit = 100) {
  try {
    const resp = await axios.get(`${MANGADEX_API}/chapter`, {
      params: { manga: mangadexId, limit, translatedLanguage: ['en'], order: { chapter: 'asc' }, contentRating: ['safe', 'suggestive'] },
      timeout: 10000
    });
    return resp.data.data || [];
  } catch (e) {
    console.error('[MangaDex] Chapter fetch error:', e.message);
    return [];
  }
}

async function fetchChapterPages(chapterId) {
  try {
    const resp = await axios.get(`${MANGADEX_API}/at-home/server/${chapterId}`, { timeout: 10000 });
    const { baseUrl, chapter } = resp.data;
    return chapter.data.map((file, i) => ({
      pageNumber: i + 1,
      imageUrl: `${baseUrl}/data/${chapter.hash}/${file}`
    }));
  } catch (e) {
    return [];
  }
}

function extractCover(manga) {
  const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
  if (coverRel?.attributes?.fileName) {
    return `${COVERS_BASE}/${manga.id}/${coverRel.attributes.fileName}.512.jpg`;
  }
  return '';
}

function extractAuthors(manga) {
  return manga.relationships?.filter(r => r.type === 'author').map(r => r.attributes?.name || '').filter(Boolean) || [];
}

async function scrapeManga() {
  console.log('[Scraper] Starting MangaDex scrape...');
  const mangaList = await fetchPopularManga(20);

  for (const item of mangaList) {
    try {
      const attrs = item.attributes;
      const title = attrs.title?.en || attrs.title?.['ja-ro'] || Object.values(attrs.title || {})[0] || 'Unknown';
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + item.id.slice(0, 6);
      const existing = await Manga.findOne({ sourceId: item.id });

      const mangaData = {
        title,
        description: attrs.description?.en || '',
        coverImage: extractCover(item),
        type: attrs.originalLanguage === 'ko' ? 'manhwa' : attrs.originalLanguage === 'zh' ? 'manhua' : 'manga',
        status: attrs.status === 'completed' ? 'completed' : 'ongoing',
        genres: attrs.tags?.filter(t => t.attributes?.group === 'genre').map(t => t.attributes?.name?.en) || [],
        authors: extractAuthors(item),
        source: 'mangadex',
        sourceId: item.id,
        sourceUrl: `https://mangadex.org/title/${item.id}`,
        lastUpdated: new Date()
      };

      let manga;
      if (existing) {
        manga = await Manga.findByIdAndUpdate(existing._id, mangaData, { new: true });
      } else {
        manga = await Manga.create({ ...mangaData, slug });
      }

      // Fetch latest chapters (last 10)
      const chapters = await fetchChapters(item.id, 10);
      for (const ch of chapters) {
        const chNum = parseFloat(ch.attributes.chapter);
        if (isNaN(chNum)) continue;
        const existsCh = await Chapter.findOne({ manga: manga._id, number: chNum });
        if (!existsCh) {
          const pages = await fetchChapterPages(ch.id);
          await Chapter.create({
            manga: manga._id,
            number: chNum,
            title: ch.attributes.title || `Chapter ${chNum}`,
            pages,
            source: 'mangadex',
            sourceUrl: `https://mangadex.org/chapter/${ch.id}`
          });
          await Manga.findByIdAndUpdate(manga._id, {
            $inc: { chapterCount: 1 },
            $max: { latestChapter: chNum },
            lastUpdated: new Date()
          });
        }
      }
      console.log(`[Scraper] Processed: ${title}`);
    } catch (e) {
      console.error('[Scraper] Error processing manga:', e.message);
    }
  }
  console.log('[Scraper] Done.');
}

module.exports = { scrapeManga };
