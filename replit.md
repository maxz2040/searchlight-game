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
- **Icons**: All inline SVG — `PawIcon`, `PlayIcon`, `ConfettiIcon`, `ArrowRightIcon`, `StarIcon`, `LanternIcon`. NO emoji used anywhere (emoji render as empty boxes in headless Chrome / some Android/Windows devices)

## Polish Fixes (May 2026)

- **FoundBurst**: AnimatePresence wraps each burst entry for proper exit animation
- **Creature filter transition**: 320ms ease on CSS `filter` property
- **Loader stagger**: lantern spring-in → text fade → bar slide
- **Hint ring**: AnimatePresence fade-in/out on dwell ring SVG
- **TimerDisplay**: bar color CSS `transition` added
- **LevelCard**: `whileHover` lift on lobby cards
- **Tutorial/Complete Y-drift**: consistent 28px entrance drift
- **Display font size**: unified to 2.369rem across Tutorial/Complete/Lobby headings
- **Dwell ring track**: opacity raised 0.25 → 0.38 for visibility
- **ConfettiIcon**: rebuilt as SVG trophy with confetti dots/streamers (was unicode emoji)
- **PawIcon**: new SVG inline icon replaces `🐾` emoji in Lobby card info row
- **Complete gallery**: `flex flex-wrap justify-center` so partial last row is centred (was `grid-cols-5` → left-aligned 4-item tail)
- **Trophy size**: h-28 w-28 (112px) up from h-24 w-24 (96px)

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
npm run test:e2e   # 171 Playwright E2E tests (3 projects × 57)
```

E2E test files (57 tests per project, 3 projects = 171 total — all green):
- `extra-scenarios.spec.ts` — 8 tests: lobby grid, Waldo foreground layer, endless/classic timer, reduced-motion, timer expiry, star persistence
- `hitbox.spec.ts` — 9 tests: free-order discovery, dwell ring, partial dwell, dwell reset, hitbox expansion, out-of-bounds bbox, exact detection
- `searchlight.spec.ts` — 11 tests: loader→tutorial flow, spotlight reveal, level completion/progression, touch (iPad only), smoke
- `v2-negative.spec.ts` — 13 tests: adversarial (bbox overlap, dwell sweep, viewport resize, video fallthrough, SW cache eviction, free-order v3)
- `uat-simulation.spec.ts` — 16 tests: 5 mechanic groups × 3 personas (sweeper/drifter/tapper) + summary

### E2E Infrastructure
- **Server**: uses the running Vite dev server on port 5000 (`reuseExistingServer: true`) — the `vite preview` server was killed by the Replit OOM killer mid-suite
- **Workers**: 1 (serial) — prevents Chrome OOM crashes on the resource-constrained container
- **NixOS Chrome flags**: `--disable-gpu --no-sandbox --disable-dev-shm-usage --disable-setuid-sandbox`
- **LD_LIBRARY_PATH**: baked into `npm run test:e2e` script (25 Nix packages for Chrome)
- **reducedMotion: 'reduce'**: global Playwright config so Framer Motion resolves instantly
- Run individual spec files or UAT groups via `--grep "A-Classic"` etc. (avoid `|` in `--grep` — shell pipe issue in npm scripts)

### Key E2E Bug Fixes (May 2026)
- `gameStore.ts start()`: guarded with `if (get().phase !== 'loading') return` — prevents Loader's `onReady` callback overriding `goToLobby()` called from tests
- `uat-simulation.spec.ts runSimulation()`: calls `goToLobby()` via store handle before `selectLevel()` on fresh page
- `uat-simulation.spec.ts driftPath()`: pause reduced from 4200 ms → 1500 ms (still 1.67× DWELL_MS=900); test timeout raised to 90 s
- `Spotlight.tsx`: outer div has `data-testid="play-surface"`
- `Complete.tsx`: `isTestEnv` check skips the video phase in tests

## Development

```bash
npm run dev    # port 5000
npm run build  # dist/
```
