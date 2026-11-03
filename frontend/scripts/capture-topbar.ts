import { chromium } from '@playwright/test';
import * as path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'mobile_360', width: 360, height: 740 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'mobile_430', width: 430, height: 932 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Wait for header to be visible
    await page.waitForSelector('header[role="banner"]');
    
    const screenshotPath = path.resolve(
      'C:/Users/SIVANAGU/.gemini/antigravity/brain/b2ef8fb5-f649-4ebc-9f54-37f91791da8a',
      `topbar_${vp.name}.png`
    );
    
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot to: ${screenshotPath}`);
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);

