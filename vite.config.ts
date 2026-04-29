import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Pokemon Searchlight Edition — kid-friendly iPad web game.
// Tailwind v4 via the Vite plugin (no postcss config needed).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'happy-dom',
    globals: true,
    // E2E lives under tests/e2e and uses Playwright's runner — exclude
    // from Vitest's discovery so they don't try to run twice.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
