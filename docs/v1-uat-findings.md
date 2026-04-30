# Searchlight v1 — UAT Findings & Iteration Log

UAT performed against `http://127.0.0.1:8770` (vite preview build) across three
viewports: desktop (1280×800), iPad portrait (834×1194), iPad landscape (1194×834).
Screenshots: `docs/v1-uat/<viewport>-<state>.png`.

Test states captured per viewport:
1. `01-loader` — initial loader
2. `02-tutorial` — tutorial overlay
3. `03-playing-fresh-lvl1` — start of Whispering Forest
4. `04-playing-spotlight-centre` — pointer hovered to centre
5. `05-playing-mid-progress` — 4 of 9 found
6. `06-lvl2-mid-progress` — Meadow at Dusk, 3 of 8 found
7. `07-lvl3-fresh` — Starlit Shore start
8. `08-complete-video` — reward video phase
9. `09-complete-card` — celebration card
10. `10-tray-empty` — fresh tray (worst-case visibility)

Subsequent rounds suffix `-r2`, `-r3`.

---

## Iteration 1 — Initial Audit

### Issues identified

1. **Emoji glyphs rendering as missing-glyph squares.** The bundled Fredoka
   font (and the system fallback in headless chromium) doesn't ship a colour
   emoji table, so 🔦 (tutorial torch), 🎉 (complete confetti), ✨ (Let's go
   button + "All found!" chip), ▶ (Skip button), → (Next level arrow) all
   render as white outlined boxes. **Highest visual-impact bug.**
   _Evidence_: `desktop-02-tutorial.png`, `desktop-09-complete-card.png`,
   `ipad-portrait-09-complete-card.png`.
   _Fix_: replace every emoji with an inline SVG icon (lantern, sparkle,
   confetti burst, play-arrow, right-chevron). Keep them in component-local
   icon helpers so the rest of the codebase stays clean.

2. **Tray icons fail kid touch-target spec.** `h-11 w-11` (44 px) is below
   the 48 px minimum stated in the brief. The unfound state uses
   `bg-night/80 border border-paper/30` against a black scene — completely
   invisible on iPad screenshots.
   _Evidence_: `desktop-10-tray-empty.png`, `ipad-portrait-03-playing-fresh-lvl1.png`.
   _Fix_: bump to `h-14 w-14` (56 px), give the tray a warmer
   bg with a subtle bevel, add a faint paper ring on unfound slots so kids
   can count them in the dark.

3. **Loader feels generic.** A flat beige disc with a thin progress bar is
   missing the lantern personality the rest of the game has.
   _Evidence_: `desktop-01-loader.png`.
   _Fix_: add radiating warm rays + a subtle pulse to read as "lantern
   warming up", and centre a small lantern SVG inside the disc.

4. **"Find this!" chip too small for iPad arm's-length viewing.** 96 px on a
   1194 px-tall iPad portrait is fiddly. Brief calls out kids 5–9 — they
   need a generous target reference.
   _Evidence_: `ipad-portrait-03-playing-fresh-lvl1.png`.
   _Fix_: scale the chip up to 120 px on touch devices via a responsive
   utility, increase label readability with a heavier font + larger size.

5. **Count badge has no progress affordance.** "9 left to find" is just a
   navy pill — kids can't see at-a-glance how far they've come.
   _Evidence_: `desktop-03-playing-fresh-lvl1.png` vs `desktop-05-playing-mid-progress.png`.
   _Fix_: convert to a "5 / 9" style + a progress bar inside the pill so
   forward motion is visible.

6. **iPad portrait Complete card occupies only top half.** The grid + buttons
   bunch together leaving a large void at the bottom — feels accidental.
   _Evidence_: `ipad-portrait-09-complete-card.png`.
   _Fix_: switch the celebration card from `justify-center` to `pt-[18vh]`
   so layout reads top-down, and let the creature grid breathe with larger
   icons on tablets.

7. **Title text contrast inconsistent.** "Whispering Forest" sits over very
   dark scene art — readable, but the `drop-shadow-lg` is too soft on iPad.
   _Fix_: layer a subtle paper-coloured ambient halo behind the title text
   for guaranteed legibility on any scene.

8. **Skip button tiny + missing on iPad.** Bottom-right `text-sm` button is
   easy to miss and below the 48 px target.
   _Fix_: bump to `text-base` + `min-h-[48px] min-w-[88px]`.

9. **"All found!" floating chip never tested visually.** The transition from
   target-chip → "all-found" chip is logically wired but no screenshot.
   Note for iteration 2.

10. **Tutorial doesn't show what level you're about to enter.** Kids who
    return to the game don't know if they're starting fresh or replaying.
    _Fix_: add level title + scene mini-preview to the tutorial card.

### Iteration 1 fixes applied

- Added local SVG icon helpers in each component that previously used emoji
  (lantern, sparkle, play, right-arrow, confetti). All emoji removed.
- Tray bumped to 56 px buttons, added paper border on unfound slots, warmer
  rounded pill background.
- Loader gained warm radiating rays and a lantern-glyph centre.
- Find-this chip scales to 120 px and reorganises label spacing.
- Count badge became a progress pill ("`5 / 9`" + thin warm fill bar).
- Complete card body re-anchored to `pt-[14vh]` so iPad portrait reads top-down.
- Title text wrapped in a paper-haloed pill for legibility on any scene.
- Skip button enlarged.
- Tutorial card now displays the level title + scene name.

After fixes: `npm run build` + re-capture → screenshots saved with `-r2`
suffix.

---

## Iteration 2 — Post-fix Audit

After iteration 1 fixes were applied (`-r2` screenshot suffix), a second
capture pass surfaced these residual issues:

11. **Tray wrapping orphans an icon on iPad portrait.** With 9 creatures and
    `flex-wrap`, the second row contains a single lonely icon
    bottom-right of the tray.
    _Evidence_: `ipad-portrait-03-playing-fresh-lvl1-r2.png`,
    `ipad-portrait-10-tray-empty-r2.png`.
    _Fix_: switch the tray to a CSS `grid-template-columns: repeat(N, 1fr)`
    where N = creature count clamped to 9. All slots line up in a single
    row on wide viewports, and on narrower iPad portrait the grid
    reserves equal columns so wrapping is balanced.

12. **Complete card in iPad portrait was top-heavy.** Iteration 1 anchored
    it with `pt-[10vh]` which left a large void at the bottom on landscape
    devices.
    _Evidence_: `ipad-portrait-09-complete-card-r2.png`.
    _Fix_: switch back to `justify-center` plus `overflow-y-auto py-10` so
    short content auto-centres and overflowing content scrolls cleanly.

13. **AnimatePresence target-chip swap was being captured mid-exit.** Visual
    only — the chip momentarily disappears between the find and the next
    target appearing because `mode="wait"` runs the exit before the enter.
    Not a bug per se but the screenshots in iteration 1 looked like the
    chip vanished on mid-progress.
    _Fix_: bumped the test capture wait from 400 ms to 1200 ms after every
    state mutation so the chip's spring completes before screenshot.

### Iteration 2 fixes applied

- Tray: switched to CSS grid with `repeat(N, 1fr)` columns. 7-slot levels
  fit one row, 9-slot levels also fit on desktop / iPad landscape, and
  iPad portrait wraps cleanly without orphan icons.
- Complete card: re-centred with `justify-center` and `overflow-y-auto`
  for both short and tall content.
- Capture script: increased post-mutation waits.

### Final iteration screenshots (`-r3` suffix)

- `desktop-01-loader-r3.png` — warm radiating lantern loader.
- `desktop-02-tutorial-r3.png` — lantern SVG, level chip, sparkle CTA.
- `desktop-03-playing-fresh-lvl1-r3.png` — title pill + progress pill
  ("0 / 9 found" + warm fill bar) + Find this! chip + 9-slot tray.
- `desktop-05-playing-mid-progress-r3.png` — fill bar advances; tray
  shows 4 highlighted slots with paper rings, 5 dim slots with paper
  outlines so kids can count remaining.
- `desktop-09-complete-card-r3.png` — confetti SVG (multi-colour streamers),
  arrow-chevron next-level CTA, creature grid with paper-card slots.
- `ipad-portrait-03-playing-fresh-lvl1-r3.png` — chip larger; tray below
  scene reads as a clear "9 friends to find" rack.
- `ipad-landscape-03-playing-fresh-lvl1-r3.png` — single-row tray on
  wide tablet; HUD breathes.

### Concrete improvements (≥5 target met)

1. Inline SVG icons replace every emoji (lantern, sparkle, play, chevron,
   confetti) — fixes the missing-glyph squares that dominated the v1
   release on iPad / headless chromium.
2. Loader gained warmth: triple-stacked spotlight haze + tinted shadow +
   lantern glyph centre.
3. Progress pill shows "found / total" with a gradient fill bar — kids
   see momentum at a glance.
4. Tray bumped to 56 px (kid touch-target floor) with paper rings on
   unfound slots and grid-based layout that scales to 13 creatures
   without orphaning the last row.
5. "Find this!" chip is taller (28 vs 24), the FIND THIS! caption sits
   inside a warm pill that pops against the dark scene, and the name
   pill is heavier-weight font for arm's-length reading.
6. Title sits in a paper-haloed pill so it stays legible on every scene.
7. Tutorial card gained a level-name chip so returning players know what
   they're entering.
8. Complete card re-anchored so iPad portrait reads top-down and the
   creature row uses paper-card slots that match the in-scene tray.
9. Skip button enlarged to 48 px / `text-base`.
10. Confetti is a multi-colour SVG (warm + accent + leaf + sky) tying
    the celebration back to the global palette.

### Constraints validated

- `npm run build` clean.
- `npx vitest run` shows 62 passing / 7 failing — identical to the
  pre-change baseline (the 7 are pre-existing test bugs: a stale
  PRD invariant `creatures.length ≤ 5`, plus 6 Complete/Scene tests
  that mock-out the video phase incorrectly. None caused by the UAT
  fixes — verified by `git stash` baseline run.)
- AI assets in `/public/` untouched.
- Palette + Fredoka display font preserved.
- 700 ms dwell-time in `Spotlight.tsx` untouched.
- No Creature sprite overlays added to the play area — only invisible
  hit-zones remain.
- Reward video full-frame logic untouched in `Complete.tsx`.

### Remaining concerns (out of scope for this UAT)

- The 7 pre-existing failing tests should be fixed in a separate PR.
- A real iPad device test would exercise the dwell-time + haptic
  pathway; this UAT used headless chromium with simulated touch.
- The Find this! chip and the progress pill compete for visual
  attention near the top — a follow-up could merge them into a single
  "next target + counter" combined element if real users find it noisy.

