# Searchlight Edition

A kid-friendly iPad web game where players use a magic lantern/spotlight to find hidden creatures.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (via Vite plugin)
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Testing**: Vitest (unit) + Playwright (e2e)

## Project Structure

```
src/
  App.tsx              # Root app component
  main.tsx             # Entry point
  index.css            # Global styles
  collision.ts         # Collision detection logic
  sceneLoader.ts       # Scene/level loading
  sound.ts             # Sound management
  components/          # UI components
    Scene.tsx           # Main game scene
    Creature.tsx        # Creature sprite component
    Spotlight.tsx       # Lantern/spotlight mechanic
    SceneBackground.tsx # Background rendering
    Tutorial.tsx        # Tutorial overlay
    Complete.tsx        # Level complete screen
    Loader.tsx          # Loading screen
    icons.tsx           # SVG icons
  levels/
    levels.ts           # Level definitions
  store/
    gameStore.ts        # Zustand game state store
  __tests__/            # Unit tests
public/                 # Static assets (fonts, sprites, etc.)
scripts/                # Build/utility scripts
tests/                  # E2E Playwright tests
```

## Development

```bash
npm run dev         # Start dev server on port 5000
npm run build       # Build for production
npm run test        # Run unit tests
npm run test:e2e    # Run Playwright e2e tests
```

## Configuration

- **Dev server**: `0.0.0.0:5000` with `allowedHosts: true` (Replit proxy compatible)
- **Deployment**: Static site — builds to `dist/` via `npm run build`
