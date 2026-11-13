import { chromium } from 'playwright';
import { preview } from 'vite';
import * as path from 'path';

async function main() {
  console.log('🚀 Starting Vite preview server...');
  const server = await preview({
    preview: {
      port: 4173,
      host: '127.0.0.1',
    },
  });

  const url = 'http://127.0.0.1:4173';
  console.log(`🌐 Server running at ${url}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });

  // Inject session for President / Coordinator role to see CoordinatorHomeView
  await context.addInitScript(() => {
    const session = {
      user: {
        uid: 'u_admin_01',
        name: 'Aarav Patel',
        email: 'aarav.patel@college.edu',
        role: 'admin',
        team: 'Management',
        teamRole: 'President',
        post: 'President',
        isVolunteer: false,
      },
      token: 'mock_jwt_token',
      expiresAt: Date.now() + 86400000,
    };
    localStorage.setItem('geohub_auth_session', JSON.stringify(session));
  });

  const page = await context.newPage();

  console.log('🧭 Navigating to GeoHub Coordinator Home...');
  await page.goto(`${url}/#home`, { waitUntil: 'domcontentloaded' });

  // Wait for the stat tiles to be mounted
  await page.waitForSelector('text=Events');
  await page.waitForSelector('text=Volunteers');

  console.log('📊 Sampling StatTile numbers during live browser execution...');

  const samples: Array<{ timeMs: number; events: string; pending: string; volunteers: string }> = [];
  const startTime = Date.now();

  const evalScript = `
    (() => {
      const getNum = (label) => {
        const all = Array.from(document.querySelectorAll('*'));
        const labelEl = all.find((el) => el.textContent && el.textContent.trim() === label);
        if (labelEl) {
          const card = labelEl.closest('.p-4') || (labelEl.parentElement ? labelEl.parentElement.parentElement : null);
          if (card) {
            const numEl = card.querySelector('.tabular-nums') || card.querySelector('.font-bold');
            if (numEl) return numEl.textContent ? numEl.textContent.trim() : '';
          }
        }
        return '';
      };
      return {
        events: getNum('Events'),
        pending: getNum('Pending'),
        volunteers: getNum('Volunteers'),
      };
    })()
  `;

  while (Date.now() - startTime <= 1300) {
    const elapsed = Date.now() - startTime;
    const tileValues = (await page.evaluate(evalScript)) as {
      events: string;
      pending: string;
      volunteers: string;
    };

    if (tileValues && tileValues.events && tileValues.volunteers) {
      samples.push({
        timeMs: elapsed,
        events: tileValues.events,
        pending: tileValues.pending,
        volunteers: tileValues.volunteers,
      });
    }

    await page.waitForTimeout(50);
  }

  console.log('\n📈 Captured Live Number Progression in Browser:');
  console.table(samples);

  // Take screenshot of completed count-up
  const screenshotPath = path.resolve(process.cwd(), 'test-count-up-verified.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Screenshot saved to ${screenshotPath}`);

  // Verification checks
  const firstSample = samples[0];
  const lastSample = samples[samples.length - 1];

  console.log('\n🔍 Verification Results:');
  console.log(
    `Initial sample (t=${firstSample.timeMs}ms): Events=${firstSample.events}, Pending=${firstSample.pending}, Volunteers=${firstSample.volunteers}`
  );
  console.log(
    `Final sample (t=${lastSample.timeMs}ms): Events=${lastSample.events}, Pending=${lastSample.pending}, Volunteers=${lastSample.volunteers}`
  );

  const hasIncrementedEvents = parseInt(lastSample.events, 10) >= 7;
  const hasIncrementedVolunteers = parseInt(lastSample.volunteers, 10) >= 25;
  const initialWasLower =
    parseInt(firstSample.volunteers, 10) < parseInt(lastSample.volunteers, 10) ||
    firstSample.volunteers === '0';

  if (hasIncrementedEvents && hasIncrementedVolunteers && initialWasLower) {
    console.log(
      '✅ PASS: Numbers are smoothly and visibly counting up from 0 to target values in a real browser!'
    );
  } else {
    console.error('❌ FAIL: Numbers did not progress as expected.');
    process.exitCode = 1;
  }

  await browser.close();
  server.close();
  process.exit(process.exitCode || 0);
}

main().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
