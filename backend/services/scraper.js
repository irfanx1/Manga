const cron = require('node-cron');
const { scrapeManga } = require('../scrapers/mangadex');

let scraperJob = null;
let isRunning = false;

function start() {
  if (scraperJob) return;
  // Run every 6 hours
  scraperJob = cron.schedule('0 */6 * * *', async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await scrapeManga();
    } catch (e) {
      console.error('[ScraperService] Error:', e);
    } finally {
      isRunning = false;
    }
  });
  console.log('[ScraperService] Started — runs every 6 hours');
}

function stop() {
  if (scraperJob) {
    scraperJob.stop();
    scraperJob = null;
    console.log('[ScraperService] Stopped');
  }
}

async function runNow(source = 'mangadex') {
  if (isRunning) return console.log('[ScraperService] Already running');
  isRunning = true;
  try {
    if (source === 'mangadex') await scrapeManga();
  } catch (e) {
    console.error('[ScraperService] Manual run error:', e);
  } finally {
    isRunning = false;
  }
}

module.exports = { start, stop, runNow };
