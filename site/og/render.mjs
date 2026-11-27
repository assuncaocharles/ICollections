// Renders site/og/og.html to site/public/og.png (1200x630), the link preview image.
//   npm run og
// Needs Playwright with Chromium (npx playwright install chromium); it is not a
// dependency because the image is committed and only changes with the design.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(import.meta.url)('playwright');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const url = `file://${path.join(here, 'og.html')}`;
// Google Fonts may be unreachable; the page falls back to locally installed Inter and JetBrains Mono.
await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => page.goto(url));
await page.evaluate(() => document.fonts.ready);
const out = path.join(here, '../public/og.png');
await page.screenshot({ path: out, type: 'png' });
await browser.close();
console.log(`Wrote ${path.relative(process.cwd(), out)}`);
