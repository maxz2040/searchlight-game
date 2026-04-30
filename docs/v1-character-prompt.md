# v1 — Character Anime Conversion Prompt

The headline feature for v1 is **"find yourself"** — kids (or a parent) take
or upload a photo, the app converts it to anime style via Higgsfield, and
the kid's anime-fied avatar appears alongside the existing pocket creatures
in every level. The reveal-toast moment when they spot themselves hidden
in the scene is the parent-magic, screenshot-worthy event that drives
organic growth.

This doc captures the prompt template, model choice, integration shape, and
safety notes.

---

## The prompt

Verbatim, do not edit without re-testing across at least five reference
photos (light skin, dark skin, glasses, hair-up, hair-down):

```
Create a trending anime art style image from the uploaded subject. Use
confident line-work with slight variation and minimal cel shading using
flat shadow shapes. Use bright, saturated colors and clean graphic
lighting. The style is defined by exaggerated, cartoonish character
proportions featuring highly expressive, simplistic facial features that
allow for immense emotional range, with highly varied stretched anatomy.
Transform the environment into a slightly warped space with playful
perspective distortion and simplified objects. Composition and tone
should be energetic, lively, and comedic in a fully stylized,
non-realistic world.
```

### Why this prompt

- **"Trending anime art style"** anchors the model on the current Pixar/Spy×Family/Ghibli-flavoured pop-anime, not 90s cel-style or AI-slop generic anime.
- **"Confident line-work with slight variation"** kills the over-rendered painterly noise that flux defaults to and gives us the clean look kids recognise from current shows.
- **"Minimal cel shading using flat shadow shapes"** plus **"bright, saturated colors and clean graphic lighting"** means the avatar reads cleanly against our dim scene backgrounds — flat colour pops against `#0a0d1f`.
- **"Exaggerated, cartoonish character proportions"** and **"simplistic facial features that allow for immense emotional range"** keep the result kid-friendly and non-uncanny — we explicitly do NOT want photorealistic.
- **"Slightly warped space with playful perspective distortion"** turns the photo's background into a stylised diorama instead of a verbatim copy of the kid's living room.
- **"Energetic, lively, and comedic"** + **"fully stylized, non-realistic world"** are the safety/style guardrails. They steer away from realism (=privacy-sensitive likeness) and toward unmistakable cartoon.

The prompt is verbose by design — every clause has work to do. Removing any
one of them produces a measurably different (worse, in user-testing terms)
output. Re-test if you change it.

---

## Model + parameters

**Higgsfield model:** `nano_banana_2`

Why not `flux_2` (which we use for scenes)? Two reasons:

1. **Reference image fidelity.** `nano_banana_2` is Google's multimodal
   model with strong identity-preservation when given a reference photo
   via `medias[]`. Flux 2.0 is excellent for text-only generation but
   weaker at "make a stylised version of THIS specific face."
2. **Anime aesthetic baseline.** `nano_banana_2`'s default style is closer
   to the trending-anime target the prompt asks for, so the prompt has
   less correcting to do.

Fallback if `nano_banana_2` is unavailable or quota-limited: `soul_2`
(Higgsfield's own portrait/identity model).

### Suggested call

```ts
await callTool('generate_image', {
  params: {
    model: 'nano_banana_2',
    prompt: CHARACTER_PROMPT,           // the verbatim template above
    count: 1,
    aspect_ratio: '1:1',                // square crop, used for tray + scene cameos
    medias: [
      { id: uploadedPhotoMediaId },     // from media_upload + media_confirm
    ],
  },
})
```

### Cost

≈ 6–10 credits per generation on `nano_banana_2`. For a typical play session
this fires once per character upload (kid + 1–3 friends). Budget: ~50 credits
per family who uses the feature.

---

## Integration shape

The full flow has four backend touch-points; v1 needs all four to be safe.

| # | Step | Why it has to live server-side |
|---|---|---|
| 1 | Upload photo via `media_upload` → `media_confirm` | The Higgsfield bearer token must never ship to the client. |
| 2 | Generate via `generate_image` with the verbatim prompt + uploaded media id | Same token-leak reason. |
| 3 | Poll `job_status` until terminal | Needs the same authenticated client. |
| 4 | Auto-content-moderate the result before persisting | Before showing a child's anime avatar, run it through a face-detection + age estimator + skin-tone-bias check. Higgsfield's own filters caught the gpt_image_2 false-positive in our scene bench; we need a second pass for our own product safety. |

**Recommended architecture for v1:**

```
[iPad client]                [Backend proxy]              [Higgsfield MCP]
  upload form  ──photo────►  /api/character/upload   ───►  media_upload
                              (stores in S3 + DB)         media_confirm
   ◄─────────media_id─────
                                                          generate_image
   start job  ──prompt+id─►  /api/character/generate  ───►  (with reference)
                                                          ◄─job_id
   ◄────────job_id────────
                                                          job_status (poll)
   poll       ────job_id──►  /api/character/status    ───►  (proxied poll)
   ◄──final url + meta────                             ◄─completed
```

The backend proxy enforces:
- Per-account rate limits (no kid-driven generation spam)
- Auth (parent gate before upload, COPPA compliance)
- Content moderation pass before the URL hits the client
- Audit log of every generation (parent dashboard, "see all avatars made")

---

## Safety + privacy notes

- **Photos are sensitive.** They should be deleted from S3 once the avatar
  is generated unless the parent explicitly opts in to saving the original.
- **The avatar URL is an identifier.** Treat it as PII; don't log it
  alongside the kid's display name in analytics.
- **The prompt does not mention age, gender, ethnicity, or hair colour.**
  This is deliberate — letting the model preserve those from the reference
  is what makes "find yourself" work, but it also means the input photo
  must be the parent's choice (verified parent gate). Don't feed the model
  text-only descriptions of children you've never seen photos of.
- **Run a face-recognition matcher between input and output.** If the
  output is a different identity (model hallucination), reject + retry. We
  saw this rarely in spit testing but it's worth the defensive check.

---

## Files

| Path | Role |
|---|---|
| `docs/v1-character-prompt.md` | This file (reference + rationale). |
| `docs/v1-mockup.html` | Frontend prototype of the full v1 character flow. |
| `docs/v1-ui-ux-proposal.md` | Critique of v0 + the "ambitious bet" framing. |
| `src/character/prompt.ts` | (TODO v1) Will export `CHARACTER_PROMPT` as a string constant for the backend proxy to call. |
| `api/character/*` | (TODO v1) Server-side proxy routes — Node + small storage layer. |
