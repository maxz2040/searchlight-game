export type Category = 
  | 'forest' 
  | 'ocean' 
  | 'sky' 
  | 'night' 
  | 'garden' 
  | 'arctic' 
  | 'jungle' 
  | 'magic' 
  | 'desert' 
  | 'deep-sea';

export type AnimType = 
  | 'bob' 
  | 'wiggle' 
  | 'flutter' 
  | 'spin-slow' 
  | 'pulse' 
  | 'bounce-hop' 
  | 'sway';

export interface RosterEntry {
  id: string;
  name: string;
  category: Category;
  anim: AnimType;
  emoji: string;
  blurb: string;
}

export const ROSTER: RosterEntry[] = [
  // ── Existing (12) ──
  { id: 'bunny', name: 'Bunny', category: 'forest', anim: 'wiggle', emoji: '🐰', blurb: 'Loves to hop in clover.' },
  { id: 'bear-cub', name: 'Bear Cub', category: 'forest', anim: 'bob', emoji: '🐻', blurb: 'Searching for a honey snack.' },
  { id: 'owl', name: 'Owl', category: 'forest', anim: 'bob', emoji: '🦉', blurb: 'Watching from the high branches.' },
  { id: 'frog-pal', name: 'Frog Pal', category: 'garden', anim: 'bounce-hop', emoji: '🐸', blurb: 'A happy jumper in ponds.' },
  { id: 'bee-buzz', name: 'Bee Buzz', category: 'garden', anim: 'flutter', emoji: '🐝', blurb: 'Collecting nectar from bright flowers.' },
  { id: 'kitty', name: 'Kitty', category: 'forest', anim: 'wiggle', emoji: '🐱', blurb: 'Chasing shadows in the grass.' },
  { id: 'turtle-shell', name: 'Turtle Shell', category: 'ocean', anim: 'bob', emoji: '🐢', blurb: 'Slow and steady wins races.' },
  { id: 'star-pal', name: 'Star Pal', category: 'night', anim: 'spin-slow', emoji: '⭐', blurb: 'Shining bright in the sky.' },
  { id: 'moon-kid', name: 'Moon Kid', category: 'night', anim: 'pulse', emoji: '🌙', blurb: 'Glowing softly in the dark.' },
  { id: 'fox-pup', name: 'Fox Pup', category: 'forest', anim: 'wiggle', emoji: '🦊', blurb: 'Clever friend of the woods.' },
  { id: 'penguin-pal', name: 'Penguin Pal', category: 'arctic', anim: 'bounce-hop', emoji: '🐧', blurb: 'Waddling across the icy snow.' },
  { id: 'duck-bill', name: 'Duck Bill', category: 'garden', anim: 'bob', emoji: '🦆', blurb: 'Splashing in the cool water.' },

  // ── Batch A (29) ──
  { id: 'deer-dot', name: 'Deer Dot', category: 'forest', anim: 'bob', emoji: '🦌', blurb: 'A gentle friend with spots.' },
  { id: 'hedgehog-roll', name: 'Hedgehog Roll', category: 'forest', anim: 'bounce-hop', emoji: '🦔', blurb: 'Curls up into a ball.' },
  { id: 'squirrel-nut', name: 'Squirrel Nut', category: 'forest', anim: 'wiggle', emoji: '🐿️', blurb: 'Always looking for more nuts.' },
  { id: 'raccoon-mask', name: 'Raccoon Mask', category: 'forest', anim: 'wiggle', emoji: '🦝', blurb: 'A clever nocturnal forest bandit.' },
  { id: 'chipmunk-cheek', name: 'Chipmunk Cheek', category: 'forest', anim: 'wiggle', emoji: '🐿️', blurb: 'Cheeks full of tasty seeds.' },
  { id: 'hamster-round', name: 'Hamster Round', category: 'garden', anim: 'bob', emoji: '🐹', blurb: 'Likes to run in wheels.' },
  { id: 'fish-fin', name: 'Fish Fin', category: 'ocean', anim: 'bob', emoji: '🐟', blurb: 'Gliding through the blue waves.' },
  { id: 'crab-snap', name: 'Crab Snap', category: 'ocean', anim: 'bounce-hop', emoji: '🦀', blurb: 'Walking sideways on the sand.' },
  { id: 'octopus-pal', name: 'Octopus Pal', category: 'ocean', anim: 'sway', emoji: '🐙', blurb: 'Eight arms for many hugs.' },
  { id: 'seahorse-curl', name: 'Seahorse Curl', category: 'ocean', anim: 'sway', emoji: '🎠', blurb: 'A tiny horse of sea.' },
  { id: 'jellyfish-glow', name: 'Jellyfish Glow', category: 'deep-sea', anim: 'pulse', emoji: '🪼', blurb: 'Drifting with a soft light.' },
  { id: 'dolphin-flip', name: 'Dolphin Flip', category: 'ocean', anim: 'bob', emoji: '🐬', blurb: 'Jumping high above the waves.' },
  { id: 'clownfish', name: 'Clownfish', category: 'ocean', anim: 'sway', emoji: '🐠', blurb: 'Hiding in the wavy anemones.' },
  { id: 'narwhal-horn', name: 'Narwhal Horn', category: 'arctic', anim: 'sway', emoji: '🦄', blurb: 'The unicorn of the sea.' },
  { id: 'sea-turtle-jr', name: 'Sea Turtle Jr', category: 'ocean', anim: 'bob', emoji: '🐢', blurb: 'Swimming towards the open ocean.' },
  { id: 'lobster-red', name: 'Lobster Red', category: 'ocean', anim: 'bounce-hop', emoji: '🦞', blurb: 'Living among the rocky reefs.' },
  { id: 'cloud-puff', name: 'Cloud Puff', category: 'sky', anim: 'bounce-hop', emoji: '☁️', blurb: 'Soft and fluffy in sky.' },
  { id: 'bat-wing', name: 'Bat Wing', category: 'night', anim: 'flutter', emoji: '🦇', blurb: 'Flying through the night air.' },
  { id: 'butterfly-blue', name: 'Butterfly Blue', category: 'garden', anim: 'flutter', emoji: '🦋', blurb: 'Graceful wings in the sun.' },
  { id: 'dragonfly-zip', name: 'Dragonfly Zip', category: 'garden', anim: 'flutter', emoji: '🐝', blurb: 'Fastest flyer in the garden.' },
  { id: 'parrot-red', name: 'Parrot Red', category: 'jungle', anim: 'flutter', emoji: '🦜', blurb: 'A colorful talker of trees.' },
  { id: 'hummingbird', name: 'Hummingbird', category: 'garden', anim: 'flutter', emoji: '🐦', blurb: 'Tiny wings that move fast.' },
  { id: 'flamingo-pink', name: 'Flamingo Pink', category: 'ocean', anim: 'flutter', emoji: '🦩', blurb: 'Standing tall on one leg.' },
  { id: 'toucan-beak', name: 'Toucan Beak', category: 'jungle', anim: 'flutter', emoji: '🐧', blurb: 'Big beak for eating fruit.' },
  { id: 'eagle-soar', name: 'Eagle Soar', category: 'sky', anim: 'flutter', emoji: '🦅', blurb: 'Majestic king of the heights.' },
  { id: 'firefly-glow', name: 'Firefly Glow', category: 'night', anim: 'flutter', emoji: '🪰', blurb: 'Lighting up the summer grass.' },
  { id: 'comet-kid', name: 'Comet Kid', category: 'night', anim: 'bounce-hop', emoji: '☄️', blurb: 'Streaking across the dark sky.' },
  { id: 'ufo-pal', name: 'UFO Pal', category: 'night', anim: 'spin-slow', emoji: '🛸', blurb: 'A visitor from far away.' },
  { id: 'rocket-red', name: 'Rocket Red', category: 'sky', anim: 'bounce-hop', emoji: '🚀', blurb: 'Blasting off to the stars.' },

  // ── Batch B (29) ──
  { id: 'planet-ring', name: 'Planet Ring', category: 'night', anim: 'spin-slow', emoji: '🪐', blurb: 'Spinning slowly in outer space.' },
  { id: 'astro-bear', name: 'Astro Bear', category: 'night', anim: 'pulse', emoji: '🐻‍❄️', blurb: 'Floating in a cosmic suit.' },
  { id: 'luna-cat', name: 'Luna Cat', category: 'night', anim: 'pulse', emoji: '🐈‍⬛', blurb: 'Guardian of the moonbeams.' },
  { id: 'star-scout', name: 'Star Scout', category: 'night', anim: 'spin-slow', emoji: '🔭', blurb: 'Looking for new constellations.' },
  { id: 'nebula-pup', name: 'Nebula Pup', category: 'night', anim: 'pulse', emoji: '🐶', blurb: 'Made of stardust and clouds.' },
  { id: 'ladybug-spot', name: 'Ladybug Spot', category: 'garden', anim: 'wiggle', emoji: '🐞', blurb: 'Counting spots on red wings.' },
  { id: 'caterpillar-green', name: 'Caterpillar Green', category: 'garden', anim: 'wiggle', emoji: '🐛', blurb: 'Munching on a green leaf.' },
  { id: 'snail-trail', name: 'Snail Trail', category: 'garden', anim: 'wiggle', emoji: '🐌', blurb: 'Taking a very slow walk.' },
  { id: 'mushroom-cap', name: 'Mushroom Cap', category: 'forest', anim: 'bounce-hop', emoji: '🍄', blurb: 'Sprouting after a rainy day.' },
  { id: 'sunflower-face', name: 'Sunflower Face', category: 'garden', anim: 'bounce-hop', emoji: '🌻', blurb: 'Always turning toward the sun.' },
  { id: 'acorn-buddy', name: 'Acorn Buddy', category: 'forest', anim: 'bounce-hop', emoji: '🌰', blurb: 'Waiting to be an oak.' },
  { id: 'dewdrop-fairy', name: 'Dewdrop Fairy', category: 'garden', anim: 'pulse', emoji: '🧚', blurb: 'Sparkling on the morning grass.' },
  { id: 'daisy-bud', name: 'Daisy Bud', category: 'garden', anim: 'bounce-hop', emoji: '🌼', blurb: 'A fresh flower in meadow.' },
  { id: 'polar-pup', name: 'Polar Pup', category: 'arctic', anim: 'bob', emoji: '🐶', blurb: 'Fluffy white friend of snow.' },
  { id: 'snow-fox', name: 'Snow Fox', category: 'arctic', anim: 'sway', emoji: '🦊', blurb: 'Blending in with the drifts.' },
  { id: 'walrus-pal', name: 'Walrus Pal', category: 'arctic', anim: 'bob', emoji: '🦭', blurb: 'Relaxing on the floating ice.' },
  { id: 'seal-pup', name: 'Seal Pup', category: 'arctic', anim: 'bob', emoji: '🦭', blurb: 'Splashing in the freezing water.' },
  { id: 'snowflake-kid', name: 'Snowflake Kid', category: 'arctic', anim: 'spin-slow', emoji: '❄️', blurb: 'Unique and cold and bright.' },
  { id: 'ice-bear', name: 'Ice Bear', category: 'arctic', anim: 'sway', emoji: '🐻‍❄️', blurb: 'Strong walker of the north.' },
  { id: 'husky-pup', name: 'Husky Pup', category: 'arctic', anim: 'bounce-hop', emoji: '🐕', blurb: 'Ready to pull the sled.' },
  { id: 'yeti-small', name: 'Yeti Small', category: 'arctic', anim: 'sway', emoji: '🧊', blurb: 'A friendly legend of snow.' },
  { id: 'arctic-hare', name: 'Arctic Hare', category: 'arctic', anim: 'bounce-hop', emoji: '🐇', blurb: 'Fast jumper of the tundra.' },
  { id: 'penguin-baby', name: 'Penguin Baby', category: 'arctic', anim: 'bounce-hop', emoji: '🐧', blurb: 'A fuzzy chick on ice.' },
  { id: 'monkey-swing', name: 'Monkey Swing', category: 'jungle', anim: 'wiggle', emoji: '🐒', blurb: 'Hanging from the jungle vines.' },
  { id: 'tiger-cub', name: 'Tiger Cub', category: 'jungle', anim: 'wiggle', emoji: '🐯', blurb: 'Playful stripes in the tall grass.' },
  { id: 'elephant-baby', name: 'Elephant Baby', category: 'jungle', anim: 'bob', emoji: '🐘', blurb: 'Using a trunk to splash.' },
  { id: 'giraffe-spot', name: 'Giraffe Spot', category: 'jungle', anim: 'wiggle', emoji: '🦒', blurb: 'Reaching for the highest leaves.' },
  { id: 'hippo-round', name: 'Hippo Round', category: 'jungle', anim: 'bob', emoji: '🦛', blurb: 'Loves a cool mud bath.' },
  { id: 'chameleon-shift', name: 'Chameleon Shift', category: 'jungle', anim: 'wiggle', emoji: '🦎', blurb: 'Changing colors to match leaves.' },
  { id: 'sloth-hang', name: 'Sloth Hang', category: 'jungle', anim: 'bob', emoji: '🦥', blurb: 'Taking a very long nap.' },
  { id: 'zebra-stripe', name: 'Zebra Stripe', category: 'jungle', anim: 'wiggle', emoji: '🦓', blurb: 'Running with the wild herd.' },

  // ── Batch C (30) ──
  { id: 'parrot-green', name: 'Parrot Green', category: 'jungle', anim: 'flutter', emoji: '🦜', blurb: 'A bright bird of paradise.' },
  { id: 'crocodile-smile', name: 'Crocodile Smile', category: 'jungle', anim: 'wiggle', emoji: '🐊', blurb: 'Waiting by the river bank.' },
  { id: 'unicorn-spark', name: 'Unicorn Spark', category: 'magic', anim: 'sway', emoji: '🦄', blurb: 'A magical horse with horn.' },
  { id: 'dragon-pup', name: 'Dragon Pup', category: 'magic', anim: 'sway', emoji: '🐲', blurb: 'Small wings and warm breath.' },
  { id: 'pixie-wing', name: 'Pixie Wing', category: 'magic', anim: 'flutter', emoji: '🧚', blurb: 'Flitting through enchanted flower bells.' },
  { id: 'crystal-blue', name: 'Crystal Blue', category: 'magic', anim: 'pulse', emoji: '💎', blurb: 'Glimmering with a magic light.' },
  { id: 'rainbow-pal', name: 'Rainbow Pal', category: 'magic', anim: 'spin-slow', emoji: '🌈', blurb: 'Bringing color to the sky.' },
  { id: 'sparkle-deer', name: 'Sparkle Deer', category: 'magic', anim: 'sway', emoji: '🦌', blurb: 'Leaves a trail of stardust.' },
  { id: 'wishing-star', name: 'Wishing Star', category: 'magic', anim: 'spin-slow', emoji: '🌟', blurb: 'Granting wishes from above sky.' },
  { id: 'magic-cat', name: 'Magic Cat', category: 'magic', anim: 'pulse', emoji: '🐱', blurb: 'Knows all the secret spells.' },
  { id: 'phoenix-chick', name: 'Phoenix Chick', category: 'magic', anim: 'flutter', emoji: '🐦', blurb: 'Rising with a warm glow.' },
  { id: 'fairy-bud', name: 'Fairy Bud', category: 'magic', anim: 'flutter', emoji: '🌸', blurb: 'Waking up the sleeping flowers.' },
  { id: 'cactus-kid', name: 'Cactus Kid', category: 'desert', anim: 'sway', emoji: '🌵', blurb: 'Strong and prickly desert friend.' },
  { id: 'camel-hump', name: 'Camel Hump', category: 'desert', anim: 'bob', emoji: '🐪', blurb: 'Walking across the sandy dunes.' },
  { id: 'lizard-sun', name: 'Lizard Sun', category: 'desert', anim: 'sway', emoji: '🦎', blurb: 'Basking on a warm rock.' },
  { id: 'sand-fox', name: 'Sand Fox', category: 'desert', anim: 'wiggle', emoji: '🦊', blurb: 'Large ears for desert listening.' },
  { id: 'meerkat-pop', name: 'Meerkat Pop', category: 'desert', anim: 'bounce-hop', emoji: '🦒', blurb: 'Standing tall to see far.' },
  { id: 'gecko-green', name: 'Gecko Green', category: 'desert', anim: 'bounce-hop', emoji: '🦎', blurb: 'Can walk on any surface.' },
  { id: 'sand-cat', name: 'Sand Cat', category: 'desert', anim: 'wiggle', emoji: '🐈', blurb: 'A small hunter of dunes.' },
  { id: 'armadillo-roll', name: 'Armadillo Roll', category: 'desert', anim: 'bounce-hop', emoji: '🛡️', blurb: 'Strong armor for desert life.' },
  { id: 'anglerfish-glow', name: 'Anglerfish Glow', category: 'deep-sea', anim: 'pulse', emoji: '🐟', blurb: 'A light in the darkness.' },
  { id: 'puffer-fish', name: 'Puffer Fish', category: 'ocean', anim: 'bounce-hop', emoji: '🐡', blurb: 'Round and prickly when surprised.' },
  { id: 'manta-ray', name: 'Manta Ray', category: 'ocean', anim: 'sway', emoji: '🐟', blurb: 'Flying through the deep ocean.' },
  { id: 'squid-ink', name: 'Squid Ink', category: 'deep-sea', anim: 'sway', emoji: '🦑', blurb: 'Jetting through the dark water.' },
  { id: 'sea-dragon', name: 'Sea Dragon', category: 'ocean', anim: 'sway', emoji: '🐉', blurb: 'Looks just like the seaweed.' },
  { id: 'coral-fish', name: 'Coral Fish', category: 'ocean', anim: 'sway', emoji: '🐠', blurb: 'Living in the colorful reef.' },
  { id: 'whale-calf', name: 'Whale Calf', category: 'ocean', anim: 'bob', emoji: '🐋', blurb: 'A giant friend of ocean.' },
  { id: 'mercat', name: 'Mercat', category: 'ocean', anim: 'pulse', emoji: '🧜', blurb: 'Part cat and part fish.' },
  { id: 'cloud-castle', name: 'Cloud Castle', category: 'sky', anim: 'bounce-hop', emoji: '🏰', blurb: 'Where the sky friends live.' },
  { id: 'candy-bear', name: 'Candy Bear', category: 'magic', anim: 'bounce-hop', emoji: '🧸', blurb: 'Sweet and soft and colorful.' },
  { id: 'lemon-pup', name: 'Lemon Pup', category: 'magic', anim: 'bounce-hop', emoji: '🐶', blurb: 'Zesty and happy yellow friend.' },
];

export type CreatureKind = (typeof ROSTER[number])['id'];
