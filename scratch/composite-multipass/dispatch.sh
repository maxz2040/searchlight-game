#!/usr/bin/env bash
# Multi-pass single-character compositing for L1 forest.
#
# Strategy: each pass adds ONE specific character to ONE specific region
# of the result image. nano_banana_2 won't reflex-duplicate when there's
# only one character to add — the constraint is binding, not soft.
#
# 13 passes × ~20s = ~5 min. Cost ~10 credits/pass × 13 = ~130 credits.
set -uo pipefail
. ~/.config/searchlight/env
ENDPOINT="https://mcp.higgsfield.ai/mcp"
AUTH="Authorization: Bearer $HIGGSFIELD_TOKEN"
ACCEPT="Accept: application/json, text/event-stream"
CT="Content-Type: application/json"
ROOT="/gt/searchlight/mayor/rig"
OUT="$ROOT/scratch/composite-multipass"
mkdir -p "$OUT"

# Start from the existing single-pass composite (already has detail) and
# layer in additional characters one at a time.
SEED="$ROOT/public/scenes/lvl-1-forest.png"
WORK="$OUT/work-l1.png"
cp "$SEED" "$WORK"

# 13-step character + position program. Each row is "character | placement".
# Mix biased toward biome but every kind appears.
PROGRAM=(
  "leaf-pup|sitting on the path stones in the lower-left foreground"
  "shroom-buddy|peeking from behind a mossy log just left of centre"
  "aqua-spark|sitting at the pond edge, centre-foreground"
  "puff-bird|perched on a lily pad in the centre-right pond"
  "pebble-pal|on a low rock at the far right"
  "flame-cub|half-hidden behind a tree trunk in the upper-left"
  "leaf-pup|in tall grass upper-centre-left, sitting differently from the first"
  "shroom-buddy|peeking from a mushroom cluster upper-centre"
  "bolt-bunny|on a stone in the upper-right"
  "star-fish|wedged between two logs, mid-right edge"
  "pebble-pal|near a fern, lower-right (different pose from the first)"
  "puff-bird|on the path lower-centre (different pose from the first)"
  "leaf-pup|climbing a root, far-left mid-height (third leaf-pup, different pose)"
)

curl -sS -D /tmp/mp-init -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"multipass","version":"0"}}}' --max-time 30 -o /dev/null
SID=$( (grep -i 'mcp-session-id:' /tmp/mp-init || true) | awk '{print $2}' | tr -d '\r\n')
SID_HEADER=""; [ -n "$SID" ] && SID_HEADER="-H Mcp-Session-Id:$SID"

upload_one() {
  local FILE="$1"; local FN; FN=$(basename "$FILE")
  local RESP MID URL
  RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
    -d "$(jq -nc --arg fn "$FN" '{jsonrpc:"2.0",id:2,method:"tools/call",params:{name:"media_upload",arguments:{method:"upload_url",filename:$fn,type:"image"}}}')" --max-time 30)
  MID=$(echo "$RESP" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  URL=$(echo "$RESP" | grep -oE "'https?://[^']+'" | head -1 | tr -d "'")
  curl -sS -X PUT --max-time 90 -H "Content-Type: image/png" --data-binary "@$FILE" "$URL" >/dev/null
  curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
    -d "$(jq -nc --arg id "$MID" '{jsonrpc:"2.0",id:3,method:"tools/call",params:{name:"media_confirm",arguments:{type:"image",media_id:$id}}}')" --max-time 20 >/dev/null
  echo "$MID"
}

PASS=0
for STEP in "${PROGRAM[@]}"; do
  PASS=$((PASS + 1))
  CHAR="${STEP%%|*}"
  PLACE="${STEP##*|}"
  CHAR_PNG="$ROOT/public/creatures/$CHAR.png"
  echo "[pass $PASS/13] $CHAR @ $PLACE"
  WORK_MID=$(upload_one "$WORK")
  CHAR_MID=$(upload_one "$CHAR_PNG")
  MEDIAS=$(jq -nc --arg s "$WORK_MID" --arg c "$CHAR_MID" '[{name:"medias",value:$s,role:"image"},{name:"medias",value:$c,role:"image"}]')
  PROMPT="Use the FIRST reference as the base scene. Preserve EVERY detail of it pixel-for-pixel — every existing tree, path, pond, log, character, and the painterly twilight palette MUST remain unchanged. Add ONE new chibi mascot character — the chibi mascot from the SECOND reference image — into the scene at this location: $PLACE. The added character is SMALL (no larger than 7% of scene height), painted into the scene matching the existing painterly twilight lighting. Do NOT add any other characters. Do NOT modify or duplicate existing characters. Do NOT change anything else in the scene. NO text, NO logos. 16:9."
  BODY=$(jq -nc --arg p "$PROMPT" --argjson m "$MEDIAS" '{jsonrpc:"2.0",id:4,method:"tools/call",params:{name:"generate_image",arguments:{params:{model:"nano_banana_2",prompt:$p,count:1,aspect_ratio:"16:9",resolution:"4k",medias:$m}}}}')
  RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER -d "$BODY" --max-time 90)
  JOB=$(echo "$RESP" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  if [ -z "$JOB" ]; then echo "[pass $PASS] no jobId — skipping"; continue; fi
  URL=""
  for i in $(seq 1 50); do
    POLL=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
      -d "$(jq -nc --arg j "$JOB" '{jsonrpc:"2.0",id:5,method:"tools/call",params:{name:"job_status",arguments:{jobId:$j,sync:true}}}')" --max-time 40)
    URL=$(echo "$POLL" | grep -oE 'https?://[^"\\)]+\.(png|jpe?g|webp)' | head -1)
    if [ -n "$URL" ]; then break; fi
    if echo "$POLL" | grep -qiE 'failed|nsfw|cancel|ip_detect'; then echo "[pass $PASS] FAIL"; URL=""; break; fi
    sleep 4
  done
  if [ -n "$URL" ]; then
    curl -sS -o "$WORK" --max-time 120 "$URL"
    cp "$WORK" "$OUT/pass-$(printf '%02d' $PASS)-$CHAR.png"
    echo "[pass $PASS] ✅"
  fi
done
cp "$WORK" "$OUT/lvl-1-forest-multipass-final.png"
echo "DONE: $OUT/lvl-1-forest-multipass-final.png"
