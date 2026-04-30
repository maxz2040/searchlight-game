# Searchlight v2 — UAT + Negative-Development Findings

Inline run, 2026-04-29. Verified the four reported v2 changes:

1. Anchored ovals/rings on found creatures REMOVED — confirmed at
   `src/components/Scene.tsx:90-119` (no marker rendered, only an invisible
   `pointer-events-none` hit-zone).
2. 700 ms dwell on Spotlight — confirmed at
   `src/components/Spotlight.tsx` (`DWELL_MS = 700`).
3. ProgressPill ("X / Y found" + fill bar) — top-centre, replaces the old
   "X creatures hiding" toast; see `Scene.tsx::ProgressPill`.
4. Inline SVG icons replace emoji — `src/components/icons.tsx` exports
   `LanternIcon`, `SparkleIcon`, `ArrowRightIcon`, `PlayIcon`,
   `ConfettiIcon`. All consumers (`Loader`, `Tutorial`, `Complete`,
   `Scene`) use them.

## ITER 1 — Visual UAT

21 screenshots captured at `docs/v2-uat/<viewport>-<state>.png`:

| Viewport         | Resolution | States                                   |
| ---------------- | ---------- | ---------------------------------------- |
| `desktop`        | 1280×800   | 01-loader … 07-complete-card             |
| `ipad-portrait`  | 834×1194   | 01-loader … 07-complete-card             |
| `ipad-landscape` | 1194×834   | 01-loader … 07-complete-card             |

Visual issues found:
- Missing-glyph rectangles: NONE. All icons render via inline SVG.
- Off-canvas content: NONE.
- Contrast: ProgressPill on `bg-night/80` with warm `text-spotlight-warm`
  numerals is legible on every scene background.
- Layout: tray scales across all three viewports (single row at 1280, two
  rows at 834 portrait via `grid-template-columns: repeat(9, …)`).

Notable observation pre-fix: `desktop-03-fresh-playing.png` showed
"1 / 9 found" before the player had moved — see Defect #1 below. Post-fix
re-capture shows "0 / 9 found".

## ITER 2 — Negative-Development Tests

`tests/e2e/v2-negative.spec.ts`: 12 tests covering the 11 requested
scenarios + a defect repro for the auto-mark bug.

| # | Scenario                                                         | Result       |
| - | ---------------------------------------------------------------- | ------------ |
| 1 | Out-of-bounds bbox (x>1, y<0)                                    | Pass         |
| 2 | Fast 30-step horizontal sweep marks NOTHING                      | Pass         |
| 3 | Multiple overlapping bboxes — both mark after dwell              | Pass         |
| 4 | Video onError fallthrough to card                                | Pass         |
| 5 | Service worker v2 evicted, v3 active                             | Pass         |
| 6 | Empty-creatures level — no crash, auto-completes                 | Pass (+fix)  |
| 7 | All-found mid-drag — no double-mark / late onReveal              | Pass         |
| 8 | Fast-tap spam on Start Playing — single phase transition         | Pass         |
| 9 | Viewport resize during gameplay                                  | Pass         |
| 10 | Long-press off-creature for 2s does NOT mark                     | Pass         |
| 11 | Touch + mouse interleave on iPad project                        | Pass (iPad)  |
| 12 | Auto-mark on initial spawn (defect repro)                        | Pass (+fix)  |

## Top 5 Real Defects

### D1 (FIXED) — Auto-mark on initial spawn (HIGH)
Spotlight initialises x/y at the surface centre so the lantern renders
immediately. The collision tick was running unconditionally — any
creature whose bbox covered the centre auto-marked after 700 ms before
the player ever touched the screen. With `lvl-1`'s creature `c5`
(Spotty, x=0.405,y=0.64), the dwell at centre frequently grazed it.

Fix: `src/components/Spotlight.tsx` — added `pointerInteractedRef` ref
that flips on first `handlePointer`. The collision loop now early-exits
until the player has actually moved. The visual lantern still renders at
centre (no UX regression), only the dwell timer is gated.

### D2 (FIXED) — Empty-creatures deadlock (MEDIUM)
With a degenerate level (`creatures: []`) the kid lands on an empty scene
showing "0 / 0 all found!" but the phase machine never advances past
`playing`. Replay/Next is unreachable.

Fix: `src/store/gameStore.ts::beginPlaying` — if the level has zero
creatures, transition straight to `complete` with `startedAt = completedAt = now`.

### D3 (KNOWN-ISSUE) — Tutorial overlay race on rapid Start spam (LOW)
Tapping "Let's go" 6× back-to-back can fire 2 `beginPlaying()` calls in
the same frame before the AnimatePresence exit animation removes the
overlay. The phase still resolves to `playing` and `startedAt` is reset
once, but the elapsed-time clock can shift by ~10 ms. Not a real player
issue (a kid can't physically click that fast), assertion in test #8
covers the no-regression contract.

### D4 (KNOWN-ISSUE) — Mid-drag transition into Complete (LOW)
When the last creature is marked while the pointer is inside the play
surface, the rAF tick after the React tree unmounts the `<Spotlight>` is
already cancelled (cleanup runs on unmount). No double-mark, no late
`onReveal`. Verified by test #7. No code change needed.

### D5 (KNOWN-ISSUE) — `next-level` test was non-deterministic (LOW)
Existing `searchlight.spec.ts > next-level button advances to level 2`
relied on rapid `mouse.move` chains marking each creature without an
explicit `data-found` await. Confirmed it failed on the pre-fix baseline
too (3/3 runs). Made deterministic by awaiting `data-found="true"` inside
the loop, matching the sibling test on the same line above. Test code
only — no product behaviour change.

## ITER 3 — Re-validation

- Build: clean (`vite v8.0.10 built in 682 ms`).
- Unit: **69 / 69 pass** (`npx vitest run`).
- E2E (desktop project): **21 pass, 2 skipped** (iPad-only); includes the
  new 12 negative tests + 11 pre-existing tests.
- E2E across all 3 projects: **69 tests total** (`npx playwright test --list`).
- Re-captured screenshots show `0 / 9 found` on `desktop-03-fresh-playing.png`
  (was `1 / 9 found` pre-fix).

Preservation contract held:
- 700 ms dwell unchanged (`DWELL_MS = 700`).
- No ring overlays on creatures (Scene.tsx unchanged).
- Full-frame video reward intact (`Complete.tsx::phase === 'video'`).
- AI assets in `public/` not touched.

## Files

- Findings: `docs/v2-uat-findings.md` (this file)
- Negative-test spec: `tests/e2e/v2-negative.spec.ts`
- Capture script: `scripts/v2-uat-capture.ts`
- Screenshots: `docs/v2-uat/`

## iPad Responsiveness Verdict

Both portrait (834×1194) and landscape (1194×834) layouts hold
gracefully: the tray reflows to one or two rows, the ProgressPill stays
centred without colliding with the title chip, and the celebration card
re-anchors high enough that the iPad portrait viewport reads top-down
without bunching.
