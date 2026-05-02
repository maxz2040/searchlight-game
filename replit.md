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
  main.tsx             # Entry point
  index.css            # Global styles, OKLCH tokens, animation keyframes
  collision.ts         # Spotlight ↔ creature collision detection
  sound.ts             # Web Audio context (unlockAudio, playPing, playFanfare)
  components/
    Loader.tsx          # "Lighting the lantern…" splash + sparkle particles
    Tutorial.tsx        # Level intro overlay + ambient particles
    Scene.tsx           # HUD (timer, progress, target vignette, tray) + FoundBurst
    Spotlight.tsx       # Core mechanic — radial gradient darkness + dwell ring SVG
    SceneBackground.tsx # AI-generated scene PNGs (brightness + vignette)
    Creature.tsx        # Chibi PNG sprites (found/hidden filter states)
    Complete.tsx        # Star rating + creature gallery + replay/next/lobby buttons
    Lobby.tsx           # Level-select screen — 3 scene cards with star ratings
    icons.tsx           # Inline SVG icons (all oklch → sRGB hex for Safari)
  levels/
    levels.ts           # LEVELS array, getLevel(), nextLevelId()
  store/
    gameStore.ts        # Zustand store — phases: loading|tutorial|playing|complete|lobby
public/
  creatures/            # 8 chibi creature PNGs (256×256)
  scenes/               # 3 AI scene PNGs (1024×576)
  videos/               # 3 reward MP4s
  fonts/                # Fraunces.woff2 + Nunito.woff2
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

## Development

```bash
npm run dev    # port 5000
npm run build  # dist/
```
