import { chromium } from '@playwright/test';
import { preview } from 'vite';
import * as path from 'path';

async function verify() {
  const rootDir = path.resolve(import.meta.dirname, '..');
  const server = await preview({
    preview: { port: 4179 },
    root: rootDir,
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Clear storage
  await page.goto('http://localhost:4179/#login', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Login as President or Faculty to get all modules
  await page.goto('http://localhost:4179/#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('#login-roll-no', { timeout: 10000 });
  await page.click('button:has-text("FAC01")'); // Faculty has all modules
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Navigate to Operations
  const opsNavBtn = page.locator('button[aria-label="Operations"], button:has-text("Ops")').first();
  await opsNavBtn.click();
  await page.waitForTimeout(800);

  // If a module was open, back out to landing
  const backHubBtn = page.locator('button[data-testid="btn-back-hub"]');
  if (await backHubBtn.isVisible()) {
    await backHubBtn.click();
    await page.waitForTimeout(600);
  }

  const artifactDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/b6200dad-855f-4d8c-86eb-afedf4aca689';

  // 1. Capture Bento Grid View (without metric tiles)
  const bentoShot = path.join(artifactDir, 'rebuilt_operations_clean_no_metrics.png');
  await page.screenshot({ path: bentoShot, fullPage: false });
  console.log('Saved clean Operations Hub screenshot to:', bentoShot);

  // 2. Filter by "Events" category
  const eventsFilterBtn = page.locator('button:has-text("Events")').first();
  if (await eventsFilterBtn.isVisible()) {
    await eventsFilterBtn.click();
    await page.waitForTimeout(500);
    const filterShot = path.join(artifactDir, 'rebuilt_operations_filtered_events.png');
    await page.screenshot({ path: filterShot, fullPage: false });
    console.log('Saved Events Filter screenshot to:', filterShot);
  }

  // Switch back to "All"
  await page.click('button:has-text("All")');
  await page.waitForTimeout(300);

  // 3. Switch to List View
  const listToggleBtn = page.locator('button[aria-label="List View"]').first();
  if (await listToggleBtn.isVisible()) {
    await listToggleBtn.click();
    await page.waitForTimeout(500);
    const listShot = path.join(artifactDir, 'rebuilt_operations_list_view.png');
    await page.screenshot({ path: listShot, fullPage: false });
    console.log('Saved List View screenshot to:', listShot);
  }

  await browser.close();
  await new Promise<void>((resolve, reject) => {
    server.httpServer.close((err) => (err ? reject(err) : resolve()));
  });
  console.log('Verification script completed cleanly.');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});

