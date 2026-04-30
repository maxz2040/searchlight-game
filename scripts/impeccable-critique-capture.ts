// Impeccable critique screenshot capture. Drives the live preview at
// 8770 across three viewports x five game states and writes PNGs into
// docs/impeccable-critique/<viewport>-<state>.png.
//
// States:
//   01-loader, 02-tutorial, 03-fresh-playing, 04-mid-progress,
//   05-complete-card.
//
// Run: npx tsx scripts/impeccable-critique-capture.ts [iter-tag]
// where [iter-tag] is an optional suffix appended to filenames, e.g.
// `iter-2` writes <viewport>-<state>-iter-2.png so we can diff.

import { chromium, type Page, type Browser } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TAG = process.argv[2] ? `-${process.argv[2]}` : '';
const BASE = 'http://127.0.0.1:8770';
const OUT = path.resolve(__dirname, '..', 'docs', 'impeccable-critique');
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
  creatures: { id: string }[];
}

async function shoot(page: Page, vp: Vp, name: string) {
  const file = path.join(OUT, `${vp.name}-${name}${TAG}.png`);
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
          getState(): { markFound(id: string): void };
        };
      };
    }).__searchlight;
    for (const id of ids) h.store.getState().markFound(id);
  }, ids);
}

async function captureViewport(browser: Browser, vp: Vp) {
  console.log(`\n[${vp.name} ${vp.width}x${vp.height}]`);

  // 01 loader
  {
    const { ctx, page } = await setup(browser, vp);
    await page.goto(BASE, { waitUntil: 'commit' });
    await page.waitForTimeout(180);
    await shoot(page, vp, '01-loader');
    await ctx.close();
  }

  // 02 tutorial
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await page.waitForTimeout(500);
    await shoot(page, vp, '02-tutorial');
    await ctx.close();
  }

  // 03 fresh-playing
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    await page.waitForTimeout(550);
    await shoot(page, vp, '03-fresh-playing');
    await ctx.close();
  }

  // 04 mid-progress: mark roughly half the creatures
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    const lvl = await getLevel(page);
    const half = Math.max(1, Math.floor(lvl.creatures.length / 2));
    await markCreatures(page, lvl.creatures.slice(0, half).map((c) => c.id));
    await page.waitForTimeout(550);
    await shoot(page, vp, '04-mid-progress');
    await ctx.close();
  }

  // 05 complete-card (skip past video)
  {
    const { ctx, page } = await setup(browser, vp);
    await gotoFresh(page);
    await waitTutorial(page);
    await startPlaying(page);
    const lvl = await getLevel(page);
    await markCreatures(page, lvl.creatures.map((c) => c.id));
    await page.waitForTimeout(300);
    const skip = page.getByRole('button', { name: /^skip/i });
    try {
      await skip.click({ timeout: 2000 });
    } catch {
      // no video file
    }
    await page.getByRole('heading', { name: /you found them all/i }).waitFor({
      timeout: 12_000,
    });
    await page.waitForTimeout(900);
    await shoot(page, vp, '05-complete-card');
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
