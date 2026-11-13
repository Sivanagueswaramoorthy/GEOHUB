import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    window.localStorage.setItem('geohub_auth_session', JSON.stringify({
      token: 'demo_token_admin',
      user: {
        uid: 'u_admin_01',
        rollNo: '21GEO001',
        name: 'Alex Rivera',
        role: 'admin',
        department: 'Geomatics & Earth Sciences',
        status: 'active'
      },
      rememberMe: true
    }));
    window.localStorage.setItem('geohub_phone_frame', 'false');
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/#operations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Click on Member Directory card
  const memberCard = await page.locator('text=Member Directory').first();
  if (memberCard) {
    await memberCard.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b/member_directory_header_no_logo.png' });
  await browser.close();
  console.log('Done capturing member directory');
})();

