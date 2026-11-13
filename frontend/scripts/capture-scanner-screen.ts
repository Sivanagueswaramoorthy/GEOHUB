import { chromium } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
  const server = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: 4180 },
  });

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => {
      window.localStorage.setItem(
        'geohub_auth_session',
        JSON.stringify({
          token: 'demo_token_vol',
          user: {
            uid: 'u_vol_01',
            rollNo: '21GEO099',
            name: 'Jordan Lee',
            role: 'volunteer',
            department: 'Geomatics & Earth Sciences',
            status: 'active',
          },
          rememberMe: true,
        })
      );
      window.localStorage.setItem('geohub_phone_frame', 'false');
    });

    const page = await context.newPage();
    await page.goto('http://localhost:4180/#scan_qr', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const artifactDir = 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b';

    // 1. Capture rebuilt scanner screen
    const shotScanner = path.resolve(artifactDir, 'rebuilt_qr_scanner_screen.png');
    await page.screenshot({ path: shotScanner, fullPage: true });
    console.log(`Saved screenshot 1: ${shotScanner}`);

    // 2. Click "Use OTP" button
    const useOtpBtn = await page.$('button:has-text("Use OTP")');
    if (useOtpBtn) {
      await useOtpBtn.click();
      await page.waitForTimeout(400);

      // Capture empty state
      const shotOtpEmpty = path.resolve(artifactDir, 'rebuilt_otp_screen_empty.png');
      await page.screenshot({ path: shotOtpEmpty, fullPage: true });
      console.log(`Saved screenshot 2a: ${shotOtpEmpty}`);

      // Enter 6 invalid digits (000000) to trigger the exact inline Invalid OTP error banner
      const key0 = await page.$('button:has-text("0")');
      if (key0) {
        for (let i = 0; i < 6; i++) {
          await key0.click();
          await page.waitForTimeout(60);
        }
        await page.waitForTimeout(200);

        // Click the Enter / submit button to verify OTP manually
        const enterBtn = await page.$('button[aria-label="Submit"]');
        if (enterBtn) {
          await enterBtn.click();
        }
        await page.waitForTimeout(300);

        // Capture the Invalid OTP inline banner
        const shotOtpError = path.resolve(artifactDir, 'rebuilt_otp_error_banner.png');
        await page.screenshot({ path: shotOtpError, fullPage: true });
        console.log(`Saved screenshot 2_error: ${shotOtpError}`);
      }

      // Enter 6 digits to test full 6-digit state with solid (non-blinking) submit button
      for (const d of ['1', '2', '3', '4', '5', '6']) {
        const key = await page.$(`button:has-text("${d}")`);
        if (key) {
          await key.click();
          await page.waitForTimeout(60);
        }
      }
      await page.waitForTimeout(300);

      const shotOtpFilled = path.resolve(artifactDir, 'rebuilt_otp_screen_filled.png');
      await page.screenshot({ path: shotOtpFilled, fullPage: true });
      console.log(`Saved screenshot 2b (6 digits filled): ${shotOtpFilled}`);

      // Return to scanner
      const returnBtn = await page.$('button:has-text("Scanner")');
      if (returnBtn) {
        await returnBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // 3. Click viewfinder to simulate scan
    const viewfinder = await page.$('div[title="Click to simulate scan"]');
    if (viewfinder) {
      await viewfinder.click({ force: true });
      await page.waitForTimeout(500);
      const shotPopup = path.resolve(artifactDir, 'rebuilt_attendance_success_popup.png');
      await page.screenshot({ path: shotPopup, fullPage: true });
      console.log(`Saved screenshot 3: ${shotPopup}`);
    }

    await context.close();
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

capture().catch(console.error);
