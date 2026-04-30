/**
 * Build the model comparison HTML — 4 image-gen models on the same prompt.
 * Self-contained file, base64-inlined images, lives in docs/.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BENCH = path.join(ROOT, 'scratch', 'model-bench')
const OUT = path.join(ROOT, 'docs', 'model-comparison.html')

interface Result {
  model: string
  ok: boolean
  file?: string
  bytes?: number
  secs?: number
  err?: string
}

const META: Record<string, { provider: string; verdict: string; useCase: string; pros: string[]; cons: string[] }> = {
  flux_2: {
    provider: 'Black Forest Labs',
    verdict: '⭐ Winner — production scenes',
    useCase: 'Anime-style scene backgrounds with negative space for the spotlight to reveal.',
    pros: [
      'Best balance of density and breathing room — has clear empty mid-tones for the spotlight to selectively reveal.',
      'Strong prompt adherence; "anime style" reads correctly without wandering into manga or 3D-render.',
      'Painterly detail in the background that rewards close inspection (good for older kids replaying).',
      'Fast — 3 s end-to-end on this run.',
    ],
    cons: [
      'Has its OWN tendency to bake creatures into scenes; the prompt has to explicitly say "NO animals, NO creatures".',
      '`pro` variant is the default (auto-applied if `model` param is unset); `max` is more painterly but ~2× slower.',
    ],
  },
  soul_location: {
    provider: 'Higgsfield',
    verdict: 'Pass — too dense for our gameplay',
    useCase: 'Purpose-built for "environment / location / background" — but specifically a populated environment.',
    pros: [
      'Atmospheric, beautiful greenery and water. Strongest "world feels alive" of the four.',
      'Deepest top-down composition — basically isometric.',
    ],
    cons: [
      'Saturates the frame with characters by default; almost zero negative space. The opposite of what the spotlight mechanic needs.',
      'Hard to steer toward emptiness even with explicit "NO animals" prompts.',
    ],
  },
  gpt_image_2: {
    provider: 'OpenAI',
    verdict: '❌ Failed — false-positive NSFW filter',
    useCase: 'Strong text/diagram fidelity, multi-resolution support, normally a strong default.',
    pros: [
      'Excellent at text-in-image (useful for HUD elements if we ever bake them into the scene).',
      '4K available, low/medium/high quality tiers.',
    ],
    cons: [
      'OpenAI safety filter rejected our prompt as NSFW after 7+ minutes — likely tripping on "creatures hiding" + "playful energy" combination. Famously trigger-happy on phrases that involve children + hiding.',
      'No graceful fallback when filtered; the entire job 404s out late.',
      'Slowest in the bench (didn\'t complete inside 7 min budget).',
    ],
  },
  nano_banana_2: {
    provider: 'Google (proxied via Higgsfield)',
    verdict: '⭐ Backup — character avatars',
    useCase: 'Reference-image-driven generation. The recommended model for v1 character upload (see docs/v1-character-prompt.md).',
    pros: [
      'Beautiful, dreamlike, painterly aesthetic; arguably more "movie-magical" than flux_2.',
      'Strong identity preservation when given a reference photo — exactly what character-upload needs.',
      'Top-quality at 4K.',
    ],
    cons: [
      'Composition slightly less dense than flux_2 — fewer hidden-creature spots in a single frame.',
      'Style is more painterly / less anime-line-art; if you wanted crisp Spy×Family lines this isn\'t it.',
    ],
  },
}

async function inline(file: string): Promise<string> {
  const buf = await readFile(path.join(BENCH, file))
  return `data:image/png;base64,${buf.toString('base64')}`
}

async function main() {
  const results: Result[] = JSON.parse(await readFile(path.join(BENCH, 'results.json'), 'utf8'))

  const promptFile = path.join(BENCH, 'dispatch.ts')
  const promptSource = await readFile(promptFile, 'utf8')
  const promptText = promptSource.match(/PROMPT = process\.env\.PROMPT!/)
    ? '(passed via env — see scripts)'
    : ''
  const sharedPrompt = `A highly detailed, vibrant, and chaotic illustration in anime style featuring a dense and lively environment filled with hundreds of unique pocket creatures interacting with their surroundings. The scene is set in a glowing forest, packed with hidden details, lush vegetation, and various creatures hiding behind trees, in bushes, and near streams. The perspective is a wide-angle, top-down view that allows for maximum visual complexity. The image should be bright, colorful, and filled with playful energy, maintaining a high level of visual density where every inch of the canvas contains a story or a hidden creature to find.`

  const cards = await Promise.all(
    results.map(async (r) => {
      const meta = META[r.model] ?? { provider: '', verdict: '', useCase: '', pros: [], cons: [] }
      let imgTag = ''
      if (r.ok && r.file) {
        const data = await inline(r.file)
        imgTag = `<a href="${data}" target="_blank" rel="noopener"><img loading="lazy" src="${data}" alt="${r.model} output" /></a>`
      } else {
        imgTag = `<div class="no-image">⚠️ no image — ${(r.err ?? 'unknown error').slice(0, 200)}</div>`
      }
      const verdictClass = meta.verdict.startsWith('⭐')
        ? 'win'
        : meta.verdict.startsWith('❌')
          ? 'fail'
          : 'pass'
      return `
      <article class="card ${verdictClass}">
        <header>
          <h2>${r.model}</h2>
          <div class="provider">${meta.provider}</div>
          <div class="verdict">${meta.verdict}</div>
          <div class="meta">${r.ok ? `${(r.bytes! / 1024).toFixed(0)} KB · ${r.secs}s` : 'failed'}</div>
        </header>
        ${imgTag}
        <div class="useCase"><strong>Best for:</strong> ${meta.useCase}</div>
        <div class="pros-cons">
          <div class="col"><strong>+ Pros</strong><ul>${meta.pros.map((p) => `<li>${p}</li>`).join('')}</ul></div>
          <div class="col"><strong>− Cons</strong><ul>${meta.cons.map((c) => `<li>${c}</li>`).join('')}</ul></div>
        </div>
      </article>`
    }),
  )

  // Also show what `flux_2` produced when re-prompted for the actual game
  // scene backgrounds (dim, atmospheric, no creatures baked in).
  const sceneFiles = ['lvl-1-forest.png', 'lvl-2-meadow.png', 'lvl-3-shore.png']
  const scenes: { id: string; data: string }[] = []
  for (const f of sceneFiles) {
    const buf = await readFile(path.join(ROOT, 'public', 'scenes', f))
    scenes.push({ id: f.replace('.png', ''), data: `data:image/png;base64,${buf.toString('base64')}` })
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Searchlight — Image-gen model comparison</title>
<style>
  :root {
    --night: #0a0d1f;
    --night-deep: #050714;
    --paper: #fff8e7;
    --warm: #fff4c8;
    --edge: #ffd070;
    --accent: #ff6b9d;
    --leaf: #4ade80;
    --rule: rgba(255, 248, 231, 0.12);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--night-deep); color: var(--paper);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
  a { color: var(--edge); }
  header.hero {
    padding: 80px 80px 48px;
    background:
      radial-gradient(circle at 22% 28%, rgba(255, 244, 200, 0.16) 0%, rgba(255, 208, 112, 0.04) 28%, transparent 60%),
      radial-gradient(circle at 78% 72%, rgba(255, 107, 157, 0.14) 0%, transparent 50%),
      linear-gradient(180deg, #0a0d1f 0%, #050714 100%);
    border-bottom: 1px solid var(--rule);
  }
  .kicker { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255, 248, 231, 0.55); }
  h1 { font-size: clamp(40px, 5vw, 64px); margin: 14px 0 16px;
    background: linear-gradient(120deg, #fff8e7 0%, #ffd070 60%, #ff6b9d 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    line-height: 1; letter-spacing: -0.02em; font-weight: 700;
    font-family: "Fredoka", "SF Pro Rounded", system-ui, sans-serif; }
  header.hero p { max-width: 780px; margin: 0; color: rgba(255, 248, 231, 0.78); font-size: 18px; line-height: 1.5; }
  main { max-width: 1500px; margin: 0 auto; padding: 0 80px 120px; }
  section { padding: 60px 0 32px; border-top: 1px solid var(--rule); }
  section:first-child { border-top: none; }
  section h2 { font-size: 28px; margin: 0 0 12px; font-weight: 600; }
  section .sub { color: rgba(255, 248, 231, 0.6); margin: 0 0 28px; max-width: 780px; }
  .prompt-box {
    background: rgba(255, 248, 231, 0.04);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 18px 22px;
    font-family: ui-monospace, "SF Mono", monospace;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 248, 231, 0.72);
    margin: 0 0 32px;
  }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .card {
    background: rgba(255, 248, 231, 0.03);
    border: 1px solid var(--rule);
    border-radius: 16px;
    overflow: hidden;
  }
  .card.win { border-color: rgba(74, 222, 128, 0.35); box-shadow: 0 0 32px rgba(74, 222, 128, 0.1); }
  .card.fail { opacity: 0.7; border-style: dashed; }
  .card header { padding: 18px 22px 12px; }
  .card h2 { font-size: 22px; margin: 0; font-weight: 700; font-family: "Fredoka", system-ui, sans-serif; }
  .provider { font-size: 12px; color: rgba(255, 248, 231, 0.55); margin: 4px 0 10px; letter-spacing: 0.06em; text-transform: uppercase; }
  .verdict { font-size: 13px; font-weight: 600; }
  .card.win .verdict { color: var(--leaf); }
  .card.pass .verdict { color: var(--edge); }
  .card.fail .verdict { color: var(--accent); }
  .meta { font-size: 11px; color: rgba(255, 248, 231, 0.5); margin-top: 6px; }
  .card img { display: block; width: 100%; height: auto; }
  .no-image { padding: 60px 22px; background: rgba(255, 107, 157, 0.08); color: rgba(255, 200, 200, 0.85); font-size: 13px; text-align: center; }
  .useCase { padding: 16px 22px; font-size: 14px; line-height: 1.55; color: rgba(255, 248, 231, 0.78); border-top: 1px solid var(--rule); }
  .pros-cons { display: grid; grid-template-columns: 1fr 1fr; padding: 0 22px 20px; gap: 20px; font-size: 13px; }
  .pros-cons strong { display: block; margin-bottom: 6px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 248, 231, 0.6); }
  .pros-cons ul { margin: 0; padding-left: 16px; line-height: 1.55; color: rgba(255, 248, 231, 0.78); }
  .scene-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .scene-grid figure { margin: 0; border: 1px solid var(--rule); border-radius: 12px; overflow: hidden; }
  .scene-grid img { display: block; width: 100%; height: auto; }
  .scene-grid figcaption { padding: 12px 16px; font-size: 13px; color: rgba(255, 248, 231, 0.65); }
  @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } .scene-grid { grid-template-columns: 1fr; } main, header.hero { padding-left: 24px; padding-right: 24px; } }
</style>
</head>
<body>

<header class="hero">
  <div class="kicker">v1 backend pick · ${new Date().toISOString().slice(0, 10)}</div>
  <h1>Image-gen<br/>model bench</h1>
  <p>Four candidate models, one shared anime-style top-down forest prompt.
  Goal: pick the right backbone for AI-generated scene backgrounds and the
  v1 character-upload feature. All runs via Higgsfield MCP, 16:9, 1k.</p>
</header>

<main>

  <section>
    <h2>The shared prompt</h2>
    <p class="sub">Pulled from the user's seed set. Distinctive enough to expose stylistic differences between models — dense, anime, hidden-creatures.</p>
    <div class="prompt-box">${sharedPrompt}</div>
  </section>

  <section>
    <h2>Model results</h2>
    <p class="sub">Click any image to open full-resolution. Verdicts are scored against this project's needs (kid-friendly searchlight game, dense scenes, kid-safe outputs).</p>
    <div class="grid">${cards.join('')}</div>
  </section>

  <section>
    <h2>What we shipped with</h2>
    <p class="sub">Re-prompted <code>flux_2</code> with scene-specific prompts tuned for the spotlight gameplay (dim base, empty negative-space zones, no baked-in creatures). These are the production scene backgrounds now wired into <code>SceneBackground.tsx</code>.</p>
    <div class="scene-grid">
      ${scenes.map((s) => `<figure><img loading="lazy" src="${s.data}" alt="${s.id}" /><figcaption>${s.id}</figcaption></figure>`).join('')}
    </div>
  </section>

  <section>
    <h2>Decision summary</h2>
    <p class="sub" style="max-width: 900px;">
      <strong style="color: var(--leaf);">Production scenes:</strong> <code>flux_2</code> at 16:9, 1k, <code>pro</code> variant —
      best mix of detail and negative space, fast (3 s), kid-safe outputs.<br/><br/>
      <strong style="color: var(--leaf);">v1 character avatars:</strong> <code>nano_banana_2</code> with reference photo via <code>medias[]</code>
      — strongest identity preservation, anime aesthetic by default. See
      <a href="v1-character-prompt.md">v1-character-prompt.md</a> for the verbatim prompt and integration shape.<br/><br/>
      <strong style="color: var(--accent);">Avoid:</strong> <code>gpt_image_2</code> (NSFW filter false-positives on kid-game phrasing) and
      <code>soul_location</code> (saturates the frame with creatures, no negative space for the spotlight).
    </p>
  </section>

</main>

</body>
</html>`

  await writeFile(OUT, html)
  console.log(`✅ ${OUT}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
