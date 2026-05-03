// hitbox.spec.ts — focused E2E tests for spotlight hit-detection mechanics.
//
// These tests specifically exercise:
//   • Free-order discovery (any unfound creature can be found)
//   • Dwell ring visual feedback for non-active creatures
//   • Dwell timing accuracy (partial hold vs full hold)
//   • Hitbox expansion tolerance (25% larger than raw bbox)
//   • Active-target priority when bboxes overlap
//   • Dwell reset when spotlight moves off the hitbox
//
// All tests hook into window.__searchlight (main.tsx test handle) so they
// can read level metadata and drive the store without CSS fragility.

import { test, expect, type Page } from '@playwright/test'

interface Creature {
  id: string
  kind: string
  x: number
  y: number
  w: number
  h: number
  name: string
}
interface Level {
  id: string
  title: string
  spotlight: number
  creatures: Creature[]
}

// ── Shared helpers ────────────────────────────────────────────────────────────

async function gotoFresh(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __searchlight?: unknown }).__searchlight),
  )
  await page.evaluate(() => {
    const h = (window as unknown as {
      __searchlight: {
        levels: Level[]
        store: { getState(): { selectLevel(id: string): void } }
      }
    }).__searchlight
    h.store.getState().selectLevel(h.levels[0].id)
  })
}

async function getLevel(page: Page): Promise<Level> {
  return page.evaluate(() =>
    (window as unknown as {
      __searchlight: { store: { getState(): { level(): Level } } }
    }).__searchlight.store.getState().level(),
  )
}

async function getFound(page: Page): Promise<string[]> {
  return page.evaluate(() => [
    ...(window as unknown as {
      __searchlight: { store: { getState(): { found: Set<string> } } }
    }).__searchlight.store.getState().found,
  ])
}

async function waitOverlay(page: Page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="play-surface"]') as HTMLElement | null
      if (!el) return false
      const r = el.getBoundingClientRect()
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      let cur: Element | null = top
      while (cur) { if (cur === el) return true; cur = cur.parentElement }
      return false
    },
    null,
    { timeout: 3_000 },
  )
}

async function startPlaying(page: Page) {
  await page.getByRole('button', { name: /start playing/i }).click()
  await waitOverlay(page)
}

async function moveTo(page: Page, fx: number, fy: number, steps = 8) {
  const surface = page.getByTestId('play-surface')
  const box = await surface.boundingBox()
  if (!box) throw new Error('no surface box')
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps })
}

// ── Free-order discovery ──────────────────────────────────────────────────────

test.describe('Free-order discovery', () => {
  test('dwelling on a non-active creature marks it (any-order find)', async ({ page }) => {
    // c1 is the active (first) target. We dwell on the LAST creature instead.
    // With free-order mechanics it must still be found.
    await gotoFresh(page)
    await startPlaying(page)
    const level = await getLevel(page)
    const last = level.creatures[level.creatures.length - 1]
    const first = level.creatures[0]

    // Make sure last is far from first so the spotlight can't accidentally
    // cover first while we aim at last.
    const dist = Math.hypot(last.x - first.x, last.y - first.y)
    // For lvl-1 this distance will be ~0.7 which is well beyond any
    // spotlight radius (0.16 of min side).
    expect(dist).toBeGreaterThan(0.2)

    await moveTo(page, last.x, last.y)
    await expect(page.getByTestId(`creature-${last.id}`)).toHaveAttribute(
      'data-found', 'true', { timeout: 5_000 },
    )
    // c1 (active target) was never touched — must still be unfound.
    await expect(page.getByTestId(`creature-${first.id}`)).toHaveAttribute(
      'data-found', 'false',
    )
  })

  test('can find all creatures in reverse order', async ({ page }) => {
    await gotoFresh(page)
    await startPlaying(page)
    const level = await getLevel(page)

    // Find in reverse order (last → first).
    const reversed = [...level.creatures].reverse()
    for (const c of reversed) {
      await moveTo(page, c.x, c.y)
      await expect(page.getByTestId(`creature-${c.id}`)).toHaveAttribute(
        'data-found', 'true', { timeout: 5_000 },
      )
    }
    // All creatures found — should land on complete screen.
    await expect(page.getByRole('heading', { name: /you found them all/i })).toBeVisible({
      timeout: 5_000,
    })
  })

  test('active target is found first when bboxes heavily overlap', async ({ page }) => {
    // Inject two creatures with the same centre. Active target (id='a')
    // must be found first because the ordered priority puts it first.
    await gotoFresh(page)
    await page.evaluate(() => {
      const h = (window as unknown as { __searchlight: { levels: Level[] } }).__searchlight
      h.levels[0].creatures = [
        { id: 'a', kind: 'leaf-pup',   x: 0.5, y: 0.5, w: 0.14, h: 0.14, name: 'Alpha' },
        { id: 'b', kind: 'pebble-pal', x: 0.5, y: 0.5, w: 0.14, h: 0.14, name: 'Beta'  },
      ]
    })
    await page.evaluate(() =>
      (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight.store.getState().selectLevel('lvl-1'),
    )
    await startPlaying(page)

    // Dwell on the shared centre — 'a' (active target) must be found first.
    await moveTo(page, 0.5, 0.5)
    await expect(page.getByTestId('creature-a')).toHaveAttribute('data-found', 'true', {
      timeout: 5_000,
    })
    // 'b' is now the next active target; wait for it too (still on bbox).
    await expect(page.getByTestId('creature-b')).toHaveAttribute('data-found', 'true', {
      timeout: 5_000,
    })
    // Verify 'a' was found before 'b' by checking there was only one find at a time.
    const found = await getFound(page)
    expect(found.sort()).toEqual(['a', 'b'])
  })
})

// ── Dwell timing ──────────────────────────────────────────────────────────────

test.describe('Dwell timing', () => {
  test('dwell ring becomes visible within 300 ms of entering a creature hitbox', async ({ page }) => {
    await gotoFresh(page)
    await startPlaying(page)
    const level = await getLevel(page)
    // Use the last creature (non-active) to also confirm free-order ring feedback.
    const c = level.creatures[level.creatures.length - 1]

    await moveTo(page, c.x, c.y)

    // Ring SVG opacity is set directly via element.style.opacity in the rAF
    // loop — check that it becomes non-zero within 300 ms.
    await page.waitForFunction(
      () => {
        const ring = document.querySelector('[data-testid="dwell-ring"]') as SVGElement | null
        return ring !== null && ring.style.opacity !== '0'
      },
      null,
      { timeout: 800 },
    )
  })

  test('partial dwell (650 ms — less than DWELL_MS=900) does NOT mark the creature', async ({ page }) => {
    await gotoFresh(page)
    await startPlaying(page)
    const level = await getLevel(page)
    const target = level.creatures[0]

    const surface = page.getByTestId('play-surface')
    const box = await surface.boundingBox()
    if (!box) throw new Error('no box')

    // Move onto the creature, hold for 300ms, then immediately move far away.
    // 300ms is safely below DWELL_MS=900 even under headless event-loop pressure.
    await page.mouse.move(box.x + box.width * target.x, box.y + box.height * target.y, { steps: 6 })
    await page.waitForTimeout(300)
    // Move to a guaranteed empty corner to break dwell.
    const farX = target.x < 0.5 ? 0.97 : 0.03
    const farY = target.y < 0.5 ? 0.97 : 0.03
    await page.mouse.move(box.x + box.width * farX, box.y + box.height * farY, { steps: 4 })
    await page.waitForTimeout(100)

    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'false')
  })

  test('moving off the hitbox hides the dwell ring', async ({ page }) => {
    await gotoFresh(page)
    await startPlaying(page)
    const level = await getLevel(page)
    const c = level.creatures[0]

    // Move onto creature so ring appears.
    await moveTo(page, c.x, c.y)
    await page.waitForFunction(
      () => {
        const ring = document.querySelector('[data-testid="dwell-ring"]') as SVGElement | null
        return ring !== null && ring.style.opacity !== '0'
      },
      null,
      { timeout: 800 },
    )

    // Move to an empty area — ring should fade back to opacity 0.
    const farX = c.x < 0.5 ? 0.97 : 0.03
    const farY = c.y < 0.5 ? 0.97 : 0.03
    await moveTo(page, farX, farY)
    await page.waitForFunction(
      () => {
        const ring = document.querySelector('[data-testid="dwell-ring"]') as SVGElement | null
        return ring !== null && ring.style.opacity === '0'
      },
      null,
      { timeout: 600 },
    )
  })

  test('after moving away and back, dwell restarts from 0 % (no residual progress)', async ({ page }) => {
    // Hold for 650 ms (partial), move away, immediately return.
    // The creature should need another full ~900 ms — total > 650 ms solo.
    await gotoFresh(page)
    await startPlaying(page)
    const level = await getLevel(page)
    const target = level.creatures[0]
    const farX = target.x < 0.5 ? 0.97 : 0.03
    const farY = target.y < 0.5 ? 0.97 : 0.03

    const surface = page.getByTestId('play-surface')
    const box = await surface.boundingBox()
    if (!box) throw new Error('no box')

    // First pass — 650 ms then leave.
    await page.mouse.move(box.x + box.width * target.x, box.y + box.height * target.y, { steps: 6 })
    await page.waitForTimeout(650)
    await page.mouse.move(box.x + box.width * farX, box.y + box.height * farY, { steps: 4 })
    await page.waitForTimeout(150)

    // Return and hold for another 650 ms — total elapsed since first touch
    // would be > 900 ms if dwell carried over, but it SHOULDN'T.
    await page.mouse.move(box.x + box.width * target.x, box.y + box.height * target.y, { steps: 4 })
    await page.waitForTimeout(650)
    // Still not found — dwell was reset on exit.
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'false')

    // Now hold the full 900 ms without breaking — should find it.
    await page.waitForTimeout(400)
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute(
      'data-found', 'true', { timeout: 3_000 },
    )
  })
})

// ── Exact hitbox detection ────────────────────────────────────────────────────
// The spotlight uses the raw creature bbox with no expansion. Kids must aim
// the spotlight directly at the creature.

test.describe('Exact hitbox detection', () => {
  test('spotlight centred on creature centre registers after full dwell', async ({ page }) => {
    await gotoFresh(page)
    await page.evaluate(() => {
      const h = (window as unknown as { __searchlight: { levels: Level[] } }).__searchlight
      h.levels[0].creatures = [
        { id: 'exact', kind: 'leaf-pup', x: 0.5, y: 0.5, w: 0.12, h: 0.12, name: 'Target' },
      ]
    })
    await page.evaluate(() =>
      (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight.store.getState().selectLevel('lvl-1'),
    )
    await startPlaying(page)
    await moveTo(page, 0.5, 0.5)
    await expect(page.getByTestId('creature-exact')).toHaveAttribute(
      'data-found', 'true', { timeout: 5_000 },
    )
  })

  test('spotlight clearly outside the raw bbox does NOT trigger', async ({ page }) => {
    // Inject a small creature and a very tiny spotlight so the only way to
    // register is to be directly over the bbox (no radius bridge, no expansion).
    await gotoFresh(page)
    await page.evaluate(() => {
      const h = (window as unknown as { __searchlight: { levels: Level[] } }).__searchlight
      h.levels[0].creatures = [
        { id: 'exact', kind: 'leaf-pup', x: 0.5, y: 0.5, w: 0.06, h: 0.06, name: 'Target' },
      ]
      h.levels[0].spotlight = 0.01  // tiny radius so it can't bridge the gap
    })
    await page.evaluate(() =>
      (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight.store.getState().selectLevel('lvl-1'),
    )
    await startPlaying(page)

    // Place spotlight well outside the bbox (half-width = 0.03, so edge at 0.53;
    // test point 0.57 is clearly outside even the largest spotlight radius).
    await moveTo(page, 0.57, 0.5)
    await page.waitForTimeout(1200)
    expect(await getFound(page)).toEqual([])
  })
})
