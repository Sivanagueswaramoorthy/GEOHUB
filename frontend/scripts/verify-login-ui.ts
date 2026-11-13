import { chromium } from '@playwright/test';
import { preview } from 'vite';
import * as path from 'path';

async function verify() {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const server = await preview({
    preview: { port: 4173 },
    root: rootDir,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Navigate to login page and wait for splash screen to complete
  await page.goto('http://localhost:4173/#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('#login-roll-no', { timeout: 10000 });
  await page.waitForTimeout(500);

  // Take initial screenshot
  const artifactDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b';
  const initialShot = path.join(artifactDir, 'restored_mascot_login.png');
  await page.screenshot({ path: initialShot, fullPage: false });
  console.log('Saved screenshot to:', initialShot);

  // Measure bounding boxes of labels and inputs to verify ZERO overlap
  const rollLabelBox = await page.locator('label[for="login-roll-no"]').boundingBox();
  const rollInputBox = await page.locator('#login-roll-no').boundingBox();
  const passLabelBox = await page.locator('label[for="login-password"]').boundingBox();
  const passInputBox = await page.locator('#login-password').boundingBox();

  console.log('Roll Label Box:', JSON.stringify(rollLabelBox));
  console.log('Roll Input Box:', JSON.stringify(rollInputBox));
  console.log('Pass Label Box:', JSON.stringify(passLabelBox));
  console.log('Pass Input Box:', JSON.stringify(passInputBox));

  if (rollLabelBox && rollInputBox) {
    const gap = rollInputBox.y - (rollLabelBox.y + rollLabelBox.height);
    console.log(`Gap between Roll Label bottom and Roll Input top: ${gap}px`);
    if (gap < 0) {
      console.error('ERROR: Roll Label and Input are overlapping!');
    } else {
      console.log('SUCCESS: Roll Label and Input do NOT overlap.');
    }
  }

  if (passLabelBox && passInputBox) {
    const gap = passInputBox.y - (passLabelBox.y + passLabelBox.height);
    console.log(`Gap between Pass Label bottom and Pass Input top: ${gap}px`);
    if (gap < 0) {
      console.error('ERROR: Pass Label and Input are overlapping!');
    } else {
      console.log('SUCCESS: Pass Label and Input do NOT overlap.');
    }
  }

  // Also fill in a preset to see filled state
  await page.click('button:has-text("21GEO001")');
  await page.waitForTimeout(400);
  const filledShot = path.join(artifactDir, 'rebuilt_login_filled.png');
  await page.screenshot({ path: filledShot, fullPage: false });
  console.log('Saved filled screenshot to:', filledShot);

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
