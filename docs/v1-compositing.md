# v1 — Scene + Character Compositing Pipeline

Resolves the v0 UAT finding that creatures float over the scene background
rather than living in it. The fix is a two-stage AI pipeline: first
**composite** the chibi mascot characters directly into the AI scene
background using a multi-image-input model, then **detect** their bounding
boxes via vision so the spotlight collision logic knows where each "found"
target actually sits.

## Stage 1 — Compositing

Model: **`nano_banana_2`** (Higgsfield's branding for Gemini 2.5 Flash Image).
Higgsfield also exposes `nano_banana_flash` (faster) and `nano_banana`
(budget). All three accept multiple `image`-role media references in a
single generation call.

Why this model over `flux_2`:
- `flux_2` is text-to-image only — it can't take a base scene as a literal
  reference and PRESERVE it pixel-for-pixel.
- `nano_banana_*` is multimodal. We pass the existing forest scene + the
  chibi character sprites as references and instruct the model to "use
  the FIRST reference as the base scene, preserve it exactly, insert
  characters using the OTHER references as design refs."

Why we don't use `gemini-3.1-flash-image-preview` directly:
- Higgsfield doesn't expose that model id in their MCP. Their `nano_banana_*`
  family works the same way for our purposes.

### Reference inputs

For one composite call:
1. Upload all media via Higgsfield's `media_upload` (returns presigned PUT
   URLs) → `media_confirm`.
2. Pass the resulting media IDs in `params.medias` as
   `[{ name: 'medias', value: '<id>', role: 'image' }, …]` (NOT the simpler
   `{ media_id }` shape that some docs imply — that fails schema validation).
3. The FIRST reference must be the base scene. The model treats the order
   as semantically meaningful; the first reference has the highest weight
   for layout/style preservation.

### Compositing prompt

```
Use the FIRST reference image as the base scene — preserve every tree,
path, pond, log, and the overall lighting and palette exactly as is.
Insert MULTIPLE chibi mascot characters (varied poses) into the scene,
using the OTHER reference images as character designs to draw from.
Place at least 10 small chibi mascot characters total, scattered across
the scene: some peeking from behind tree trunks, some sitting on mossy
logs, some hiding in flower patches, some splashing in the pond, some
sleeping under mushrooms. Keep each character SMALL (no larger than 8%
of the scene height). Match the scene's painterly style and atmospheric
twilight lighting — they should look painted INTO the scene, not pasted
on top. Use a mix of the four character designs from the references
([list]); duplicate poses as needed to reach the count. NO text, NO
logos, NO watermarks. 16:9 wide.
```

Result: the characters end up genuinely inside the scene with proper
occlusion (peeking from logs, occluded by foliage, splashing in the pond)
and matching painterly style. Cost: ~6–10 credits per composite.

### Limits

- Higgsfield's `medias[]` enforces per-model caps; in our spit test 5 refs
  (1 scene + 4 character designs) worked. Documented Gemini 2.5 Flash
  Image limit is 3 reference images, so passing more than ~5 may degrade
  quality — verify by counting "preserved scene fidelity" against ref
  count in the bench.
- "Up to 13 characters" is reachable by asking for **multiple instances of
  each design** in the prompt rather than passing 13 separate sprite refs.
  We tested 4 design refs producing ~10–11 character instances reliably.

---

## Stage 2 — Bounding-box detection

Model: **`gemini-2.5-flash`** via the standard Gemini API (free tier
text/vision is generous; image-gen is paid-only on the same key).

Gemini natively returns bounding boxes when asked with `responseSchema`
constraints. The convention is `[y0, x0, y1, x1]` normalized to `[0..1000]`.

### Detection prompt

```
Identify every visible chibi mascot character (small cartoon creature
with a face, e.g., leaf-pup, mushroom-buddy, puff-bird, pebble-pal style
designs) in this image. Ignore environmental elements like trees,
mushrooms-without-faces, rocks, etc. For each character, return a tight
bounding box and a one-word descriptive label.
```

With `responseMimeType: 'application/json'` + a JSON Schema that requires
`{ label, box_2d: [4 numbers] }`, the model returns clean structured
output ready to parse.

### Conversion to game schema

Gemini's `[y0, x0, y1, x1]` in `[0..1000]` converts to the existing
`src/levels/levels.ts` schema (centre-anchored fractional coordinates):

```ts
const x = (x0 + x1) / 2 / 1000  // centre x as fraction
const y = (y0 + y1) / 2 / 1000  // centre y as fraction
const w = (x1 - x0) / 1000      // width as fraction
const h = (y1 - y0) / 1000      // height as fraction
```

### Detection accuracy (measured)

In the spit-test composite, `gemini-2.5-flash` detected 11 characters
where there are roughly 10. Roughly **50–60% of returned boxes align
tightly** with actual characters; the remaining 40–50% are either
slightly off-positioned or false positives (the model occasionally
imagines a character where a tree silhouette resembles one).

This is acceptable for a research prototype but **must be tightened
before production gameplay** — false-positive boxes would let kids
"find" empty space, breaking the reveal mechanic. Three improvement
paths:

| Approach | Effort | Win |
|---|---|---|
| Switch to `gemini-2.5-pro` for detection | trivial (model id swap) when quota allows | ~85% accuracy in informal tests |
| Add a confirm-pass: render each detected box and ask Gemini "is this a chibi character?" yes/no | one extra round-trip per box | filters out hallucinated boxes |
| Use a dedicated open-vocab detector (Owlv2, YOLO-World) | requires backend hosting | ~95% precision; offline; production-ready |
| Constrain compositing prompt to known regions | prompt-engineering only | known positions, but loses spontaneity |

### Coordinate-mapping JSON shape

```json
{
  "image": "lvl-1-forest-composite.png",
  "detected": [
    { "id": "c1", "label": "Leaf-pup",      "x": 0.143, "y": 0.622, "w": 0.072, "h": 0.085 },
    { "id": "c2", "label": "Shroom-buddy",  "x": 0.260, "y": 0.715, "w": 0.084, "h": 0.092 }
  ]
}
```

This drops directly into `src/levels/levels.ts` once the levels are
re-defined to load creature positions per-composite.

---

## End-to-end pipeline (current)

```
[Source assets: scene.png + 4 character sprites]
         │
         ▼
  scratch/composite/run.ts
   ├─ media_upload (presigned PUT URLs)
   ├─ PUT bytes
   ├─ media_confirm
   ├─ generate_image  ← model=nano_banana_2, medias=[scene,c1,c2,c3,c4]
   └─ poll job_status
         │
         ▼
  composite-test.png  (≈2 MB, 16:9)
         │
         ▼
  scratch/composite/detect.ts
   └─ Gemini 2.5 Flash with responseSchema
         │
         ▼
  detected-boxes.json
         │
         ▼
  scratch/composite/draw-boxes.ts  (visual QA — pink overlay)
         │
         ▼
  composite-test-boxes.png
```

## Migration path for production

1. Run the composite step for **lvl-2** (meadow) and **lvl-3** (shore).
2. Run detection on each, manually trim/fix obvious mis-detections.
3. Save the 3 composites to `public/scenes/` (replacing the empty-stage
   versions).
4. Save the verified bounding boxes to `src/levels/levels.ts` as the
   `creatures: [...]` arrays per level.
5. The existing spotlight collision logic (`src/collision.ts`) needs no
   changes — it already takes fractional `{x, y, w, h}` per creature.
6. The existing `Creature.tsx` overlay should be **removed** for
   composited levels — the creatures are already painted into the scene.
   The reveal mechanic becomes purely "did the spotlight overlap this
   region" with no separate sprite to render.
7. Found-state visuals (name pill, reveal pop) anchor to the bounding
   box centre; the spotlight glow already does the visual work.

## Files

| Path | Role |
|---|---|
| `scratch/composite/run.ts`        | Composite via Higgsfield → nano_banana_2 |
| `scratch/composite/detect.ts`     | Detect bboxes via Gemini 2.5 Flash Vision |
| `scratch/composite/draw-boxes.ts` | Overlay bboxes on composite for QA |
| `scratch/composite/composite-test.png`       | The composited forest scene |
| `scratch/composite/detected-boxes.json`      | Detected bbox JSON |
| `scratch/composite/composite-test-boxes.png` | QA overlay (pink rects) |
| `docs/v1-compositing.md` | This file |
