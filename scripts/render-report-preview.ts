/**
 * Renders a preview of the stakeholder report (cover + first scene) so
 * the layout can be eyeballed without opening the 14 MB HTML file.
 * Also outputs a print-ready PDF alongside the HTML.
 */
import { chromium } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const HTML = path.join(ROOT, 'report', 'index.html')
const PREVIEW = path.join(ROOT, 'report', 'preview-cover.png')
const PDF = path.join(ROOT, 'report', 'Searchlight-Stakeholder-Review.pdf')

async function main() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  await page.goto(`file://${HTML}`)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: PREVIEW, fullPage: false })
  console.log(`✅ Cover preview → ${PREVIEW}`)

  // PDF — print-style, A4 with backgrounds.
  await page.emulateMedia({ media: 'print' })
  await page.pdf({
    path: PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
  })
  console.log(`✅ PDF → ${PDF}`)

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
