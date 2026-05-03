/* eslint-disable react-refresh/only-export-components */
import React from 'react';

// Batch C - 30 creatures (71-100)

function ParrotGreen() {
  return (
    <g className="creature-flutter">
      <ellipse cx="50" cy="65" rx="20" ry="25" fill="#4caf50" />
      <ellipse cx="30" cy="60" rx="8" ry="18" fill="#388e3c" transform="rotate(-15 30 60)" />
      <ellipse cx="70" cy="60" rx="8" ry="18" fill="#388e3c" transform="rotate(15 70 60)" />
      <circle cx="50" cy="40" r="20" fill="#4caf50" />
      <circle cx="42" cy="35" r="8" fill="white" />
      <circle cx="58" cy="35" r="8" fill="white" />
      <circle cx="42" cy="35" r="4" fill="#1a1a2e" />
      <circle cx="58" cy="35" r="4" fill="#1a1a2e" />
      <path d="M48 45 L52 45 L50 55 Z" fill="#ffeb3b" />
      <path d="M40 90 L45 85 L55 85 L60 90" fill="none" stroke="#388e3c" strokeWidth="3" />
    </g>
  );
}

function CrocodileSmile() {
  return (
    <g className="creature-wiggle">
      <path d="M20 70 Q50 60 80 70 L80 85 Q50 95 20 85 Z" fill="#2e7d32" />
      <circle cx="40" cy="65" r="10" fill="#2e7d32" />
      <circle cx="60" cy="65" r="10" fill="#2e7d32" />
      <circle cx="40" cy="65" r="6" fill="white" />
      <circle cx="60" cy="65" r="6" fill="white" />
      <circle cx="40" cy="65" r="3" fill="#1a1a2e" />
      <circle cx="60" cy="65" r="3" fill="#1a1a2e" />
      <path d="M25 78 L75 78" stroke="#1b5e20" strokeWidth="2" />
      <path d="M30 78 L35 82 M45 78 L50 82 M60 78 L65 82" stroke="white" strokeWidth="1.5" />
    </g>
  );
}

function UnicornSpark() {
  return (
    <g className="creature-sway">
      <circle cx="50" cy="60" r="25" fill="#f3e5f5" />
      <circle cx="50" cy="40" r="20" fill="#f3e5f5" />
      <path d="M50 20 L45 5 L55 5 Z" fill="#ffd54f" />
      <circle cx="42" cy="38" r="3" fill="#1a1a2e" />
      <circle cx="58" cy="38" r="3" fill="#1a1a2e" />
      <path d="M40 15 Q30 25 35 45" fill="none" stroke="#ce93d8" strokeWidth="4" />
      <circle cx="20" cy="20" r="2" fill="#ffd54f" />
      <circle cx="80" cy="30" r="2" fill="#ffd54f" />
    </g>
  );
}

function DragonPup() {
  return (
    <g className="creature-sway">
      <ellipse cx="50" cy="70" rx="25" ry="20" fill="#81c784" />
      <circle cx="50" cy="45" r="22" fill="#81c784" />
      <path d="M35 25 L30 15 L40 20 Z" fill="#2e7d32" />
      <path d="M65 25 L70 15 L60 20 Z" fill="#2e7d32" />
      <circle cx="40" cy="42" r="4" fill="#1a1a2e" />
      <circle cx="60" cy="42" r="4" fill="#1a1a2e" />
      <circle cx="42" cy="40" r="1.5" fill="white" />
      <circle cx="62" cy="40" r="1.5" fill="white" />
      <path d="M30 60 Q20 50 10 70" fill="none" stroke="#2e7d32" strokeWidth="4" />
      <path d="M70 60 Q80 50 90 70" fill="none" stroke="#2e7d32" strokeWidth="4" />
    </g>
  );
}

function PixieWing() {
  return (
    <g className="creature-flutter">
      <ellipse cx="30" cy="40" rx="15" ry="25" fill="#f48fb1" opacity="0.6" />
      <ellipse cx="70" cy="40" rx="15" ry="25" fill="#f48fb1" opacity="0.6" />
      <circle cx="50" cy="50" r="15" fill="#fce4ec" />
      <circle cx="45" cy="48" r="2" fill="#1a1a2e" />
      <circle cx="55" cy="48" r="2" fill="#1a1a2e" />
      <path d="M45 55 Q50 58 55 55" fill="none" stroke="#f06292" strokeWidth="1" />
      <circle cx="50" cy="30" r="12" fill="#f06292" opacity="0.8" />
    </g>
  );
}

function CrystalBlue() {
  return (
    <g className="creature-pulse">
      <polygon points="50,10 80,40 50,90 20,40" fill="#4fc3f7" />
      <polygon points="50,10 65,40 50,90 35,40" fill="#81d4fa" />
      <circle cx="45" cy="40" r="2" fill="white" />
      <circle cx="55" cy="40" r="2" fill="white" />
      <path d="M47 45 Q50 48 53 45" fill="none" stroke="white" strokeWidth="1" />
    </g>
  );
}

function RainbowPal() {
  return (
    <g className="creature-spin-slow">
      <path d="M20 60 A30 30 0 0 1 80 60" fill="none" stroke="#ef5350" strokeWidth="6" />
      <path d="M26 60 A24 24 0 0 1 74 60" fill="none" stroke="#ffeb3b" strokeWidth="6" />
      <path d="M32 60 A18 18 0 0 1 68 60" fill="none" stroke="#42a5f5" strokeWidth="6" />
      <circle cx="20" cy="60" r="10" fill="white" />
      <circle cx="80" cy="60" r="10" fill="white" />
      <circle cx="45" cy="45" r="2.5" fill="#1a1a2e" />
      <circle cx="55" cy="45" r="2.5" fill="#1a1a2e" />
    </g>
  );
}

function SparkleDeer() {
  return (
    <g className="creature-sway">
      <ellipse cx="50" cy="70" rx="20" ry="22" fill="#a1887f" />
      <circle cx="50" cy="40" r="18" fill="#a1887f" />
      <path d="M40 25 L35 10 M60 25 L65 10" stroke="#5d4037" strokeWidth="3" />
      <circle cx="43" cy="38" r="3" fill="#1a1a2e" />
      <circle cx="57" cy="38" r="3" fill="#1a1a2e" />
      <circle cx="50" cy="45" r="2" fill="#5d4037" />
      <circle cx="25" cy="30" r="2" fill="#fff176" />
      <circle cx="75" cy="50" r="1.5" fill="#fff176" />
    </g>
  );
}

function WishingStar() {
  return (
    <g className="creature-spin-slow">
      <polygon points="50,10 60,40 90,40 65,60 75,90 50,70 25,90 35,60 10,40 40,40" fill="#ffd54f" />
      <circle cx="43" cy="45" r="4" fill="#1a1a2e" />
      <circle cx="57" cy="45" r="4" fill="#1a1a2e" />
      <circle cx="45" cy="43" r="1.5" fill="white" />
      <circle cx="59" cy="43" r="1.5" fill="white" />
      <path d="M80 20 L85 10 M85 20 L75 15" stroke="#ffd54f" strokeWidth="2" />
    </g>
  );
}

function MagicCat() {
  return (
    <g className="creature-pulse">
      <circle cx="50" cy="65" r="22" fill="#7e57c2" />
      <circle cx="50" cy="40" r="20" fill="#7e57c2" />
      <path d="M35 30 L30 15 L45 25 Z" fill="#7e57c2" />
      <path d="M65 30 L70 15 L55 25 Z" fill="#7e57c2" />
      <circle cx="42" cy="38" r="4" fill="#ffd54f" />
      <circle cx="58" cy="38" r="4" fill="#ffd54f" />
      <circle cx="42" cy="38" r="2" fill="#1a1a2e" />
      <circle cx="58" cy="38" r="2" fill="#1a1a2e" />
      <path d="M40 70 Q50 60 60 70" fill="none" stroke="#b39ddb" strokeWidth="2" />
    </g>
  );
}

function PhoenixChick() {
  return (
    <g className="creature-flutter">
      <ellipse cx="50" cy="65" rx="18" ry="22" fill="#ff7043" />
      <circle cx="50" cy="42" r="16" fill="#ff7043" />
      <path d="M30 60 Q15 40 35 55" fill="#f4511e" />
      <path d="M70 60 Q85 40 65 55" fill="#f4511e" />
      <circle cx="44" cy="40" r="3" fill="#1a1a2e" />
      <circle cx="56" cy="40" r="3" fill="#1a1a2e" />
      <path d="M48 48 L52 48 L50 54 Z" fill="#ffd54f" />
    </g>
  );
}

function FairyBud() {
  return (
    <g className="creature-flutter">
      <ellipse cx="50" cy="70" rx="20" ry="15" fill="#81c784" />
      <circle cx="50" cy="45" r="15" fill="#fff176" />
      <circle cx="45" cy="43" r="2" fill="#1a1a2e" />
      <circle cx="55" cy="43" r="2" fill="#1a1a2e" />
      <path d="M30 40 L20 25 M70 40 L80 25" stroke="#f06292" strokeWidth="2" />
      <circle cx="20" cy="25" r="4" fill="#f06292" />
      <circle cx="80" cy="25" r="4" fill="#f06292" />
    </g>
  );
}

function CactusKid() {
  return (
    <g className="creature-sway">
      <rect x="35" y="40" width="30" height="50" rx="15" fill="#43a047" />
      <path d="M35 60 Q25 60 25 50" fill="none" stroke="#43a047" strokeWidth="10" strokeLinecap="round" />
      <path d="M65 70 Q75 70 75 60" fill="none" stroke="#43a047" strokeWidth="10" strokeLinecap="round" />
      <circle cx="43" cy="55" r="3" fill="#1a1a2e" />
      <circle cx="57" cy="55" r="3" fill="#1a1a2e" />
      <circle cx="50" cy="35" r="5" fill="#f06292" />
      <path d="M40 70 Q50 75 60 70" fill="none" stroke="#1b5e20" strokeWidth="2" />
    </g>
  );
}

function CamelHump() {
  return (
    <g className="creature-bob">
      <ellipse cx="50" cy="75" rx="30" ry="20" fill="#d7ccc8" />
      <path d="M35 55 A15 15 0 0 1 65 55" fill="#a1887f" />
      <path d="M70 75 L85 50" fill="none" stroke="#d7ccc8" strokeWidth="8" strokeLinecap="round" />
      <circle cx="85" cy="50" r="12" fill="#d7ccc8" />
      <circle cx="82" cy="48" r="3" fill="#1a1a2e" />
      <circle cx="90" cy="48" r="3" fill="#1a1a2e" />
      <path d="M40 95 L40 90 M60 95 L60 90" stroke="#5d4037" strokeWidth="4" />
    </g>
  );
}

function LizardSun() {
  return (
    <g className="creature-sway">
      <ellipse cx="50" cy="70" rx="30" ry="12" fill="#9ccc65" />
      <circle cx="75" cy="65" r="10" fill="#9ccc65" />
      <circle cx="78" cy="62" r="3" fill="#1a1a2e" />
      <path d="M30 70 Q15 70 10 90" fill="none" stroke="#9ccc65" strokeWidth="6" strokeLinecap="round" />
      <circle cx="40" cy="65" r="2" fill="#ffeb3b" />
      <circle cx="55" cy="65" r="2" fill="#ffeb3b" />
    </g>
  );
}

function SandFox() {
  return (
    <g className="creature-wiggle">
      <circle cx="50" cy="65" r="22" fill="#ffe0b2" />
      <circle cx="50" cy="40" r="25" fill="#ffe0b2" />
      <path d="M25 25 L20 5 L40 20 Z" fill="#ffe0b2" />
      <path d="M75 25 L80 5 L60 20 Z" fill="#ffe0b2" />
      <circle cx="40" cy="38" r="4" fill="#1a1a2e" />
      <circle cx="60" cy="38" r="4" fill="#1a1a2e" />
      <circle cx="50" cy="45" r="3" fill="#5d4037" />
    </g>
  );
}

function MeerkatPop() {
  return (
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="60" rx="15" ry="35" fill="#bcaaa4" />
      <circle cx="50" cy="30" r="15" fill="#bcaaa4" />
      <circle cx="45" cy="28" r="5" fill="#5d4037" />
      <circle cx="55" cy="28" r="5" fill="#5d4037" />
      <circle cx="45" cy="28" r="2.5" fill="#1a1a2e" />
      <circle cx="55" cy="28" r="2.5" fill="#1a1a2e" />
      <circle cx="50" cy="35" r="2" fill="#1a1a2e" />
    </g>
  );
}

function GeckoGreen() {
  return (
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="70" rx="15" ry="25" fill="#66bb6a" />
      <circle cx="50" cy="45" r="15" fill="#66bb6a" />
      <circle cx="42" cy="40" r="6" fill="white" />
      <circle cx="58" cy="40" r="6" fill="white" />
      <circle cx="42" cy="40" r="3" fill="#1a1a2e" />
      <circle cx="58" cy="40" r="3" fill="#1a1a2e" />
      <path d="M40 90 L35 95 M60 90 L65 95" stroke="#1b5e20" strokeWidth="3" />
    </g>
  );
}

function SandCat() {
  return (
    <g className="creature-wiggle">
      <circle cx="50" cy="70" r="20" fill="#ffcc80" />
      <circle cx="50" cy="45" r="18" fill="#ffcc80" />
      <path d="M35 35 L30 20 L45 35 Z" fill="#ffcc80" />
      <path d="M65 35 L70 20 L55 35 Z" fill="#ffcc80" />
      <circle cx="43" cy="42" r="3" fill="#1a1a2e" />
      <circle cx="57" cy="42" r="3" fill="#1a1a2e" />
      <path d="M45 50 L55 50" stroke="#5d4037" strokeWidth="1" />
    </g>
  );
}

function ArmadilloRoll() {
  return (
    <g className="creature-bounce-hop">
      <circle cx="50" cy="65" r="25" fill="#a1887f" />
      <path d="M25 65 A25 25 0 0 1 75 65" fill="none" stroke="#795548" strokeWidth="4" />
      <path d="M35 65 A15 15 0 0 1 65 65" fill="none" stroke="#795548" strokeWidth="4" />
      <path d="M70 70 L85 75" fill="none" stroke="#a1887f" strokeWidth="8" strokeLinecap="round" />
      <circle cx="85" cy="75" r="8" fill="#a1887f" />
      <circle cx="88" cy="73" r="2" fill="#1a1a2e" />
    </g>
  );
}

function AnglerfishGlow() {
  return (
    <g className="creature-pulse">
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#37474f" />
      <circle cx="70" cy="45" r="6" fill="white" />
      <circle cx="70" cy="45" r="3" fill="#1a1a2e" />
      <path d="M50 25 Q60 0 80 10" fill="none" stroke="#37474f" strokeWidth="3" />
      <circle cx="80" cy="10" r="5" fill="#fff176" />
      <path d="M60 70 L80 70" stroke="#cfd8dc" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function PufferFish() {
  return (
    <g className="creature-bounce-hop">
      <circle cx="50" cy="50" r="35" fill="#fff59d" />
      <circle cx="65" cy="45" r="6" fill="white" />
      <circle cx="65" cy="45" r="3" fill="#1a1a2e" />
      <path d="M20 50 L10 40 L10 60 Z" fill="#fff59d" />
      <circle cx="30" cy="30" r="2" fill="#fbc02d" />
      <circle cx="70" cy="70" r="2" fill="#fbc02d" />
      <circle cx="30" cy="70" r="2" fill="#fbc02d" />
    </g>
  );
}

function MantaRay() {
  return (
    <g className="creature-sway">
      <path d="M10 50 Q50 30 90 50 Q50 90 10 50" fill="#546e7a" />
      <path d="M50 70 L50 95" stroke="#546e7a" strokeWidth="3" />
      <circle cx="40" cy="50" r="3" fill="#1a1a2e" />
      <circle cx="60" cy="50" r="3" fill="#1a1a2e" />
    </g>
  );
}

function SquidInk() {
  return (
    <g className="creature-sway">
      <ellipse cx="50" cy="40" rx="20" ry="25" fill="#9575cd" />
      <circle cx="42" cy="45" r="4" fill="white" />
      <circle cx="58" cy="45" r="4" fill="white" />
      <circle cx="42" cy="45" r="2" fill="#1a1a2e" />
      <circle cx="58" cy="45" r="2" fill="#1a1a2e" />
      <path d="M35 60 L35 90 M45 60 L45 95 M55 60 L55 95 M65 60 L65 90" stroke="#9575cd" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

function SeaDragon() {
  return (
    <g className="creature-sway">
      <path d="M40 90 Q60 80 50 60 Q40 40 60 20" fill="none" stroke="#4db6ac" strokeWidth="10" strokeLinecap="round" />
      <path d="M45 50 L30 40 M55 40 L70 30" stroke="#80deea" strokeWidth="4" strokeLinecap="round" />
      <circle cx="65" cy="20" r="8" fill="#4db6ac" />
      <circle cx="68" cy="18" r="2" fill="#1a1a2e" />
    </g>
  );
}

function CoralFish() {
  return (
    <g className="creature-sway">
      <ellipse cx="50" cy="50" rx="30" ry="22" fill="#ff8a65" />
      <path d="M25 50 L10 35 L10 65 Z" fill="#ff8a65" />
      <path d="M50 30 A20 20 0 0 1 50 70" fill="none" stroke="#f4511e" strokeWidth="4" />
      <circle cx="70" cy="45" r="4" fill="#1a1a2e" />
    </g>
  );
}

function WhaleCalf() {
  return (
    <g className="creature-bob">
      <ellipse cx="50" cy="60" rx="40" ry="30" fill="#64b5f6" />
      <path d="M15 60 L5 50 L5 70 Z" fill="#64b5f6" />
      <circle cx="75" cy="55" r="5" fill="#1a1a2e" />
      <circle cx="77" cy="53" r="2" fill="white" />
      <path d="M50 30 Q50 10 60 10" fill="none" stroke="#bbdefb" strokeWidth="2" />
    </g>
  );
}

function Mercat() {
  return (
    <g className="creature-pulse">
      <circle cx="50" cy="40" r="18" fill="#ffab91" />
      <path d="M35 30 L30 15 L45 25 Z" fill="#ffab91" />
      <path d="M65 30 L70 15 L55 25 Z" fill="#ffab91" />
      <circle cx="44" cy="38" r="3" fill="#1a1a2e" />
      <circle cx="56" cy="38" r="3" fill="#1a1a2e" />
      <path d="M50 55 Q70 60 50 90 Q30 60 50 55" fill="#4db6ac" />
      <path d="M40 85 L50 95 L60 85" fill="#4db6ac" />
    </g>
  );
}

function CloudCastle() {
  return (
    <g className="creature-bounce-hop">
      <rect x="35" y="40" width="30" height="30" fill="#e1f5fe" />
      <polygon points="35,40 42,30 50,40 58,30 65,40" fill="#b3e5fc" />
      <circle cx="30" cy="75" r="15" fill="white" />
      <circle cx="50" cy="75" r="20" fill="white" />
      <circle cx="70" cy="75" r="15" fill="white" />
      <circle cx="45" cy="50" r="2" fill="#1a1a2e" />
      <circle cx="55" cy="50" r="2" fill="#1a1a2e" />
    </g>
  );
}

function CandyBear() {
  return (
    <g className="creature-bounce-hop">
      <circle cx="50" cy="65" r="22" fill="#f48fb1" />
      <circle cx="35" cy="45" r="10" fill="#f48fb1" />
      <circle cx="65" cy="45" r="10" fill="#f48fb1" />
      <circle cx="50" cy="45" r="20" fill="#f48fb1" />
      <circle cx="43" cy="42" r="3" fill="#1a1a2e" />
      <circle cx="57" cy="42" r="3" fill="#1a1a2e" />
      <circle cx="50" cy="48" r="5" fill="#f06292" />
    </g>
  );
}

function LemonPup() {
  return (
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="65" rx="25" ry="18" fill="#fff176" />
      <circle cx="50" cy="45" r="18" fill="#fff176" />
      <path d="M35 35 L30 50 M65 35 L70 50" stroke="#fbc02d" strokeWidth="6" strokeLinecap="round" />
      <circle cx="43" cy="42" r="3" fill="#1a1a2e" />
      <circle cx="57" cy="42" r="3" fill="#1a1a2e" />
      <circle cx="50" cy="48" r="2.5" fill="#fbc02d" />
    </g>
  );
}

export const SVG_BATCH_C: Record<string, () => React.ReactElement> = {
  'parrot-green': ParrotGreen,
  'crocodile-smile': CrocodileSmile,
  'unicorn-spark': UnicornSpark,
  'dragon-pup': DragonPup,
  'pixie-wing': PixieWing,
  'crystal-blue': CrystalBlue,
  'rainbow-pal': RainbowPal,
  'sparkle-deer': SparkleDeer,
  'wishing-star': WishingStar,
  'magic-cat': MagicCat,
  'phoenix-chick': PhoenixChick,
  'fairy-bud': FairyBud,
  'cactus-kid': CactusKid,
  'camel-hump': CamelHump,
  'lizard-sun': LizardSun,
  'sand-fox': SandFox,
  'meerkat-pop': MeerkatPop,
  'gecko-green': GeckoGreen,
  'sand-cat': SandCat,
  'armadillo-roll': ArmadilloRoll,
  'anglerfish-glow': AnglerfishGlow,
  'puffer-fish': PufferFish,
  'manta-ray': MantaRay,
  'squid-ink': SquidInk,
  'sea-dragon': SeaDragon,
  'coral-fish': CoralFish,
  'whale-calf': WhaleCalf,
  'mercat': Mercat,
  'cloud-castle': CloudCastle,
  'candy-bear': CandyBear,
  'lemon-pup': LemonPup,
};
