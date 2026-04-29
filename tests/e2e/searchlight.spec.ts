import { test, expect, type Page } from '@playwright/test'

/**
 * E2E tests for Pokemon Searchlight Edition.
 *
 * Uses the test handle published at `window.__searchlight` (in main.tsx)
 * to read level metadata and drive the Zustand store directly when
 * needed. This is more deterministic than CSS-based locators for
 * fast-moving game state.
 *
 * iPad simulation: portrait + landscape projects in playwright.config.ts
 * provide the right viewport, hasTouch, and isMobile flags.
 */

interface Creature {
  id: string
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

async function gotoFreshGame(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() => Boolean((window as { __searchlight?: unknown }).__searchlight))
  // Reset to lvl-1, tutorial phase. Avoids state leaking between tests.
  await page.evaluate(() => {
    const handle = (window as unknown as {
      __searchlight: { levels: Level[]; store: { getState(): { selectLevel(id: string): void } } }
    }).__searchlight
    handle.store.getState().selectLevel(handle.levels[0].id)
  })
}

async function getCurrentLevel(page: Page): Promise<Level> {
  return page.evaluate(() => {
    const handle = (window as unknown as {
      __searchlight: { store: { getState(): { level(): Level } } }
    }).__searchlight
    return handle.store.getState().level()
  })
}

async function getPhase(page: Page): Promise<string> {
  return page.evaluate(() => {
    const handle = (window as unknown as {
      __searchlight: { store: { getState(): { phase: string } } }
    }).__searchlight
    return handle.store.getState().phase
  })
}

async function dragSpotlightTo(page: Page, fracX: number, fracY: number) {
  // Drag the spotlight to a fraction of the play surface.
  // PointerEvents fire onMove + onDown handlers in Spotlight.tsx.
  const surface = page.getByTestId('play-surface')
  const box = await surface.boundingBox()
  if (!box) throw new Error('play surface has no bounding box')
  const x = box.x + box.width * fracX
  const y = box.y + box.height * fracY
  await page.mouse.move(x, y, { steps: 8 })
}

// The Tutorial overlay's framer-motion exit animation keeps it in the DOM
// (covering the surface, blocking pointer events) for a few hundred ms after
// `beginPlaying()`. Tests should call this once after the start-playing
// click so subsequent drags actually reach the spotlight.
async function waitForOverlayClear(page: Page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="play-surface"]') as HTMLElement | null
      if (!el) return false
      const r = el.getBoundingClientRect()
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      let cur: Element | null = top
      while (cur) {
        if (cur === el) return true
        cur = cur.parentElement
      }
      return false
    },
    null,
    { timeout: 3000 },
  )
}

async function startPlaying(page: Page) {
  await page.getByRole('button', { name: /start playing/i }).click()
  await waitForOverlayClear(page)
}

test.describe('Loader → Tutorial → Playing flow', () => {
  test('starts in tutorial after the loader completes', async ({ page }) => {
    await page.goto('/')
    // Loader animation takes ~700ms; expect tutorial visible within 2.5s.
    await expect(page.getByRole('heading', { name: /find the hidden friends/i })).toBeVisible({
      timeout: 5_000,
    })
  })

  test('tapping the start button moves into the playing phase', async ({ page }) => {
    await gotoFreshGame(page)
    // Tutorial overlay shows after gotoFreshGame's reset.
    await expect(page.getByRole('button', { name: /start playing/i })).toBeVisible()
    await startPlaying(page)
    await expect.poll(() => getPhase(page)).toBe('playing')
  })
})

test.describe('Spotlight + reveal', () => {
  test('moving the spotlight onto a creature reveals it', async ({ page }) => {
    await gotoFreshGame(page)
    await startPlaying(page)

    const level = await getCurrentLevel(page)
    const target = level.creatures[0]
    const tag = page.getByTestId(`creature-${target.id}`)
    await expect(tag).toHaveAttribute('data-found', 'false')

    // Drag the spotlight onto the creature centre.
    await dragSpotlightTo(page, target.x, target.y)
    await expect(tag).toHaveAttribute('data-found', 'true', { timeout: 5_000 })
  })

  test('off-creature drags do NOT reveal the creature', async ({ page }) => {
    await gotoFreshGame(page)
    await startPlaying(page)
    const level = await getCurrentLevel(page)
    const target = level.creatures[0]

    // Drag to the OPPOSITE corner of the surface from the target.
    const farX = target.x < 0.5 ? 0.95 : 0.05
    const farY = target.y < 0.5 ? 0.95 : 0.05
    await dragSpotlightTo(page, farX, farY)
    // Wait a beat for any rAF ticks to clear; should still be unfound.
    await page.waitForTimeout(200)
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'false')
  })

  test('a once-found creature stays found across further drags', async ({ page }) => {
    await gotoFreshGame(page)
    await startPlaying(page)
    const level = await getCurrentLevel(page)
    const target = level.creatures[0]

    await dragSpotlightTo(page, target.x, target.y)
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'true')

    // Drag away
    await dragSpotlightTo(page, 0.05, 0.05)
    await page.waitForTimeout(150)
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'true')
  })
})

test.describe('Level completion + progression', () => {
  test('finding all creatures shows the complete screen', async ({ page }) => {
    await gotoFreshGame(page)
    await startPlaying(page)

    const level = await getCurrentLevel(page)
    for (const c of level.creatures) {
      await dragSpotlightTo(page, c.x, c.y)
      await expect(page.getByTestId(`creature-${c.id}`)).toHaveAttribute('data-found', 'true', {
        timeout: 5_000,
      })
    }
    await expect(page.getByRole('heading', { name: /you found them all/i })).toBeVisible({
      timeout: 5_000,
    })
    await expect.poll(() => getPhase(page)).toBe('complete')
  })

  test('next-level button advances to level 2 and resets state', async ({ page }) => {
    await gotoFreshGame(page)
    await startPlaying(page)
    const level1 = await getCurrentLevel(page)
    for (const c of level1.creatures) await dragSpotlightTo(page, c.x, c.y)
    await expect(page.getByRole('button', { name: /next level/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: /next level/i }).click()
    const level2 = await getCurrentLevel(page)
    expect(level2.id).not.toBe(level1.id)
    await expect.poll(() => getPhase(page)).toBe('tutorial')
  })

  test('replay resets the same level', async ({ page }) => {
    await gotoFreshGame(page)
    await startPlaying(page)
    const level = await getCurrentLevel(page)
    // Find one creature so we have state to reset.
    await dragSpotlightTo(page, level.creatures[0].x, level.creatures[0].y)
    // Force-complete via the store to avoid finding all manually.
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { store: { getState(): { level(): Level; markFound(id: string): void } } }
      }).__searchlight
      const lvl = h.store.getState().level()
      for (const c of lvl.creatures) h.store.getState().markFound(c.id)
    })
    await expect(page.getByRole('button', { name: /play again/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: /play again/i }).click()
    await expect.poll(() => getPhase(page)).toBe('tutorial')
    const after = await getCurrentLevel(page)
    expect(after.id).toBe(level.id)
  })
})

test.describe('Touch input (iPad simulation)', () => {
  test('tap-and-drag reveals a creature using real touch events', async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'iPad emulation runs only on chromium projects')
    test.skip(!testInfo.project.name.startsWith('ipad'), 'iPad-only — desktop has hasTouch=false')
    await gotoFreshGame(page)
    await startPlaying(page)
    const level = await getCurrentLevel(page)
    const target = level.creatures[0]
    const surface = page.getByTestId('play-surface')
    const box = await surface.boundingBox()
    if (!box) throw new Error('no bounding box')
    const x = box.x + box.width * target.x
    const y = box.y + box.height * target.y

    // Touchscreen drag: tap and slide.
    await page.touchscreen.tap(box.x + box.width * 0.05, box.y + box.height * 0.05)
    await page.waitForTimeout(50)
    // Playwright doesn't have touchscreen.move; use page.mouse with hasTouch
    // emulation, which dispatches PointerEvents the Spotlight handler reads.
    await page.mouse.move(x, y, { steps: 8 })
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'true', {
      timeout: 5_000,
    })
  })
})

test.describe('Smoke', () => {
  test('home page renders without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
    })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /find the hidden friends/i })).toBeVisible({
      timeout: 5_000,
    })
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('level title is visible on the play surface', async ({ page }) => {
    await gotoFreshGame(page)
    await startPlaying(page)
    const level = await getCurrentLevel(page)
    await expect(page.getByRole('heading', { name: level.title })).toBeVisible()
  })
})
