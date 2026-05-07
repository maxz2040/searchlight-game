# se-02n — Restore generated PNG sprites for expanded roster

## Status

**Code wiring + pipeline complete. AI generation blocked on Higgsfield token refresh.**

This MR delivers the full PNG-first sprite pipeline ready to run once the
Higgsfield OAuth bearer is refreshed. No new PNGs are landed in this commit
because the token in `~/.config/searchlight/env` and `.env` is expired
(24-hour TTL on the device-flow grant), and a fresh device authorization
requires human browser interaction (RFC 8628 step 2: user opens
`https://higgsfield.ai/device?code=…` and approves) which an autonomous
polecat session cannot perform.

The user (or anyone with browser access to the Higgsfield account) can refresh
in one command and finish the job:

```bash
bash scripts/higgsfield-auth.sh        # device-flow refresh, ~30 s
npm run sprites:generate               # writes 100 PNGs to public/creatures/
npm run sprites:process                # chroma-keys cream → alpha + rebuilds manifest
```

Resumable: the script skips kinds that already have a PNG file. Cost on
`flux_2`: ~6–10 credits per sprite × 100 missing kinds ≈ 600–1000 credits
(within the 1400-credit Ultimate-plan budget mentioned in
`docs/higgsfield-mcp.md`).

## What this MR contains

| Path | Role |
|---|---|
| `scripts/generate-creature-sprites.ts` | Reads ROSTER, dispatches `generate_image` to Higgsfield MCP, polls `job_status`, downloads PNGs to `public/creatures/<kind>.png`. Resumable, parallel (default 3 in flight), supports `--dry-run`, `--only kind1,kind2`, `--limit N`, `--model flux_2`. |
| `scripts/build-png-manifest.ts` | Scans `public/creatures/*.png` and emits `src/creatures/png-manifest.ts` with `PNG_KINDS` (Set) + `PNG_SPRITE` (kind→URL map). Run automatically as a post-step to `sprites:generate` and `sprites:process`. |
| `src/creatures/png-manifest.ts` | Auto-generated, committed. Source of truth for "this kind has a PNG" at compile time — used by both `Creature.tsx` (renderer) and `creature-coverage.test.ts` (build guard). |
| `src/components/Creature.tsx` | Refactored to import `PNG_SPRITE` from the manifest. Render order: PNG → SvgCreature fallback → null. Comment-flag explains the contract. |
| `src/components/SvgCreature.tsx` | Header comment now flags it explicitly as the fallback path. Behavior unchanged — all 100 inline SVG bodies still ship and render whenever a PNG is missing. |
| `src/__tests__/creature-coverage.test.ts` | Build-time guard: every kind referenced in any `LEVELS[*].creatures` array AND every `ROSTER` entry must resolve to a PNG file or an SvgCreature entry. Fails CI if a level or roster row goes unrenderable. Verifies manifest URLs match `/creatures/<kind>.png`. |
| `package.json` | Three new scripts: `sprites:generate`, `sprites:process` (now also rebuilds manifest), `sprites:manifest`. |
| `report/se-02n-generation-log.jsonl` | One line per generation attempt (kind, jobId, prompt, model, outcome). Written by the script — `report/` is gitignored, so the log stays local. |

## Prompt scaffold

`scripts/generate-creature-sprites.ts` builds each prompt from three pieces:

1. **Per-kind descriptor** — `KIND_DESCRIPTORS[id]` — a one-sentence
   silhouette/colour directive (e.g. `'a fluffy white-and-pink baby bunny
   with long upright ears'`). Hand-curated for all 100 kinds.
2. **Category hint** — `CATEGORY_HINTS[category]` — biome flavour
   (e.g. forest → `'forest creature with leafy / mossy / earthy details'`).
3. **Style scaffold** — fixed for every kind, matches the painterly look of
   the original 8 PNGs:

   ```
   chibi mascot toy character, painterly storybook anime style,
   big head with simplified body, large sparkly anime eyes with twin highlights,
   soft confident outlines with slight line variation, bright saturated colors,
   subtle painterly shading with soft cel highlights, kid-friendly and non-uncanny,
   standing or sitting full body visible, centered, facing camera, friendly smile,
   flat soft cream off-white background (#fff8e7) with no shadow on ground,
   no text, no logos, no watermark, no border, square 1:1 framing.
   ```

The cream-white background is critical — it lets the existing
`scripts/process-creature-sprites.ts` chroma-key pass strip the background
to true alpha (LIGHT_CUTOFF=215, COLOR_TOL=25, EDGE_FEATHER=25 from
`process-creature-sprites.ts`).

Default model: `flux_2` (matches the original 8). Override with
`--model nano_banana_2` if a particular kind benefits from
multi-modal/reference-driven generation.

## Coverage check

`creature-coverage.test.ts` runs as part of `npm test` and enforces three
invariants:

1. Every `kind` used in any level's `creatures` array → renderable
2. Every `ROSTER` entry → renderable
3. Every entry in `PNG_SPRITE` → URL is `/creatures/<kind>.png`

Result on this branch (with PNGs only for the original 8 kinds):

```
✓ creature asset coverage (3 tests, 0 failures)
```

All 71 distinct kinds referenced across the 20 levels resolve to either a
PNG (the 8 from the original commit) or an SvgCreature entry (the 12
hand-drawn + 88 batch SVGs). The test will continue to pass as new PNGs
land, since each PNG simply switches the renderer choice from "fallback"
to "canonical" without changing whether the kind is renderable.

## What was NOT done (and why)

| Item | Status | Reason |
|---|---|---|
| Generate 88 PNG sprites via Higgsfield | ❌ blocked | OAuth bearer expired; refresh requires human browser interaction. Pipeline is ready — see top of report. |
| Visual QA on rendered levels with new PNGs | ❌ blocked | No new PNGs to QA. The existing 8 still render correctly (verified by `Creature.test.tsx`). |
| Per-kind prompt touch-up notes | ❌ blocked | No generations attempted. The generation log (`report/se-02n-generation-log.jsonl`) will capture every run when the pipeline executes. |

## Test + build

```
npm test     → 11 files, 90 tests passed (3 new in creature-coverage.test.ts)
npm run lint → clean
npm run build → 466 KB JS / 45 KB CSS / 0 errors
```

## Escalation

Filed as `hq-wisp-lrok` (HIGH severity) — Higgsfield OAuth bearer needs
refresh before this bead can fully close. Once the token is fresh, this
work can be picked up by re-slinging se-02n and running the two `npm`
commands at the top of this report.
