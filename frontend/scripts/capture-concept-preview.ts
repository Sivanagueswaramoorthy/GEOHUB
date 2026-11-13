import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 440, height: 960 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto('file:///C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b/profile_rebuild_interactive_prototype.html', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const out = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b/profile_rebuild_concept_preview.png';
  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved concept screenshot to:', out);
  await browser.close();
}

main().catch(console.error);

