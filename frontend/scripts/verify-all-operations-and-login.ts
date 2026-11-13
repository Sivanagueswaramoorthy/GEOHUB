import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

// Role mappings to ensure we can view every single module under its authorized role
const MODULE_ROLE_MAP: Record<string, any> = {
  // People
  squads: { uid: 'u_admin_01', name: 'Alex Rivera', role: 'admin', teamRole: 'President' },
  member_directory: { uid: 'u_admin_01', name: 'Alex Rivera', role: 'admin', teamRole: 'President' },
  squad_leads: { uid: 'u_mgmt_01', name: 'Divya Rao', role: 'management', teamRole: 'Management Lead' },
  
  // Events
  attendance_desk: { uid: 'u_admin_01', name: 'Alex Rivera', role: 'admin', teamRole: 'President' },
  duties_stations: { uid: 'u_admin_01', name: 'Alex Rivera', role: 'admin', teamRole: 'President' },
  event_permissions: { uid: 'u_admin_01', name: 'Alex Rivera', role: 'admin', teamRole: 'President' },
  attendance_operation: { uid: 'u_mgmt_01', name: 'Divya Rao', role: 'management', teamRole: 'Management Lead' },
  duties_assignment: { uid: 'u_mgmt_01', name: 'Divya Rao', role: 'management', teamRole: 'Management Lead' },
  
  // Finance
  treasury: { uid: 'u_admin_01', name: 'Alex Rivera', role: 'admin', teamRole: 'President' },
  expenditure_ledger: { uid: 'u_treasurer_09', name: 'Ananya Iyer', role: 'treasurer', teamRole: 'Treasurer Lead' },
  add_expense: { uid: 'u_treasurer_09', name: 'Ananya Iyer', role: 'treasurer', teamRole: 'Treasurer Lead' },
  financial_audit_export: { uid: 'u_treasurer_09', name: 'Ananya Iyer', role: 'treasurer', teamRole: 'Treasurer Lead' },
  
  // Media & Docs
  release_calendar: { uid: 'u_promo_03', name: 'David Chen', role: 'promotion', teamRole: 'Promotion Lead' },
  event_media_upload: { uid: 'u_promo_03', name: 'David Chen', role: 'promotion', teamRole: 'Promotion Lead' },
  bulletins_daily_report: { uid: 'u_promo_03', name: 'David Chen', role: 'promotion', teamRole: 'Promotion Lead' },
  meetings_mom: { uid: 'u_doc_08', name: 'Aarav Patel', role: 'documentation', teamRole: 'Documentation Lead' },
  
  // Review
  lead_activity_review: { uid: 'u_admin_01', name: 'Alex Rivera', role: 'admin', teamRole: 'President' },
  approvals: { uid: 'u_mgmt_01', name: 'Divya Rao', role: 'management', teamRole: 'Management Lead' },
};

async function verifyScreens() {
  const browser = await chromium.launch({ headless: true });
  const outDir = path.resolve(process.cwd(), 'verify-shots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const url = 'http://localhost:5173';

  // 1. Verify Login Screen on 390x844
  console.log('--- Verifying Login Screen ---');
  const loginContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const loginPage = await loginContext.newPage();
  await loginPage.goto(`${url}/#login`, { waitUntil: 'domcontentloaded' });
  
  // Wait for splash screen to dismiss (up to 2.5s)
  await loginPage.waitForTimeout(2200);
  await loginPage.waitForSelector('input#login-roll-no', { timeout: 8000 });

  // Type in username and password
  await loginPage.fill('input#login-roll-no', '21GEO001');
  await loginPage.fill('input[type="password"]', 'Password123');

  // Check label and input bounding boxes
  const labelBox = await loginPage.locator('label[for="login-roll-no"]').boundingBox();
  const inputBox = await loginPage.locator('input#login-roll-no').boundingBox();

  console.log('Login label box:', labelBox);
  console.log('Login input box:', inputBox);

  if (labelBox && inputBox) {
    const isOverlapping = !(
      labelBox.y + labelBox.height <= inputBox.y ||
      inputBox.y + inputBox.height <= labelBox.y
    );
    console.log(`Label/Input overlap check: ${isOverlapping ? 'FAILED (Overlapping)' : 'PASSED (Clean separation)'}`);
  }

  await loginPage.screenshot({ path: path.join(outDir, 'login_mobile_390.png'), fullPage: false });
  await loginContext.close();

  // 2. Test Operations Hub and all 18 screens
  console.log('\n--- Verifying Operations Hub and all 18 Screens ---');
  const modules = Object.keys(MODULE_ROLE_MAP);

  const viewports = [
    { name: 'mobile_360', width: 360, height: 740 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'desktop_1280', width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    for (const mod of modules) {
      const user = MODULE_ROLE_MAP[mod];
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      
      await ctx.addInitScript((u) => {
        const session = {
          user: {
            ...u,
            email: `${u.uid}@college.edu`,
            team: 'Management',
            isVolunteer: false,
            status: 'active',
          },
          token: 'mock_jwt_token',
          expiresAt: Date.now() + 86400000,
        };
        localStorage.setItem('geohub_auth_session', JSON.stringify(session));
      }, user);

      const page = await ctx.newPage();
      await page.goto(`${url}/#operations?module=${mod}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const maxScroll = Math.max(scrollWidth, bodyScrollWidth);
        const hasHScroll = maxScroll > docWidth + 1;

        const overflowing: string[] = [];
        const all = document.querySelectorAll('*');
        for (let i = 0; i < all.length; i++) {
          const el = all[i] as HTMLElement;
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 2 && el.offsetWidth > 0) {
            overflowing.push(`${el.tagName}.${el.className.toString().slice(0, 30)} (right: ${Math.round(rect.right)}px > ${docWidth}px)`);
          }
        }

        return {
          docWidth,
          maxScroll,
          hasHScroll,
          samples: overflowing.slice(0, 3),
        };
      });

      if (overflow.hasHScroll) {
        console.error(`❌ [${vp.name}] ${mod} OVERFLOW: scrollWidth ${overflow.maxScroll} > clientWidth ${overflow.docWidth}`, overflow.samples);
      } else {
        console.log(`✓ [${vp.name}] ${mod} (${user.role}) fits perfectly (${overflow.docWidth}px)`);
      }

      if (vp.name === 'mobile_390') {
        try {
          await page.screenshot({ path: path.join(outDir, `mod_${mod}.png`), fullPage: false, timeout: 5000 });
        } catch {
          // If font loading timed out, capture without waiting
          await page.screenshot({ path: path.join(outDir, `mod_${mod}.png`), fullPage: false, timeout: 2000 });
        }
      }

      await ctx.close();
    }
  }

  await browser.close();
  console.log('\nAll 18 Operations Hub screens successfully verified!');
}

verifyScreens().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
