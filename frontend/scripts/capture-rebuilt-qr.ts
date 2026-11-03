import { chromium } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
  const server = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: 4173 },
  });

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => {
      window.localStorage.setItem(
        'geohub_auth_session',
        JSON.stringify({
          token: 'demo_token_fac',
          user: {
            uid: 'u_super_admin_01',
            rollNo: 'FAC01',
            name: 'Dr. Sarah Jenkins',
            role: 'super_admin',
            department: 'Geomatics & Earth Sciences',
            status: 'active',
          },
          rememberMe: true,
        })
      );
      window.localStorage.setItem('geohub_phone_frame', 'false');
    });

    const page = await context.newPage();
    await page.goto('http://localhost:4173/#my_qr', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const artifactPath = path.resolve(
      'C:/Users/SIVANAGU/.gemini/antigravity/brain/3778472a-b8ec-4cc3-9751-dfd44b3dc741',
      'rebuilt_qr_pass.png'
    );
    await page.screenshot({ path: artifactPath, fullPage: true });
    console.log(`Saved screenshot to: ${artifactPath}`);
    await context.close();
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

capture().catch(console.error);

