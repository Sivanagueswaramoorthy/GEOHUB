import { chromium } from '@playwright/test';
import { preview } from 'vite';
import * as path from 'path';

async function verify() {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const server = await preview({
    preview: { port: 4177 },
    root: rootDir,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Clear local storage / session storage first
  await page.goto('http://localhost:4177/#login', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // 1. Login with President role
  await page.goto('http://localhost:4177/#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('#login-roll-no', { timeout: 10000 });
  await page.click('button:has-text("21GEO001")');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // 2. Click the Operations (Ops) tab in the floating nav
  const opsNavBtn = page.locator('button[aria-label="Operations"], button:has-text("Ops")').first();
  await opsNavBtn.click();
  await page.waitForTimeout(800);

  // If a module was already open with a back button, click Back to return to Hub
  const backHubBtn = page.locator('button[data-testid="btn-back-hub"]');
  if (await backHubBtn.isVisible()) {
    await backHubBtn.click();
    await page.waitForTimeout(600);
  }

  // 3. Find and click "Attendance Operation" in Operations Hub
  const attOpCard = page.locator('div:has-text("Attendance Operation"), button:has-text("Attendance Operation")').last();
  await attOpCard.scrollIntoViewIfNeeded();
  await attOpCard.click();
  await page.waitForTimeout(800);

  // 4. Capture screenshot of rebuilt Attendance Operation screen
  const artifactDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/b6200dad-855f-4d8c-86eb-afedf4aca689';
  const screenShot = path.join(artifactDir, 'rebuilt_attendance_operation_screen.png');
  await page.screenshot({ path: screenShot, fullPage: false });
  console.log('Saved Attendance Operation screen to:', screenShot);

  // 5. Click "Generate QR" button
  const genQrBtn = page.locator('button[data-testid="btn-generate-qr"]').first();
  await genQrBtn.scrollIntoViewIfNeeded();
  await genQrBtn.click();
  await page.waitForTimeout(600);

  // 6. Capture screenshot of Attendance QR Generator modal
  const qrModalShot = path.join(artifactDir, 'attendance_qr_generator_modal.png');
  await page.screenshot({ path: qrModalShot, fullPage: false });
  console.log('Saved QR generator modal to:', qrModalShot);

  await browser.close();
  await new Promise<void>((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()));
  });
  console.log('Verification completed successfully.');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
