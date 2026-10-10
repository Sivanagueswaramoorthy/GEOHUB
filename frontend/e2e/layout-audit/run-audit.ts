import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Violation {
  id: string;
  role: string;
  route: string;
  viewport: string;
  rule: string;
  elementSelector: string;
  expected: string;
  actual: string;
  screenshot: string;
  severity: 'Blocker' | 'Major' | 'Minor' | 'Polish';
}

interface ScreenResult {
  role: string;
  route: string;
  viewport: string;
  passed: boolean;
  violationsCount: number;
  screenshot: string;
}

const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1280x800', width: 1280, height: 800 },
];

const ROLES = [
  {
    key: 'faculty',
    name: 'Faculty Advisor',
    user: {
      uid: 'u_super_admin_01',
      email: 'sarah.jenkins@college.edu',
      name: 'Dr. Sarah Jenkins',
      role: 'super_admin',
      team: 'Management',
      teamRole: 'Faculty Advisor',
      isVolunteer: false,
      status: 'active',
      department: 'Geography & Geomatics',
      yearOfStudy: 'Faculty Staff',
    },
    routes: ['home', 'events', 'operations', 'members', 'profile', 'attendance', 'reports', 'approvals', 'notifications'],
  },
  {
    key: 'coordinator',
    name: 'Coordinator / Lead',
    user: {
      uid: 'u_admin_02',
      email: 'alex.rivera@college.edu',
      name: 'Alex Rivera',
      role: 'admin',
      team: 'Management',
      teamRole: 'Club President',
      isVolunteer: false,
      status: 'active',
      department: 'Geoinformatics Engineering',
      yearOfStudy: 'Final Year (4th)',
    },
    routes: ['home', 'events', 'operations', 'members', 'profile', 'tasks', 'teams', 'meetings', 'notifications'],
  },
  {
    key: 'documentation',
    name: 'Documentation Lead',
    user: {
      uid: 'u_doc_lead_08',
      email: 'aarav.patel@college.edu',
      name: 'Aarav Patel',
      role: 'documentation',
      team: 'Documentation',
      post: 'Documentation Lead',
      teamRole: 'Documentation Lead',
      isVolunteer: false,
      status: 'active',
    },
    routes: ['home', 'events', 'operations', 'archives', 'profile', 'doc_studio', 'forum', 'notifications'],
  },
  {
    key: 'treasurer',
    name: 'Treasurer Lead',
    user: {
      uid: 'u_treasurer_09',
      email: 'ananya.iyer@college.edu',
      name: 'Ananya Iyer',
      role: 'treasurer',
      team: 'Management',
      post: 'Treasurer Lead',
      teamRole: 'Treasurer Lead',
      isVolunteer: false,
      status: 'active',
    },
    routes: ['home', 'events', 'operations', 'finance', 'profile', 'tasks', 'notifications'],
  },
  {
    key: 'promotion',
    name: 'Promotion Lead',
    user: {
      uid: 'u_promo_03',
      email: 'david.chen@college.edu',
      name: 'David Chen',
      role: 'team_admin',
      team: 'Promotion',
      post: 'Promotion Lead',
      teamRole: 'Promotion Lead',
      isVolunteer: false,
      status: 'active',
    },
    routes: ['home', 'events', 'operations', 'campaigns', 'profile', 'forum', 'notifications'],
  },
  {
    key: 'student',
    name: 'Student Volunteer',
    user: {
      uid: 'u_volunteer_05',
      email: 'liam.vance@college.edu',
      name: 'Liam Vance',
      role: 'volunteer',
      team: 'Entertainment',
      teamRole: 'Event Coordinator',
      isVolunteer: true,
      status: 'active',
    },
    routes: ['home', 'events', 'operations', 'memories', 'profile', 'my_qr', 'tasks', 'notifications'],
  },
];

const BASE_URL = 'http://localhost:5173';
const SHOTS_DIR = path.resolve(__dirname, 'shots');

const getAuditScript = (isMobile: boolean) => `
(function() {
  var isMobile = ${isMobile};
  var vList = [];

  function getSelector(el) {
    if (el.id) return '#' + el.id;
    var cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
      : '';
    return el.tagName.toLowerCase() + cls;
  }

  var ALLOWED_FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 22, 28, 32];

  // 1. FONT CHECK
  var allTextEls = Array.from(document.querySelectorAll('body *:not(script):not(style)'));
  for (var i = 0; i < allTextEls.length; i++) {
    var el = allTextEls[i];
    var hasDirectText = Array.from(el.childNodes).some(function(n) {
      return n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0;
    });
    if (!hasDirectText) continue;

    var style = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }

    var fontSize = Math.round(parseFloat(style.fontSize));
    if (fontSize < 11) {
      vList.push({
        rule: 'Font Scale & Minimum Size',
        elementSelector: getSelector(el),
        expected: '>= 11px and token in scale',
        actual: fontSize + 'px (below 11px minimum)',
        severity: 'Blocker'
      });
    } else if (ALLOWED_FONT_SIZES.indexOf(fontSize) === -1) {
      vList.push({
        rule: 'Font Scale',
        elementSelector: getSelector(el),
        expected: 'One of: ' + ALLOWED_FONT_SIZES.join(', ') + 'px',
        actual: fontSize + 'px',
        severity: 'Major'
      });
    }
  }

  // 2. SPACING & GUTTERS CHECK
  var contentContainer = document.querySelector('.mobile-app-content') || document.querySelector('#root');
  if (contentContainer) {
    var containerStyle = window.getComputedStyle(contentContainer);
    var padLeft = Math.round(parseFloat(containerStyle.paddingLeft));
    var padRight = Math.round(parseFloat(containerStyle.paddingRight));
    var expectedGutter = isMobile ? 20 : 24;

    if (padLeft !== expectedGutter) {
      vList.push({
        rule: 'Page Left Gutter',
        elementSelector: getSelector(contentContainer),
        expected: expectedGutter + 'px',
        actual: padLeft + 'px',
        severity: 'Major'
      });
    }
    if (padRight !== expectedGutter) {
      vList.push({
        rule: 'Page Right Gutter',
        elementSelector: getSelector(contentContainer),
        expected: expectedGutter + 'px',
        actual: padRight + 'px',
        severity: 'Major'
      });
    }
  }

  // Sibling Blocks Left Edge Alignment
  if (contentContainer) {
    var directChildren = Array.from(contentContainer.children).filter(function(c) {
      var r = c.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (directChildren.length > 1) {
      var firstLeft = directChildren[0].getBoundingClientRect().left;
      for (var j = 1; j < directChildren.length; j++) {
        var childLeft = directChildren[j].getBoundingClientRect().left;
        if (Math.abs(childLeft - firstLeft) > 1.5) {
          vList.push({
            rule: 'Sibling Left Edge Unity',
            elementSelector: getSelector(directChildren[j]),
            expected: 'left: ' + firstLeft + 'px (within 1px)',
            actual: 'left: ' + childLeft + 'px (offset by ' + Math.round(Math.abs(childLeft - firstLeft)) + 'px)',
            severity: 'Major'
          });
          break;
        }
      }
    }
  }

  // 3. ICONS CHECK
  var svgs = Array.from(document.querySelectorAll('svg'));
  var ALLOWED_ICON_SIZES = [16, 20, 24, 28, 48];
  for (var k = 0; k < svgs.length; k++) {
    var svg = svgs[k];
    var sRect = svg.getBoundingClientRect();
    if (sRect.width === 0 || sRect.height === 0) continue;
    // Skip data visualization charts (DonutCard), illustrations, and QR matrices
    if (sRect.width > 50 || sRect.height > 50) {
      if (Math.round(sRect.width) === 48 && Math.round(sRect.height) === 48) {
        // EmptyState 48px token is permitted
      } else {
        continue;
      }
    }
    if (svg.querySelector('circle[stroke-dasharray]')) continue;

    var w = Math.round(sRect.width);
    var h = Math.round(sRect.height);
    var isMatch = ALLOWED_ICON_SIZES.some(function(sz) {
      return Math.abs(w - sz) <= 2 && Math.abs(h - sz) <= 2;
    });
    if (!isMatch) {
      vList.push({
        rule: 'Icon Sizing (Lucide Tokens)',
        elementSelector: getSelector(svg),
        expected: 'One of 16, 20, 24, 28, 48px',
        actual: w + 'x' + h + 'px',
        severity: 'Minor'
      });
    }
    var computedStroke = window.getComputedStyle(svg).strokeWidth;
    var strokeW = (computedStroke && parseFloat(computedStroke) > 0) ? computedStroke : svg.getAttribute('stroke-width');
    if (strokeW && svg.classList.contains('lucide')) {
      var swNum = parseFloat(strokeW);
      if (swNum > 0 && (swNum < 1.6 || swNum > 1.9)) {
        vList.push({
          rule: 'Icon Stroke Width',
          elementSelector: getSelector(svg),
          expected: '1.75 stroke-width',
          actual: strokeW,
          severity: 'Minor'
        });
      }
    }
  }

  // 4. IMAGES CHECK
  var imgs = Array.from(document.querySelectorAll('img'));
  for (var m = 0; m < imgs.length; m++) {
    var img = imgs[m];
    if (!img.getAttribute('alt') && img.getAttribute('alt') !== '') {
      vList.push({
        rule: 'Image Alt Attribute',
        elementSelector: getSelector(img),
        expected: 'alt attribute present',
        actual: 'Missing alt attribute',
        severity: 'Minor'
      });
    }
    var iStyle = window.getComputedStyle(img);
    if (!iStyle.objectFit || iStyle.objectFit === 'fill') {
      vList.push({
        rule: 'Image Object Fit',
        elementSelector: getSelector(img),
        expected: 'object-fit cover or contain',
        actual: iStyle.objectFit || 'none',
        severity: 'Minor'
      });
    }
  }

  // 5. SEARCHBAR CHECK
  var searchInputs = Array.from(document.querySelectorAll('input[type="search"], input[placeholder*="Search" i]'));
  for (var n = 0; n < searchInputs.length; n++) {
    var sinp = searchInputs[n];
    var sinpRect = sinp.getBoundingClientRect();
    var sh = Math.round(sinpRect.height);
    if (Math.abs(sh - 48) > 2) {
      vList.push({
        rule: 'SearchBar Height',
        elementSelector: getSelector(sinp),
        expected: '48px',
        actual: sh + 'px',
        severity: 'Major'
      });
    }
  }

  // 6. TOUCH TARGET HIT AREA CHECK
  var buttons = Array.from(document.querySelectorAll('button:not(:disabled), [role="button"]:not([aria-disabled="true"])'));
  for (var b = 0; b < buttons.length; b++) {
    var btn = buttons[b];
    var bStyle = window.getComputedStyle(btn);
    if (bStyle.display === 'none' || bStyle.visibility === 'hidden') continue;
    var bRect = btn.getBoundingClientRect();
    if (bRect.width === 0 || bRect.height === 0) continue;
    var afterStyle = window.getComputedStyle(btn, '::after');
    var hasPseudoTarget = afterStyle && (parseFloat(afterStyle.minWidth) >= 44 || parseFloat(afterStyle.width) >= 44);
    var hasTouchClass = btn.classList.contains('touch-target-44') || btn.classList.contains('icon-button') || btn.classList.contains('icon-box-chevron') || btn.classList.contains('sheet-close-btn') || btn.classList.contains('password-toggle-btn') || hasPseudoTarget;
    if (Math.round(bRect.width) < 40 && Math.round(bRect.height) < 40 && !hasTouchClass) {
      vList.push({
        rule: 'Minimum 44x44 Touch Target',
        elementSelector: getSelector(btn),
        expected: '>= 44x44px or touch-target-44 pseudo element',
        actual: Math.round(bRect.width) + 'x' + Math.round(bRect.height) + 'px',
        severity: 'Minor'
      });
    }
  }

  // 7. HEADER & FLOATING NAV CHECK
  var header = document.querySelector('header, .app-header-root, [class*="Header"]');
  if (header) {
    var hRect = header.getBoundingClientRect();
    if (hRect.height > 0 && Math.abs(Math.round(hRect.height) - 64) > 2) {
      vList.push({
        rule: 'App Header Height',
        elementSelector: getSelector(header),
        expected: '64px',
        actual: Math.round(hRect.height) + 'px',
        severity: 'Major'
      });
    }
  }

  var nav = document.querySelector('nav, .floating-nav-root, [class*="FloatingNav"]');
  if (nav) {
    var nRect = nav.getBoundingClientRect();
    if (nRect.height > 0 && Math.abs(Math.round(nRect.height) - 64) > 2) {
      vList.push({
        rule: 'Floating Nav Height',
        elementSelector: getSelector(nav),
        expected: '64px',
        actual: Math.round(nRect.height) + 'px',
        severity: 'Major'
      });
    }
    var navChildren = Array.from(nav.children);
    if (navChildren.length !== 5) {
      vList.push({
        rule: 'Floating Nav 5 Slots',
        elementSelector: getSelector(nav),
        expected: 'Exactly 5 equal navigation slots',
        actual: navChildren.length + ' slots',
        severity: 'Major'
      });
    }
  }

  // 8. OVERLINE LETTER-SPACING CHECK
  var overlines = Array.from(document.querySelectorAll('.font-overline, [class*="overline" i]'));
  for (var ov = 0; ov < overlines.length; ov++) {
    var oel = overlines[ov];
    var oStyle = window.getComputedStyle(oel);
    var ls = oStyle.letterSpacing;
    if (ls === 'normal' || ls === '0px') {
      vList.push({
        rule: 'Overline Letter Spacing',
        elementSelector: getSelector(oel),
        expected: '+0.08em letter-spacing',
        actual: ls,
        severity: 'Minor'
      });
    }
  }

  // 10. HORIZONTAL OVERFLOW CHECK
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 2) {
    vList.push({
      rule: 'Horizontal Page Overflow',
      elementSelector: 'html/body',
      expected: 'scrollWidth <= clientWidth',
      actual: 'scrollWidth (' + document.documentElement.scrollWidth + 'px) > clientWidth (' + document.documentElement.clientWidth + 'px)',
      severity: 'Blocker'
    });
  }

  // 11. PURE WHITE BACKGROUND CHECK
  var bodyBg = window.getComputedStyle(document.body).backgroundColor;
  if (bodyBg && bodyBg !== 'rgb(255, 255, 255)' && bodyBg !== 'rgba(0, 0, 0, 0)') {
    vList.push({
      rule: 'Pure White Scaffold Invariant',
      elementSelector: 'body',
      expected: '#FFFFFF (rgb(255, 255, 255))',
      actual: bodyBg,
      severity: 'Major'
    });
  }

  return vList;
})()
`;

async function runAudit() {
  if (!fs.existsSync(SHOTS_DIR)) {
    fs.mkdirSync(SHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const allViolations: Violation[] = [];
  const screenResults: ScreenResult[] = [];

  let violationCounter = 0;

  console.log('🚀 Starting GeoHub Layout & Design System Audit...');

  for (const role of ROLES) {
    console.log(`\n========================================`);
    console.log(`Auditing Role: ${role.name} (${role.key})`);
    console.log(`========================================`);

    for (const vp of VIEWPORTS) {
      console.log(`\n  Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });

      await context.addInitScript((userData) => {
        try {
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
        } catch (e) {
          console.error(e);
        }
      }, role.user);

      const page = await context.newPage();

      for (const route of role.routes) {
        const targetUrl = `${BASE_URL}/#${route}`;
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(300); // Allow render & data settlement

        const shotFilename = `${role.key}_${route}_${vp.name}.png`;
        const shotPath = path.join(SHOTS_DIR, shotFilename);
        await page.screenshot({ path: shotPath, fullPage: true });

        // Run in-page evaluation of the 11 rules
        const pageViolations: Array<{
          rule: string;
          elementSelector: string;
          expected: string;
          actual: string;
          severity: 'Blocker' | 'Major' | 'Minor' | 'Polish';
        }> = await page.evaluate(getAuditScript(vp.width < 768));

        // Record screen result
        const passed = pageViolations.length === 0;
        screenResults.push({
          role: role.key,
          route,
          viewport: vp.name,
          passed,
          violationsCount: pageViolations.length,
          screenshot: shotFilename,
        });

        for (const pv of pageViolations) {
          violationCounter++;
          allViolations.push({
            id: `VIO-${String(violationCounter).padStart(4, '0')}`,
            role: role.key,
            route,
            viewport: vp.name,
            rule: pv.rule,
            elementSelector: pv.elementSelector,
            expected: pv.expected,
            actual: pv.actual,
            screenshot: shotFilename,
            severity: pv.severity,
          });
        }
      }

      await context.close();
    }
  }

  // Audit special screens: login, pending-approval, 404
  console.log('\n========================================');
  console.log('Auditing Auth & System Screens');
  console.log('========================================');

  const authContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const authPage = await authContext.newPage();

  // 1. #login
  await authPage.goto(`${BASE_URL}/#login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await authPage.evaluate(`localStorage.removeItem('geohub_auth_session')`);
  await authPage.goto(`${BASE_URL}/#login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await authPage.waitForTimeout(400);
  await authPage.screenshot({ path: path.join(SHOTS_DIR, 'auth_login_390x844.png'), fullPage: true });

  // 2. #pending-approval
  const pendingUser = {
    uid: 'u_pending_01',
    name: 'Jordan Lee',
    email: 'jordan@college.edu',
    role: 'member',
    status: 'pending',
  };
  await authPage.evaluate(
    `localStorage.setItem('geohub_auth_session', JSON.stringify({
      token: 'demo_pending',
      user: ${JSON.stringify(pendingUser)},
      rememberMe: true,
      createdAt: Date.now()
    }))`
  );
  await authPage.goto(`${BASE_URL}/#pending-approval`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await authPage.waitForTimeout(400);
  await authPage.screenshot({ path: path.join(SHOTS_DIR, 'auth_pending_390x844.png'), fullPage: true });

  // 3. #404
  await authPage.goto(`${BASE_URL}/#non_existent_route_test`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await authPage.waitForTimeout(400);
  await authPage.screenshot({ path: path.join(SHOTS_DIR, 'auth_404_390x844.png'), fullPage: true });

  await authContext.close();
  await browser.close();

  // Write docs/layout-audit-report.json
  const reportJsonPath = path.resolve(__dirname, '../../../docs/layout-audit-report.json');
  fs.writeFileSync(
    reportJsonPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalScreensAudited: screenResults.length,
        totalViolations: allViolations.length,
        severityCounts: {
          Blocker: allViolations.filter((v) => v.severity === 'Blocker').length,
          Major: allViolations.filter((v) => v.severity === 'Major').length,
          Minor: allViolations.filter((v) => v.severity === 'Minor').length,
          Polish: allViolations.filter((v) => v.severity === 'Polish').length,
        },
        screenResults,
        violations: allViolations,
      },
      null,
      2
    )
  );

  // Write docs/layout-audit-report.md
  const reportMdPath = path.resolve(__dirname, '../../../docs/layout-audit-report.md');
  const blockerCount = allViolations.filter((v) => v.severity === 'Blocker').length;
  const majorCount = allViolations.filter((v) => v.severity === 'Major').length;
  const minorCount = allViolations.filter((v) => v.severity === 'Minor').length;
  const polishCount = allViolations.filter((v) => v.severity === 'Polish').length;

  let reportMd = `# GeoHub Layout & Design System Audit Report

**Date**: ${new Date().toISOString()}  
**Total Screens Audited**: ${screenResults.length}  
**Total Violations Found**: ${allViolations.length}  

## Severity Summary
- 🛑 **Blocker**: ${blockerCount}
- ⚠️ **Major**: ${majorCount}
- ℹ️ **Minor**: ${minorCount}
- 💅 **Polish**: ${polishCount}

---

## Role × Screen Matrix

| Role | Route | 360×740 | 390×844 | 430×932 | 768×1024 | 1280×800 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
`;

  // Aggregate matrix rows
  const roleRoutePairs = Array.from(new Set(screenResults.map((s) => `${s.role}::${s.route}`)));
  for (const pair of roleRoutePairs) {
    const [rRole, rRoute] = pair.split('::');
    const vpStatuses = VIEWPORTS.map((vp) => {
      const match = screenResults.find((s) => s.role === rRole && s.route === rRoute && s.viewport === vp.name);
      return match ? (match.passed ? '✅ Pass' : `❌ Fail (${match.violationsCount})`) : '-';
    });
    reportMd += `| **${rRole}** | \`#${rRoute}\` | ${vpStatuses.join(' | ')} |\n`;
  }

  reportMd += `\n---\n\n## Detailed Violations Log\n\n`;
  reportMd += `| ID | Role | Route | Viewport | Rule | Selector | Expected | Actual | Severity |\n`;
  reportMd += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const v of allViolations.slice(0, 150)) {
    // Show top 150 in table
    reportMd += `| ${v.id} | ${v.role} | \`#${v.route}\` | ${v.viewport} | ${v.rule} | \`${v.elementSelector}\` | ${v.expected} | ${v.actual} | ${v.severity} |\n`;
  }

  if (allViolations.length > 150) {
    reportMd += `\n*... and ${allViolations.length - 150} additional violations documented in layout-audit-report.json.*\n`;
  }

  fs.writeFileSync(reportMdPath, reportMd);

  console.log(`\n========================================`);
  console.log(`Audit Complete!`);
  console.log(`Total Violations: ${allViolations.length}`);
  console.log(`  Blocker: ${blockerCount}`);
  console.log(`  Major:   ${majorCount}`);
  console.log(`  Minor:   ${minorCount}`);
  console.log(`Report generated: docs/layout-audit-report.md and docs/layout-audit-report.json`);
  console.log(`========================================\n`);
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
