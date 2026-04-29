import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LEVELS } from './levels/levels'
import { useGame } from './store/gameStore'

// Expose level + store hooks on window for E2E tests. The data is
// already in the bundle so this is just a stable test handle —
// no secrets, no behaviour change in production.
//
// Use Object.defineProperty rather than `window.__searchlight = …` so
// terser doesn't elide the assignment as a dead store. The value is
// only consumed by external test code which the bundler can't see, so
// the simple-assignment form gets dropped during minification.
Object.defineProperty(window, '__searchlight', {
  value: { levels: LEVELS, store: useGame },
  writable: false,
  configurable: false,
  enumerable: false,
})

// Register service worker for offline play (PRD §Performance).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker isn't critical; fail silently in dev.
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
