import { chromium } from 'playwright';
import * as path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    window.localStorage.setItem(
      'geohub_auth_session',
      JSON.stringify({
        token: 'demo_token_pres',
        user: {
          uid: 'u_admin_02',
          rollNo: '21GEO001',
          name: 'Alex Rivera',
          role: 'coordinator',
          post: 'Club President',
          team: 'Management',
          department: 'Geoinformatics Engineering',
          status: 'active',
        },
        rememberMe: true,
      })
    );
    window.localStorage.setItem('geohub_phone_frame', 'false');
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/#profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const outDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b';

  // 1. Capture Overview tab
  const shotOverview = path.join(outDir, 'rebuilt_profile_overview.png');
  await page.screenshot({ path: shotOverview, fullPage: true });
  console.log(`Saved screenshot 1: ${shotOverview}`);

  // 2. Click 'Security' tab (Clean closed state)
  await page.click('button:has-text("Security")');
  await page.waitForTimeout(400);
  const shotSecurity = path.join(outDir, 'rebuilt_profile_security.png');
  await page.screenshot({ path: shotSecurity, fullPage: true });
  console.log(`Saved screenshot 2: ${shotSecurity}`);

  // 3. Click 'Change' button to open clean Change Password modal
  await page.click('button:has-text("Change")');
  await page.waitForTimeout(400);
  const shotModalEmpty = path.join(outDir, 'rebuilt_profile_change_password_modal.png');
  await page.screenshot({ path: shotModalEmpty });
  console.log(`Saved screenshot 3: ${shotModalEmpty}`);

  // 4. Fill form with old & new password to show clean filled state with strength & match
  await page.fill('#profile-old-password', 'CurrentPass2026');
  await page.fill('#profile-new-password', 'GeoSecure2027!');
  await page.fill('#profile-confirm-password', 'GeoSecure2027!');
  await page.waitForTimeout(300);
  const shotModalFilled = path.join(outDir, 'rebuilt_profile_change_password_filled.png');
  await page.screenshot({ path: shotModalFilled });
  console.log(`Saved screenshot 4: ${shotModalFilled}`);

  await browser.close();
}

main().catch(console.error);
