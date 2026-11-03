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
  await page.goto('http://localhost:5173/#my_qr', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1) Capture initial screen (before clicking Generate QR)
  const initialPath = path.resolve(
    'C:/Users/SIVANAGU/.gemini/antigravity/brain/3778472a-b8ec-4cc3-9751-dfd44b3dc741',
    'attendance_qr_initial.png'
  );
  await page.screenshot({ path: initialPath, fullPage: true });
  console.log(`Saved initial screenshot to: ${initialPath}`);

  // 2) Click Generate QR button to open popup
  const genBtn = await page.$('button[data-testid="btn-generate-qr"]');
  if (genBtn) {
    await genBtn.click();
    await page.waitForTimeout(600);
  }

  // 3) Capture popup screen
  const popupPath = path.resolve(
    'C:/Users/SIVANAGU/.gemini/antigravity/brain/3778472a-b8ec-4cc3-9751-dfd44b3dc741',
    'attendance_qr_popup.png'
  );
  await page.screenshot({ path: popupPath, fullPage: true });
  console.log(`Saved popup screenshot to: ${popupPath}`);

  await context.close();
  await browser.close();
}

main().catch(console.error);
