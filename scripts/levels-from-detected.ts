/**
 * Read the detected creature bbox JSONs from scratch/composite/ and emit a
 * fresh src/levels/levels.ts file. The composited PNGs in public/scenes/
 * are the source of truth for what's painted; this script just lifts the
 * detected positions into game data.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DETECTED = path.join(ROOT, 'scratch', 'composite')
const OUT = path.join(ROOT, 'src', 'levels', 'levels.ts')

interface DetectedCreature {
  id: string; kind: string; x: number; y: number; w: number; h: number; name: string
}

const LEVELS = [
  { id: 'lvl-1', title: 'Whispering Forest', scene: 'forest', spotlight: 0.16, file: 'lvl-1-forest-creatures.json' },
  { id: 'lvl-2', title: 'Meadow at Dusk',    scene: 'meadow', spotlight: 0.16, file: 'lvl-2-meadow-creatures.json' },
  { id: 'lvl-3', title: 'Starlit Shore',     scene: 'beach',  spotlight: 0.16, file: 'lvl-3-shore-creatures.json' },
]

async function main() {
  const lines: string[] = [
    '// Auto-generated from scratch/composite/*-creatures.json by',
    '// scripts/levels-from-detected.ts. Each creature\'s {x,y,w,h} is the',
    '// bounding box detected by Gemini Vision on the corresponding composited',
    '// scene PNG in /public/scenes/. The sprite itself is BAKED INTO the scene',
    '// — the overlay layer in Scene.tsx renders only the invisible hit-zone',
    '// for spotlight collision and the name pill that pops in on find.',
    '//',
    '// Re-run: npm run levels:rebuild',
    '',
    `export type CreatureKind =`,
    `  | 'leaf-pup'`,
    `  | 'flame-cub'`,
    `  | 'aqua-spark'`,
    `  | 'bolt-bunny'`,
    `  | 'puff-bird'`,
    `  | 'shroom-buddy'`,
    `  | 'pebble-pal'`,
    `  | 'star-fish';`,
    '',
    'export interface Creature {',
    '  id: string;',
    '  kind: CreatureKind;',
    '  /** centre-x as fraction of play surface width (0..1) */',
    '  x: number;',
    '  /** centre-y as fraction of play surface height (0..1) */',
    '  y: number;',
    '  /** bounding-box width as fraction of play surface width */',
    '  w: number;',
    '  /** bounding-box height as fraction of play surface height */',
    '  h: number;',
    '  /** display label revealed on find */',
    '  name: string;',
    '}',
    '',
    `export type SceneKind = 'forest' | 'meadow' | 'beach';`,
    '',
    'export interface Level {',
    '  id: string;',
    '  title: string;',
    '  scene: SceneKind;',
    '  /** Spotlight radius as fraction of play surface min(w, h). */',
    '  spotlight: number;',
    '  creatures: Creature[];',
    '}',
    '',
    'export const LEVELS: Level[] = [',
  ]
  for (const L of LEVELS) {
    const data = JSON.parse(await readFile(path.join(DETECTED, L.file), 'utf8')) as DetectedCreature[]
    lines.push(`  {`)
    lines.push(`    id: '${L.id}',`)
    lines.push(`    title: '${L.title}',`)
    lines.push(`    scene: '${L.scene}',`)
    lines.push(`    spotlight: ${L.spotlight},`)
    lines.push(`    creatures: [`)
    for (const c of data) {
      lines.push(`      { id: '${c.id}', kind: '${c.kind}', x: ${c.x}, y: ${c.y}, w: ${c.w}, h: ${c.h}, name: '${c.name}' },`)
    }
    lines.push(`    ],`)
    lines.push(`  },`)
  }
  lines.push('];')
  lines.push('')
  lines.push('export function getLevel(id: string): Level | undefined {')
  lines.push('  return LEVELS.find((l) => l.id === id);')
  lines.push('}')
  lines.push('')
  lines.push('export function nextLevelId(current: string): string | null {')
  lines.push('  const idx = LEVELS.findIndex((l) => l.id === current);')
  lines.push('  if (idx < 0 || idx >= LEVELS.length - 1) return null;')
  lines.push('  return LEVELS[idx + 1].id;')
  lines.push('}')
  lines.push('')
  await writeFile(OUT, lines.join('\n'))
  console.log(`✅ ${OUT}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
