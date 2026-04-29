import { defineConfig, devices } from '@playwright/test'

// Pokemon Searchlight Edition — E2E config.
//
// Targets: iPad Pro portrait + landscape, plus a desktop viewport for
// dev sanity. The dev preview server is started by the runner; tests
// drive Chromium against it. We use Playwright's bundled Chromium
// from the Playwright npm package; on this dev box that's the
// Apify-cached binary we already have working.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,           // game state is global; serial keeps tests deterministic
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8770',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
    // Force-touch by default — iPad simulation.
    hasTouch: true,
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 8770 --host 127.0.0.1',
    url: 'http://127.0.0.1:8770',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      // iPad Pro 11 portrait — chromium-emulated (webkit not installed
      // in this env). We borrow the viewport / userAgent / pixel-ratio
      // from devices['iPad Pro 11'] but force the browser to chromium.
      name: 'ipad-portrait',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 834, height: 1194 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: false, // chromium doesn't allow isMobile=true with non-webkit
      },
    },
    {
      name: 'ipad-landscape',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1194, height: 834 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: false,
      },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
})
