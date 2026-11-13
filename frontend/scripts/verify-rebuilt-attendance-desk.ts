import { chromium } from '@playwright/test';
import { preview } from 'vite';
import * as path from 'path';

async function verify() {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const server = await preview({
    preview: { port: 4185 },
    root: rootDir,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Clear storage
  await page.goto('http://localhost:4185/#login', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Login as Faculty
  await page.goto('http://localhost:4185/#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('#login-roll-no', { timeout: 10000 });
  await page.click('button:has-text("FAC01")');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Navigate to Operations Hub
  const opsNavBtn = page.locator('button[aria-label="Operations"], button:has-text("Ops")').first();
  await opsNavBtn.click();
  await page.waitForTimeout(800);

  // Navigate to Attendance Desk module
  await page.goto('http://localhost:4185/#operations?module=attendance_desk', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const artifactDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/b6200dad-855f-4d8c-86eb-afedf4aca689';

  // Capture rebuilt Attendance Desk fitted perfectly to the screen
  const fittedShot = path.join(artifactDir, 'rebuilt_attendance_desk_fitted.png');
  await page.screenshot({ path: fittedShot, fullPage: false });
  console.log('Saved fitted Attendance Desk screenshot to:', fittedShot);

  await browser.close();
  await new Promise<void>((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()));
  });
  console.log('Verification completed cleanly.');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
