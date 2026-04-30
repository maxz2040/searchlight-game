#!/usr/bin/env bash
# Explicit-placement compositing — pre-name 13 positions and 13 characters
# from the 8-character library so the model has no degree of freedom to
# duplicate. Pass scene + 8 character refs. Test on lvl-1 forest first.
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

# 13 explicit positions for L1 forest. Each maps to a specific character
# from the library. Mix is biome-aware (forest has plant/mushroom/rock
# leaning) but every kind is represented at least once.
PROMPT_L1='Use the FIRST reference image as the base forest scene — preserve every tree, path, pond, log, and the painterly twilight palette EXACTLY.

Insert THIRTEEN chibi mascot characters using the OTHER 8 reference images as the character library. Each character below is placed ONCE at the named position. Do not add or duplicate characters beyond this list:

1. lower-left, sitting on the path stones — leaf-pup (the green leaf-puppy from reference image 2).
2. just left of centre, peeking from behind a mossy log — shroom-buddy (the purple mushroom from reference 7).
3. centre-foreground, sitting at the pond edge — aqua-spark (the blue water-droplet from reference 4).
4. centre-right, lily pad in the pond — puff-bird (the pink fluffy bird from reference 6).
5. far right, perched on a low rock — pebble-pal (the grey moss-rock from reference 8).
6. upper-left, half-hidden behind a tree trunk — flame-cub (the orange flame fox from reference 3).
7. upper-centre-left, in tall grass — leaf-pup (a SECOND leaf-pup, sitting differently).
8. upper-centre, peeking out of a mushroom cluster — shroom-buddy (a SECOND shroom-buddy).
9. upper-right, sitting on a stone — bolt-bunny (the yellow lightning bunny from reference 5).
10. mid-right edge, between two logs — star-fish (the yellow star from reference 9).
11. lower-right, near a fern — pebble-pal (a SECOND pebble-pal).
12. lower-centre, on the path — puff-bird (a SECOND puff-bird).
13. far-left mid-height, climbing a root — leaf-pup (a THIRD leaf-pup).

Each character is SMALL — no larger than 7% of scene height. Match the painterly atmospheric twilight lighting EXACTLY. Characters are painted INTO the scene, not pasted on top. NO text, NO logos, NO additional creatures beyond these 13. 16:9.'

curl -sS -D /tmp/c13e-init -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"c13e","version":"0"}}}' --max-time 30 -o /dev/null
SID=$( (grep -i 'mcp-session-id:' /tmp/c13e-init || true) | awk '{print $2}' | tr -d '\r\n')
SID_HEADER=""; [ -n "$SID" ] && SID_HEADER="-H Mcp-Session-Id:$SID"

upload_one() {
  local FILE="$1"
  local FN
  FN=$(basename "$FILE")
  local RESP
  RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
    -d "$(jq -nc --arg fn "$FN" '{jsonrpc:"2.0",id:2,method:"tools/call",params:{name:"media_upload",arguments:{method:"upload_url",filename:$fn,type:"image"}}}')" --max-time 30)
  local MID URL
  MID=$(echo "$RESP" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  URL=$(echo "$RESP" | grep -oE "'https?://[^']+'" | head -1 | tr -d "'")
  curl -sS -X PUT --max-time 90 -H "Content-Type: image/png" --data-binary "@$FILE" "$URL" >/dev/null
  curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
    -d "$(jq -nc --arg id "$MID" '{jsonrpc:"2.0",id:3,method:"tools/call",params:{name:"media_confirm",arguments:{type:"image",media_id:$id}}}')" --max-time 20 >/dev/null
  echo "$MID"
}

echo "[L1] uploading 9 refs…"
SCENE_MID=$(upload_one "$ROOT/public/scenes/lvl-1-forest.png")
CHAR_MIDS=()
for C in "${CHARS[@]}"; do CHAR_MIDS+=("$(upload_one "$C")"); done
ALL=("$SCENE_MID" "${CHAR_MIDS[@]}")
MEDIAS=$(printf '%s\n' "${ALL[@]}" | jq -Rs 'split("\n")|map(select(.!="")|{name:"medias",value:.,role:"image"})')

BODY=$(jq -nc --arg p "$PROMPT_L1" --argjson m "$MEDIAS" '{jsonrpc:"2.0",id:4,method:"tools/call",params:{name:"generate_image",arguments:{params:{model:"nano_banana_2",prompt:$p,count:1,aspect_ratio:"16:9",resolution:"4k",medias:$m}}}}')
RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER -d "$BODY" --max-time 90)
JOB=$(echo "$RESP" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
echo "[L1] job=$JOB polling"
URL=""
for i in $(seq 1 60); do
  POLL=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
    -d "$(jq -nc --arg j "$JOB" '{jsonrpc:"2.0",id:5,method:"tools/call",params:{name:"job_status",arguments:{jobId:$j,sync:true}}}')" --max-time 40)
  URL=$(echo "$POLL" | grep -oE 'https?://[^"\\)]+\.(png|jpe?g|webp)' | head -1)
  if [ -n "$URL" ]; then break; fi
  if echo "$POLL" | grep -qiE 'failed|nsfw|cancel|ip_detect'; then echo "FAIL: $(echo "$POLL"|head -c 300)"; URL=""; break; fi
  printf '.'
  sleep 4
done
echo
if [ -n "$URL" ]; then
  curl -sS -o "$OUT/lvl-1-forest-explicit.png" --max-time 120 "$URL"
  ls -la "$OUT/lvl-1-forest-explicit.png"
fi
