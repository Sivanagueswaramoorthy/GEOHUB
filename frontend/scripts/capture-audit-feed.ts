import { chromium } from '@playwright/test';
import * as path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  
  await context.addInitScript(() => {
    window.localStorage.setItem(
      'geohub_auth_session',
      JSON.stringify({
        token: 'demo_token_fac',
        user: {
          uid: 'u_super_admin_01',
          rollNo: 'FAC01',
          name: 'Dr. Sarah Jenkins',
          role: 'faculty',
          department: 'Geomatics & Earth Sciences',
          status: 'active',
        },
        rememberMe: true,
      })
    );
    window.localStorage.setItem('geohub_phone_frame', 'false');
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/#home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshotPath = path.resolve(
    'C:/Users/SIVANAGU/.gemini/antigravity/brain/3778472a-b8ec-4cc3-9751-dfd44b3dc741',
    'audit_feed_no_logos.png'
  );

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to: ${screenshotPath}`);

  await context.close();
  await browser.close();
}

main().catch(console.error);
