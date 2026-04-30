// Vitest setup — runs before every test file.
// Brings in jest-dom matchers and any browser-API polyfills happy-dom
// doesn't ship.
import '@testing-library/jest-dom/vitest'

// happy-dom omits ResizeObserver, used (transitively) by Framer Motion.
class ResizeObserverPolyfill {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
;(globalThis as unknown as { ResizeObserver: typeof ResizeObserverPolyfill }).ResizeObserver =
  ResizeObserverPolyfill

// Stub matchMedia (Framer Motion checks reduced-motion).
if (typeof window !== 'undefined' && !window.matchMedia) {
  ;(window as unknown as { matchMedia: unknown }).matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// happy-dom's Image() never decodes anything (no real pixels), so its
// onload handler never fires. The new sceneLoader awaits onload; stub it
// to fire on the next microtask so unit tests don't time out.
class FakeImage {
  set src(_v: string) {
    queueMicrotask(() => this.onload?.())
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
}
;(globalThis as unknown as { Image: typeof FakeImage }).Image = FakeImage

// Stub Web Audio so sound module imports don't blow up under happy-dom.
;(globalThis as unknown as { AudioContext: unknown }).AudioContext = class {
  state = 'running'
  currentTime = 0
  destination = {}
  createOscillator() {
    return {
      type: '',
      frequency: { value: 0 },
      connect: () => ({ connect: () => ({}) }),
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => ({}),
    }
  }
  resume() {
    return Promise.resolve()
  }
}
