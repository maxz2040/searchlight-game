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
  fullyParallel: false,
  workers: 1,                     // serial execution — preview server is stable under 1 worker
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
    // Force-touch by default — iPad simulation.
    hasTouch: true,
    // Reduce motion globally so Framer Motion resolves all animations
    // instantly — prevents toBeVisible() timing out on opacity:0 initial states.
    reducedMotion: 'reduce',
    launchOptions: {
      // NixOS: Chromium headless shell requires these flags so it doesn't
      // attempt to load GPU / sandbox libraries that aren't available in the
      // Replit container (libgbm.so.1, etc.).
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
      ],
    },
  },
  webServer: {
    // Use the already-running Vite dev server.  `vite preview` (the built-
    // artefact server on 8770) is killed by the Replit container OOM killer
    // mid-suite; the dev server managed by the workflow is stable.
    command: 'npm run dev',
    url: 'http://127.0.0.1:5000',
    reuseExistingServer: true,
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
