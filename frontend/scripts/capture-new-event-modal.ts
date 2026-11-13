import { chromium } from 'playwright';

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
          department: 'Geomatics & Earth Sciences',
          status: 'active',
        },
        rememberMe: true,
      })
    );
    window.localStorage.setItem('geohub_phone_frame', 'false');
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/#events', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Click 'New event' button
  const newEventBtn = page.locator('button:has-text("New event")');
  await newEventBtn.waitFor({ timeout: 5000 });
  await newEventBtn.click();
  await page.waitForTimeout(500);

  // Fill title to enable Next button
  await page.fill('input[placeholder*="GIS"]', 'GIS Spatial Analysis Workshop');
  await page.waitForTimeout(300);

  // Click 'Next: Duties Roster' to reach Step 2
  await page.click('button:has-text("Next: Duties Roster")');
  await page.waitForTimeout(500);

  // Click 'Assign' on the first squad (Promotion Squad)
  const assignBtn = page.locator('button:has-text("Assign")').first();
  await assignBtn.waitFor({ timeout: 5000 });
  await assignBtn.click();
  await page.waitForTimeout(600);

  const outPicker = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b/fullscreen_people_picker.png';
  await page.screenshot({ path: outPicker });
  console.log(`Saved people picker to: ${outPicker}`);

  await browser.close();
}

main().catch(console.error);
