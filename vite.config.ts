import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Pokemon Searchlight Edition — kid-friendly iPad web game.
// Tailwind v4 via the Vite plugin (no postcss config needed).
//
// `base` is keyed off vite's `command` (not NODE_ENV) so that a shell-level
// NODE_ENV=production cannot accidentally apply the GitHub Pages base to
// the dev server. `vite build` (real production build) gets the
// `/searchlight-game/` prefix; `vite serve` (npm run dev), Playwright, and
// vitest all stay at `/`.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/searchlight-game/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    // E2E lives under tests/e2e and uses Playwright's runner — exclude
    // from Vitest's discovery so they don't try to run twice.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    setupFiles: ['./src/__tests__/setup.ts'],
    // Force NODE_ENV=test inside test workers. A shell-level
    // NODE_ENV=production causes React to load its production cjs build,
    // which omits React.act and crashes @testing-library/react with
    // "React.act is not a function".
    env: { NODE_ENV: 'test' },
  },
}))
