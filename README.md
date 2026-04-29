# Pokemon Searchlight Edition

A kid-friendly searchlight game for iPad. Drag your finger across a darkened
scene to find friendly pocket creatures hiding in the shadows. Built per the
PRD at [`docs/PRD.md`](docs/PRD.md).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 — opens on the dev server
npm run build        # production bundle in dist/
npm run preview      # serve the production bundle locally
```

The game targets iPad Safari but runs in any modern desktop browser too
(useful for development).

## What's in v0 (this build)

| Feature | Status |
|---|---|
| Spotlight mechanic (Framer Motion + radial gradient, 60 fps) | ✅ |
| Touch + mouse + pen via PointerEvents | ✅ |
| Circle-vs-rectangle collision with rAF loop | ✅ |
| Three hand-painted SVG scenes (forest, meadow, beach) | ✅ |
| 8 distinct creature kinds with reveal-pop animation | ✅ |
| Idle hint glow after 1.6 s | ✅ |
| Loading screen + tutorial + level-complete screens | ✅ |
| Replay / next-level flow | ✅ |
| Web-Audio-generated ping + fanfare (no audio files) | ✅ |
| Service worker for offline play | ✅ |
| 48 px touch targets, accessible button sizes | ✅ |
| Portrait + landscape responsive layout | ✅ |
| Stub `sceneLoader` interface ready for real backend | ✅ |
| AI-generated scene backgrounds (GPT-Image / SD) | ⏳ stub only |
| Backend image-generation queue + CDN | ⏳ stub only |
| Quadtree broad-phase collision | ⏳ — not needed at 4–5 creatures/level |

## Architecture

```
src/
├── App.tsx                     phase machine: loading → tutorial → playing → complete
├── main.tsx                    React root + service-worker registration
├── index.css                   Tailwind v4 + custom palette + animations
├── sceneLoader.ts              stub for /api/scene; future AI-gen entry point
├── sound.ts                    Web Audio: playPing(), playFanfare()
├── levels/
│   └── levels.ts               level + creature data (% coords, scene kind, spotlight radius)
├── store/
│   └── gameStore.ts            Zustand store: phase, found set, elapsed time
└── components/
    ├── Loader.tsx              "Tuning the lantern..." progress
    ├── Tutorial.tsx            one-screen drag-to-find explainer
    ├── Scene.tsx               composes Spotlight + creatures + HUD
    ├── Spotlight.tsx           CORE — Framer Motion useMotionValue, rAF collision
    ├── Creature.tsx            inline-SVG creature sprites (8 kinds)
    ├── SceneBackground.tsx     hand-painted SVG backdrops (forest/meadow/beach)
    └── Complete.tsx            level-complete celebration screen

public/
└── sw.js                       service worker for offline + scene caching
```

## Performance choices

Per PRD §Performance:

- **Pointer position lives in Framer Motion `useMotionValue`s, not React state.**
  The radial-gradient mask is updated via direct DOM `style.background`
  on every motion-value tick — zero React re-renders during a drag.
- **Collision detection runs in a `requestAnimationFrame` loop**
  reading those motion values. The store's `markFound` is the only React-
  triggering side effect, and it fires at most once per creature.
- **Creature counts are kept low (4–5 per level).** With 4–5 axis-aligned
  rectangles per frame, the closest-point-on-rect-to-circle algorithm is
  O(n) and does not need a quadtree. The PRD's quadtree note becomes
  load-bearing only if a future level wants 50+ creatures.
- **Build size: 338 kB JS / 107 kB gzipped.** Tailwind, Framer Motion,
  Zustand, React 19. No heavy assets — backgrounds are inline SVG.
  Sounds are synthesised via Web Audio.

## Accessibility

Per PRD §UI/UX:

- All interactive elements meet the 48 px minimum touch target with
  generous spacing (`min-h-[60px]`, `min-w-[200px]` on the start button;
  56 px on Replay/Next).
- High-contrast colour palette: `#fff8e7` paper on `#050714` night.
- No hover-only affordances. Every action reachable via tap.
- ARIA labels on the play surface and the start button.
- Haptic feedback (`navigator.vibrate`) on creature reveal where supported.
- `viewport` meta locks user-scaling so kid double-taps don't break layout.
- Reduced-motion support (handled by Framer Motion automatically).

## Scene-data schema

Each level is a small object in `src/levels/levels.ts`:

```ts
{
  id: 'lvl-1',
  title: 'Whispering Forest',
  scene: 'forest',                  // → SceneBackground variant
  spotlight: 0.18,                  // radius as fraction of min(width, height)
  creatures: [
    { id: 'c1', kind: 'leaf-pup', x: 0.15, y: 0.35, w: 0.10, h: 0.10, name: 'Leafu' },
    ...
  ],
}
```

All coordinates are 0..1 fractions of the play surface so scenes adapt
to portrait, landscape, and any iPad size without recomputation.

## Extending toward the full PRD

The v0 scope was deliberately the **playable core**. The PRD's larger
ambition (AI-generated scenes, queue-based backend, CDN caching) plugs
in via three well-defined extension points:

| PRD section | v0 stub | What to add |
|---|---|---|
| §Base scene generation | `src/sceneLoader.ts` | Replace synthetic `setTimeout` with `fetch('/api/scene?level=X')`. Backend returns `{ scene_url, creatures: [...] }`. Renderer already handles fetched URLs (replace `<SceneBackground>` with `<img src={scene_url}>`). |
| §Image generation service | none | Build the FastAPI/Node service per PRD: queue-based scaling, KEDA + Karpenter or equivalent, generic-pocket-creature prompts (NEVER licensed names per PRD). |
| §Caching and CDN | `public/sw.js` already caches `/api/scene/*` stale-while-revalidate | Add `Cache-Control` + `ETag` + `Expires` headers from backend; the SW already honours them. |
| §Prefetch next scene | `prefetchScene()` no-op | Inject `<link rel="prefetch" href={next_scene_url}>` on level-complete. |

## Asset / IP compliance

Per PRD §Safety: this game **never** generates or refers to licensed
characters (Pokémon, Mario, etc). Bundled creature names (Leafu, Emberi,
Voltu, Splashu, Twinki, Roxxo, Capi, Shroomi, Puffi, Cloudi, Sandi,
Zappi, Skye, Sprout) are generic original names. When the real
generation backend ships, prompts must use phrases like "friendly
pocket creatures" — never licensed property names — and the model
should reject prompts that try to invoke them anyway.

## Scripts

```
npm run dev       Vite dev server (HMR)
npm run build     production bundle to dist/
npm run preview   serve dist/ locally
npm run lint      ESLint over src/
```
