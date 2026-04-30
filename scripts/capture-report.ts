/**
 * Capture screenshots for the stakeholder review report.
 *
 * Boots a chromium instance against the prod-built preview server (started
 * separately on :8770) and walks every game phase across desktop + iPad
 * portrait + iPad landscape viewports. Writes a manifest.json describing
 * what was captured so the HTML report builder can lay them out.
 *
 * Run: npm run report:capture
 */
import { chromium, type Browser, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE = 'http://127.0.0.1:8770'
const OUT = path.resolve(__dirname, '..', 'report', 'screenshots')

interface Viewport {
  name: string
  label: string
  width: number
  height: number
  deviceScaleFactor: number
  hasTouch: boolean
}

const VIEWPORTS: Viewport[] = [
  { name: 'desktop',         label: 'Desktop',        width: 1280, height: 800,  deviceScaleFactor: 1, hasTouch: false },
  { name: 'ipad-portrait',   label: 'iPad Portrait',  width: 834,  height: 1194, deviceScaleFactor: 2, hasTouch: true  },
  { name: 'ipad-landscape',  label: 'iPad Landscape', width: 1194, height: 834,  deviceScaleFactor: 2, hasTouch: true  },
]

interface Shot {
  file: string
  viewport: string
  scene: string
  caption: string
}

interface Level {
  id: string
  title: string
  spotlight: number
  creatures: { id: string; x: number; y: number; w: number; h: number; name: string; kind: string }[]
}

async function withPage(browser: Browser, vp: Viewport, fn: (p: Page) => Promise<void>) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    hasTouch: vp.hasTouch,
  })
  const page = await ctx.newPage()
  try {
    await fn(page)
  } finally {
    await ctx.close()
  }
}

async function gotoFresh(page: Page, levelId?: string) {
  await page.goto(BASE)
  await page.waitForFunction(() => Boolean((window as { __searchlight?: unknown }).__searchlight))
  if (levelId) {
    await page.evaluate((id) => {
      const handle = (window as unknown as {
        __searchlight: { store: { getState(): { selectLevel(i: string): void } } }
      }).__searchlight
      handle.store.getState().selectLevel(id)
    }, levelId)
  } else {
    // Wait out the loader.
    await page.waitForSelector('button:has-text("Let\'s go")', { timeout: 5000 })
  }
}

async function getLevel(page: Page): Promise<Level> {
  return page.evaluate(() => {
    const h = (window as unknown as {
      __searchlight: { store: { getState(): { level(): Level } } }
    }).__searchlight
    return h.store.getState().level()
  })
}

async function startPlaying(page: Page) {
  await page.getByRole('button', { name: /start playing/i }).click()
  await page.waitForFunction(() => {
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
  })
}

async function dragTo(page: Page, fx: number, fy: number) {
  const surface = page.getByTestId('play-surface')
  const box = await surface.boundingBox()
  if (!box) throw new Error('no box')
  // Park the cursor in a creature-free corner first so the interpolated
  // path to (fx, fy) doesn't accidentally graze other creatures.
  await page.mouse.move(box.x + 4, box.y + 4)
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 12 })
}

async function markFound(page: Page, ids: string[]) {
  await page.evaluate((ids) => {
    const h = (window as unknown as {
      __searchlight: { store: { getState(): { markFound(id: string): void } } }
    }).__searchlight
    for (const id of ids) h.store.getState().markFound(id)
  }, ids)
}

async function snap(page: Page, vp: Viewport, scene: string, caption: string, shots: Shot[]) {
  const file = `${vp.name}__${scene}.png`
  const fp = path.join(OUT, file)
  await page.screenshot({ path: fp, fullPage: false })
  shots.push({ file, viewport: vp.name, scene, caption })
  // eslint-disable-next-line no-console
  console.log(`  📸 ${vp.name} / ${scene}`)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const shots: Shot[] = []

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Capturing ${vp.label} (${vp.width}×${vp.height}) ===`)
    await withPage(browser, vp, async (page) => {
      // 1. Loader (catch it before it disappears)
      await page.goto(BASE)
      await page.waitForLoadState('domcontentloaded')
      await snap(page, vp, '01-loader', 'Loading screen — "Tuning the lantern…" with progress bar', shots)

      // 2. Tutorial
      await gotoFresh(page)
      await snap(page, vp, '02-tutorial', 'Tutorial — first-time-player onboarding overlay', shots)

      // 3. Playing — fresh surface
      await startPlaying(page)
      const lvl = await getLevel(page)
      await page.waitForTimeout(400)
      await snap(page, vp, '03-playing-fresh', `${lvl.title} — fresh play surface, all creatures hidden`, shots)

      // 4. Spotlight on first creature — drag the spotlight there.
      const c1 = lvl.creatures[0]
      await dragTo(page, c1.x, c1.y)
      // Force only c1 found (drag path may have grazed others).
      await page.evaluate((id) => {
        const h = (window as unknown as {
          __searchlight: { store: { getState(): { markFound(i: string): void; level(): { creatures: { id: string }[] } }; setState(s: { found: Set<string> }): void } }
        }).__searchlight
        h.store.setState({ found: new Set([id]) })
      }, c1.id)
      await page.waitForTimeout(400)
      await snap(page, vp, '04-spotlight-reveal', `Spotlight reveals ${c1.name} (${c1.kind}) — name tag appears, ping plays`, shots)

      // 5. Mid-progress (half found) — drive via store, then park spotlight on
      // the most-recently-found one for a clean composition.
      const half = Math.ceil(lvl.creatures.length / 2)
      const foundIds = lvl.creatures.slice(0, half).map((c) => c.id)
      await page.evaluate((ids) => {
        const h = (window as unknown as { __searchlight: { store: { setState(s: { found: Set<string> }): void } } }).__searchlight
        h.store.setState({ found: new Set(ids) })
      }, foundIds)
      const last = lvl.creatures[half - 1]
      await dragTo(page, last.x, last.y)
      await page.waitForTimeout(300)
      await snap(page, vp, '05-mid-progress', `${half} of ${lvl.creatures.length} creatures revealed — tray icons light up as they're found`, shots)

      // 6. Idle hint — pulsing glow on the next unfound creature.
      // Move spotlight to a corner away from creatures and wait.
      await dragTo(page, 0.02, 0.5)
      await page.waitForTimeout(1900)
      await snap(page, vp, '06-idle-hint', 'After 1.6 s of idle — pulsing hint glow nudges the player toward the next creature', shots)

      // 7. Complete screen — wait long enough for the staggered spring
      // animation (creatures stagger at 0.06s up to ~0.73s; buttons at 0.85s)
      // plus settling time, so every element is in its final position.
      await page.evaluate(() => {
        const h = (window as unknown as {
          __searchlight: { store: { getState(): { level(): Level; markFound(id: string): void } } }
        }).__searchlight
        const lvl = h.store.getState().level()
        for (const c of lvl.creatures) h.store.getState().markFound(c.id)
      })
      await page.waitForTimeout(2200)
      await snap(page, vp, '07-complete', `Level complete — ${lvl.title}, with replay / next-level CTAs`, shots)

      // 8. Level 2 fresh
      await gotoFresh(page, 'lvl-2')
      await startPlaying(page)
      await page.waitForTimeout(400)
      const l2 = await getLevel(page)
      await snap(page, vp, '08-level2', `${l2.title} — second scene (different palette + creatures)`, shots)

      // 9. Level 3 fresh
      await gotoFresh(page, 'lvl-3')
      await startPlaying(page)
      await page.waitForTimeout(400)
      const l3 = await getLevel(page)
      await snap(page, vp, '09-level3', `${l3.title} — third scene`, shots)
    })
  }

  await browser.close()
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(shots, null, 2))
  console.log(`\n✅ Captured ${shots.length} screenshots → ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
