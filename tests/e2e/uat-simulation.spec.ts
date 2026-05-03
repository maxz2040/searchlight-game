// UAT Simulation — automated split-test assessment across mechanic groups.
//
// This suite simulates three player "personas" on one representative level
// from each of the five mechanic groups and records outcome metrics.
// It is tagged @uat and skipped in CI (SKIP_UAT=1). Run manually with:
//
//   npx playwright test uat-simulation --project=chromium
//
// Mechanic groups under test:
//   lvl-6  — Classic     (900ms dwell, spotlight 0.15,  90s timer)
//   lvl-10 — Quick Dwell (500ms dwell, spotlight 0.15,  75s timer)
//   lvl-14 — Wide Beam   (900ms dwell, spotlight 0.24, 120s timer)
//   lvl-18 — Pinhole     (900ms dwell, spotlight 0.10,  90s timer)
//   lvl-22 — Endless     (900ms dwell, spotlight 0.16,  no timer)
//
// Personas:
//   Sweeper  — systematic left-to-right raster scan (efficient coverage)
//   Drifter  — slow random walk with 4 s pauses (triggers hint ring)
//   Tapper   — fast random movements (stress tests quick dwell)

import { test, expect, type Page } from '@playwright/test';

// Skip in CI unless explicitly requested.
const SKIP = process.env.SKIP_UAT !== '0' && process.env.CI === 'true';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForPlayPhase(page: Page, timeoutMs = 12_000) {
  // Click through to lobby → select level → skip tutorial → playing
  await page.waitForSelector('[data-phase="playing"]', { timeout: timeoutMs });
}

async function selectLevel(page: Page, levelId: string) {
  // Open lobby if not already there
  const lobbyBtn = page.locator('[data-testid="lobby-btn"]');
  if (await lobbyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await lobbyBtn.click();
  }
  // Click the level card
  await page.locator(`[data-testid="level-card-${levelId}"]`).click();
  // Skip tutorial if shown
  const skipBtn = page.locator('[data-testid="tutorial-skip"]');
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipBtn.click();
  }
}

/** Generate a systematic raster-scan path across the play surface. */
function sweepPath(
  surfaceW: number,
  surfaceH: number,
  cols = 8,
  rows = 5,
): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < rows; r++) {
    const leftToRight = r % 2 === 0;
    for (let c = 0; c < cols; c++) {
      const col = leftToRight ? c : cols - 1 - c;
      pts.push({
        x: Math.round(surfaceW * (0.05 + (col / (cols - 1)) * 0.90)),
        y: Math.round(surfaceH * (0.10 + (r  / (rows - 1)) * 0.80)),
      });
    }
  }
  return pts;
}

/** Generate a slow random walk path (Drifter persona). */
function driftPath(
  surfaceW: number,
  surfaceH: number,
  seed = 42,
): Array<{ x: number; y: number; pauseMs?: number }> {
  const pts: Array<{ x: number; y: number; pauseMs?: number }> = [];
  let lc = seed;
  function rand() {
    lc = (lc * 1664525 + 1013904223) & 0xffffffff;
    return (lc >>> 0) / 0xffffffff;
  }
  let x = surfaceW * 0.5;
  let y = surfaceH * 0.5;
  for (let i = 0; i < 30; i++) {
    x = Math.max(30, Math.min(surfaceW - 30, x + (rand() - 0.5) * surfaceW * 0.28));
    y = Math.max(30, Math.min(surfaceH - 30, y + (rand() - 0.5) * surfaceH * 0.28));
    pts.push({ x: Math.round(x), y: Math.round(y), pauseMs: i % 6 === 0 ? 1500 : 200 });
  }
  return pts;
}

/** Generate fast random movements (Tapper persona). */
function tapPath(
  surfaceW: number,
  surfaceH: number,
  seed = 99,
): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  let lc = seed;
  function rand() {
    lc = (lc * 22695477 + 1) & 0xffffffff;
    return (lc >>> 0) / 0xffffffff;
  }
  for (let i = 0; i < 60; i++) {
    pts.push({
      x: Math.round(30 + rand() * (surfaceW - 60)),
      y: Math.round(30 + rand() * (surfaceH - 60)),
    });
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Simulation runner
// ---------------------------------------------------------------------------

interface SimResult {
  group:     string;
  levelId:   string;
  persona:   string;
  found:     number;
  total:     number;
  completed: boolean;
  elapsedMs: number;
  hintsShown:number;
}

async function runSimulation(
  page: Page,
  levelId: string,
  groupLabel: string,
  persona: 'sweeper' | 'drifter' | 'tapper',
): Promise<SimResult> {
  await page.goto('/');
  // Wait for test handle then navigate to lobby so level cards are visible.
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __searchlight?: unknown }).__searchlight),
  );
  await page.evaluate(() => {
    (window as unknown as {
      __searchlight: { store: { getState(): { goToLobby(): void } } }
    }).__searchlight.store.getState().goToLobby();
  });
  await selectLevel(page, levelId);
  await waitForPlayPhase(page);

  const surface = page.locator('[data-testid="play-surface"]');
  const box     = await surface.boundingBox();
  if (!box) throw new Error('Could not find spotlight surface');

  const { width: W, height: H, x: ox, y: oy } = box;

  // Build path for this persona.
  const rawPath =
    persona === 'sweeper' ? sweepPath(W, H) :
    persona === 'drifter' ? driftPath(W, H) :
    tapPath(W, H);

  let hintsShown = 0;
  const startMs  = Date.now();

  for (const pt of rawPath) {
    await page.mouse.move(ox + pt.x, oy + pt.y);
    const pauseMs = (pt as { pauseMs?: number }).pauseMs ?? (persona === 'tapper' ? 50 : 250);
    await page.waitForTimeout(pauseMs);

    // Count hint ring appearances (amber pulsing ring above overlay).
    const hintVisible = await page
      .locator('.animate-hint-pulse')
      .isVisible()
      .catch(() => false);
    if (hintVisible) hintsShown++;

    // Stop early if phase changed away from 'playing'
    const phase = await page
      .locator('[data-phase]')
      .getAttribute('data-phase')
      .catch(() => 'playing');
    if (phase !== 'playing') break;
  }

  const elapsedMs = Date.now() - startMs;

  // Count found creatures.
  const foundEls = await page.locator('[data-found="true"]').count();
  const totalEls = await page.locator('[data-testid^="creature-"]').count();

  const completed = foundEls >= totalEls && totalEls > 0;

  return {
    group:  groupLabel,
    levelId,
    persona,
    found:  foundEls,
    total:  totalEls,
    completed,
    elapsedMs,
    hintsShown,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const MECHANIC_GROUPS = [
  { id: 'lvl-6',  label: 'A-Classic'   },
  { id: 'lvl-10', label: 'B-QuickDwell'},
  { id: 'lvl-14', label: 'C-WideBeam'  },
  { id: 'lvl-18', label: 'D-Pinhole'   },
  { id: 'lvl-22', label: 'E-Endless'   },
] as const;

const PERSONAS = ['sweeper', 'drifter', 'tapper'] as const;

// Collect results for end-of-suite summary.
const results: SimResult[] = [];

test.describe('UAT split-test simulation @uat', () => {
  test.skip(SKIP, 'Set SKIP_UAT=0 to run UAT simulations locally');
  // Each persona simulation can run up to 90 s (drifter has 4.2 s pauses).
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // Start from a clean localStorage state.
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  for (const { id, label } of MECHANIC_GROUPS) {
    for (const persona of PERSONAS) {
      test(`${label} × ${persona}`, async ({ page }) => {
        const result = await runSimulation(page, id, label, persona);
        results.push(result);

        // Sanity: we should interact with the correct level.
        expect(result.total).toBeGreaterThan(0);

        // Log for human review.
        console.log(
          `[UAT] ${label.padEnd(14)} ${persona.padEnd(8)} ` +
          `found=${result.found}/${result.total} ` +
          `completed=${result.completed ? 'YES' : 'no '} ` +
          `hints=${result.hintsShown} ` +
          `time=${(result.elapsedMs / 1000).toFixed(1)}s`,
        );
      });
    }
  }

  // Final summary printed once all simulations finish.
  test('UAT summary report', async () => {
    test.skip(results.length === 0, 'No results collected yet');

    console.log('\n──────────────────────────────────────────────────────');
    console.log('UAT SPLIT-TEST ASSESSMENT — Mechanic Completion Rates');
    console.log('──────────────────────────────────────────────────────');

    const groups = [...new Set(results.map((r) => r.group))];
    for (const group of groups) {
      const groupResults = results.filter((r) => r.group === group);
      const completions  = groupResults.filter((r) => r.completed).length;
      const avgHints     = groupResults.reduce((s, r) => s + r.hintsShown, 0) / groupResults.length;
      const avgTime      = groupResults.reduce((s, r) => s + r.elapsedMs, 0) / groupResults.length;
      console.log(
        `  ${group.padEnd(16)} ` +
        `completion=${completions}/${groupResults.length} ` +
        `avgHints=${avgHints.toFixed(1)} ` +
        `avgTime=${(avgTime / 1000).toFixed(1)}s`,
      );
    }
    console.log('──────────────────────────────────────────────────────\n');

    // Best mechanic: highest completion rate, fewest hints (proxy for "fun").
    const ranked = groups
      .map((g) => {
        const gr = results.filter((r) => r.group === g);
        return {
          group:      g,
          completion: gr.filter((r) => r.completed).length / gr.length,
          avgHints:   gr.reduce((s, r) => s + r.hintsShown, 0) / gr.length,
        };
      })
      .sort((a, b) => b.completion - a.completion || a.avgHints - b.avgHints);

    console.log(`RECOMMENDED MECHANIC: ${ranked[0].group}`);
    console.log(`  completion ${(ranked[0].completion * 100).toFixed(0)}%  avgHints ${ranked[0].avgHints.toFixed(1)}`);
    console.log('──────────────────────────────────────────────────────\n');
  });
});
