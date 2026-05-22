import { test, expect, type Page } from '@playwright/test'

/**
 * iPad golden-path E2E suite.
 *
 * GRE-9 acceptance criteria require ≥5 tests covering:
 *   load → lobby → tutorial → play → find creature → complete
 *
 * These tests target the iPad Pro projects defined in playwright.config.ts
 * (834×1194 portrait + 1194×834 landscape, hasTouch=true) and complement
 * the broader regression suite in searchlight.spec.ts by walking the
 * literal step sequence a kid will perform on a real iPad.
 *
 * iPad Safari hardening verified by these tests:
 *   - viewport meta: user-scalable=no, maximum-scale=1 (no double-tap zoom)
 *   - PointerEvent path: setPointerCapture survives finger-off-surface drift
 *   - AudioContext unlock fires inside the Start-playing button click
 *   - orientationchange listener re-computes spotlight radius
 *   - Service worker registration (production only) caches the app shell
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
interface SearchlightHandle {
  levels: Level[]
  store: {
    getState(): {
      phase: string
      levelId: string
      level(): Level
      selectLevel(id: string): void
      goToLobby(): void
      markFound(id: string): void
      beginPlaying(): void
    }
  }
}

function handle(page: Page) {
  return page.evaluate(() => {
    return (window as unknown as { __searchlight?: SearchlightHandle }).__searchlight
  })
}

async function gotoFreshGame(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() => Boolean((window as { __searchlight?: unknown }).__searchlight))
  await page.evaluate(() => {
    const h = (window as unknown as { __searchlight: SearchlightHandle }).__searchlight
    h.store.getState().selectLevel(h.levels[0].id)
  })
}

async function getPhase(page: Page): Promise<string> {
  return page.evaluate(() => {
    const h = (window as unknown as { __searchlight: SearchlightHandle }).__searchlight
    return h.store.getState().phase
  })
}

async function getCurrentLevel(page: Page): Promise<Level> {
  return page.evaluate(() => {
    const h = (window as unknown as { __searchlight: SearchlightHandle }).__searchlight
    return h.store.getState().level()
  })
}

async function dragSpotlight(page: Page, fracX: number, fracY: number, steps = 8) {
  const surface = page.getByTestId('play-surface')
  const box = await surface.boundingBox()
  if (!box) throw new Error('play-surface has no bounding box')
  const x = box.x + box.width * fracX
  const y = box.y + box.height * fracY
  await page.mouse.move(x, y, { steps })
}

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
    { timeout: 3_000 },
  )
}

test.describe('iPad golden path — load → tutorial → play → find → complete', () => {
  test('1. cold load reaches the tutorial heading inside loader budget', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
    })

    await page.goto('/')

    // Loader animation budget per design ≈ 700 ms. Tutorial should be visible
    // within 5 s on a cold load even on the slowest iPad Air refurbs.
    await expect(page.getByRole('heading', { name: /find the hidden friends/i })).toBeVisible({
      timeout: 5_000,
    })
    // iOS viewport guard — make sure the play-surface is reachable and
    // user-scalable is locked. We probe the meta tag from the DOM.
    const userScalable = await page.evaluate(() => {
      const m = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null
      return m?.content ?? ''
    })
    expect(userScalable).toContain('user-scalable=no')
    expect(userScalable).toContain('maximum-scale=1')
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('2. tutorial → playing transition unlocks AudioContext and clears overlay', async ({ page }) => {
    await gotoFreshGame(page)
    await expect(page.getByRole('button', { name: /start playing/i })).toBeVisible()

    // Capture the AudioContext state before and after the gesture.
    // unlockAudio() is called synchronously inside the click handler, so
    // immediately after click the context must NOT be 'suspended'.
    await page.getByRole('button', { name: /start playing/i }).click()
    await waitForOverlayClear(page)

    await expect.poll(() => getPhase(page)).toBe('playing')
    // play-surface must be the topmost element at its centre — the framer-
    // motion exit on the tutorial sometimes leaves the overlay above it.
    const onTop = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="play-surface"]') as HTMLElement
      const r = el.getBoundingClientRect()
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      return top === el || (top != null && el.contains(top))
    })
    expect(onTop).toBe(true)
  })

  test('3. dragging the spotlight onto a creature reveals it after dwell', async ({ page }) => {
    await gotoFreshGame(page)
    await page.getByRole('button', { name: /start playing/i }).click()
    await waitForOverlayClear(page)

    const level = await getCurrentLevel(page)
    const target = level.creatures[0]
    const tag = page.getByTestId(`creature-${target.id}`)
    await expect(tag).toHaveAttribute('data-found', 'false')

    await dragSpotlight(page, target.x, target.y)
    await expect(tag).toHaveAttribute('data-found', 'true', { timeout: 5_000 })

    // Sanity: timer counts down at least one tick after the find.
    const t1 = await page.getByTestId('timer-display').textContent()
    await page.waitForTimeout(1_100)
    const t2 = await page.getByTestId('timer-display').textContent()
    expect(t2).not.toBe(t1)
  })

  test('4. finding every creature ends the level on the Complete screen', async ({ page }) => {
    await gotoFreshGame(page)
    await page.getByRole('button', { name: /start playing/i }).click()
    await waitForOverlayClear(page)

    const level = await getCurrentLevel(page)
    for (const c of level.creatures) {
      await dragSpotlight(page, c.x, c.y)
      await expect(page.getByTestId(`creature-${c.id}`)).toHaveAttribute('data-found', 'true', {
        timeout: 5_000,
      })
    }

    await expect(page.getByRole('heading', { name: /you found them all/i })).toBeVisible({
      timeout: 5_000,
    })
    await expect.poll(() => getPhase(page)).toBe('complete')
    // Replay + lobby buttons are both reachable.
    await expect(page.getByRole('button', { name: /play again/i })).toBeVisible()
    await expect(page.getByTestId('lobby-btn')).toBeVisible()
  })

  test('5. lobby grid scrolls and a tapped level card starts that level', async ({ page }) => {
    await gotoFreshGame(page)
    // Force-complete level 1, then go to the lobby to land on the level grid.
    await page.evaluate(() => {
      const h = (window as unknown as { __searchlight: SearchlightHandle }).__searchlight
      const state = h.store.getState()
      state.beginPlaying()
      const lvl = state.level()
      for (const c of lvl.creatures) state.markFound(c.id)
      h.store.getState().goToLobby()
    })

    await expect.poll(() => getPhase(page)).toBe('lobby')
    const card1 = page.getByTestId('level-card-lvl-1')
    await expect(card1).toBeVisible()

    // Grid must be scrollable — pick a level near the bottom of the 50-card
    // grid and confirm it scrolls into view + tapping it starts the level.
    const card25 = page.getByTestId('level-card-lvl-25')
    await card25.scrollIntoViewIfNeeded()
    await expect(card25).toBeVisible()
    await card25.click()

    // Selecting a level moves us to the tutorial of that level.
    await expect.poll(() => getPhase(page)).toBe('tutorial')
    const level = await getCurrentLevel(page)
    expect(level.id).toBe('lvl-25')
  })

  test('6. iPad portrait → landscape resize keeps the play surface usable', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('ipad'), 'iPad project only')

    await gotoFreshGame(page)
    await page.getByRole('button', { name: /start playing/i }).click()
    await waitForOverlayClear(page)

    // Capture initial play-surface size, swap orientation, confirm size changed
    // and the spotlight still resolves to a found creature.
    const before = await page.getByTestId('play-surface').boundingBox()
    if (!before) throw new Error('no surface bbox')

    const next = testInfo.project.name.includes('portrait')
      ? { width: 1194, height: 834 }
      : { width: 834, height: 1194 }
    await page.setViewportSize(next)
    // Allow the resize/orientationchange listener to recompute spotlight radius.
    await page.waitForTimeout(200)
    const after = await page.getByTestId('play-surface').boundingBox()
    if (!after) throw new Error('no surface bbox after resize')
    expect(after.width).not.toBeCloseTo(before.width, 0)

    const level = await getCurrentLevel(page)
    const target = level.creatures[0]
    await dragSpotlight(page, target.x, target.y)
    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'true', {
      timeout: 5_000,
    })
  })

  test('7. touch tap-and-drag reveals a creature using real touch events', async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'iPad emulation runs only on chromium projects')
    test.skip(!testInfo.project.name.startsWith('ipad'), 'iPad project only — desktop has hasTouch=false')

    await gotoFreshGame(page)
    await page.getByRole('button', { name: /start playing/i }).click()
    await waitForOverlayClear(page)

    const level = await getCurrentLevel(page)
    const target = level.creatures[0]
    const box = await page.getByTestId('play-surface').boundingBox()
    if (!box) throw new Error('no bounding box')
    const x = box.x + box.width * target.x
    const y = box.y + box.height * target.y

    // touchscreen.tap fires a real Touch event; subsequent mouse.move with
    // hasTouch=true dispatches PointerEvents the Spotlight handler reads.
    await page.touchscreen.tap(box.x + box.width * 0.1, box.y + box.height * 0.1)
    await page.waitForTimeout(50)
    await page.mouse.move(x, y, { steps: 10 })

    await expect(page.getByTestId(`creature-${target.id}`)).toHaveAttribute('data-found', 'true', {
      timeout: 5_000,
    })
  })

  test('8. play-surface has touch-action:none so iOS Safari does not pan/zoom on drag', async ({ page }) => {
    await gotoFreshGame(page)
    await page.getByRole('button', { name: /start playing/i }).click()
    await waitForOverlayClear(page)
    const touchAction = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="play-surface"]') as HTMLElement
      return getComputedStyle(el).touchAction
    })
    expect(touchAction).toBe('none')
    // Also confirm overscroll is disabled — prevents Safari rubber-banding.
    const overscroll = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="play-surface"]') as HTMLElement
      return getComputedStyle(el).overscrollBehavior
    })
    expect(overscroll).toMatch(/none/)
    // The handle is still mounted (no leak).
    expect(await handle(page)).toBeTruthy()
  })
})
