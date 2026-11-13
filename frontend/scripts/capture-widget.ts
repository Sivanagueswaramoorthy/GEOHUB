import { chromium } from '@playwright/test';

async function captureWidget() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('file:///C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b/gate_otp_exact_widget.html');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/SIVANAGU/.gemini/antigravity/brain/c9ae040c-2692-43a7-a80f-a4e32d43c96b/gate_otp_exact_widget_rendered.png' });
  await browser.close();
  console.log('Saved gate_otp_exact_widget_rendered.png');
}

captureWidget().catch(console.error);

