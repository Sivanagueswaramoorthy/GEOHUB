import { chromium } from 'playwright';
import * as path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const roles = [
    {
      key: 'faculty',
      title: 'Faculty Command',
      user: {
        uid: 'u_faculty_01',
        email: 'sarah.jenkins@college.edu',
        name: 'Dr. Sarah Jenkins',
        role: 'faculty',
        team: 'Management',
        status: 'active',
      },
    },
    {
      key: 'coordinator',
      title: 'Operations Hub',
      user: {
        uid: 'u_coord_01',
        email: 'alex.rivera@college.edu',
        name: 'Alex Rivera',
        role: 'coordinator',
        status: 'active',
      },
    },
    {
      key: 'management',
      title: 'Management Desk',
      user: {
        uid: 'u_mgmt_01',
        email: 'vikram.seth@college.edu',
        name: 'Vikram Seth',
        role: 'management',
        team: 'Management',
        status: 'active',
      },
    },
  ];

  for (const r of roles) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });

    await context.addInitScript((userData) => {
      window.localStorage.setItem(
        'geohub_auth_session',
        JSON.stringify({
          token: 'demo_token_' + userData.uid,
          user: userData,
          rememberMe: true,
          createdAt: Date.now(),
        })
      );
      window.localStorage.setItem('geohub_phone_frame', 'false');
    }, r.user);

    const page = await context.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Click operations tab in floating nav
    const opsButton = page.locator('button[aria-label="Operations"]');
    if (await opsButton.count() > 0) {
      await opsButton.first().click();
      await page.waitForTimeout(600);
    }

    const shotPath = path.resolve(
      'C:/Users/SIVANAGU/.gemini/antigravity/brain/b2ef8fb5-f649-4ebc-9f54-37f91791da8a',
      `operations_${r.key}.png`
    );
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot for ${r.key} to ${shotPath}`);
    await context.close();
  }

  await browser.close();
}

main().catch(console.error);
