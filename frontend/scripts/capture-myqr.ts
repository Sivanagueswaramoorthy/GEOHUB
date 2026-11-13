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
  await page.goto('http://localhost:5173/#my_qr', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll down to the attendance roster list
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b/attendance_cards_clean_rollno.png' });
  await browser.close();
  console.log('Done capturing myqr attendance cards');
})();

