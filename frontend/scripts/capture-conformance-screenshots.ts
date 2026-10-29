import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:5173';
const ROOT_DOCS = path.resolve(__dirname, '../../docs/ui-conformance/screenshots');

const ROLE_USERS = {
  student: {
    uid: 'u_student_01',
    rollNo: '23GEO088',
    name: 'Maya Lin',
    role: 'student',
    status: 'active',
    department: 'Geomatics',
  },
  coordinator: {
    uid: 'u_admin_02',
    rollNo: '21GEO001',
    name: 'Alex Rivera',
    role: 'coordinator',
    post: 'Coordinator',
    status: 'active',
    department: 'Geomatics',
  },
  faculty: {
    uid: 'u_super_admin_01',
    rollNo: 'FAC01',
    name: 'Dr. Sarah Jenkins',
    role: 'faculty',
    status: 'active',
    department: 'Geomatics',
  },
  treasurer: {
    uid: 'u_treasurer_09',
    rollNo: '22GEO019',
    name: 'Ananya Iyer',
    role: 'treasurer',
    post: 'Treasurer',
    status: 'active',
    department: 'Geomatics',
  },
  documentation: {
    uid: 'u_doc_lead_08',
    rollNo: '22GEO034',
    name: 'Aarav Patel',
    role: 'documentation',
    post: 'Documentation Lead',
    status: 'active',
    department: 'Geomatics',
  },
  promotion: {
    uid: 'u_promo_03',
    rollNo: '22GEO014',
    name: 'David Chen',
    role: 'promotion',
    post: 'Promotion Lead',
    status: 'active',
    department: 'Geomatics',
  },
};

const ROLE_SCREENS: Record<string, string[]> = {
  student: ['home', 'events', 'operations', 'memories', 'profile', 'pass', 'scanner', 'forum', 'notifications'],
  coordinator: ['home', 'events', 'operations', 'members', 'meetings', 'attendance', 'profile', 'notifications'],
  faculty: ['home', 'events', 'operations', 'members', 'approvals', 'audit', 'profile', 'notifications'],
  treasurer: ['home', 'events', 'operations', 'finance', 'profile', 'notifications'],
  documentation: ['home', 'events', 'operations', 'archives', 'doc_studio', 'profile', 'notifications'],
  promotion: ['home', 'events', 'operations', 'campaigns', 'profile', 'notifications'],
};

async function captureScreens() {
  console.log('=====================================================');
  console.log('  Capturing Playwright Conformance Screenshots       ');
  console.log('=====================================================');

  const browser = await chromium.launch({ headless: true });

  // 1. System and Auth screens (Unauthenticated)
  console.log('\n--> Capturing Auth & System Gates');
  const authDir = path.join(ROOT_DOCS, 'auth');
  fs.mkdirSync(authDir, { recursive: true });

  const authContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const authPage = await authContext.newPage();

  // Clear session
  await authPage.goto(`${BASE_URL}/#login`, { waitUntil: 'domcontentloaded' });
  await authPage.evaluate(`
    localStorage.clear();
    sessionStorage.clear();
  `);

  // Login screen
  await authPage.goto(`${BASE_URL}/#login`, { waitUntil: 'networkidle' });
  await authPage.waitForTimeout(500);
  await authPage.screenshot({ path: path.join(authDir, 'login.png') });
  console.log('  ✓ auth/login.png (390px)');

  // Pending Approval
  await authPage.evaluate(`
    localStorage.setItem('geohub_auth_session', JSON.stringify({
      token: 'mock_pending_token',
      user: {
        uid: 'u_pending_99',
        name: 'Jordan Lee',
        email: 'jordan.lee@college.edu',
        role: 'student',
        status: 'pending'
      },
      createdAt: Date.now()
    }));
  `);
  await authPage.goto(`${BASE_URL}/#home`, { waitUntil: 'networkidle' });
  await authPage.waitForTimeout(500);
  await authPage.screenshot({ path: path.join(authDir, 'pending_approval.png') });
  console.log('  ✓ auth/pending_approval.png (390px)');

  // 404 Clearance Required
  await authPage.goto(`${BASE_URL}/#invalid-route-xyz`, { waitUntil: 'networkidle' });
  await authPage.waitForTimeout(500);
  await authPage.screenshot({ path: path.join(authDir, 'not_found.png') });
  console.log('  ✓ auth/not_found.png (390px)');

  await authContext.close();

  // 2. Design System Page
  console.log('\n--> Capturing Design System Showroom');
  const dsDir = path.join(ROOT_DOCS, 'design_system');
  fs.mkdirSync(dsDir, { recursive: true });
  const dsContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const dsPage = await dsContext.newPage();
  await dsPage.goto(`${BASE_URL}/#/design-system`, { waitUntil: 'networkidle' });
  await dsPage.waitForTimeout(600);
  await dsPage.screenshot({ path: path.join(dsDir, 'design_system_390px.png'), fullPage: true });
  console.log('  ✓ design_system/design_system_390px.png');

  // Desktop view of Design System
  await dsPage.setViewportSize({ width: 1280, height: 800 });
  await dsPage.waitForTimeout(400);
  await dsPage.screenshot({ path: path.join(dsDir, 'design_system_1280px.png') });
  console.log('  ✓ design_system/design_system_1280px.png');
  await dsContext.close();

  // 3. Role Screens at 390px, 768px, 1280px
  for (const [roleKey, user] of Object.entries(ROLE_USERS)) {
    console.log(`\n--> Capturing role screens for: ${roleKey.toUpperCase()}`);
    const roleDir = path.join(ROOT_DOCS, roleKey);
    fs.mkdirSync(roleDir, { recursive: true });

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    // Authenticate as this role
    await page.goto(`${BASE_URL}/#login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(`
      localStorage.setItem('geohub_auth_session', JSON.stringify({
        token: 'auth_${roleKey}_session',
        user: ${JSON.stringify(user)},
        createdAt: Date.now()
      }));
    `);

    const screens = ROLE_SCREENS[roleKey] || ['home'];
    for (const screen of screens) {
      // Map screen key to URL hash
      let routeHash = screen;
      if (screen === 'pass') routeHash = 'pass';
      if (screen === 'doc_studio') routeHash = 'doc_studio';
      if (screen === 'archives') routeHash = 'archives';
      if (screen === 'campaigns') routeHash = 'campaigns';

      await page.goto(`${BASE_URL}/#${routeHash}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Verify no horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      if (overflow) {
        console.warn(`  ⚠️ Warning: Horizontal overflow on ${roleKey}/${screen}`);
      }

      // 390px capture
      const shot390 = path.join(roleDir, `${screen}.png`);
      await page.screenshot({ path: shot390 });
      console.log(`  ✓ ${roleKey}/${screen}.png (390px)`);

      // Main screens captured at 768px and 1280px as required
      if (screen === 'home' || screen === 'events' || screen === 'operations') {
        // 768px tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(roleDir, `${screen}_768px.png`) });

        // 1280px desktop
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(roleDir, `${screen}_1280px.png`) });

        // Reset to 390px
        await page.setViewportSize({ width: 390, height: 844 });
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\n=====================================================');
  console.log('✓ Conformance screenshots captured and stored in:');
  console.log(`  ${ROOT_DOCS}`);
  console.log('=====================================================');
}

captureScreens().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
