# PRD Draft: r3f Evaluation for Pokemon Searchlight Edition

## Problem
Evaluate whether Pokemon Searchlight Edition should incorporate react-three-fiber (r3f) into its existing React/Vite hidden-object game. The decision must compare three paths:

- Selective: keep the 2D core and use r3f for one focused effect.
- Full pivot: rebuild scenes as 3D models with a real light cone.
- Hybrid: keep 2D scenes while introducing 3D creatures and depth-based reveal.

## Current Product Context
The current app is a kid-friendly iPad game with React 19, Vite, TypeScript, Framer Motion, Zustand, Web Audio, static PNG scene backgrounds, SVG/PNG creature assets, PointerEvents input, rAF collision, service worker offline play, and Playwright iPad coverage. The README still references `docs/PRD.md`, but that file is absent in this worktree; this draft uses README, checked-in docs, source, and tests as the planning source of truth.

## Goals
- Pick a recommended integration path with clear rationale.
- Preserve the touch-drag spotlight mechanic and current collision contract.
- Preserve 60 fps iPad Safari behavior.
- Preserve offline play and kid-friendly accessibility.
- Produce discrete implementation beads ready for build dispatch.

## Non-Goals
- Do not rebuild the whole game into a 3D game for this iteration.
- Do not introduce licensed Pokemon assets or naming into implementation work.
- Do not replace existing static scene generation, level data, or creature roster.
- Do not require a backend or online dependency for the first r3f experiment.

## User Stories
- As a child on iPad, I can drag the spotlight exactly as before and discover creatures without lag.
- As a player, I see a richer light/reveal effect that makes the search feel more magical without changing the rules.
- As a parent, I can load and replay the game offline after it has been cached.
- As a developer, I can disable or avoid the r3f effect if it hurts performance.

## Constraints
- Must run smoothly on iPad Safari in portrait and landscape.
- PointerEvents, setPointerCapture, dwell timing, rAF collision, and existing hitbox data must remain authoritative.
- Touch targets must remain at least 48 px.
- The service worker must continue caching app shell and scene/creature assets.
- The implementation must use an r3f version compatible with React 19. Current upstream docs indicate r3f v9 pairs with React 19, while v8 pairs with React 18.

## Open Questions and Resolutions
- Should the project do a full 3D pivot? Resolved: no, not for the next build slice because asset production, camera, occlusion, accessibility, and performance risks are disproportionate.
- Should 3D creatures be introduced? Resolved: defer. Hybrid 3D creatures add asset-pipeline and hitbox complexity without proving that r3f improves the core feel.
- What is the first useful r3f effect? Resolved: a selective, optional spotlight enhancement layer that renders a lightweight volumetric cone/parallax shimmer while existing DOM spotlight and collision remain canonical.
