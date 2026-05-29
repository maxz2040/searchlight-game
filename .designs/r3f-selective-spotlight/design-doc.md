# Design Doc: Selective r3f Spotlight Enhancement

## Decision
Choose the selective integration path. Keep Searchlight's 2D DOM/SVG/PNG gameplay as the source of truth, and add r3f only as an optional visual enhancement for the spotlight layer after a performance probe confirms the target device can sustain it.

Full pivot is not recommended for the next build slice. It would require new 3D scene assets, camera composition, model loading, depth authoring, new occlusion rules, and a larger test matrix before it improves the current child-facing loop. Hybrid 3D creatures are also deferred because they complicate creature assets and hitboxes while preserving most full-pivot risks.

## Architecture
- Add `three` and `@react-three/fiber` using React 19-compatible r3f v9.
- Introduce a small `R3fSpotlightLayer` mounted inside the existing play surface.
- Feed it the existing spotlight motion values or a DOM-to-r3f bridge so it follows the same pointer coordinates as `Spotlight.tsx`.
- Keep `Spotlight.tsx` as the owner of pointer capture, radius calculation, rAF collision, dwell ring, and reveal callbacks.
- Render only a lightweight transparent canvas effect: volumetric cone, dust motes, subtle beam edge, or parallax glint.
- Gate the layer with a capability/performance flag so the game can fall back to the current CSS radial gradient.

## Implementation Plan

### Phase 1: Dependency and Compatibility Spike
Add React 19-compatible r3f dependencies and create a minimal off-route or hidden test canvas. Confirm TypeScript, Vite, lint, build, and Vitest remain clean. Record bundle-size delta.

Acceptance criteria:
- `npm run build` passes.
- `npm run lint` passes or existing lint status is documented.
- The installed r3f major version is compatible with React 19.
- Bundle-size delta is recorded in docs or bead notes.

### Phase 2: Spotlight State Bridge
Refactor `Spotlight.tsx` just enough to expose normalized spotlight position, pixel radius, and active/dragging state to child renderers without moving collision or dwell logic into React state. Prefer refs, motion values, or a tiny external store over per-frame React state.

Acceptance criteria:
- Existing spotlight behavior and tests continue to pass.
- Pointer drag does not introduce React re-render per move.
- `R3fSpotlightLayer` can subscribe to position and radius.

### Phase 3: Optional r3f Visual Layer
Implement `R3fSpotlightLayer` as an absolutely positioned, pointer-events-none canvas above the scene background and below HUD/foreground overlays. Render a low-poly/transparent cone or shader plane that follows the spotlight and can be disabled.

Acceptance criteria:
- DOM spotlight overlay and dwell ring still work.
- The r3f layer never captures touch/mouse events.
- The effect can be disabled by feature flag or capability check.
- Visuals remain kid-friendly and do not obscure creatures.

### Phase 4: Performance and Fallback Guard
Add a capability/performance guard that disables the r3f layer on unsupported WebGL, low frame rate, reduced-motion preference if needed, or test environments. Preserve the existing radial gradient fallback.

Acceptance criteria:
- No-WebGL fallback keeps the game playable.
- Offline service worker still serves the game after build.
- iPad viewport tests pass with the layer enabled where supported.

### Phase 5: Regression and Visual Tests
Extend unit/E2E tests to verify the r3f layer is optional and non-interactive. Add Playwright checks for iPad portrait/landscape: start game, drag spotlight, reveal creature, complete level, and confirm no overlay blocks the play surface.

Acceptance criteria:
- Existing unit and E2E suites pass.
- New tests cover disabled and enabled r3f paths.
- iPad golden-path tests still pass.

### Phase 6: Documentation and Decision Record
Document the evaluation, chosen path, deferred alternatives, dependency versions, performance findings, and rollback instructions.

Acceptance criteria:
- A checked-in doc explains why selective r3f was chosen.
- Full-pivot and hybrid options are explicitly deferred with rationale.
- Follow-up beads can be derived for future 3D creature or 3D scene experiments.

## Dependencies
- Phase 2 depends on Phase 1.
- Phase 3 depends on Phase 2.
- Phase 4 depends on Phase 3.
- Phase 5 depends on Phase 4.
- Phase 6 depends on Phases 1-5 findings.

## Risks and Mitigations
- Performance risk: keep canvas optional, lightweight, and disableable.
- Event risk: canvas must be `pointer-events: none`.
- Architecture risk: collision remains DOM/rAF based; r3f is visual only.
- Bundle risk: record size delta before expanding scope.
- Compatibility risk: use r3f v9 for React 19.

## Verification
- `npm run build`
- `npm run test`
- `npm run test:e2e` or targeted Playwright projects for iPad portrait/landscape
- Manual visual check on a real or emulated iPad viewport
