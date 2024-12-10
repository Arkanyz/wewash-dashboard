import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let browser = null;
let context = null;

async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }
}

app.post('/api/weline/login', async (req, res) => {
  const { username, password } = req.body;
  let page = null;

  try {
    await initBrowser();
    page = await context.newPage();

    await page.goto('https://we-line.fr/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('form');

    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);

    const errorElement = await page.$('.error-message');
    if (errorElement) {
      const errorText = await errorElement.textContent();
      throw new Error(errorText || 'Identifiants invalides');
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  } finally {
    if (page) await page.close();
  }
});

app.post('/api/weline/calls', async (req, res) => {
  const { date } = req.body;
  let page = null;

  try {
    if (!browser || !context) {
      throw new Error('Not logged in');
    }

    page = await context.newPage();
    await page.goto('https://we-line.fr/statistics', { waitUntil: 'networkidle' });

    await page.click('.date-selector');
    await page.fill('input[type="date"]', date);
    await page.press('input[type="date"]', 'Enter');

    await page.waitForSelector('.calls-table', { state: 'visible' });

    const callsData = await page.$$eval('.calls-row', (rows) => {
      return rows.map(row => ({
        time: row.querySelector('.time')?.textContent?.trim() || '',
        calls: parseInt(row.querySelector('.calls')?.textContent?.trim() || '0'),
        duration: parseFloat(row.querySelector('.duration')?.textContent?.trim() || '0')
      }));
    });

    res.json({ success: true, data: callsData });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  } finally {
    if (page) await page.close();
  }
});

app.post('/api/weline/logout', async (req, res) => {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      context = null;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

process.on('SIGTERM', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
