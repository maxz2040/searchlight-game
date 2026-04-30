#!/usr/bin/env bash
# Generate the remaining character sheets via gpt_image_2 (with nano_banana_2
# fallback). Bash/curl-based because node-fetch ETIMEDOUTs from this host.
# Idempotent: skips any character whose sheet already exists.
set -uo pipefail
. ~/.config/searchlight/env

ENDPOINT="https://mcp.higgsfield.ai/mcp"
AUTH="Authorization: Bearer $HIGGSFIELD_TOKEN"
ACCEPT="Accept: application/json, text/event-stream"
CT="Content-Type: application/json"
ROOT="/gt/searchlight/mayor/rig"
OUT="$ROOT/public/character-sheets"
mkdir -p "$OUT"

STYLE='cute chibi mascot toy character in friendly pop-anime / digimon-inspired cartoon style, big expressive eyes, round chubby body, bright saturated palette, clean cel shading with flat shadow shapes, confident line-work, branding-free original character (NOT Pokémon, NOT any famous franchise)'

declare -A SUBJECTS=(
  [leaf-pup]="Leafu — a small leaf-themed puppy mascot, soft mint-green fur with darker green leaf-shaped ears and a tiny leaf curl on top of its head, smiling friendly face, dainty paws."
  [flame-cub]="Emberi — a tiny orange-and-red flame cub mascot, fluffy fur shaped like gentle flame tufts on the head and tail, warm honey-amber eyes, friendly grin."
  [aqua-spark]="Splashu — a cheerful blue water-droplet mascot creature, smooth glossy teardrop body, two little fin-arms, big sparkling eyes like reflective bubbles."
  [bolt-bunny]="Zappo — a bright yellow chibi bunny mascot with long curled lightning-bolt-shaped ears, soft fur, pink cheeks, tiny zigzag tail (designed to be visually distinct from any famous franchise — long curled ears, different body proportions)."
  [puff-bird]="Puffi — a pink fluffy round-bodied baby bird mascot, soft cotton-candy plush look, tiny orange beak, round inquisitive eyes, two small wing nubs."
  [shroom-buddy]="Shroomi — a purple mushroom mascot character with a round dome cap dotted with white spots, a cute round body underneath the cap, two stubby legs."
  [pebble-pal]="Roxxo — a smooth grey-stone pebble mascot, soft round rock body with a friendly cartoon face carved into it, two tiny stone arms, moss patches on top of its head."
  [star-fish]="Twinkli — a bright yellow five-pointed star mascot character with a soft glow around its edges, cheerful happy face on the front centre, tiny arms and legs."
  [ivy-cat]="Ivy — a small mossy-green vine cat mascot, leafy curling vines as ears and tail, soft fur, tiny pink flower petal nose."
  [petal-mouse]="Petalle — a tiny pink rose-petal mouse mascot, body covered in overlapping pink petals, big black bead eyes, small white paws."
  [acorn-pup]="Acorny — a round brown acorn-shelled puppy mascot, smooth dome cap on head like an acorn lid, fluffy tan body underneath, droopy soft ears."
  [fern-fox]="Ferno — a small forest-green fox mascot with a long fluffy fern-frond tail, leafy fur tufts behind the ears, bright golden eyes."
  [sprout-sloth]="Sprouty — a pale-mint sleepy sloth mascot with a small green sprout growing from the top of its head, eyes half-closed in a peaceful smile."
  [ember-snake]="Emberlin — a tiny coiled red-and-orange snake mascot, smooth scales fading to flame tones, gentle lidded eyes, a small forked tongue with a tiny flame tip."
  [magma-mole]="Magmu — a round molten-orange burrower mascot, soft warm-glowing fur, tiny stubby digger paws, glowing yellow eyes."
  [cinder-cat]="Cindra — a cute orange tabby cat mascot with smoke-puff ear tufts, soot smudges on its cheeks, golden glowing eyes, smouldering tail tip."
  [spark-spider]="Sparkit — a small ruby-red round spider mascot with eight short stubby legs, tiny glowing crackle pattern on its back like little sparks, four big eyes."
  [lava-larva]="Larvy — a short golden-yellow caterpillar mascot, segmented body with warm glowing seams between each segment, tiny stubby legs, antennae."
  [wave-otter]="Otta — a small cyan-blue otter mascot with a curled wave-shaped tail, sleek fur, big black bead eyes, clutching a tiny clamshell."
  [mist-jelly]="Misty — a translucent pale-blue jellyfish mascot, dome-shaped soft body, dangling little ribbon tentacles, gentle sparkle eyes."
  [coral-crab]="Crabbi — a tiny bright-pink coral crab mascot, two cute claws raised, shell patterned with coral textures, four little legs."
  [dewdrop-frog]="Dewy — a small mint-green frog mascot peeking out from under a clear glassy dewdrop dome, big round eyes, soft cream belly, tiny webbed feet."
  [tide-shell]="Spiri — a small lavender spiral-shell snail mascot, soft purple body emerging from the shell, two long curling antennae, big sleepy smile."
  [cloud-sheep]="Cumbie — a small fluffy white cloud sheep mascot, body shaped like a soft cumulus cloud, tiny grey hooves, big pale-blue eyes."
  [breeze-bird]="Breezi — a small pastel-yellow songbird mascot, round body, tiny orange beak, soft fanned tail feathers, eyes closed in song."
  [kite-butterfly]="Kytia — a chibi butterfly mascot with kite-shaped multicoloured wings (pastel pinks, oranges, blues), tiny round body, sparkling eyes."
  [zephyr-deer]="Zephie — a small pale-blue fawn mascot with curling wind-swirl markings on its flanks, tiny stubby legs, gentle smile."
  [dandelion-puff]="Pluffy — a small fluffy seed-puff creature mascot, body is a giant white dandelion-clock dome, tiny green stem-legs, cheerful smiling face peeking out."
  [moss-turtle]="Mosso — a small dark-green turtle mascot with a moss-and-flowers shell, friendly squint-eyed smile, soft tan limbs and head."
  [crystal-cub]="Quartzu — a round purple-grey bear cub mascot with a translucent crystal cluster growing on its back like a small geode, big sparkling violet eyes."
  [quartz-quail]="Quaila — a round pale-grey quail mascot with quartz-crystal-shaped tufts on its head, sparkly cream chest feathers, tiny stubby legs."
  [boulder-bear]="Bouldi — a small grey-brown stone bear cub mascot with rounded smooth boulder-shaped body, tiny rocky paws, friendly squinted eyes."
  [clay-mole]="Clayi — a chubby terracotta-orange mole mascot, soft round body, tiny digger claws, tiny hard hat made of a leaf, big smile."
  [comet-cat]="Cometi — a pale-yellow chibi cat mascot with a long shimmering star-comet tail trailing sparkles, big curious eyes, tiny pink nose."
  [moonbeam-bunny]="Lunelle — a silver-grey bunny mascot with crescent-moon-shaped ears, soft glowing pale-blue fur tips, big tranquil eyes."
  [nova-newt]="Nova — a small electric-blue newt mascot with bioluminescent dotted markings along its back, gentle pink belly, big innocent eyes."
  [sparklepup]="Sparx — a round honey-gold puppy mascot with sparkles in its fur, soft floppy ears, tiny black bead eyes, pink tongue out in a cheerful grin."
  [dawn-deer]="Dawnie — a small rose-pink fawn mascot with golden sunrise highlights on its back, tiny stubby legs, gentle smile, big dark eyes."
  [shadow-pup]="Shadou — a small rounded indigo-purple ghost-puppy mascot, semi-translucent at the edges, big glowing pale-violet eyes, tiny smiling fangs."
  [dusk-cat]="Duski — a soft dark-indigo cat mascot with star-pattern fur, fluffy plump body, half-closed tranquil yellow eyes, long swishing tail."
  [wisp-bat]="Wispy — a tiny pastel-purple round bat mascot, two cute wing nubs spread, big round bright pink eyes, tiny fangs in a friendly grin."
  [inkblot-octopus]="Inko — a small inky-black round octopus mascot with eight stubby curling tentacles, big bright friendly eyes, a tiny pink heart on its forehead."
  [ruby-rat]="Rubelle — a small ruby-red gem rat mascot with shimmering faceted-crystal fur patterns, tiny pink ears, big sparkling black eyes."
  [emerald-eel]="Emi — a small emerald-green chibi eel mascot, smooth slick body in a wavy curl, tiny round face with cheerful big eyes, two tiny fin-arms."
  [sapphire-snail]="Saphira — a small bright-blue snail mascot, glittering sapphire-blue spiral shell on its back, soft cream body, two tall curling antennae."
  [spore-puff]="Sporo — a round pure-white mushroom puffball mascot, tiny stubby legs, big sleepy lidded eyes, soft fluffy spores drifting around it."
  [toadstool-buddy]="Toady — a small classic red mushroom mascot with white spots on the cap, plump cream body underneath the cap, tiny stubby legs."
  [fungi-fox]="Fungo — a small orange fox mascot with a mushroom-cap-shaped patch on its head, soft fluffy tail, big golden eyes."
  [honey-bear]="Honi — a round golden-yellow bear cub mascot, soft fluffy fur, sticky honey drips on its paws, half-closed blissful eyes."
  [cocoa-pup]="Cocoa — a round chocolate-brown puppy mascot, soft glossy fur, big honey-amber eyes, tiny floppy ears, pink tongue out in a cheerful smile."
)

# Build the verbatim character-sheet template prompt.
sheet_prompt() {
  local subject="$1"
  cat <<EOF
Create a single unified MASTER CHARACTER REFERENCE SHEET from these inputs:

[STYLE]: $STYLE
[SUBJECT_DESCRIPTION]: $subject

Create the board in a 4:3 horizontal layout. The board layout, background, typography and spacing must be clean, neutral, minimal and technical, on a pure white or clean off-white background. Use clear section titles, readable English labels, balanced spacing, no clutter, no watermark, no logo. Apply [STYLE] only to the character and visual elements, not to the board layout or UI. All text must be clearly readable at normal viewing size. Avoid tiny or dense text.

Infer all missing details from the subject description, including name, alias if suitable, role, age, personality, core theme, accent, wardrobe details, accessories, key prop if clearly relevant, visual notes and a fitting color palette.

Use this layout:
top row = left: title + horizontal info block, right: COLOR PALETTE
center = large MAIN IDENTITY + SCALE SHEET as the biggest section
right = EXPRESSION PROGRESSION + HEAD DETAIL SHEET + NEUTRAL BASELINE + POSTURE VARIATION + CLOSE-UP POSE
bottom = WARDROBE / ACCESSORIES DETAILS + PROP + HAND GESTURES

Include: Title CHARACTER REFERENCE SHEET. TOP INFO BLOCK (Name, Alias, Role, Age, Personality, Core Theme, Speech Accent). 6-8 swatch COLOR PALETTE top-right. MAIN IDENTITY + SCALE SHEET dominant center with Front, 3/4, Side, Back over height-marked guide lines + small SILHOUETTE GUIDE (Neutral, Profile). EXPRESSION PROGRESSION (8: Neutral, Curious, Worried, Surprised, Afraid, Sad, Determined, Relieved). MICRO EXPRESSIONS (5: subtle eye tension, slight smirk, lip tension, micro fear, controlled breath). HEAD DETAIL SHEET (3/4, side, top, low, diagonal). NEUTRAL BASELINE 1 panel. POSTURE VARIATION (relaxed, tense, confident). 1 CLOSE-UP POSE chest-up. WARDROBE/ACCESSORIES 4 callouts. PROP if relevant (Object Name, Type, Traits). HAND/PAW GESTURES (relaxed, tense, pointing, gripping, near-face).

Keep the subject fully consistent across all panels. The MAIN IDENTITY + SCALE SHEET must visually dominate the board. Premium production visual bible / character continuity sheet matching the selected [STYLE].
EOF
}

# MCP init.
curl -sS -D /tmp/sheets-init -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"sheets-bash","version":"0"}}}' --max-time 30 -o /dev/null
SID=$( (grep -i 'mcp-session-id:' /tmp/sheets-init || true) | awk '{print $2}' | tr -d '\r\n')
SID_HEADER=""; [ -n "$SID" ] && SID_HEADER="-H Mcp-Session-Id:$SID"

dispatch_one() {
  local CHAR="$1"; local MODEL="$2"
  local PROMPT
  PROMPT=$(sheet_prompt "${SUBJECTS[$CHAR]}")
  local PARAMS
  if [ "$MODEL" = "gpt_image_2" ]; then
    PARAMS='"resolution":"2k","quality":"high"'
  else
    PARAMS='"resolution":"4k"'
  fi
  local BODY
  BODY=$(jq -nc --arg p "$PROMPT" --arg m "$MODEL" --argjson params "{$PARAMS}" '{jsonrpc:"2.0",id:2,method:"tools/call",params:{name:"generate_image",arguments:{params:({model:$m,prompt:$p,count:1,aspect_ratio:"4:3"} + $params)}}}')
  local RESP
  RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER -d "$BODY" --max-time 90)
  echo "$RESP" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1
}

poll_one() {
  local JOB="$1"; local OUTFILE="$2"
  for i in $(seq 1 80); do
    local RESP
    RESP=$(curl -sS -X POST "$ENDPOINT" -H "$AUTH" -H "$CT" -H "$ACCEPT" $SID_HEADER \
      -d "$(jq -nc --arg j "$JOB" '{jsonrpc:"2.0",id:5,method:"tools/call",params:{name:"job_status",arguments:{jobId:$j,sync:true}}}')" --max-time 40)
    local URL
    URL=$(echo "$RESP" | grep -oE 'https?://[^"\\)]+\.(png|jpe?g|webp)' | head -1)
    if [ -n "$URL" ]; then
      curl -sS -o "$OUTFILE" --max-time 120 "$URL"
      return 0
    fi
    if echo "$RESP" | grep -qiE 'failed|nsfw|cancel|ip_detect'; then return 1; fi
    sleep 5
  done
  return 1
}

ORDER=(
  leaf-pup flame-cub aqua-spark bolt-bunny puff-bird shroom-buddy pebble-pal star-fish
  ivy-cat petal-mouse acorn-pup fern-fox sprout-sloth
  ember-snake magma-mole cinder-cat spark-spider lava-larva
  wave-otter mist-jelly coral-crab dewdrop-frog tide-shell
  cloud-sheep breeze-bird kite-butterfly zephyr-deer dandelion-puff
  moss-turtle crystal-cub quartz-quail boulder-bear clay-mole
  comet-cat moonbeam-bunny nova-newt sparklepup dawn-deer
  shadow-pup dusk-cat wisp-bat inkblot-octopus
  ruby-rat emerald-eel sapphire-snail
  spore-puff toadstool-buddy fungi-fox
  honey-bear cocoa-pup
)

DONE=0; SKIPPED=0; FAILED=()
for CHAR in "${ORDER[@]}"; do
  OUTFILE="$OUT/$CHAR.png"
  if [ -s "$OUTFILE" ]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  echo "[$CHAR] dispatching gpt_image_2…"
  JOB=$(dispatch_one "$CHAR" "gpt_image_2")
  if [ -z "$JOB" ]; then
    echo "[$CHAR] no jobId on gpt — falling back to nano_banana_2"
    JOB=$(dispatch_one "$CHAR" "nano_banana_2")
  fi
  if [ -z "$JOB" ]; then echo "[$CHAR] ❌ both models refused"; FAILED+=("$CHAR"); continue; fi
  if poll_one "$JOB" "$OUTFILE"; then
    DONE=$((DONE + 1))
    echo "[$CHAR] ✅ $(du -h "$OUTFILE" | awk '{print $1}')"
  else
    echo "[$CHAR] gpt poll failed — fallback nano_banana_2"
    JOB=$(dispatch_one "$CHAR" "nano_banana_2")
    if [ -n "$JOB" ] && poll_one "$JOB" "$OUTFILE"; then
      DONE=$((DONE + 1))
      echo "[$CHAR] ✅ via nano_banana_2"
    else
      echo "[$CHAR] ❌"
      FAILED+=("$CHAR")
    fi
  fi
done
echo
echo "Sheets cycle done: $DONE new, $SKIPPED already-existing, ${#FAILED[@]} failed"
[ ${#FAILED[@]} -gt 0 ] && echo "Failed: ${FAILED[*]}"
echo "Total in library: $(ls "$OUT"/*.png 2>/dev/null | wc -l) / 50"
