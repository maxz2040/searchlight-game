/* eslint-disable react-refresh/only-export-components */
import React from 'react';

// Animation assignments for Batch B:
// bob         → polar-pup seal-pup walrus-pal elephant-baby hippo-round sloth-hang
// wiggle      → monkey-swing tiger-cub giraffe-spot zebra-stripe chameleon-shift
// spin-slow   → planet-ring star-scout snowflake-kid
// pulse       → nebula-pup dewdrop-fairy astro-bear luna-cat
// bounce-hop  → sun-flower-face acorn-buddy daisy-bud mushroom-cap husky-pup arctic-hare penguin-baby
// sway        → snow-fox yeti-small ice-bear

export const PlanetRing = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-spin-slow">
      <ellipse cx="50" cy="50" rx="45" ry="15" stroke="#A855F7" strokeWidth="4" transform="rotate(-15 50 50)" />
      <circle cx="50" cy="50" r="25" fill="#C084FC" />
      <circle cx="42" cy="45" r="3" fill="black" />
      <circle cx="58" cy="45" r="3" fill="black" />
      <path d="M45 55 Q50 60 55 55" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const AstroBear = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-pulse">
      <circle cx="50" cy="50" r="40" fill="#E2E8F0" />
      <circle cx="50" cy="50" r="30" fill="#94A3B8" />
      <circle cx="35" cy="25" r="10" fill="#94A3B8" />
      <circle cx="65" cy="25" r="10" fill="#94A3B8" />
      <circle cx="40" cy="45" r="4" fill="black" />
      <circle cx="60" cy="45" r="4" fill="black" />
      <circle cx="50" cy="55" r="5" fill="#64748B" />
      <path d="M40 65 Q50 70 60 65" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const LunaCat = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-pulse">
      <circle cx="50" cy="50" r="40" fill="#1E293B" />
      <path d="M25 25 L40 40 L20 45 Z" fill="#1E293B" />
      <path d="M75 25 L60 40 L80 45 Z" fill="#1E293B" />
      <circle cx="40" cy="45" r="4" fill="#FDE047" />
      <circle cx="60" cy="45" r="4" fill="#FDE047" />
      <path d="M45 60 Q50 65 55 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 50 Q30 50 40 55" stroke="white" strokeWidth="1" />
      <path d="M90 50 Q70 50 60 55" stroke="white" strokeWidth="1" />
    </g>
  </svg>
);

export const StarScout = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-spin-slow">
      <path d="M50 5 L61 35 L95 35 L68 57 L78 91 L50 70 L22 91 L32 57 L5 35 L39 35 Z" fill="#FBBF24" />
      <circle cx="40" cy="45" r="3" fill="black" />
      <circle cx="60" cy="45" r="3" fill="black" />
      <circle cx="50" cy="55" r="4" fill="#F59E0B" />
    </g>
  </svg>
);

export const NebulaPup = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-pulse">
      <circle cx="50" cy="50" r="35" fill="#818CF8" />
      <circle cx="30" cy="30" r="12" fill="#818CF8" />
      <circle cx="70" cy="30" r="12" fill="#818CF8" />
      <circle cx="40" cy="45" r="4" fill="black" />
      <circle cx="60" cy="45" r="4" fill="black" />
      <circle cx="50" cy="55" r="6" fill="#4F46E5" />
      <circle cx="20" cy="20" r="4" fill="white" opacity="0.5" />
      <circle cx="80" cy="20" r="3" fill="white" opacity="0.3" />
    </g>
  </svg>
);

export const LadybugSpot = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <circle cx="50" cy="55" r="35" fill="#EF4444" />
      <path d="M50 20 V90" stroke="black" strokeWidth="2" />
      <circle cx="35" cy="40" r="5" fill="black" />
      <circle cx="65" cy="40" r="5" fill="black" />
      <circle cx="30" cy="65" r="5" fill="black" />
      <circle cx="70" cy="65" r="5" fill="black" />
      <circle cx="50" cy="25" r="15" fill="black" />
      <circle cx="45" cy="22" r="2" fill="white" />
      <circle cx="55" cy="22" r="2" fill="white" />
    </g>
  </svg>
);

export const CaterpillarGreen = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <circle cx="20" cy="60" r="12" fill="#4ADE80" />
      <circle cx="40" cy="60" r="12" fill="#22C55E" />
      <circle cx="60" cy="60" r="12" fill="#4ADE80" />
      <circle cx="80" cy="50" r="15" fill="#22C55E" />
      <circle cx="75" cy="45" r="3" fill="black" />
      <circle cx="85" cy="45" r="3" fill="black" />
      <path d="M78 35 Q80 25 75 20" stroke="black" strokeWidth="1" />
      <path d="M82 35 Q85 25 90 20" stroke="black" strokeWidth="1" />
    </g>
  </svg>
);

export const SnailTrail = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <path d="M10 80 Q50 85 90 80 L80 70 L20 70 Z" fill="#FDE68A" />
      <circle cx="45" cy="50" r="25" fill="#D97706" />
      <circle cx="45" cy="50" r="18" stroke="#B45309" strokeWidth="2" fill="none" />
      <circle cx="45" cy="50" r="10" stroke="#B45309" strokeWidth="2" fill="none" />
      <circle cx="80" cy="65" r="3" fill="black" />
      <path d="M80 65 L85 55" stroke="black" strokeWidth="1" />
      <circle cx="85" cy="55" r="1" fill="black" />
    </g>
  </svg>
);

export const MushroomCap = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bounce-hop">
      <rect x="40" y="50" width="20" height="30" rx="10" fill="#F3F4F6" />
      <path d="M15 55 Q50 15 85 55 Z" fill="#EF4444" />
      <circle cx="35" cy="35" r="5" fill="white" />
      <circle cx="50" cy="30" r="6" fill="white" />
      <circle cx="65" cy="40" r="4" fill="white" />
      <circle cx="45" cy="65" r="2" fill="black" />
      <circle cx="55" cy="65" r="2" fill="black" />
    </g>
  </svg>
);

export const SunflowerFace = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bounce-hop">
      <circle cx="50" cy="50" r="20" fill="#78350F" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <ellipse key={deg} cx="50" cy="20" rx="8" ry="15" fill="#FBBF24" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="45" cy="48" r="3" fill="black" />
      <circle cx="55" cy="48" r="3" fill="black" />
      <path d="M45 55 Q50 60 55 55" stroke="white" strokeWidth="1" />
    </g>
  </svg>
);

export const AcornBuddy = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bounce-hop">
      <path d="M30 40 Q50 90 70 40 Z" fill="#D97706" />
      <path d="M25 40 Q50 25 75 40 Z" fill="#78350F" />
      <rect x="48" y="20" width="4" height="10" fill="#78350F" />
      <circle cx="43" cy="50" r="3" fill="black" />
      <circle cx="57" cy="50" r="3" fill="black" />
      <path d="M45 60 Q50 65 55 60" stroke="black" strokeWidth="1" />
    </g>
  </svg>
);

export const DewdropFairy = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-pulse">
      <path d="M50 20 Q80 60 50 85 Q20 60 50 20 Z" fill="#60A5FA" />
      <path d="M50 30 L65 45 Q75 55 65 65 L50 50" fill="white" opacity="0.4" />
      <path d="M50 30 L35 45 Q25 55 35 65 L50 50" fill="white" opacity="0.4" />
      <circle cx="45" cy="55" r="3" fill="black" />
      <circle cx="55" cy="55" r="3" fill="black" />
    </g>
  </svg>
);

export const DaisyBud = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bounce-hop">
      <circle cx="50" cy="50" r="15" fill="#FDE047" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
        <ellipse key={deg} cx="50" cy="25" rx="5" ry="12" fill="white" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="45" cy="48" r="3" fill="black" />
      <circle cx="55" cy="48" r="3" fill="black" />
    </g>
  </svg>
);

export const PolarPup = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bob">
      <circle cx="50" cy="50" r="35" fill="#F8FAFC" />
      <circle cx="30" cy="30" r="10" fill="#F8FAFC" />
      <circle cx="70" cy="30" r="10" fill="#F8FAFC" />
      <circle cx="40" cy="45" r="4" fill="black" />
      <circle cx="60" cy="45" r="4" fill="black" />
      <circle cx="50" cy="55" r="5" fill="black" />
      <path d="M40 65 Q50 72 60 65" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const SnowFox = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-sway">
      <path d="M20 80 Q50 30 80 80 Z" fill="#F1F5F9" />
      <path d="M20 80 L10 50 L30 70 Z" fill="#F1F5F9" />
      <path d="M80 80 L90 50 L70 70 Z" fill="#F1F5F9" />
      <circle cx="42" cy="65" r="3" fill="black" />
      <circle cx="58" cy="65" r="3" fill="black" />
      <circle cx="50" cy="72" r="4" fill="#94A3B8" />
    </g>
  </svg>
);

export const WalrusPal = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bob">
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="#94A3B8" />
      <path d="M40 65 V85" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 65 V85" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="50" r="4" fill="black" />
      <circle cx="60" cy="50" r="4" fill="black" />
      <circle cx="50" cy="60" r="6" fill="#475569" />
      <path d="M30 60 Q20 60 15 65" stroke="white" strokeWidth="1" />
      <path d="M70 60 Q80 60 85 65" stroke="white" strokeWidth="1" />
    </g>
  </svg>
);

export const SealPup = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bob">
      <ellipse cx="50" cy="55" rx="35" ry="25" fill="#CBD5E1" />
      <circle cx="40" cy="50" r="4" fill="black" />
      <circle cx="60" cy="50" r="4" fill="black" />
      <circle cx="50" cy="58" r="5" fill="black" />
      <path d="M20 75 Q10 85 15 65" fill="#CBD5E1" />
      <path d="M80 75 Q90 85 85 65" fill="#CBD5E1" />
    </g>
  </svg>
);

export const SnowflakeKid = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-spin-slow">
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <rect key={deg} x="48" y="10" width="4" height="80" fill="#BAE6FD" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="15" fill="#7DD3FC" />
      <circle cx="45" cy="48" r="2" fill="black" />
      <circle cx="55" cy="48" r="2" fill="black" />
      <path d="M47 55 Q50 58 53 55" stroke="black" strokeWidth="1" />
    </g>
  </svg>
);

export const IceBear = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-sway">
      <rect x="25" y="30" width="50" height="60" rx="20" fill="#F8FAFC" />
      <circle cx="35" cy="30" r="10" fill="#F8FAFC" />
      <circle cx="65" cy="30" r="10" fill="#F8FAFC" />
      <circle cx="43" cy="50" r="4" fill="black" />
      <circle cx="57" cy="50" r="4" fill="black" />
      <circle cx="50" cy="60" r="6" fill="#94A3B8" />
    </g>
  </svg>
);

export const HuskyPup = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bounce-hop">
      <circle cx="50" cy="50" r="35" fill="#94A3B8" />
      <path d="M30 50 Q50 20 70 50 Z" fill="white" />
      <path d="M25 25 L40 40 L20 45 Z" fill="#475569" />
      <path d="M75 25 L60 40 L80 45 Z" fill="#475569" />
      <circle cx="40" cy="50" r="4" fill="black" />
      <circle cx="60" cy="50" r="4" fill="black" />
      <circle cx="50" cy="60" r="5" fill="black" />
    </g>
  </svg>
);

export const YetiSmall = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-sway">
      <rect x="20" y="30" width="60" height="60" rx="25" fill="white" />
      <path d="M20 40 L15 50 L25 55" fill="white" />
      <path d="M80 40 L85 50 L75 55" fill="white" />
      <rect x="35" y="45" width="30" height="20" rx="10" fill="#E0F2FE" />
      <circle cx="43" cy="53" r="3" fill="black" />
      <circle cx="57" cy="53" r="3" fill="black" />
      <path d="M48 60 H52" stroke="black" strokeWidth="2" />
    </g>
  </svg>
);

export const ArcticHare = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="65" rx="30" ry="25" fill="#F8FAFC" />
      <circle cx="50" cy="45" r="20" fill="#F8FAFC" />
      <rect x="40" y="10" width="8" height="30" rx="4" fill="#F8FAFC" />
      <rect x="52" y="10" width="8" height="30" rx="4" fill="#F8FAFC" />
      <circle cx="45" cy="45" r="2" fill="black" />
      <circle cx="55" cy="45" r="2" fill="black" />
      <circle cx="50" cy="50" r="3" fill="#FDA4AF" />
    </g>
  </svg>
);

export const PenguinBaby = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="60" rx="30" ry="35" fill="#475569" />
      <ellipse cx="50" cy="60" rx="20" ry="25" fill="white" />
      <circle cx="43" cy="45" r="3" fill="black" />
      <circle cx="57" cy="45" r="3" fill="black" />
      <path d="M45 52 L50 60 L55 52 Z" fill="#F59E0B" />
      <path d="M20 60 Q10 70 25 75" fill="#475569" />
      <path d="M80 60 Q90 70 75 75" fill="#475569" />
    </g>
  </svg>
);

export const MonkeySwing = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <circle cx="50" cy="45" r="25" fill="#78350F" />
      <circle cx="30" cy="40" r="10" fill="#78350F" />
      <circle cx="70" cy="40" r="10" fill="#78350F" />
      <ellipse cx="50" cy="50" rx="18" ry="15" fill="#FDE68A" />
      <circle cx="43" cy="45" r="3" fill="black" />
      <circle cx="57" cy="45" r="3" fill="black" />
      <circle cx="50" cy="52" r="4" fill="#D97706" />
      <path d="M40 60 Q50 65 60 60" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const TigerCub = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <circle cx="50" cy="50" r="35" fill="#F97316" />
      <path d="M20 40 Q35 15 50 40 Q65 15 80 40" stroke="black" strokeWidth="4" fill="none" />
      <circle cx="30" cy="25" r="10" fill="#F97316" />
      <circle cx="70" cy="25" r="10" fill="#F97316" />
      <circle cx="40" cy="50" r="4" fill="black" />
      <circle cx="60" cy="50" r="4" fill="black" />
      <circle cx="50" cy="60" r="6" fill="#FB923C" />
      <path d="M15 50 H30 M70 50 H85" stroke="black" strokeWidth="2" />
    </g>
  </svg>
);

export const ElephantBaby = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bob">
      <circle cx="50" cy="55" r="30" fill="#94A3B8" />
      <ellipse cx="25" cy="45" rx="15" ry="20" fill="#94A3B8" />
      <ellipse cx="75" cy="45" rx="15" ry="20" fill="#94A3B8" />
      <rect x="45" y="55" width="10" height="25" rx="5" fill="#94A3B8" />
      <circle cx="42" cy="50" r="3" fill="black" />
      <circle cx="58" cy="50" r="3" fill="black" />
    </g>
  </svg>
);

export const GiraffeSpot = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <rect x="42" y="40" width="16" height="50" rx="8" fill="#FBBF24" />
      <circle cx="50" cy="35" r="20" fill="#FBBF24" />
      <circle cx="40" cy="20" r="5" fill="#FBBF24" />
      <circle cx="60" cy="20" r="5" fill="#FBBF24" />
      <circle cx="45" cy="35" r="3" fill="black" />
      <circle cx="55" cy="35" r="3" fill="black" />
      <circle cx="45" cy="55" r="4" fill="#B45309" />
      <circle cx="55" cy="70" r="5" fill="#B45309" />
    </g>
  </svg>
);

export const HippoRound = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bob">
      <ellipse cx="50" cy="60" rx="40" ry="30" fill="#94A3B8" />
      <circle cx="30" cy="35" r="8" fill="#94A3B8" />
      <circle cx="70" cy="35" r="8" fill="#94A3B8" />
      <ellipse cx="50" cy="65" rx="25" ry="15" fill="#CBD5E1" />
      <circle cx="43" cy="50" r="4" fill="black" />
      <circle cx="57" cy="50" r="4" fill="black" />
      <circle cx="45" cy="65" r="3" fill="#475569" />
      <circle cx="55" cy="65" r="3" fill="#475569" />
    </g>
  </svg>
);

export const ChameleonShift = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <path d="M20 70 Q50 30 80 70" stroke="#4ADE80" strokeWidth="20" strokeLinecap="round" fill="none" />
      <circle cx="75" cy="60" r="15" fill="#4ADE80" />
      <circle cx="75" cy="60" r="8" fill="#22C55E" />
      <circle cx="78" cy="58" r="2" fill="black" />
      <path d="M15 70 Q5 60 15 50" stroke="#4ADE80" strokeWidth="5" fill="none" />
    </g>
  </svg>
);

export const SlothHang = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-bob">
      <circle cx="50" cy="45" r="25" fill="#A8A29E" />
      <ellipse cx="50" cy="50" rx="18" ry="15" fill="#F5F5F4" />
      <rect x="35" y="45" width="10" height="5" rx="2" fill="#78716C" />
      <rect x="55" y="45" width="10" height="5" rx="2" fill="#78716C" />
      <circle cx="40" cy="47" r="2" fill="black" />
      <circle cx="60" cy="47" r="2" fill="black" />
      <circle cx="50" cy="55" r="3" fill="black" />
      <path d="M45 62 Q50 65 55 62" stroke="black" strokeWidth="1" />
    </g>
  </svg>
);

export const ZebraStripe = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g className="creature-wiggle">
      <circle cx="50" cy="50" r="35" fill="white" />
      <path d="M15 50 H30 M70 50 H85 M40 15 V30 M60 15 V30 M40 70 V85 M60 70 V85" stroke="black" strokeWidth="5" />
      <circle cx="40" cy="45" r="4" fill="black" />
      <circle cx="60" cy="45" r="4" fill="black" />
      <circle cx="50" cy="60" r="6" fill="#E2E8F0" />
    </g>
  </svg>
);

export const SVG_BATCH_B: Record<string, () => React.ReactElement> = {
  'planet-ring': PlanetRing,
  'astro-bear': AstroBear,
  'luna-cat': LunaCat,
  'star-scout': StarScout,
  'nebula-pup': NebulaPup,
  'ladybug-spot': LadybugSpot,
  'caterpillar-green': CaterpillarGreen,
  'snail-trail': SnailTrail,
  'mushroom-cap': MushroomCap,
  'sunflower-face': SunflowerFace,
  'acorn-buddy': AcornBuddy,
  'dewdrop-fairy': DewdropFairy,
  'daisy-bud': DaisyBud,
  'polar-pup': PolarPup,
  'snow-fox': SnowFox,
  'walrus-pal': WalrusPal,
  'seal-pup': SealPup,
  'snowflake-kid': SnowflakeKid,
  'ice-bear': IceBear,
  'husky-pup': HuskyPup,
  'yeti-small': YetiSmall,
  'arctic-hare': ArcticHare,
  'penguin-baby': PenguinBaby,
  'monkey-swing': MonkeySwing,
  'tiger-cub': TigerCub,
  'elephant-baby': ElephantBaby,
  'giraffe-spot': GiraffeSpot,
  'hippo-round': HippoRound,
  'chameleon-shift': ChameleonShift,
  'sloth-hang': SlothHang,
  'zebra-stripe': ZebraStripe,
};
