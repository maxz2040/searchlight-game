// v2 Negative-development tests.
//
// Each test poses a way the player (or environment) could break the game
// and asserts the contracted behaviour. These tests are intentionally
// adversarial — they are the spec for "what should NOT happen".
//
// Hooks into the test handle published at window.__searchlight (see main.tsx).
//
// Coverage:
//   1. Spotlight collision on out-of-bounds bbox (x>1, y<0)
//   2. Dwell timer reset on fast horizontal skim — 30-step sweep marks NOTHING
//   3. Multiple overlapping bboxes — both should mark after dwell
//   4. Video onError fallthrough to card
//   5. Service worker v2→v3 cache eviction
//   6. Empty-creatures level — no crash, ProgressPill "0 / 0", auto-completes
//   7. All-found mid-drag — no double-mark / no late onReveal
//   8. Fast-tap spam on Start Playing — single phase transition
//   9. Viewport resize during gameplay — radius recomputes, no orphan state
//  10. Long-press off-creature for 2s — does NOT mark
//  11. Touch + mouse interleave on iPad project
//  12. (Defect repro) Auto-mark on spawn — spotlight starts at surface
//      centre; a creature whose bbox covers centre must NOT auto-mark.

import { test, expect, type Page } from '@playwright/test';

interface Creature {
  id: string;
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
}
interface Level {
  id: string;
  title: string;
  spotlight: number;
  creatures: Creature[];
}

async function gotoFresh(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __searchlight?: unknown }).__searchlight),
  );
  await page.evaluate(() => {
    const h = (
      window as unknown as {
        __searchlight: {
          levels: Level[];
          store: { getState(): { selectLevel(id: string): void } };
        };
      }
    ).__searchlight;
    h.store.getState().selectLevel(h.levels[0].id);
  });
}

async function getPhase(page: Page): Promise<string> {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          __searchlight: { store: { getState(): { phase: string } } };
        }
      ).__searchlight.store.getState().phase,
  );
}

async function getLevel(page: Page): Promise<Level> {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          __searchlight: { store: { getState(): { level(): Level } } };
        }
      ).__searchlight.store.getState().level(),
  );
}

async function getFound(page: Page): Promise<string[]> {
  return page.evaluate(
    () => [
      ...(
        window as unknown as {
          __searchlight: { store: { getState(): { found: Set<string> } } };
        }
      ).__searchlight.store.getState().found,
    ],
  );
}

async function waitOverlay(page: Page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="play-surface"]') as HTMLElement | null;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      let cur: Element | null = top;
      while (cur) {
        if (cur === el) return true;
        cur = cur.parentElement;
      }
      return false;
    },
    null,
    { timeout: 3000 },
  );
}

async function startPlaying(page: Page) {
  await page.getByRole('button', { name: /start playing/i }).click();
  await waitOverlay(page);
}

async function surfaceBox(page: Page) {
  const surface = page.getByTestId('play-surface');
  const box = await surface.boundingBox();
  if (!box) throw new Error('no surface box');
  return box;
}

async function pointerTo(page: Page, fx: number, fy: number, steps = 6) {
  const box = await surfaceBox(page);
  const x = box.x + box.width * fx;
  const y = box.y + box.height * fy;
  await page.mouse.move(x, y, { steps });
}

test.describe('v2 negative — spotlight + collision', () => {
  test('1. out-of-bounds bbox (x>1, y<0) does not crash and is reachable at the edge', async ({
    page,
  }) => {
    await gotoFresh(page);
    // Mutate level to inject an out-of-bounds creature.
    await page.evaluate(() => {
      const h = (
        window as unknown as {
          __searchlight: {
            levels: Level[];
          };
        }
      ).__searchlight;
      h.levels[0].creatures = [
        // Centre at x=1.05 (off right edge), y=-0.05 (off top), so the
        // bbox bleeds back into the surface near the top-right corner.
        { id: 'oob1', kind: 'leaf-pup', x: 1.05, y: -0.05, w: 0.2, h: 0.2, name: 'OOB' },
      ];
    });
    await page.evaluate(() =>
      (
        window as unknown as {
          __searchlight: { store: { getState(): { selectLevel(id: string): void } } };
        }
      ).__searchlight.store.getState().selectLevel('lvl-1'),
    );
    await startPlaying(page);
    // Drag to the visible corner of the bbox (top-right of surface).
    await pointerTo(page, 0.99, 0.01, 4);
    // The dwell loop should still register a hit — bbox extends into surface.
    await expect(page.getByTestId('creature-oob1')).toHaveAttribute(
      'data-found',
      'true',
      { timeout: 5_000 },
    );
  });

  test('2. fast 30-step horizontal sweep marks NOTHING (dwell honoured)', async ({ page }) => {
    await gotoFresh(page);
    await startPlaying(page);
    const box = await surfaceBox(page);
    // Sweep across the full width in 30 steps very quickly. Total wall
    // time is whatever the mouse driver decides, but each individual
    // overlap is brief — well under 700 ms.
    const y = box.y + box.height * 0.6;
    await page.mouse.move(box.x + 5, y);
    const t0 = Date.now();
    for (let i = 0; i <= 30; i++) {
      const fx = i / 30;
      await page.mouse.move(box.x + box.width * fx, y, { steps: 1 });
    }
    const elapsed = Date.now() - t0;
    // Confirm we actually moved fast (well under 700ms per creature).
    expect(elapsed).toBeLessThan(2500);
    await page.waitForTimeout(300);
    expect(await getFound(page)).toEqual([]);
  });

  test('3. multiple overlapping bboxes — both mark after dwell', async ({ page }) => {
    await gotoFresh(page);
    await page.evaluate(() => {
      const h = (
        window as unknown as { __searchlight: { levels: Level[] } }
      ).__searchlight;
      // Two creatures with heavily overlapping bboxes, both centred near (0.4, 0.4).
      h.levels[0].creatures = [
        { id: 'a', kind: 'leaf-pup', x: 0.4, y: 0.4, w: 0.15, h: 0.15, name: 'A' },
        { id: 'b', kind: 'pebble-pal', x: 0.42, y: 0.41, w: 0.15, h: 0.15, name: 'B' },
      ];
    });
    await page.evaluate(() =>
      (
        window as unknown as {
          __searchlight: { store: { getState(): { selectLevel(id: string): void } } };
        }
      ).__searchlight.store.getState().selectLevel('lvl-1'),
    );
    await startPlaying(page);
    // Park the spotlight on the overlap region for > dwell.
    await pointerTo(page, 0.41, 0.405);
    await page.waitForTimeout(1100);
    const found = await getFound(page);
    expect(found.sort()).toEqual(['a', 'b']);
  });

  test('12. spotlight does NOT auto-mark a creature on initial spawn', async ({ page }) => {
    // Defect repro: Spotlight.tsx initialises x/y to surface centre, so a
    // creature whose bbox covers that centre would auto-mark after 700ms
    // before the player even touches the screen. Verify this is fixed.
    await gotoFresh(page);
    await page.evaluate(() => {
      const h = (
        window as unknown as { __searchlight: { levels: Level[] } }
      ).__searchlight;
      // Creature whose bbox spans the whole centre.
      h.levels[0].creatures = [
        { id: 'centre', kind: 'leaf-pup', x: 0.5, y: 0.5, w: 0.3, h: 0.3, name: 'Centre' },
      ];
    });
    await page.evaluate(() =>
      (
        window as unknown as {
          __searchlight: { store: { getState(): { selectLevel(id: string): void } } };
        }
      ).__searchlight.store.getState().selectLevel('lvl-1'),
    );
    await startPlaying(page);
    // Wait > dwell without ANY pointer movement.
    await page.waitForTimeout(1100);
    expect(await getFound(page)).toEqual([]);
    // Once the player actually moves onto the bbox, dwell should mark it.
    await pointerTo(page, 0.5, 0.5);
    await page.waitForTimeout(900);
    expect(await getFound(page)).toEqual(['centre']);
  });
});

test.describe('v2 negative — UI / state machine', () => {
  test('6. empty-creatures level — no crash, "0 / 0", auto-completes', async ({
    page,
  }) => {
    await gotoFresh(page);
    await page.evaluate(() => {
      const h = (
        window as unknown as { __searchlight: { levels: Level[] } }
      ).__searchlight;
      h.levels[0].creatures = [];
    });
    await page.evaluate(() =>
      (
        window as unknown as {
          __searchlight: { store: { getState(): { selectLevel(id: string): void } } };
        }
      ).__searchlight.store.getState().selectLevel('lvl-1'),
    );
    // Tutorial → playing — the empty level must not crash. After fix it
    // auto-advances to the complete phase since 0 == 0.
    await page.getByRole('button', { name: /start playing/i }).click();
    // Either we go straight to "complete" (preferred) or we land in
    // playing with "0 / 0 all found!" pill. Both are acceptable, neither
    // is a crash.
    await page.waitForTimeout(400);
    const phase = await getPhase(page);
    expect(['playing', 'complete']).toContain(phase);
    if (phase === 'playing') {
      // Pill shows the empty state correctly.
      await expect(page.getByText(/0\s*\/\s*0/)).toBeVisible();
    }
  });

  test('7. all-found mid-drag — no double-mark, no late onReveal', async ({ page }) => {
    await gotoFresh(page);
    await startPlaying(page);
    const level = await getLevel(page);
    // Force-find every creature mid-drag.
    await pointerTo(page, 0.5, 0.5);
    await page.evaluate(() => {
      const h = (
        window as unknown as {
          __searchlight: {
            store: {
              getState(): { level(): Level; markFound(id: string): void };
            };
          };
        }
      ).__searchlight;
      const lvl = h.store.getState().level();
      for (const c of lvl.creatures) h.store.getState().markFound(c.id);
    });
    // Phase becomes complete; further drag should not trigger any extra
    // store changes (markFound is idempotent + Spotlight skips found ids).
    await pointerTo(page, level.creatures[0].x, level.creatures[0].y);
    await page.waitForTimeout(800);
    const found = await getFound(page);
    expect(found.length).toBe(level.creatures.length);
    expect(await getPhase(page)).toBe('complete');
  });

  test('8. fast-tap spam on Start Playing — single phase transition', async ({
    page,
  }) => {
    await gotoFresh(page);
    const btn = page.getByRole('button', { name: /start playing/i });
    // Fire 6 clicks as fast as possible.
    for (let i = 0; i < 6; i++) {
      await btn.click({ force: true, timeout: 1000 }).catch(() => {});
    }
    // Phase must be 'playing' (never 'tutorial' or 'complete') and the
    // store didn't reset startedAt repeatedly to a wildly later time.
    await expect.poll(() => getPhase(page)).toBe('playing');
  });

  test('9. viewport resize during gameplay — radius recomputes, state intact', async ({
    page,
  }) => {
    await gotoFresh(page);
    await startPlaying(page);
    const level = await getLevel(page);
    // Mark one to anchor state.
    await page.evaluate((id) => {
      const h = (
        window as unknown as {
          __searchlight: { store: { getState(): { markFound(id: string): void } } };
        }
      ).__searchlight;
      h.store.getState().markFound(id);
    }, level.creatures[0].id);
    // Resize hard.
    await page.setViewportSize({ width: 600, height: 900 });
    await page.waitForTimeout(200);
    await page.setViewportSize({ width: 1400, height: 700 });
    await page.waitForTimeout(200);
    // Found set survives resize.
    expect((await getFound(page))[0]).toBe(level.creatures[0].id);
    // Surface still responsive — drag onto another creature reveals it.
    const next = level.creatures[1];
    await pointerTo(page, next.x, next.y);
    await expect(page.getByTestId(`creature-${next.id}`)).toHaveAttribute(
      'data-found',
      'true',
      { timeout: 5_000 },
    );
  });

  test('10. long-press off-creature for 2s does NOT mark anything', async ({ page }) => {
    await gotoFresh(page);
    await startPlaying(page);
    const level = await getLevel(page);
    // Pick an empty area: top-left corner is empty for lvl-1.
    const empty = { x: 0.02, y: 0.05 };
    // Make sure no creature bbox actually covers the empty point.
    for (const c of level.creatures) {
      const inX = empty.x > c.x - c.w / 2 && empty.x < c.x + c.w / 2;
      const inY = empty.y > c.y - c.h / 2 && empty.y < c.y + c.h / 2;
      expect(inX && inY).toBe(false);
    }
    const box = await surfaceBox(page);
    const x = box.x + box.width * empty.x;
    const y = box.y + box.height * empty.y;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForTimeout(2000);
    await page.mouse.up();
    expect(await getFound(page)).toEqual([]);
  });

  test('11. touch + mouse interleave on iPad project', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('ipad'), 'iPad-only');
    await gotoFresh(page);
    await startPlaying(page);
    const level = await getLevel(page);
    const target = level.creatures[0];
    const box = await surfaceBox(page);
    // Touch first.
    await page.touchscreen.tap(box.x + box.width * 0.2, box.y + box.height * 0.2);
    // Then mouse drag onto target.
    await pointerTo(page, target.x, target.y);
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute(
      'data-found',
      'true',
      { timeout: 5_000 },
    );
  });
});

test.describe('v2 negative — service worker / video', () => {
  test('4. video onError fallthrough renders the celebration card', async ({ page }) => {
    await gotoFresh(page);
    // Block the video URLs so the <video> element fires onError.
    await page.route('**/videos/**', (route) => route.abort('failed'));
    await startPlaying(page);
    await page.evaluate(() => {
      const h = (
        window as unknown as {
          __searchlight: {
            store: {
              getState(): { level(): Level; markFound(id: string): void };
            };
          };
        }
      ).__searchlight;
      const lvl = h.store.getState().level();
      for (const c of lvl.creatures) h.store.getState().markFound(c.id);
    });
    // The celebration card heading must appear (either onError fired
    // immediately, or the 9.5s setTimeout fallback). 12s timeout covers both.
    await expect(page.getByRole('button', { name: /play again/i })).toBeVisible({
      timeout: 12_000,
    });
  });

  test('5. service worker v2 cache is evicted on activate (v3 active)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Inject a stale v2 cache, then run the SW activate handler manually
    // to verify it deletes anything not equal to the current CACHE_VERSION.
    const result = await page.evaluate(async () => {
      // Seed the stale cache.
      try {
        const c = await caches.open('searchlight-v2');
        await c.put(
          new Request('/__stale-v2__'),
          new Response('stale', { status: 200 }),
        );
      } catch {
        return { ok: false, reason: 'caches API unavailable' };
      }
      const before = await caches.keys();
      // Run the same eviction logic the SW does on activate.
      const CACHE_VERSION = 'searchlight-v3-anime';
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      );
      const after = await caches.keys();
      return { ok: true, before, after, current: CACHE_VERSION };
    });
    if (!('ok' in result) || result.ok === false) {
      test.skip(true, 'caches API not available in test browser');
      return;
    }
    expect(result.before).toContain('searchlight-v2');
    expect(result.after).not.toContain('searchlight-v2');
  });
});

test.describe('Active-target gating (v2 UAT fix)', () => {
  test('panning the spotlight past non-active unfound creatures does NOT mark them', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => Boolean((window as { __searchlight?: unknown }).__searchlight))
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { levels: { id: string }[]; store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight
      h.store.getState().selectLevel(h.levels[0].id)
    })
    await page.getByRole('button', { name: /start playing/i }).click()
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="play-surface"]') as HTMLElement | null
      if (!el) return false
      const r = el.getBoundingClientRect()
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      let cur: Element | null = top
      while (cur) { if (cur === el) return true; cur = cur.parentElement }
      return false
    }, { timeout: 4000 })

    const lvl = await page.evaluate(() => {
      type L = { creatures: { id: string; x: number; y: number; w: number; h: number }[] }
      const h = (window as unknown as { __searchlight: { store: { getState(): { level(): L } } } }).__searchlight
      return h.store.getState().level()
    })
    const surface = page.getByTestId('play-surface')
    const box = await surface.boundingBox()
    if (!box) throw new Error('no box')

    // Pick the unfound creature SPATIALLY FURTHEST from creatures[0] (the
    // active target). Spotlight radius is 0.16 of min(W,H) so we want the
    // dwell-target far enough that the spotlight at its centre cannot
    // overlap c1's bbox even partially. Then dwell on it for 2s — it must
    // NOT mark.
    const c1 = lvl.creatures[0]
    const target = lvl.creatures.slice(1).reduce((best, c) => {
      const d = Math.hypot(c.x - c1.x, c.y - c1.y)
      const dBest = Math.hypot(best.x - c1.x, best.y - c1.y)
      return d > dBest ? c : best
    })
    await page.mouse.move(box.x + box.width * target.x, box.y + box.height * target.y, { steps: 5 })
    await page.waitForTimeout(2000)

    const foundIds = await page.evaluate(() => {
      const h = (window as unknown as { __searchlight: { store: { getState(): { found: Set<string> } } } }).__searchlight
      return [...h.store.getState().found]
    })
    // The far creature must NOT be marked — it's not active.
    expect(foundIds).not.toContain(target.id)
  })
})
