/**
 * Generate AI PNG sprites for every kind in src/creatures/roster.ts that
 * doesn't already have one in public/creatures/. Matches the painterly
 * "chibi mascot toy character" style of the original 8 PNGs (leaf-pup,
 * flame-cub, etc.) by funnelling every generation through Higgsfield's
 * flux_2 model with a shared prompt scaffold + per-creature description.
 *
 * Pipeline:
 *   1. Read ROSTER, skip kinds whose PNG already exists.
 *   2. For each remaining kind, build the prompt and dispatch generate_image.
 *   3. Poll job_status until terminal.
 *   4. Download to public/creatures/<kind>.png.
 *   5. Hand off to scripts/process-creature-sprites.ts (npm run sprites:process)
 *      for the chroma-key pass that turns the cream background into alpha.
 *
 * Resumable: re-runs skip kinds with an existing file.
 * Parallel: PARALLEL controls how many in-flight jobs at once.
 * Cost: ~6-10 credits per sprite on flux_2; budget ~600-900 for 88 sprites.
 *
 * Run: HIGGSFIELD_TOKEN=<token> tsx scripts/generate-creature-sprites.ts
 *      [--limit N] [--only kind1,kind2] [--parallel N] [--dry-run]
 */
import { mkdir, writeFile, access, appendFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROSTER, type RosterEntry, type Category } from '../src/creatures/roster'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')
const OUT_DIR = path.join(REPO, 'public', 'creatures')
const LOG_PATH = path.join(REPO, 'report', 'se-02n-generation-log.jsonl')

const ENDPOINT = 'https://mcp.higgsfield.ai/mcp'
const TOKEN = process.env.HIGGSFIELD_TOKEN
if (!TOKEN) {
  console.error('HIGGSFIELD_TOKEN env var missing. Run scripts/higgsfield-auth.sh first.')
  process.exit(2)
}

// ── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function arg(name: string, def?: string): string | undefined {
  const i = args.indexOf(`--${name}`)
  if (i === -1) return def
  return args[i + 1]
}
const flagDryRun = args.includes('--dry-run')
const onlyArg = arg('only')
const onlyKinds = onlyArg ? new Set(onlyArg.split(',')) : null
const limit = Number(arg('limit') ?? '0') || 0
const PARALLEL = Number(arg('parallel') ?? '3') || 3
const MODEL = arg('model') ?? 'flux_2'

// ── MCP client ───────────────────────────────────────────────────────────
let nextRpcId = 1
let mcpSessionId: string | undefined

interface McpResult {
  result?: { content?: { type: string; text?: string }[]; isError?: boolean }
  error?: { code: number; message: string }
}

async function rpc(method: string, params?: unknown): Promise<McpResult> {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      ...(mcpSessionId ? { 'Mcp-Session-Id': mcpSessionId } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextRpcId++, method, params }),
  })
  const sid = r.headers.get('mcp-session-id')
  if (sid) mcpSessionId = sid
  const text = await r.text()
  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) {
      try { return JSON.parse(line.slice(6)) } catch { /* fall through */ }
    }
  }
  try { return JSON.parse(text) } catch { return { error: { code: -1, message: text } } }
}

async function handshake() {
  await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'sprite-gen', version: '1.0' },
  })
  await rpc('notifications/initialized').catch(() => {})
}

// ── Prompt builder ───────────────────────────────────────────────────────

// Painterly storybook chibi mascot — matches the original 8 PNGs
// (leaf-pup, flame-cub, aqua-spark, etc.). Each generated character must:
//   - read as cute / kid-friendly / non-uncanny
//   - sit on a near-pure cream-white background (#fff8e7) so the
//     existing sharp-based chroma-key pass can isolate it cleanly
//   - have soft confident outlines and bright saturated paint-style fills
//   - fit a 1024×1024 square with the character roughly centred
const STYLE_SCAFFOLD = [
  'chibi mascot toy character, painterly storybook anime style,',
  'big head with simplified body, large sparkly anime eyes with twin highlights,',
  'soft confident outlines with slight line variation, bright saturated colors,',
  'subtle painterly shading with soft cel highlights, kid-friendly and non-uncanny,',
  'standing or sitting full body visible, centered, facing camera, friendly smile,',
  'flat soft cream off-white background (#fff8e7) with no shadow on ground,',
  'no text, no logos, no watermark, no border, square 1:1 framing.',
].join(' ')

const CATEGORY_HINTS: Record<Category, string> = {
  forest: 'forest creature with leafy / mossy / earthy details',
  ocean: 'ocean creature with watery / coral / wave details',
  sky: 'sky creature with cloud / wind / sunbeam details',
  night: 'night-themed creature with starlight / moon / cosmic details',
  garden: 'garden creature with flower / leaf / dewdrop details',
  arctic: 'arctic creature with snow / ice / frost details',
  jungle: 'jungle creature with vine / leaf / canopy details',
  magic: 'magical creature with sparkle / aura / fairy-glow details',
  desert: 'desert creature with sand / cactus / sun-warm details',
  'deep-sea': 'deep-sea creature with bioluminescent / dark-water glow details',
}

/** Per-kind concrete description: shapes the model's silhouette and colour. */
const KIND_DESCRIPTORS: Record<string, string> = {
  // Original 12 — kept here in case we want to regenerate alongside batches.
  'bunny': 'a fluffy white-and-pink baby bunny with long upright ears',
  'bear-cub': 'a small honey-brown bear cub with round soft cheeks',
  'owl': 'a chubby tawny-brown owlet with big round eyes and feather tufts',
  'frog-pal': 'a cheerful spring-green frog with golden eye-bumps',
  'bee-buzz': 'a fluffy yellow-and-black striped bumblebee with translucent wings',
  'kitty': 'an orange tabby kitten with big green eyes and a white belly',
  'turtle-shell': 'a baby green sea-turtle with a hexagon-patterned shell',
  'star-pal': 'a smiling golden five-point-star with sparkles around it',
  'moon-kid': 'a sleepy crescent-moon character with a friendly face',
  'fox-pup': 'a tiny orange fox kit with a white belly and bushy tail',
  'penguin-pal': 'a chubby black-and-white penguin chick',
  'duck-bill': 'a yellow duckling with a small blue spray of water on top',

  // Batch A — 29
  'deer-dot': 'a tiny tan-and-cream spotted fawn with white belly dots',
  'hedgehog-roll': 'a chubby brown hedgehog with soft prickly back',
  'squirrel-nut': 'a fluffy red-brown squirrel holding an acorn',
  'raccoon-mask': 'a small grey raccoon kit with a black eye-mask',
  'chipmunk-cheek': 'a striped chipmunk with full cheeks',
  'hamster-round': 'a round golden hamster',
  'fish-fin': 'a cheerful tropical-blue fish with bright fins',
  'crab-snap': 'a tiny red-orange crab with friendly claws',
  'octopus-pal': 'a smiling pink-purple baby octopus',
  'seahorse-curl': 'a turquoise seahorse with a curly tail',
  'jellyfish-glow': 'a translucent pink jellyfish with a soft inner glow',
  'dolphin-flip': 'a smiling grey-blue baby dolphin in a small jump pose',
  'clownfish': 'an orange-and-white striped clownfish',
  'narwhal-horn': 'a soft-grey narwhal calf with a swirled spiral horn',
  'sea-turtle-jr': 'a baby sea-turtle with a small green shell',
  'lobster-red': 'a friendly red lobster with cartoon claws',
  'cloud-puff': 'a fluffy round cloud with a smiling face',
  'bat-wing': 'a tiny purple-grey bat with friendly fangs',
  'butterfly-blue': 'a vivid sky-blue butterfly with patterned wings',
  'dragonfly-zip': 'a turquoise dragonfly with iridescent wings',
  'parrot-red': 'a bright crimson-red parrot with cyan tail feathers',
  'hummingbird': 'a tiny iridescent green-and-pink hummingbird hovering',
  'flamingo-pink': 'a soft pink flamingo with one leg tucked',
  'toucan-beak': 'a black-and-yellow toucan chick with a giant beak',
  'eagle-soar': 'a brown-and-white eaglet with strong wings spread',
  'firefly-glow': 'a tiny firefly with a glowing yellow tail-lantern',
  'comet-kid': 'a smiling comet with a sparkling rainbow tail',
  'ufo-pal': 'a small silver UFO disc with friendly window-eyes',
  'rocket-red': 'a cheerful red rocket with white wings and a flame trail',

  // Batch B — 29
  'planet-ring': 'a smiling Saturn-style planet with rainbow rings',
  'astro-bear': 'a polar-bear cub in a tiny astronaut helmet',
  'luna-cat': 'a black cat with crescent-moon markings and starry eyes',
  'star-scout': 'a small star with a tiny telescope',
  'nebula-pup': 'a fluffy puppy made of swirling pink-purple nebula clouds',
  'ladybug-spot': 'a round red ladybug with five black spots',
  'caterpillar-green': 'a chubby bright-green caterpillar with tiny feet',
  'snail-trail': 'a smiling brown snail with a swirly shell',
  'mushroom-cap': 'a red-and-white spotted toadstool with a cute face',
  'sunflower-face': 'a sunflower with a smiling brown centre and bright petals',
  'acorn-buddy': 'a tiny tan acorn with a small leafy hat',
  'dewdrop-fairy': 'a tiny translucent water-drop fairy with butterfly wings',
  'daisy-bud': 'a small white daisy with a smiling yellow centre',
  'polar-pup': 'a fluffy white-furred husky pup',
  'snow-fox': 'a small snow-white arctic fox kit',
  'walrus-pal': 'a chubby brown walrus with tiny tusks',
  'seal-pup': 'a soft grey-spotted baby seal with big eyes',
  'snowflake-kid': 'a six-point ice-blue snowflake with a friendly face',
  'ice-bear': 'a fluffy ice-blue polar bear cub',
  'husky-pup': 'a black-and-white husky puppy with bright blue eyes',
  'yeti-small': 'a tiny fluffy white yeti with friendly eyes',
  'arctic-hare': 'a fluffy white arctic hare with long ears',
  'penguin-baby': 'a tiny grey-fluff penguin chick',
  'monkey-swing': 'a small brown monkey with a long curly tail',
  'tiger-cub': 'an orange-and-black striped tiger cub with a white belly',
  'elephant-baby': 'a soft-grey baby elephant with a tiny trunk',
  'giraffe-spot': 'a tan-and-white spotted baby giraffe',
  'hippo-round': 'a chubby pink-purple baby hippo',
  'chameleon-shift': 'a green chameleon with a curled tail and big spiral eyes',
  'sloth-hang': 'a fluffy brown sloth with a sleepy smile',
  'zebra-stripe': 'a black-and-white striped baby zebra',

  // Batch C — 30
  'parrot-green': 'a bright emerald-green parrot with red tail feathers',
  'crocodile-smile': 'a friendly green baby crocodile with cartoon teeth',
  'unicorn-spark': 'a white unicorn foal with a pastel-rainbow mane and golden horn',
  'dragon-pup': 'a small purple-and-pink baby dragon with tiny wings',
  'pixie-wing': 'a tiny pixie fairy with iridescent wings and a sparkle wand',
  'crystal-blue': 'a smiling sky-blue crystal gem with sparkles',
  'rainbow-pal': 'a smiling rainbow arc with a cloud at one end',
  'sparkle-deer': 'a magical fawn with star-shaped antlers and stardust trail',
  'wishing-star': 'a glowing five-point shooting-star with a sparkle tail',
  'magic-cat': 'a purple cat with a tiny pointed wizard hat',
  'phoenix-chick': 'a fluffy red-orange phoenix chick with feather flames',
  'fairy-bud': 'a tiny pink flower-fairy peeking out of a flower bud',
  'cactus-kid': 'a smiling green saguaro cactus with a pink flower on top',
  'camel-hump': 'a small tan camel calf with two soft humps',
  'lizard-sun': 'a small sandy-yellow lizard sunbathing',
  'sand-fox': 'a small fennec fox with huge ears and pale tan fur',
  'meerkat-pop': 'a meerkat standing tall with friendly alert eyes',
  'gecko-green': 'a bright lime-green gecko with sticky toe-pads',
  'sand-cat': 'a small sand-coloured wild kitten with tufted ears',
  'armadillo-roll': 'a smiling tan armadillo with banded armor',
  'anglerfish-glow': 'a dark-blue baby anglerfish with a glowing lantern lure',
  'puffer-fish': 'a round puffed-up blue puffer-fish with friendly eyes',
  'manta-ray': 'a smooth black-and-white manta ray gliding',
  'squid-ink': 'a small purple squid with curling tentacles',
  'sea-dragon': 'a leafy sea-dragon shaped like floating seaweed',
  'coral-fish': 'a bright neon-pink-and-yellow coral reef fish',
  'whale-calf': 'a tiny grey-blue baby whale with a smiling mouth',
  'mercat': 'a cat with a fish-tail mermaid lower body',
  'cloud-castle': 'a tiny floating cloud with a fairytale castle on top',
  'candy-bear': 'a pastel-rainbow gummy-bear character with a soft sheen',
  'lemon-pup': 'a bright lemon-yellow puppy with citrus-leaf ears',
}

function buildPrompt(entry: RosterEntry): string {
  const desc = KIND_DESCRIPTORS[entry.id] ?? entry.blurb
  const cat = CATEGORY_HINTS[entry.category]
  return `${desc}, ${cat}. ${STYLE_SCAFFOLD}`
}

// ── Generation loop ──────────────────────────────────────────────────────

const UUID_RE = /\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i
const URL_RE = /https?:\/\/[^\s")\\]+\.(?:png|jpe?g|webp)/i

async function exists(p: string): Promise<boolean> {
  try { await access(p); return true } catch { return false }
}

async function logEntry(payload: Record<string, unknown>) {
  await mkdir(path.dirname(LOG_PATH), { recursive: true })
  await appendFile(LOG_PATH, JSON.stringify({ t: new Date().toISOString(), ...payload }) + '\n')
}

interface GenResult { kind: string; ok: boolean; url?: string; error?: string; jobId?: string }

async function generateOne(entry: RosterEntry): Promise<GenResult> {
  const prompt = buildPrompt(entry)
  const dispatch = await rpc('tools/call', {
    name: 'generate_image',
    arguments: {
      params: { model: MODEL, prompt, count: 1, aspect_ratio: '1:1' },
    },
  })
  if (dispatch.error || dispatch.result?.isError) {
    const msg = dispatch.error?.message
      ?? dispatch.result?.content?.find(c => c.type === 'text')?.text
      ?? 'unknown error'
    return { kind: entry.id, ok: false, error: msg }
  }
  const text = dispatch.result?.content?.find(c => c.type === 'text')?.text ?? ''
  const jobMatch = text.match(UUID_RE)
  if (!jobMatch) return { kind: entry.id, ok: false, error: `no jobId in dispatch: ${text.slice(0, 200)}` }
  const jobId = jobMatch[1]

  for (let i = 0; i < 60; i++) {
    const poll = await rpc('tools/call', {
      name: 'job_status',
      arguments: { jobId, sync: true },
    })
    const t = poll.result?.content?.find(c => c.type === 'text')?.text ?? ''
    const url = t.match(URL_RE)?.[0]
    if (url) return { kind: entry.id, ok: true, url, jobId }
    if (/failed|error|nsfw|cancel/i.test(t)) {
      return { kind: entry.id, ok: false, error: t.slice(0, 200), jobId }
    }
    await new Promise(r => setTimeout(r, 4000))
  }
  return { kind: entry.id, ok: false, error: 'timeout', jobId }
}

async function downloadAndSave(url: string, outPath: string) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`download ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  await mkdir(path.dirname(outPath), { recursive: true })
  await writeFile(outPath, buf)
}

async function processOne(entry: RosterEntry): Promise<GenResult> {
  const outPath = path.join(OUT_DIR, `${entry.id}.png`)
  if (await exists(outPath)) return { kind: entry.id, ok: true, url: outPath, error: 'skipped: file exists' }
  const prompt = buildPrompt(entry)
  if (flagDryRun) {
    console.log(`[dry-run] ${entry.id}\n  prompt: ${prompt.slice(0, 160)}…`)
    await logEntry({ kind: entry.id, dryRun: true, prompt })
    return { kind: entry.id, ok: true, error: 'dry-run' }
  }
  const r = await generateOne(entry)
  if (!r.ok || !r.url) {
    console.error(`✗ ${entry.id}: ${r.error}`)
    await logEntry({ kind: entry.id, ok: false, error: r.error, jobId: r.jobId, prompt })
    return r
  }
  try {
    await downloadAndSave(r.url, outPath)
    console.log(`✓ ${entry.id} → ${path.relative(REPO, outPath)}`)
    await logEntry({ kind: entry.id, ok: true, url: r.url, jobId: r.jobId, prompt, model: MODEL })
    return r
  } catch (e) {
    const msg = (e as Error).message
    console.error(`✗ ${entry.id} download: ${msg}`)
    await logEntry({ kind: entry.id, ok: false, error: `download: ${msg}`, jobId: r.jobId, prompt })
    return { kind: entry.id, ok: false, error: msg, jobId: r.jobId }
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // Build the work queue.
  let queue = ROSTER.filter(e => !onlyKinds || onlyKinds.has(e.id))
  // Filter out kinds with existing PNG (resumable).
  const filtered: RosterEntry[] = []
  for (const e of queue) {
    if (await exists(path.join(OUT_DIR, `${e.id}.png`))) continue
    filtered.push(e)
  }
  queue = filtered
  if (limit > 0) queue = queue.slice(0, limit)

  console.log(`Queue: ${queue.length} kinds (model=${MODEL}, parallel=${PARALLEL}, dryRun=${flagDryRun})`)
  if (!flagDryRun) await handshake()

  const results: GenResult[] = []
  let inFlight = 0
  let idx = 0

  await new Promise<void>((resolve) => {
    const tick = () => {
      while (inFlight < PARALLEL && idx < queue.length) {
        const entry = queue[idx++]
        inFlight++
        processOne(entry)
          .then(r => results.push(r))
          .catch(e => results.push({ kind: entry.id, ok: false, error: (e as Error).message }))
          .finally(() => {
            inFlight--
            if (idx >= queue.length && inFlight === 0) resolve()
            else tick()
          })
      }
    }
    if (queue.length === 0) resolve()
    else tick()
  })

  const ok = results.filter(r => r.ok).length
  const fail = results.length - ok
  console.log(`\nDone: ${ok} ok, ${fail} failed.`)
  if (fail > 0) console.log('Re-run to retry failures (existing files are skipped).')
  console.log(`Now run: npm run sprites:process    # chroma-key the cream backgrounds`)
}

main().catch((e) => { console.error(e); process.exit(1) })
