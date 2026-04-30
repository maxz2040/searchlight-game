#!/usr/bin/env bash
# Re-composite each scene with 13 chibi mascot characters drawn from the
# FULL 8-character library so each scene can show varied unique kinds
# rather than the model's natural duplication tendency. nano_banana_2 at
# 4K. Saves to scratch/composite-13/<level>.png — promote after QA.
set -uo pipefail
. ~/.config/searchlight/env

ENDPOINT="https://mcp.higgsfield.ai/mcp"
AUTH="Authorization: Bearer $HIGGSFIELD_TOKEN"
ACCEPT="Accept: application/json, text/event-stream"
CT="Content-Type: application/json"
ROOT="/gt/searchlight/mayor/rig"
OUT="$ROOT/scratch/composite-13"
mkdir -p "$OUT"

CHARS=(
  "$ROOT/public/creatures/leaf-pup.png"
  "$ROOT/public/creatures/flame-cub.png"
  "$ROOT/public/creatures/aqua-spark.png"
  "$ROOT/public/creatures/bolt-bunny.png"
  "$ROOT/public/creatures/puff-bird.png"
  "$ROOT/public/creatures/shroom-buddy.png"
  "$ROOT/public/creatures/pebble-pal.png"
  "$ROOT/public/creatures/star-fish.png"
)

declare -A PROMPTS=(
  [lvl-1-forest]="Use the FIRST reference image as the base forest scene — preserve every tree, path, pond, log, and the painterly twilight palette EXACTLY. Insert THIRTEEN distinct chibi mascot characters into the scene, each in a UNIQUE pose at a UNIQUE position. CRITICAL: include AT LEAST ONE INSTANCE of EACH of the 8 different character designs from the OTHER reference images (leaf-pup, flame-cub, aqua-spark, bolt-bunny, puff-bird, shroom-buddy, pebble-pal, star-fish). Then add 5 more varied poses by repeating any designs. DO NOT make all 13 the same character kind. Place them: peeking from behind tree trunks, sitting on mossy logs, hiding in flower patches, splashing in the pond, sleeping under mushrooms, peeking from leaf piles, climbing roots, sitting on path stones. Each character SMALL (no larger than 7% of scene height). Match painterly atmospheric twilight lighting EXACTLY — characters look painted INTO the scene. Spread evenly across the canvas. NO text, NO logos. 16:9."
  [lvl-2-meadow]="Use the FIRST reference image as the base meadow at dusk — preserve every detail of the rolling hills, grass, sky, path, palette EXACTLY. Insert THIRTEEN distinct chibi mascot characters into the scene, each in a UNIQUE pose at a UNIQUE position. CRITICAL: include AT LEAST ONE INSTANCE of EACH of the 8 different character designs from the OTHER reference images (leaf-pup, flame-cub, aqua-spark, bolt-bunny, puff-bird, shroom-buddy, pebble-pal, star-fish). Then add 5 more varied poses by repeating any designs. DO NOT make all 13 the same kind. Place them: hiding in tall grass, behind boulders, lounging in wildflowers, napping on rocks, chasing fireflies, peeking from path corners, sitting on hill ridges. Each character SMALL. Match painterly dusk lighting EXACTLY. Spread evenly. NO text, NO logos. 16:9."
  [lvl-3-shore]="Use the FIRST reference image as the base starlit seashore — preserve sand, waves, tide pools, sky, cliff, palette EXACTLY. Insert THIRTEEN distinct chibi mascot characters into the scene, each in a UNIQUE pose at a UNIQUE position. CRITICAL: include AT LEAST ONE INSTANCE of EACH of the 8 different character designs from the OTHER reference images (leaf-pup, flame-cub, aqua-spark, bolt-bunny, puff-bird, shroom-buddy, pebble-pal, star-fish). Then add 5 more varied poses by repeating any designs. DO NOT make all 13 the same kind. Place them: splashing in tide pools, perched on driftwood, sitting on wet sand at wave edge, hiding behind beach rocks, star-gazing on cliff base, riding seashells, peeking from rock crevices. Each character SMALL. Match cool moonlit lighting EXACTLY. Spread evenly. NO text, NO logos. 16:9."
)

# MCP init
curl -sS -D /tmp/c13v2-init -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"c13v2","version":"0"}}}' --max-time 30 -o /dev/null
SID=$( (grep -i 'mcp-session-id:' /tmp/c13v2-init || true) | awk '{print $2}' | tr -d '\r\n')
SID_HEADER=""; [ -n "$SID" ] && SID_HEADER="-H Mcp-Session-Id:$SID"

# Upload one file via media_upload single-filename + PUT + media_confirm
upload_one() {
  local FILE="$1"
  local FN
  FN=$(basename "$FILE")
  local RESP
  RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
    -d "$(jq -nc --arg fn "$FN" '{jsonrpc:"2.0",id:2,method:"tools/call",params:{name:"media_upload",arguments:{method:"upload_url",filename:$fn,type:"image"}}}')" \
    --max-time 30)
  local MID URL
  MID=$(echo "$RESP" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  URL=$(echo "$RESP" | grep -oE "'https?://[^']+'" | head -1 | tr -d "'")
  [ -z "$MID" ] && { echo "ERR no media_id for $FN: $RESP" | head -c 300 >&2; return 1; }
  curl -sS -X PUT --max-time 90 -H "Content-Type: image/png" --data-binary "@$FILE" "$URL" >/dev/null
  curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
    -d "$(jq -nc --arg id "$MID" '{jsonrpc:"2.0",id:3,method:"tools/call",params:{name:"media_confirm",arguments:{type:"image",media_id:$id}}}')" --max-time 20 >/dev/null
  echo "$MID"
}

for ID in lvl-1-forest lvl-2-meadow lvl-3-shore; do
  echo "=== [$ID] uploading 9 refs ==="
  SCENE_MID=$(upload_one "$ROOT/public/scenes/$ID.png")
  echo "  scene=$SCENE_MID"
  CHAR_MIDS=()
  for C in "${CHARS[@]}"; do
    M=$(upload_one "$C")
    CHAR_MIDS+=("$M")
    echo "  $(basename "$C")=$M"
  done

  # Build medias[] — scene first, then 8 character refs.
  ALL=("$SCENE_MID" "${CHAR_MIDS[@]}")
  MEDIAS=$(printf '%s\n' "${ALL[@]}" | jq -Rs 'split("\n")|map(select(.!="")|{name:"medias",value:.,role:"image"})')

  PROMPT="${PROMPTS[$ID]}"
  BODY=$(jq -nc --arg p "$PROMPT" --argjson m "$MEDIAS" '{jsonrpc:"2.0",id:4,method:"tools/call",params:{name:"generate_image",arguments:{params:{model:"nano_banana_2",prompt:$p,count:1,aspect_ratio:"16:9",resolution:"4k",medias:$m}}}}')
  RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER -d "$BODY" --max-time 90)
  JOB=$(echo "$RESP" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  if [ -z "$JOB" ]; then
    echo "[$ID] ❌ no jobId  resp=$(echo "$RESP" | head -c 400)"
    continue
  fi
  echo "[$ID] job=$JOB polling"
  URL=""
  for i in $(seq 1 80); do
    POLL=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
      -d "$(jq -nc --arg j "$JOB" '{jsonrpc:"2.0",id:5,method:"tools/call",params:{name:"job_status",arguments:{jobId:$j,sync:true}}}')" --max-time 40)
    URL=$(echo "$POLL" | grep -oE 'https?://[^"\\)]+\.(png|jpe?g|webp)' | head -1)
    if [ -n "$URL" ]; then break; fi
    if echo "$POLL" | grep -qiE 'failed|nsfw|cancel|ip_detect'; then echo "[$ID] FAILED: $(echo "$POLL"|head -c 300)"; URL=""; break; fi
    printf '.'
    sleep 4
  done
  echo
  if [ -n "$URL" ]; then
    curl -sS -o "$OUT/$ID.png" --max-time 120 "$URL"
    ls -la "$OUT/$ID.png"
  else
    echo "[$ID] ❌ no URL"
  fi
done
