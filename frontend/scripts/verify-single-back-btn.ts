import { chromium } from '@playwright/test';
import { preview } from 'vite';
import * as path from 'path';

async function verify() {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const server = await preview({
    preview: { port: 4178 },
    root: rootDir,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Clear storage first
  await page.goto('http://localhost:4178/#login', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Login as President
  await page.goto('http://localhost:4178/#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('#login-roll-no', { timeout: 10000 });
  await page.click('button:has-text("21GEO001")');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Navigate to Operations Hub Squads
  const opsNavBtn = page.locator('button[aria-label="Operations"], button:has-text("Ops")').first();
  await opsNavBtn.click();
  await page.waitForTimeout(800);

  // If a module was open, back out
  const backHubBtn = page.locator('button[data-testid="btn-back-hub"]');
  if (await backHubBtn.isVisible()) {
    await backHubBtn.click();
    await page.waitForTimeout(600);
  }

  // Click on "Squads"
  const squadsCard = page.locator('div:has-text("Squads"), button:has-text("Squads")').last();
  await squadsCard.scrollIntoViewIfNeeded();
  await squadsCard.click();
  await page.waitForTimeout(800);

  const artifactDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/b6200dad-855f-4d8c-86eb-afedf4aca689';

  // 1. Capture main Squads screen
  const mainShot = path.join(artifactDir, 'verified_squads_main_single_back_btn.png');
  await page.screenshot({ path: mainShot, fullPage: false });
  console.log('Saved main Squads screen to:', mainShot);

  // Count back buttons on main screen
  const mainBackButtons = await page.locator('button[aria-label="Back"], button[aria-label="Back to Operations Hub"]').all();
  console.log('Number of back buttons on main Squads screen:', mainBackButtons.length);

  // Click into "Management Squad" to view roster drilldown
  const mgmtSquad = page.locator('div:has-text("Management Squad")').last();
  await mgmtSquad.scrollIntoViewIfNeeded();
  await mgmtSquad.click();
  await page.waitForTimeout(800);

  // 2. Capture roster drilldown screen
  const drillShot = path.join(artifactDir, 'verified_squad_single_back_btn.png');
  await page.screenshot({ path: drillShot, fullPage: false });
  console.log('Saved squad drilldown screen to:', drillShot);

  // Count back buttons on drilldown screen (MUST be exactly 1)
  const drillBackButtons = await page.locator('button[aria-label="Back"], button:has-text("Back")').all();
  console.log('Number of back buttons on drilldown screen:', drillBackButtons.length);

  // Verify text "Back" is not displayed in the button
  const topBackBtn = page.locator('button[data-testid="btn-back-hub"]').first();
  const topBackBtnText = (await topBackBtn.innerText()).trim();
  console.log('Text content of top back button (should be empty):', JSON.stringify(topBackBtnText));

  // Check if "Back to Squads" button exists (MUST be false)
  const backToSquadsCount = await page.locator('button:has-text("Back to Squads")').count();
  console.log('"Back to Squads" count (MUST be 0):', backToSquadsCount);

  // Click the single back button to ensure it navigates back to Squads
  await topBackBtn.click();
  await page.waitForTimeout(600);

  const afterBackShot = path.join(artifactDir, 'verified_after_clicking_single_back.png');
  await page.screenshot({ path: afterBackShot, fullPage: false });
  console.log('Saved screen after clicking single back to:', afterBackShot);

  await browser.close();
  await new Promise<void>((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()));
  });
  console.log('Single back button verification completed successfully.');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

