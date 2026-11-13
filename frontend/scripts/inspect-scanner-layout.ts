import { chromium } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const server = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: 4177 },
  });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => {
      window.localStorage.setItem(
        'geohub_auth_session',
        JSON.stringify({
          token: 'demo_token_vol',
          user: { uid: 'u_vol_01', rollNo: '21GEO099', name: 'Jordan Lee', role: 'volunteer', status: 'active' },
          rememberMe: true,
        })
      );
      window.localStorage.setItem('geohub_phone_frame', 'false');
    });
    const page = await context.newPage();
    await page.goto('http://localhost:4177/#scan_qr', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const elements = await page.evaluate(`(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all
        .filter(el => el.children.length === 0 && (el.innerText || el.tagName === 'VIDEO' || el.style.border || el.className))
        .map(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return null;
          return {
            tag: el.tagName,
            cls: el.className?.toString().slice(0, 30),
            text: (el.innerText || '').slice(0, 30),
            box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
          };
        })
        .filter(Boolean);
    })()`);
    console.log('All visible leaf elements:\n', JSON.stringify(elements, null, 2));
    console.log('Bounding boxes:\n', JSON.stringify(elements, null, 2));
    await context.close();
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

main().catch(console.error);
