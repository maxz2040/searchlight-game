# Searchlight Edition

A kid-friendly iPad web game where players use a magic lantern/spotlight to find hidden creatures in darkened scenes.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (via Vite plugin)
- **Animation**: Framer Motion 12
- **State Management**: Zustand 5

## Project Structure

```
src/
  App.tsx              # Root — phase machine (loading → tutorial → playing → complete ↔ lobby)
  main.tsx             # Entry point + window.__searchlight test handle
  index.css            # Global styles, OKLCH tokens, animation keyframes
  collision.ts         # Spotlight ↔ creature collision; creatureRect() supports expansion param
  sound.ts             # Web Audio context (unlockAudio, playPing, playFanfare)
  components/
    Loader.tsx          # "Lighting the lantern…" splash + sparkle particles
    Tutorial.tsx        # Level intro overlay + ambient particles
    Scene.tsx           # HUD (timer, progress, target vignette, tray) + FoundBurst
    Spotlight.tsx       # Core mechanic — radial gradient darkness + dwell ring SVG
                        #   DWELL_MS=900  FIND_COOLDOWN_MS=500  HIT_EXPANSION=1.25
                        #   FREE-ORDER discovery: any unfound creature can be found;
                        #   active target prioritised on bbox overlap
    SceneBackground.tsx # AI-generated scene PNGs (brightness + vignette); 5 scenes
    Creature.tsx        # Chibi PNG sprites (found/hidden filter states)
    Complete.tsx        # Star rating + creature gallery + replay/next/lobby buttons
    Lobby.tsx           # Level-select screen — 5 scene cards, 3-col portrait / 5-col landscape
    icons.tsx           # Inline SVG icons (all oklch → sRGB hex for Safari)
  levels/
    levels.ts           # 5 LEVELS (forest/meadow/beach/cave/snow); getLevel(), nextLevelId()
  store/
    gameStore.ts        # Zustand store — phases: loading|tutorial|playing|complete|lobby
public/
  creatures/            # 8 chibi creature PNGs (256×256)
  scenes/               # 5 AI scene PNGs: lvl-1-forest, lvl-2-meadow, lvl-3-shore,
                        #                   lvl-4-cave, lvl-5-snow
  videos/               # 3 reward MP4s (lvl-1/2/3 only; 4+5 skip straight to card)
  fonts/                # Fraunces.woff2 + Nunito.woff2
tests/
  e2e/
    searchlight.spec.ts # Core flow tests
    v2-negative.spec.ts # Adversarial / edge-case tests (13 tests)
    hitbox.spec.ts      # Focused hitbox mechanic tests (8 tests)
```

## Phase Machine

```
loading → tutorial → playing → complete
               ↑                   │ next() / goToLobby()
           lobby  ←────────────────┘
```

- `start()` → tutorial (first play after loader)
- `beginPlaying()` → playing
- `markFound` / `timeUp()` → complete
- `replay()` → tutorial (same level)
- `next()` → lobby (advances levelId, saves stars)
- `goToLobby()` → lobby (keeps levelId, saves stars)
- `selectLevel(id)` → tutorial (from lobby card tap)

## Spotlight Mechanic (v3)

- **DWELL_MS = 900** — hold spotlight still over a creature for 900 ms to find it
- **FIND_COOLDOWN_MS = 500** — 500 ms grace after each find before the next dwell starts
- **HIT_EXPANSION = 1.25** — creature bboxes inflated 25 % at runtime; generous hit zone
- **Free-order discovery** — ANY unfound creature can be found in any order. The "active" target (first unfound, shown in TargetVignette) is simply prioritised when multiple bboxes overlap the spotlight simultaneously.
- Dwell ring (amber SVG arc) appears for ANY overlapping unfound creature, not just the active target.

## Levels

| ID    | Title            | Scene  | Creatures | Time | Spotlight |
|-------|------------------|--------|-----------|------|-----------|
| lvl-1 | Whispering Forest | forest | 9         | 120s | 0.16      |
| lvl-2 | Meadow at Dusk   | meadow | 8         | 100s | 0.16      |
| lvl-3 | Starlit Shore    | beach  | 7         |  90s | 0.16      |
| lvl-4 | Crystal Caves    | cave   | 8         |  90s | 0.15      |
| lvl-5 | Snowy Peak       | snow   | 7         |  75s | 0.14      |

## Visual Design System

- **Palette**: warm-amber (oklch 72°) + deep indigo night (oklch 275°)
- **Fonts**: Fraunces (display serif) + Nunito (humanist sans), both woff2-variations
- **Colours in JS/SVG**: sRGB hex ONLY — `#d4a73c` (spotlight-edge), `#a07828` (accent), `rgba(245,238,222,x)` (paper). Never oklch() in attribute strings (Safari < 15.4)
- **Animations**: expo-out `cubic-bezier(0.16,1,0.3,1)` everywhere; Framer Motion springs for celebratory pops
- **Particles**: deterministic `SPARKLES` arrays (no Math.random) in Loader, Tutorial, Complete, Lobby — animated via `animate-float-particle` CSS class with `--dur` custom property per particle

## Key iPad Safari Hardening (do not revert)

1. `unlockAudio()` called synchronously inside Tutorial's button handler
2. `setPointerCapture` in Spotlight's `pointerdown` handler
3. `gesturestart/change/end` prevention in Spotlight
4. All oklch() in JS strings → sRGB hex
5. `-webkit-backdrop-filter` on `.surface-*` classes (index.css)
6. Loader shadow: `rgba(212,167,60,0.55)` not `oklch(...)`
7. Focus ring: `#d4a73c` not `oklch(...)`

## Testing

```bash
npm run test       # 73 Vitest unit tests
npx playwright test  # E2E (ipad-portrait, ipad-landscape, desktop)
```

E2E test files:
- `searchlight.spec.ts` — core game flow (loader → tutorial → playing → complete → lobby)
- `v2-negative.spec.ts` — 13 adversarial tests (out-of-bounds bbox, dwell sweep, overlap, video fallthrough, SW cache, viewport resize, auto-mark prevention, free-order discovery)
- `hitbox.spec.ts` — 8 focused mechanic tests (free-order, dwell ring visibility, partial dwell, dwell reset, hitbox expansion edge cases)

## Development

```bash
npm run dev    # port 5000
npm run build  # dist/
```
