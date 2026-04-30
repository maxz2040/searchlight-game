# Higgsfield MCP — Image & Video Generation

This project uses [Higgsfield AI](https://higgsfield.ai/) as its image- and
video-generation backend, accessed over the **Model Context Protocol** (MCP)
at `https://mcp.higgsfield.ai/mcp`.

The plan tier on the project owner's account is **Ultimate** (1,400 credits at
last balance check). Image generation costs ≈4–10 credits per render depending
on model and resolution; video is ~50–200 credits depending on duration.

---

## How auth works

Higgsfield's MCP server uses **OAuth 2.0 Device Authorization Grant** (RFC 8628)
because most MCP clients cannot receive an authorization-code redirect.

1. Client `POST`s to `https://fnf-device-auth.higgsfield.ai/authorize` and gets
   back a `device_code`, a `verification_uri` (in the form
   `https://higgsfield.ai/device?code=…`), and a poll `interval`.
2. The user opens the verification URI in a browser, signs in, and approves.
3. Client polls `POST /token` with the `device_code` until it receives an
   `access_token` (24-hour TTL, type `Bearer`).
4. All subsequent MCP requests carry `Authorization: Bearer <token>`.

The OAuth metadata is published at:
- `https://mcp.higgsfield.ai/.well-known/oauth-protected-resource` — RFC 9728
- `https://fnf-device-auth.higgsfield.ai/openapi.json` — full OpenAPI spec

### Refreshing the token

When the 24-hour TTL expires, MCP calls return `401`. Refresh with:

```bash
bash scripts/higgsfield-auth.sh
```

This prints an `Authorize here:` URL, polls until you approve, then writes the
new token to **both** locations (mode `600`, gitignored):
- `~/.config/searchlight/env` — auto-sourced from `~/.bashrc`
- `<repo>/.env` — project-local for npm scripts

It also re-registers the server with Claude Code (`claude mcp add …`) so the
in-memory bearer is current.

---

## Available tools

The MCP server exposes 14 tools (run `tools/list` to introspect; this is a
short reference):

### Discovery
| Tool | Purpose |
|---|---|
| `models_explore` | `action: list \| search \| get \| recommend` — find generation models. `recommend` takes a goal + `type=image\|video` and ranks options. |
| `balance` | Returns credits + plan + email. |
| `transactions` | Credit ledger (newest first, paginated). |
| `list_workspaces` / `select_workspace` | Switch between personal and team workspaces. |

### Generation
| Tool | Purpose |
|---|---|
| `generate_image` | Submit an image job. Required: `params.model`, `params.prompt`. Optional: `count` (1–4), `aspect_ratio`, `resolution`, reference `medias[]`. |
| `generate_video` | Submit a video job. Same shape; some models accept reference images for identity preservation. |
| `show_marketing_studio` | Marketing Studio widget for product/avatar/webproduct flows. |

### Job lifecycle
| Tool | Purpose |
|---|---|
| `job_status` | Poll a job by ID. Pass `sync: true` to make the server poll internally for ~25 s and return on terminal state — saves round-trips. |
| `job_display` | Re-render past results in the UI widget. |
| `show_generations` | Browse past generations (paginated). |

### Media uploads (for reference-driven generation)
| Tool | Purpose |
|---|---|
| `media_upload` | Returns presigned `PUT` URLs. Upload bytes, then call `media_confirm`. |
| `media_confirm` | Confirm uploads after successful `PUT`. |
| `show_medias` | List your uploaded files by type. |

---

## Recommended models for Searchlight

The MCP's `models_explore action=recommend` call surfaces these as best fits
for "anime-style top-down detailed scene illustration":

| Model | Provider | Why we'd use it |
|---|---|---|
| **`flux_2`** | Black Forest Labs | Best prompt adherence — what we used for the spit test. Variants: `pro`, `flex`, `max`. Aspect ratios: 1:1, 4:3, 3:4, 16:9, 9:16. |
| `soul_location` | Higgsfield | Purpose-built for environment / location / background generation. Tagged `landscape`, `scene`. |
| `gpt_image_2` | OpenAI | Good for diagrams + text-in-image. 1k/2k/4k resolution × low/medium/high quality tiers. |
| `nano_banana_2` | Google (proxied) | Top-quality multimodal, 4K, good at text/diagrams. |

For the `<SceneBackground>` v0 → AI swap, **`flux_2` at 16:9, 1k resolution,
`pro` variant** is the current pick. It produced 2.5 MB PNGs in ~10–20 s
during testing.

---

## Calling the MCP from Node/TypeScript

The protocol is **Streamable HTTP** (POST returns either `application/json` or
`text/event-stream`; SSE is the common case).

```ts
const ENDPOINT = 'https://mcp.higgsfield.ai/mcp'
const TOKEN = process.env.HIGGSFIELD_TOKEN!

let nextId = 1
let mcpSessionId: string | undefined

async function rpc(method: string, params?: unknown) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      ...(mcpSessionId ? { 'Mcp-Session-Id': mcpSessionId } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
  })
  const sid = r.headers.get('mcp-session-id')
  if (sid) mcpSessionId = sid

  // Streamable HTTP responses are usually SSE; pull the data line.
  const text = await r.text()
  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) return JSON.parse(line.slice(6))
  }
  return JSON.parse(text)
}

// Mandatory handshake before any tool call.
await rpc('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'my-app', version: '1.0' },
})
await rpc('notifications/initialized').catch(() => {})

// Generate.
const dispatch = await rpc('tools/call', {
  name: 'generate_image',
  arguments: {
    params: { model: 'flux_2', prompt: '…', count: 1, aspect_ratio: '16:9' },
  },
})
// Job ID is embedded in the text payload (UUID format). Parse it out:
const text = dispatch.result.content.find((c: any) => c.type === 'text').text
const jobId = text.match(/\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/)![1]

// Poll. `sync: true` lets the server wait up to 25 s before replying.
let final
while (true) {
  const r = await rpc('tools/call', {
    name: 'job_status',
    arguments: { jobId, sync: true },
  })
  const t = r.result.content.find((c: any) => c.type === 'text').text
  const url = t.match(/https:\/\/[^\s")]+\.(?:png|jpg|webp)/i)?.[0]
  if (url) { final = url; break }
  if (/failed|error/i.test(t)) throw new Error(t)
  await new Promise(r => setTimeout(r, 5000))
}

// Download.
const buf = Buffer.from(await (await fetch(final)).arrayBuffer())
```

> ⚠️ The dispatch response is human-readable text, **not** structured JSON.
> Job IDs and result URLs need to be extracted with regex. This is a quirk of
> the MCP server, not the protocol.

---

## Calling from Claude Code

The server is registered as a user-scoped MCP via:

```bash
claude mcp add --scope user higgsfield \
  --transport http https://mcp.higgsfield.ai/mcp \
  --header "Authorization: Bearer $HIGGSFIELD_TOKEN"
```

Once registered, the tools surface as `mcp__higgsfield__generate_image`,
`mcp__higgsfield__job_status`, etc., and can be invoked directly from any
Claude Code session.

---

## Quick reference: spit-test cost

| Run | Model | Resolution | Credits | Wallclock |
|---|---|---|---|---|
| 3-prompt spit test (forest, market, coral reef) | `flux_2` | 1k 16:9 | ~12-30 total | ~30 s start to finish |

Outputs landed in `scratch/higgsfield-spit/*.png` (gitignored).

---

## Files in this project

| File | Purpose |
|---|---|
| `scripts/higgsfield-auth.sh` | Device-flow re-auth (run when token expires) |
| `.env` | Local `HIGGSFIELD_TOKEN` mirror (gitignored) |
| `~/.config/searchlight/env` | Global token store, auto-sourced from `.bashrc` |
| `docs/higgsfield-mcp.md` | This file |
| `src/sceneLoader.ts` | (TODO) Will call `generate_image` for AI scene backgrounds — currently stubbed with hand-painted SVG fallback |
