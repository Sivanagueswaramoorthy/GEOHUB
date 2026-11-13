import { chromium } from '@playwright/test';
import { preview } from 'vite';
import * as path from 'path';

async function verify() {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const server = await preview({
    preview: { port: 4181 },
    root: rootDir,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Clear storage
  await page.goto('http://localhost:4181/#login', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto('http://localhost:4181/#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('#login-roll-no', { timeout: 10000 });
  await page.waitForTimeout(2000); // Wait for splash to completely dismiss

  const artifactDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/b6200dad-855f-4d8c-86eb-afedf4aca689';

  // 1. Capture initial login page showing all roles rollno and password
  const initialShot = path.join(artifactDir, 'rebuilt_login_all_roles_passwords.png');
  await page.screenshot({ path: initialShot, fullPage: false });
  console.log('Saved initial all roles login screenshot to:', initialShot);

  // 2. Click "All Roles (8)" button to open bottom sheet
  const allRolesBtn = page.locator('button:has-text("All Roles")').first();
  if (await allRolesBtn.isVisible()) {
    await allRolesBtn.click();
    await page.waitForTimeout(600);
    const sheetShot = path.join(artifactDir, 'rebuilt_login_all_roles_sheet.png');
    await page.screenshot({ path: sheetShot, fullPage: false });
    console.log('Saved all roles bottom sheet screenshot to:', sheetShot);

    // Click "Use Role" for Treasurer (22GEO019)
    const useRoleBtn = page.locator('button:has-text("Use Role")').nth(3); // Treasurer
    if (await useRoleBtn.isVisible()) {
      await useRoleBtn.click();
      await page.waitForTimeout(600);
      const filledShot = path.join(artifactDir, 'rebuilt_login_filled_from_sheet.png');
      await page.screenshot({ path: filledShot, fullPage: false });
      console.log('Saved filled from sheet screenshot to:', filledShot);
    }
  }

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
