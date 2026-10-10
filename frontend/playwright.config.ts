import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Mobile-360',
      use: { viewport: { width: 360, height: 740 } },
    },
    {
      name: 'Mobile-390',
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: 'Mobile-430',
      use: { viewport: { width: 430, height: 932 } },
    },
    {
      name: 'Tablet-768',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Desktop-1280',
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
});
