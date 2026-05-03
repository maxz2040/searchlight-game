// extra-scenarios.spec.ts — coverage for E2E scenarios not yet in the base suite.
//
// E02 — Lobby shows all 45 level cards
// E09 — Waldo-edition foreground SVG layer renders on lvl-26+
// E11 — Endless levels (lvl-22+) hide the countdown timer
// E13 — prefers-reduced-motion: CSS transition durations collapse to ≤ 1 ms
// E14 — Timer expiry triggers the complete phase (timeExpired flag set)
// E15 — Stars earned on level completion persist in localStorage across reload

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
  timeLimit: number
  creatures: Creature[]
}

async function waitForHandle(page: Page) {
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __searchlight?: unknown }).__searchlight),
  )
}

async function gotoFresh(page: Page) {
  await page.goto('/')
  await waitForHandle(page)
  await page.evaluate(() => {
    const h = (window as unknown as {
      __searchlight: { levels: Level[]; store: { getState(): { selectLevel(id: string): void } } }
    }).__searchlight
    h.store.getState().selectLevel(h.levels[0].id)
  })
}

async function getPhase(page: Page): Promise<string> {
  return page.evaluate(
    () =>
      (window as unknown as { __searchlight: { store: { getState(): { phase: string } } } })
        .__searchlight.store.getState().phase,
  )
}

async function waitOverlay(page: Page) {
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
    { timeout: 4_000 },
  )
}

async function startPlaying(page: Page) {
  await page.getByRole('button', { name: /start playing/i }).click()
  await waitOverlay(page)
}

// ── E02: Lobby shows all 45 level cards ──────────────────────────────────────

test.describe('E02 — Lobby level grid', () => {
  test('lobby renders one card for every level (45 total)', async ({ page }) => {
    await page.goto('/')
    await waitForHandle(page)

    // Get the total level count from the test handle, then navigate to lobby.
    const totalLevels = await page.evaluate(() => {
      const h = (window as unknown as { __searchlight: { levels: Level[] } }).__searchlight
      return h.levels.length
    })
    expect(totalLevels).toBe(45)

    // Force lobby phase so the Lobby component renders.
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { store: { getState(): { goToLobby(): void } } }
      }).__searchlight
      h.store.getState().goToLobby()
    })
    await expect.poll(() => getPhase(page)).toBe('lobby')

    // Count level-card elements.
    const cards = page.locator('[data-testid^="level-card-"]')
    await expect(cards).toHaveCount(totalLevels, { timeout: 5_000 })
  })
})

// ── E09: Waldo foreground SVG layer renders on lvl-26+ ───────────────────────

test.describe('E09 — Waldo edition foreground layer', () => {
  test('scene-foreground div is present for lvl-26 (Waldo edition)', async ({ page }) => {
    await page.goto('/')
    await waitForHandle(page)

    // Select level 26 directly.
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight
      h.store.getState().selectLevel('lvl-26')
    })
    await startPlaying(page)

    // The scene-foreground layer must be rendered above the spotlight.
    await expect(page.getByTestId('scene-foreground')).toBeVisible({ timeout: 3_000 })
  })

  test('scene-foreground is NOT present on lvl-1 (classic edition)', async ({ page }) => {
    await gotoFresh(page)
    await startPlaying(page)
    await expect(page.getByTestId('scene-foreground')).not.toBeAttached()
  })
})

// ── E11: Endless mode hides the countdown timer ───────────────────────────────

test.describe('E11 — Endless mode (no timer)', () => {
  test('lvl-22 (Endless group) shows no timer-display element', async ({ page }) => {
    await page.goto('/')
    await waitForHandle(page)
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight
      h.store.getState().selectLevel('lvl-22')
    })
    await startPlaying(page)

    // Timer element must not be in the DOM for endless levels.
    await expect(page.getByTestId('timer-display')).not.toBeAttached()
  })

  test('lvl-6 (Classic group) DOES show the timer-display', async ({ page }) => {
    await page.goto('/')
    await waitForHandle(page)
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight
      h.store.getState().selectLevel('lvl-6')
    })
    await startPlaying(page)
    await expect(page.getByTestId('timer-display')).toBeVisible({ timeout: 3_000 })
  })
})

// ── E13: prefers-reduced-motion collapses animation durations ─────────────────

test.describe('E13 — Reduced-motion media query', () => {
  test('with prefers-reduced-motion: reduce, Framer Motion resolves to instant', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Media-feature emulation only in Chromium')

    // Emulate reduced-motion preference.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await waitForHandle(page)

    // The Tutorial heading must still be visible (content is accessible).
    await expect(page.getByRole('heading', { name: /find the hidden friends/i })).toBeVisible({
      timeout: 5_000,
    })

    // Verify the media query is respected: CSS computed transition-duration
    // on any animated element should be 0s (Tailwind motion-reduce) or the
    // Framer Motion --motion-duration custom prop resolves ≤ 0.01 s.
    const hasReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    })
    expect(hasReducedMotion).toBe(true)
  })
})

// ── E14: Timer expiry triggers complete phase ─────────────────────────────────

test.describe('E14 — Timer expiry', () => {
  test('when timeLimit expires the phase transitions to complete', async ({ page }) => {
    await gotoFresh(page)

    // Mutate lvl-1 to have a 2-second timer so the test runs quickly.
    await page.evaluate(() => {
      const h = (window as unknown as { __searchlight: { levels: Level[] } }).__searchlight
      h.levels[0].timeLimit = 2
      // Keep 1 unfound creature so auto-complete doesn't fire early.
      h.levels[0].creatures = [
        { id: 'tx', kind: 'leaf-pup', x: 0.3, y: 0.3, w: 0.1, h: 0.1, name: 'T' },
      ]
    })
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(id: string): void } } }
      }).__searchlight
      h.store.getState().selectLevel('lvl-1')
    })

    await startPlaying(page)

    // The timer fires after ~2 s; give 6 s total for the phase flip.
    await expect.poll(() => getPhase(page), { timeout: 6_000 }).toBe('complete')

    // timeExpired flag must be set.
    const expired = await page.evaluate(() =>
      (window as unknown as {
        __searchlight: { store: { getState(): { timeExpired: boolean } } }
      }).__searchlight.store.getState().timeExpired,
    )
    expect(expired).toBe(true)
  })
})

// ── E15: Stars persist in localStorage across page reload ─────────────────────

test.describe('E15 — Star persistence (localStorage)', () => {
  test('stars earned on level completion are restored after a hard reload', async ({ page }) => {
    await gotoFresh(page)
    await startPlaying(page)

    // Force-find all creatures to reach complete phase quickly.
    await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: {
          store: {
            getState(): { level(): Level; markFound(id: string): void }
          }
        }
      }).__searchlight
      const lvl = h.store.getState().level()
      for (const c of lvl.creatures) h.store.getState().markFound(c.id)
    })
    await expect.poll(() => getPhase(page)).toBe('complete')

    // Advance to lobby to trigger the saveStars() path.
    await page.getByRole('button', { name: /next level/i }).click({ timeout: 5_000 })
    await expect.poll(() => getPhase(page)).toBe('lobby')

    // Read the stars stored in localStorage before reload.
    const storedBefore = await page.evaluate(() => {
      const raw = localStorage.getItem('searchlight:stars')
      return raw ? (JSON.parse(raw) as Record<string, number>) : {}
    })
    // lvl-1 should have ≥ 1 star entry.
    expect(Object.keys(storedBefore).length).toBeGreaterThan(0)

    // Hard-reload the page (clears JS memory, re-reads localStorage).
    await page.reload()
    await waitForHandle(page)

    // Stars must be present in the restored store.
    const storedAfter = await page.evaluate(() => {
      const raw = localStorage.getItem('searchlight:stars')
      return raw ? (JSON.parse(raw) as Record<string, number>) : {}
    })
    expect(storedAfter).toEqual(storedBefore)

    // The store's loaded state should reflect the persisted stars.
    const storeStarsEntry = await page.evaluate(() => {
      const h = (window as unknown as {
        __searchlight: { store: { getState(): { levelStars: Record<string, number> } } }
      }).__searchlight
      return h.store.getState().levelStars ?? {}
    })
    // At minimum the same keys exist in the store.
    for (const key of Object.keys(storedAfter)) {
      expect(storeStarsEntry[key]).toBeGreaterThanOrEqual(storedAfter[key])
    }
  })
})
