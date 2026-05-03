/* eslint-disable react-refresh/only-export-components */
import React from 'react';

// Animation Assignment for Batch A
// bob: deer-dot, hamster-round, fish-fin, dolphin-flip, sea-turtle-jr
// wiggle: raccoon-mask, squirrel-nut, chipmunk-cheek, hedgehog-roll
// flutter: bat-wing, butterfly-blue, dragonfly-zip, hummingbird, firefly-glow, parrot-red, flamingo-pink, eagle-soar, toucan-beak
// spin-slow: ufo-pal
// pulse: jellyfish-glow
// bounce-hop: crab-snap, lobster-red, comet-kid, rocket-red, cloud-puff
// sway: clownfish, seahorse-curl, octopus-pal, narwhal-horn

export const DeerDot = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bob">
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#D2B48C" />
      <circle cx="50" cy="35" r="25" fill="#D2B48C" />
      <circle cx="38" cy="18" r="8" fill="#D2B48C" />
      <circle cx="62" cy="18" r="8" fill="#D2B48C" />
      <circle cx="42" cy="32" r="3" fill="black" />
      <circle cx="58" cy="32" r="3" fill="black" />
      <circle cx="43" cy="31" r="1" fill="white" />
      <circle cx="59" cy="31" r="1" fill="white" />
      <path d="M46 42 Q50 46 54 42" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="50" r="3" fill="white" />
      <circle cx="60" cy="55" r="3" fill="white" />
      <circle cx="50" cy="65" r="3" fill="white" />
    </g>
  </svg>
);

export const HedgehogRoll = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-wiggle">
      <path d="M20 70 Q50 10 80 70" fill="#8B4513" />
      <circle cx="50" cy="65" r="30" fill="#DEB887" />
      <circle cx="40" cy="60" r="3" fill="black" />
      <circle cx="60" cy="60" r="3" fill="black" />
      <path d="M48 72 Q50 75 52 72" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const SquirrelNut = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-wiggle">
      <path d="M70 70 Q90 30 70 10 Q50 30 70 50" fill="#A0522D" />
      <ellipse cx="50" cy="60" rx="25" ry="30" fill="#CD853F" />
      <circle cx="50" cy="35" r="18" fill="#CD853F" />
      <circle cx="43" cy="32" r="2.5" fill="black" />
      <circle cx="57" cy="32" r="2.5" fill="black" />
      <ellipse cx="50" cy="60" rx="10" ry="12" fill="#EEDDCC" />
    </g>
  </svg>
);

export const RaccoonMask = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-wiggle">
      <circle cx="50" cy="60" r="30" fill="#808080" />
      <circle cx="50" cy="40" r="25" fill="#808080" />
      <path d="M30 35 L70 35 L70 45 L30 45 Z" fill="#333" />
      <circle cx="40" cy="40" r="3" fill="black" />
      <circle cx="60" cy="40" r="3" fill="black" />
      <circle cx="41" cy="39" r="1" fill="white" />
      <circle cx="61" cy="39" r="1" fill="white" />
      <circle cx="50" cy="45" r="2" fill="black" />
    </g>
  </svg>
);

export const ChipmunkCheek = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-wiggle">
      <circle cx="50" cy="60" r="30" fill="#D2691E" />
      <circle cx="50" cy="35" r="22" fill="#D2691E" />
      <circle cx="35" cy="40" r="8" fill="#F4A460" />
      <circle cx="65" cy="40" r="8" fill="#F4A460" />
      <circle cx="44" cy="33" r="2.5" fill="black" />
      <circle cx="56" cy="33" r="2.5" fill="black" />
      <path d="M45 15 L45 30 M50 13 L50 28 M55 15 L55 30" stroke="#5C4033" strokeWidth="2" />
    </g>
  </svg>
);

export const HamsterRound = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bob">
      <circle cx="50" cy="55" r="35" fill="#FFDAB9" />
      <circle cx="38" cy="50" r="3" fill="black" />
      <circle cx="62" cy="50" r="3" fill="black" />
      <circle cx="35" cy="65" r="8" fill="#FFC0CB" opacity="0.6" />
      <circle cx="65" cy="65" r="8" fill="#FFC0CB" opacity="0.6" />
      <path d="M48 58 L52 58 L50 61 Z" fill="#FFB6C1" />
    </g>
  </svg>
);

export const FishFin = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bob">
      <ellipse cx="50" cy="50" rx="35" ry="25" fill="#FF7F50" />
      <path d="M85 50 L95 35 L95 65 Z" fill="#FF7F50" />
      <circle cx="35" cy="45" r="4" fill="black" />
      <circle cx="36" cy="44" r="1.5" fill="white" />
      <path d="M50 30 Q60 15 70 30" fill="#FF7F50" />
    </g>
  </svg>
);

export const CrabSnap = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="60" rx="30" ry="20" fill="#FF4500" />
      <circle cx="30" cy="40" r="10" fill="#FF4500" />
      <circle cx="70" cy="40" r="10" fill="#FF4500" />
      <circle cx="42" cy="55" r="3" fill="black" />
      <circle cx="58" cy="55" r="3" fill="black" />
      <path d="M25 75 L15 85 M75 75 L85 85" stroke="#FF4500" strokeWidth="4" />
    </g>
  </svg>
);

export const OctopusPal = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-sway">
      <circle cx="50" cy="40" r="25" fill="#BA55D3" />
      <circle cx="42" cy="35" r="3.5" fill="black" />
      <circle cx="58" cy="35" r="3.5" fill="black" />
      <path d="M30 65 Q35 85 40 65 Q45 85 50 65 Q55 85 60 65 Q65 85 70 65" fill="none" stroke="#BA55D3" strokeWidth="8" strokeLinecap="round" />
    </g>
  </svg>
);

export const SeahorseCurl = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-sway">
      <path d="M50 20 Q65 20 60 40 Q55 60 40 60 Q30 60 30 75 Q30 90 50 90" fill="none" stroke="#FFD700" strokeWidth="10" strokeLinecap="round" />
      <circle cx="50" cy="25" r="12" fill="#FFD700" />
      <circle cx="52" cy="22" r="2" fill="black" />
      <path d="M40 25 L30 25" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

export const JellyfishGlow = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-pulse">
      <path d="M25 50 A25 25 0 0 1 75 50 Z" fill="#E6E6FA" opacity="0.8" />
      <circle cx="40" cy="45" r="2.5" fill="black" />
      <circle cx="60" cy="45" r="2.5" fill="black" />
      <path d="M35 50 V75 M45 50 V80 M55 50 V80 M65 50 V75" stroke="#E6E6FA" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

export const DolphinFlip = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bob">
      <path d="M20 60 Q50 10 90 60" fill="#87CEEB" />
      <path d="M85 60 L95 70 L75 70 Z" fill="#87CEEB" />
      <circle cx="40" cy="45" r="3" fill="black" />
      <path d="M20 60 L10 65" stroke="#87CEEB" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

export const Clownfish = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-sway">
      <ellipse cx="50" cy="50" rx="35" ry="22" fill="#FF8C00" />
      <rect x="40" y="28" width="10" height="44" fill="white" />
      <rect x="65" y="35" width="8" height="30" fill="white" />
      <circle cx="30" cy="45" r="3" fill="black" />
      <path d="M85 50 L95 35 L95 65 Z" fill="#FF8C00" />
    </g>
  </svg>
);

export const NarwhalHorn = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-sway">
      <ellipse cx="45" cy="60" rx="30" ry="20" fill="#D3D3D3" />
      <path d="M70 50 L95 35" stroke="#F5F5DC" strokeWidth="4" strokeLinecap="round" />
      <circle cx="35" cy="55" r="3" fill="black" />
      <path d="M15 60 L5 50 L5 70 Z" fill="#D3D3D3" />
    </g>
  </svg>
);

export const SeaTurtleJr = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bob">
      <ellipse cx="50" cy="55" rx="30" ry="22" fill="#6B8E23" />
      <circle cx="80" cy="55" r="12" fill="#9ACD32" />
      <circle cx="85" cy="52" r="2.5" fill="black" />
      <path d="M40 35 L30 25 M60 35 L70 25 M40 75 L30 85 M60 75 L70 85" stroke="#9ACD32" strokeWidth="6" strokeLinecap="round" />
    </g>
  </svg>
);

export const LobsterRed = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="60" rx="20" ry="30" fill="#B22222" />
      <circle cx="30" cy="30" r="12" fill="#B22222" />
      <circle cx="70" cy="30" r="12" fill="#B22222" />
      <circle cx="45" cy="50" r="2.5" fill="black" />
      <circle cx="55" cy="50" r="2.5" fill="black" />
      <path d="M50 90 L40 100 M50 90 L60 100" stroke="#B22222" strokeWidth="4" />
    </g>
  </svg>
);

export const CloudPuff = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bounce-hop">
      <circle cx="35" cy="50" r="20" fill="white" />
      <circle cx="50" cy="40" r="22" fill="white" />
      <circle cx="65" cy="50" r="20" fill="white" />
      <circle cx="42" cy="45" r="3" fill="black" />
      <circle cx="58" cy="45" r="3" fill="black" />
      <path d="M46 52 Q50 56 54 52" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const BatWing = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <path d="M10 40 Q30 20 50 45 Q70 20 90 40 Q70 60 50 50 Q30 60 10 40" fill="#4B0082" />
      <circle cx="50" cy="45" r="12" fill="#4B0082" />
      <circle cx="46" cy="42" r="2" fill="black" />
      <circle cx="54" cy="42" r="2" fill="black" />
      <path d="M48 52 L49 55 L50 52 L51 55 L52 52" fill="white" />
    </g>
  </svg>
);

export const ButterflyBlue = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <path d="M50 50 L20 20 Q10 40 50 50 L20 80 Q10 60 50 50" fill="#87CEEB" />
      <path d="M50 50 L80 20 Q90 40 50 50 L80 80 Q90 60 50 50" fill="#87CEEB" />
      <ellipse cx="50" cy="50" rx="5" ry="25" fill="#333" />
      <circle cx="48" cy="35" r="1" fill="white" />
    </g>
  </svg>
);

export const DragonflyZip = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <ellipse cx="50" cy="50" rx="4" ry="35" fill="#2F4F4F" />
      <ellipse cx="30" cy="45" rx="20" ry="5" fill="#AFEEEE" opacity="0.7" />
      <ellipse cx="70" cy="45" rx="20" ry="5" fill="#AFEEEE" opacity="0.7" />
      <circle cx="50" cy="20" r="6" fill="#2F4F4F" />
      <circle cx="47" cy="18" r="2" fill="black" />
      <circle cx="53" cy="18" r="2" fill="black" />
    </g>
  </svg>
);

export const ParrotRed = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <circle cx="50" cy="40" r="20" fill="#FF0000" />
      <ellipse cx="50" cy="65" rx="15" ry="25" fill="#FF0000" />
      <path d="M30 60 Q10 40 35 50" fill="#FF0000" />
      <path d="M70 60 Q90 40 65 50" fill="#FF0000" />
      <circle cx="45" cy="35" r="3" fill="black" />
      <path d="M50 40 L58 45 L50 45 Z" fill="#FFFF00" />
    </g>
  </svg>
);

export const Hummingbird = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <ellipse cx="55" cy="50" rx="20" ry="12" fill="#008080" />
      <circle cx="75" cy="40" r="10" fill="#008080" />
      <path d="M85 40 L100 35" stroke="#333" strokeWidth="2" />
      <path d="M55 40 L45 10 Q35 30 55 45" fill="#008080" opacity="0.8" />
      <circle cx="78" cy="38" r="2" fill="black" />
    </g>
  </svg>
);

export const FlamingoPink = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <ellipse cx="40" cy="60" rx="20" ry="15" fill="#FFB6C1" />
      <path d="M55 60 Q70 60 70 30 Q70 15 60 15" fill="none" stroke="#FFB6C1" strokeWidth="8" strokeLinecap="round" />
      <circle cx="62" cy="18" r="8" fill="#FFB6C1" />
      <circle cx="65" cy="15" r="2" fill="black" />
      <path d="M40 75 L40 95 M45 75 L45 95" stroke="#FFB6C1" strokeWidth="3" />
    </g>
  </svg>
);

export const ToucanBeak = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <circle cx="40" cy="40" r="20" fill="#333" />
      <ellipse cx="40" cy="65" rx="15" ry="20" fill="#333" />
      <path d="M55 30 Q85 30 85 50 Q55 55 55 30" fill="#FFA500" />
      <circle cx="45" cy="35" r="3" fill="black" />
      <circle cx="46" cy="34" r="1" fill="white" />
    </g>
  </svg>
);

export const EagleSoar = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <path d="M10 50 Q30 20 50 50 Q70 20 90 50" fill="none" stroke="#8B4513" strokeWidth="10" strokeLinecap="round" />
      <circle cx="50" cy="50" r="15" fill="#8B4513" />
      <circle cx="50" cy="45" r="12" fill="white" />
      <circle cx="46" cy="42" r="2" fill="black" />
      <circle cx="54" cy="42" r="2" fill="black" />
      <path d="M50 48 L53 52 L47 52 Z" fill="#FFFF00" />
    </g>
  </svg>
);

export const FireflyGlow = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-flutter">
      <ellipse cx="50" cy="50" rx="10" ry="18" fill="#333" />
      <circle cx="50" cy="75" r="15" fill="#FFFFE0" opacity="0.6">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="30" r="8" fill="#333" />
      <circle cx="47" cy="28" r="1.5" fill="black" />
      <circle cx="53" cy="28" r="1.5" fill="black" />
    </g>
  </svg>
);

export const CometKid = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bounce-hop">
      <path d="M20 20 L60 50 L20 80 Z" fill="#FFD700" opacity="0.5" />
      <circle cx="65" cy="50" r="20" fill="#FFD700" />
      <circle cx="60" cy="45" r="3" fill="black" />
      <circle cx="70" cy="45" r="3" fill="black" />
      <path d="M62 55 Q65 60 68 55" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const UfoPal = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-spin-slow">
      <ellipse cx="50" cy="60" rx="40" ry="15" fill="#A9A9A9" />
      <path d="M30 60 A20 20 0 0 1 70 60 Z" fill="#87CEEB" opacity="0.6" />
      <circle cx="50" cy="50" r="8" fill="#ADFF2F" />
      <circle cx="47" cy="48" r="1.5" fill="black" />
      <circle cx="53" cy="48" r="1.5" fill="black" />
    </g>
  </svg>
);

export const RocketRed = () => (
  <svg viewBox="0 0 100 100">
    <g className="creature-bounce-hop">
      <path d="M50 10 Q65 40 65 80 L35 80 Q35 40 50 10" fill="#FF4500" />
      <rect x="40" y="80" width="20" height="10" fill="#333" />
      <circle cx="50" cy="45" r="8" fill="white" />
      <circle cx="50" cy="45" r="5" fill="#87CEEB" />
      <path d="M35 60 L20 80 L35 80 Z M65 60 L80 80 L65 80 Z" fill="#FF4500" />
    </g>
  </svg>
);

export const SVG_BATCH_A: Record<string, () => React.ReactElement> = {
  'deer-dot': DeerDot,
  'hedgehog-roll': HedgehogRoll,
  'squirrel-nut': SquirrelNut,
  'raccoon-mask': RaccoonMask,
  'chipmunk-cheek': ChipmunkCheek,
  'hamster-round': HamsterRound,
  'fish-fin': FishFin,
  'crab-snap': CrabSnap,
  'octopus-pal': OctopusPal,
  'seahorse-curl': SeahorseCurl,
  'jellyfish-glow': JellyfishGlow,
  'dolphin-flip': DolphinFlip,
  'clownfish': Clownfish,
  'narwhal-horn': NarwhalHorn,
  'sea-turtle-jr': SeaTurtleJr,
  'lobster-red': LobsterRed,
  'cloud-puff': CloudPuff,
  'bat-wing': BatWing,
  'butterfly-blue': ButterflyBlue,
  'dragonfly-zip': DragonflyZip,
  'parrot-red': ParrotRed,
  'hummingbird': Hummingbird,
  'flamingo-pink': FlamingoPink,
  'toucan-beak': ToucanBeak,
  'eagle-soar': EagleSoar,
  'firefly-glow': FireflyGlow,
  'comet-kid': CometKid,
  'ufo-pal': UfoPal,
  'rocket-red': RocketRed,
};
