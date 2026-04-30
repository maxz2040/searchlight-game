// v2 UAT screenshot capture. Drives the live preview at 8770 across
// three viewports x seven game states and writes PNGs into
// docs/v2-uat/<viewport>-<state>.png.
//
// Run: npx tsx scripts/v2-uat-capture.ts

import { chromium, type Page, type Browser } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://127.0.0.1:8770';
const OUT = path.resolve(__dirname, '..', 'docs', 'v2-uat');
fs.mkdirSync(OUT, { recursive: true });

interface Vp {
  name: string;
  width: number;
  height: number;
}
const VIEWPORTS: Vp[] = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'ipad-portrait', width: 834, height: 1194 },
  { name: 'ipad-landscape', width: 1194, height: 834 },
];

interface Level {
  id: string;
  creatures: { id: string; x: number; y: number }[];
}

async function shoot(page: Page, vp: Vp, name: string) {
  const file = path.join(OUT, `${vp.name}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  -> ${path.relative(process.cwd(), file)}`);
}

async function setup(browser: Browser, vp: Vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function gotoFresh(page: Page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __searchlight?: unknown }).__searchlight)
  );
}

async function waitTutorial(page: Page) {
  await page.getByRole('heading', { name: /find the hidden friends/i }).waitFor({
    timeout: 5000,
  });
}

async function startPlaying(page: Page) {
  await page.getByRole('button', { name: /start playing/i }).click();
  // Wait for overlay to clear
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
    { timeout: 3000 }
  );
}

async function getLevel(page: Page): Promise<Level> {
  return page.evaluate(() => {
    const h = (window as unknown as {
      __searchlight: { store: { getState(): { level(): Level } } };
    }).__searchlight;
    return h.store.getState().level();
  });
}

async function markCreatures(page: Page, ids: string[]) {
  await page.evaluate((ids) => {
    const h = (window as unknown as {
      __searchlight: {
        store: {
          getState(): {
            markFound(id: string): void;
          };
        };
      };
    }).__searchlight;
    for (const id of ids) h.store.getState().markFound(id);
  }, ids);
}

async function captureViewport(browser: Browser, vp: Vp) {
  console.log(`\n[${vp.name} ${vp.width}x${vp.height}]`);

  // 01 loader — must be captured before the loader auto-advances
  {
    const { ctx, page } = await setup(browser, vp);
    // Slow the network a tiny bit so the loader is visible
    await page.goto(BASE, { waitUntil: 'commit' });
    // The loader animates 0→100 in ~700ms; grab quickly.
    await page.waitForTimeout(150);
    await shoot(page, vp, '01-loader');
    await ctx.close();
  }

  // 02 tutorial
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await page.waitForTimeout(400); // let intro animations settle
    await shoot(page, vp, '02-tutorial');
    await ctx.close();
  }

  // 03 fresh-playing
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    await page.waitForTimeout(500);
    await shoot(page, vp, '03-fresh-playing');
    await ctx.close();
  }

  // 04 mid-progress (1 creature found)
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    const lvl = await getLevel(page);
    await markCreatures(page, [lvl.creatures[0].id]);
    await page.waitForTimeout(500);
    await shoot(page, vp, '04-mid-progress');
    await ctx.close();
  }

  // 05 pre-complete (n-1)
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    const lvl = await getLevel(page);
    const ids = lvl.creatures.slice(0, -1).map((c) => c.id);
    await markCreatures(page, ids);
    await page.waitForTimeout(500);
    await shoot(page, vp, '05-pre-complete');
    await ctx.close();
  }

  // 06 video-reward
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    const lvl = await getLevel(page);
    const ids = lvl.creatures.map((c) => c.id);
    await markCreatures(page, ids);
    await page.waitForTimeout(500);
    await shoot(page, vp, '06-video-reward');
    await ctx.close();
  }

  // 07 complete-card (skip past video)
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    const lvl = await getLevel(page);
    const ids = lvl.creatures.map((c) => c.id);
    await markCreatures(page, ids);
    await page.waitForTimeout(300);
    // Click skip if visible, else wait for fallback
    const skip = page.getByRole('button', { name: /^skip/i });
    try {
      await skip.click({ timeout: 2000 });
    } catch {
      // No video file: card already shown
    }
    await page.getByRole('heading', { name: /you found them all/i }).waitFor({
      timeout: 12_000,
    });
    await page.waitForTimeout(800);
    await shoot(page, vp, '07-complete-card');
    await ctx.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const vp of VIEWPORTS) {
    await captureViewport(browser, vp);
  }
  await browser.close();
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
