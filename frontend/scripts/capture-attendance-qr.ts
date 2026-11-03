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
          department: 'Geography & Geomatics',
          status: 'active',
        },
        rememberMe: true,
      })
    );
    window.localStorage.setItem('geohub_phone_frame', 'false');
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/#my_qr', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1) Capture "Marked" tab
  const markedShotPath = path.resolve(
    'C:/Users/SIVANAGU/.gemini/antigravity/brain/3778472a-b8ec-4cc3-9751-dfd44b3dc741',
    'attendance_tab_marked.png'
  );
  await page.screenshot({ path: markedShotPath, fullPage: true });
  console.log(`Saved marked tab screenshot to: ${markedShotPath}`);

  // 2) Click "Not Marked" tab
  const notMarkedBtn = await page.$('button[aria-label*="Not Marked"]');
  if (notMarkedBtn) {
    await notMarkedBtn.click();
    await page.waitForTimeout(400);
  }

  // 3) Capture "Not Marked" tab
  const notMarkedShotPath = path.resolve(
    'C:/Users/SIVANAGU/.gemini/antigravity/brain/3778472a-b8ec-4cc3-9751-dfd44b3dc741',
    'attendance_tab_not_marked.png'
  );
  await page.screenshot({ path: notMarkedShotPath, fullPage: false });
  console.log(`Saved not marked tab screenshot to: ${notMarkedShotPath}`);

  await context.close();
  await browser.close();
}

main().catch(console.error);
