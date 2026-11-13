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
  const outDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b';

  // 1. Home Screen
  await page.goto('http://localhost:5173/#home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'botanical_home.png'), fullPage: true });
  console.log('Saved botanical_home.png');

  // 2. Operations Screen
  await page.goto('http://localhost:5173/#operations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'botanical_operations.png'), fullPage: true });
  console.log('Saved botanical_operations.png');

  // 3. Events Screen
  await page.goto('http://localhost:5173/#events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'botanical_events.png'), fullPage: true });
  console.log('Saved botanical_events.png');

  // 4. Profile Overview Screen
  await page.goto('http://localhost:5173/#profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'botanical_profile.png'), fullPage: true });
  console.log('Saved botanical_profile.png');

  // 5. Profile Security Tab & Change Password Modal
  const securityTab = page.locator('button:has-text("Security")');
  if (await securityTab.isVisible()) {
    await securityTab.click();
    await page.waitForTimeout(400);

    const changeBtn = page.locator('button:has-text("Change")');
    if (await changeBtn.isVisible()) {
      await changeBtn.click();
      await page.waitForTimeout(400);

      // Type some test credentials to see the inputs and strength bar
      const oldInput = page.locator('#profile-old-password');
      if (await oldInput.isVisible()) {
        await oldInput.fill('AdminPass123!');
      }
      const newInput = page.locator('#profile-new-password');
      if (await newInput.isVisible()) {
        await newInput.fill('BotanicalPro2026!');
      }

      await page.screenshot({ path: path.join(outDir, 'botanical_change_password.png'), fullPage: true });
      console.log('Saved botanical_change_password.png');
    }
  }

  await browser.close();
}

main().catch(console.error);

