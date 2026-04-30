/**
 * Strip the cream/off-white background from each AI-generated creature
 * sprite via per-pixel chroma-key. Outputs PNG with transparent background
 * so the sprite reads cleanly against any scene tile or tray colour.
 *
 * Run: npm run sprites:process
 */
import sharp from 'sharp'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIR = path.resolve(__dirname, '..', 'public', 'creatures')

// Threshold tuning. The Higgsfield prompt asks for a "soft cream off-white
// (#fff8e7)" background. We treat any near-white pixel (r,g,b all above
// LIGHT_CUTOFF and within COLOR_TOL of each other) as background to remove.
// EDGE_FEATHER softens the alpha falloff so we don't get crunchy edges.
const LIGHT_CUTOFF = 215
const COLOR_TOL = 25
const EDGE_FEATHER = 25 // luminance range over which alpha ramps in

async function processFile(file: string) {
  const inputPath = path.join(DIR, file)
  const buf = await readFile(inputPath)
  const img = sharp(buf).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const pixels = new Uint8ClampedArray(data) // RGBA
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
    const minRgb = Math.min(r, g, b)
    const maxRgb = Math.max(r, g, b)
    const isNearWhite = minRgb >= LIGHT_CUTOFF && (maxRgb - minRgb) < COLOR_TOL
    if (isNearWhite) {
      pixels[i + 3] = 0
    } else if (minRgb >= LIGHT_CUTOFF - EDGE_FEATHER && (maxRgb - minRgb) < COLOR_TOL) {
      // Feathered edge: linear ramp from full alpha to 0 across EDGE_FEATHER.
      const t = (minRgb - (LIGHT_CUTOFF - EDGE_FEATHER)) / EDGE_FEATHER
      pixels[i + 3] = Math.round(pixels[i + 3] * (1 - t))
    }
  }
  await sharp(Buffer.from(pixels), { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(inputPath)
  return inputPath
}

async function main() {
  const entries = (await readdir(DIR)).filter((f) => f.endsWith('.png'))
  for (const f of entries) {
    const out = await processFile(f)
    console.log(`✅ ${path.basename(out)}`)
  }
  console.log(`Done — ${entries.length} sprites chroma-keyed in place.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
