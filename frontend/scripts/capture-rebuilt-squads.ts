import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const outDir = path.resolve('C:/Users/SIVANAGU/.gemini/antigravity/brain/b6200dad-855f-4d8c-86eb-afedf4aca689');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    const session = {
      user: {
        uid: 'u_admin_01',
        name: 'Alex Rivera',
        role: 'admin',
        teamRole: 'President',
        email: 'alex.rivera@geohub.edu',
        team: 'Management',
        isVolunteer: false,
        status: 'active',
      },
      token: 'mock_jwt_token',
      expiresAt: Date.now() + 86400000,
    };
    localStorage.setItem('geohub_auth_session', JSON.stringify(session));
  });

  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/#operations?module=squads', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const shotPath = path.join(outDir, 'rebuilt_squads_screen.png');
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`Saved screenshot to: ${shotPath}`);

  // Also check attendance desk
  await page.goto('http://localhost:5173/#operations?module=attendance_desk', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const shotPath2 = path.join(outDir, 'rebuilt_attendance_desk.png');
  await page.screenshot({ path: shotPath2, fullPage: false });
  console.log(`Saved screenshot to: ${shotPath2}`);

  await browser.close();
}

main().catch(console.error);

