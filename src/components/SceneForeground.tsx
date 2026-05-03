// SceneForeground — always-visible SVG overlay rendered ABOVE the spotlight
// dark-mask so it acts as genuine scene depth.  Creatures positioned inside
// these zones are partially occluded, creating authentic "hiding behind the
// scenery" gameplay for the Waldo Edition levels (26–45).
//
// Each scene provides:
//   Forest  — left/right tree trunks, top-left pine bough, bottom grass band
//   Meadow  — bottom tall-grass band, left+right edge tuft clusters
//   Beach   — bottom sand dune, left seaweed+rock, right boulder
//   Cave    — left+right cave walls, top stalactites, bottom stalagmites
//   Snow    — bottom snow drifts, left+right snow piles, top icicles
//
// Hiding zones (creature x/y fractions that fall behind foreground elements):
//   forest  — left trunk x∈[0.03,0.09], right trunk x∈[0.91,0.97],
//             top branch x∈[0.03,0.32]&y∈[0.03,0.12], grass y∈[0.77,0.84]
//   meadow  — grass y∈[0.76,0.84], left tuft x∈[0.02,0.09]&y∈[0.57,0.77],
//             right tuft x∈[0.91,0.98]&y∈[0.59,0.77]
//   beach   — sand y∈[0.80,0.87], left rock x∈[0.02,0.13]&y∈[0.67,0.82],
//             right rock x∈[0.87,0.98]&y∈[0.64,0.82]
//   cave    — left wall x∈[0.02,0.08], right wall x∈[0.92,0.98],
//             stalactites y∈[0.02,0.15], stalagmites y∈[0.77,0.86]
//   snow    — drifts y∈[0.79,0.87], left pile x∈[0.02,0.11]&y∈[0.70,0.80],
//             right pile x∈[0.89,0.98]&y∈[0.70,0.80], icicles y∈[0.03,0.14]

import type { SceneKind } from '../levels/levels';

// ---------------------------------------------------------------------------
// Individual foreground layers
// ---------------------------------------------------------------------------

function ForestForeground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Left tree trunk */}
      <path d="M0,0 H9 Q8,50 9,100 H0 Z" fill="#231508" />
      {/* Right tree trunk */}
      <path d="M91,0 Q92,50 91,100 H100 V0 Z" fill="#231508" />
      {/* Bark texture left */}
      <path d="M3,10 Q4,30 3,50 Q5,70 3,90" stroke="#2e1c0a" strokeWidth="1.2" fill="none" />
      {/* Bark texture right */}
      <path d="M97,10 Q96,30 97,50 Q95,70 97,90" stroke="#2e1c0a" strokeWidth="1.2" fill="none" />
      {/* Top-left pine bough */}
      <path d="M0,0 H34 Q29,6 23,7 Q17,10 11,8 Q6,12 0,13 Z" fill="#1b360d" />
      {/* Pine needle details */}
      <path d="M12,8 L10,3 M18,7 L17,2 M24,6 L23,1" stroke="#142c0a" strokeWidth="0.8" fill="none" />
      {/* Bottom ground band */}
      <rect x="0" y="79" width="100" height="21" fill="#152b09" />
      {/* Grass blades */}
      <path
        d="M3,79 L5,68 L7,79
           M10,79 L12,72 L14,79
           M18,79 L20,66 L22,79
           M26,79 L28,70 L30,79
           M34,79 L36,67 L38,79
           M43,79 L45,64 L47,79
           M52,79 L54,69 L56,79
           M60,79 L62,71 L64,79
           M68,79 L70,65 L72,79
           M77,79 L79,70 L81,79
           M85,79 L87,66 L89,79
           M93,79 L95,71 L97,79"
        fill="#1e4011"
      />
    </svg>
  );
}

function MeadowForeground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Bottom grass band */}
      <rect x="0" y="78" width="100" height="22" fill="#163009" />
      {/* Tall grass blades across full width */}
      <path
        d="M2,78 L4,63 L6,78
           M9,78 L11,67 L13,78
           M16,78 L18,62 L20,78
           M23,78 L25,65 L27,78
           M31,78 L33,64 L35,78
           M39,78 L41,60 L43,78
           M47,78 L49,66 L51,78
           M55,78 L57,62 L59,78
           M63,78 L65,67 L67,78
           M71,78 L73,63 L75,78
           M79,78 L81,65 L83,78
           M87,78 L89,61 L91,78
           M95,78 L97,64 L99,78"
        fill="#224d10"
      />
      {/* Left edge grass tuft cluster */}
      <path
        d="M0,59 L3,48 L5,59
           M0,63 L4,53 L7,63
           M0,67 L5,58 L8,67"
        fill="#1e4810"
      />
      <rect x="0" y="67" width="9" height="11" fill="#163009" />
      {/* Right edge grass tuft cluster */}
      <path
        d="M95,59 L97,48 L100,59
           M93,63 L97,53 L100,63
           M92,67 L96,58 L100,67"
        fill="#1e4810"
      />
      <rect x="91" y="67" width="9" height="11" fill="#163009" />
    </svg>
  );
}

function BeachForeground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Bottom sand dunes — smooth waves */}
      <path
        d="M0,85 Q15,79 30,84 Q45,79 60,84 Q75,78 90,84 Q95,80 100,85 V100 H0 Z"
        fill="#5c420f"
      />
      {/* Sand ripple lines */}
      <path d="M10,90 Q30,87 50,90 Q70,87 90,90" stroke="#6e5218" strokeWidth="0.7" fill="none" />
      <path d="M5,94 Q25,92 45,94 Q65,92 85,94" stroke="#6e5218" strokeWidth="0.5" fill="none" />
      {/* Left seaweed strands */}
      <path d="M3,68 Q6,61 5,55 Q8,49 6,43" stroke="#1e4a14" strokeWidth="1.4" fill="none" />
      <path d="M6,70 Q9,63 8,57 Q11,51 9,46" stroke="#1a4010" strokeWidth="1.2" fill="none" />
      {/* Left boulder */}
      <path d="M0,68 H13 Q14,74 12,82 H0 Z" fill="#3a2e0a" />
      <path d="M2,71 Q7,69 11,72" stroke="#4a3c14" strokeWidth="0.8" fill="none" />
      {/* Right boulder */}
      <path d="M87,65 Q93,63 100,65 V82 L88,83 Z" fill="#3a2e0a" />
      <path d="M89,69 Q94,67 98,70" stroke="#4a3c14" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function CaveForeground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Left cave wall */}
      <rect x="0" y="0" width="8" height="100" fill="#1c1812" />
      {/* Right cave wall */}
      <rect x="92" y="0" width="8" height="100" fill="#1c1812" />
      {/* Wall crack detail left */}
      <path d="M4,20 Q3,35 5,50 Q4,65 3,80" stroke="#2a221a" strokeWidth="0.9" fill="none" />
      {/* Wall crack detail right */}
      <path d="M96,20 Q97,35 95,50 Q96,65 97,80" stroke="#2a221a" strokeWidth="0.9" fill="none" />
      {/* Stalactites hanging from top */}
      <path
        d="M8,0 L12,14 L16,0
           M19,0 L24,17 L29,0
           M31,0 L36,13 L41,0
           M43,0 L48,18 L53,0
           M55,0 L60,13 L65,0
           M67,0 L72,16 L77,0
           M79,0 L84,15 L89,0
           M90,0 L91,10 L92,0"
        fill="#1a1610"
      />
      {/* Mineral glint on stalactites */}
      <path d="M12,4 L13,10 M24,5 L25,12 M36,3 L37,9 M48,5 L49,13" stroke="#2e2820" strokeWidth="0.6" fill="none" />
      {/* Stalagmites rising from bottom */}
      <path
        d="M8,100 L13,79 L18,100
           M20,100 L26,82 L32,100
           M34,100 L40,78 L46,100
           M48,100 L54,81 L60,100
           M62,100 L68,80 L74,100
           M76,100 L82,83 L88,100
           M89,100 L90,82 L92,100"
        fill="#1a1610"
      />
    </svg>
  );
}

function SnowForeground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Icicles hanging from top */}
      <path
        d="M9,0 L11,13 L13,0
           M17,0 L20,16 L23,0
           M27,0 L29,11 L31,0
           M35,0 L38,17 L41,0
           M45,0 L48,12 L51,0
           M55,0 L58,15 L61,0
           M65,0 L68,11 L71,0
           M75,0 L78,16 L81,0
           M85,0 L88,13 L91,0"
        fill="#4a6478"
      />
      {/* Icicle shine detail */}
      <path d="M11,2 L11,8 M20,3 L20,10 M29,2 L29,8 M38,3 L38,11" stroke="#5c7a8e" strokeWidth="0.5" fill="none" />
      {/* Left snow pile */}
      <path d="M0,72 Q5,65 11,72 V82 H0 Z" fill="#3a5060" />
      <path d="M1,74 Q5,70 10,74" stroke="#4a6272" strokeWidth="0.7" fill="none" />
      {/* Right snow pile */}
      <path d="M89,72 Q95,65 100,72 V82 H89 Z" fill="#3a5060" />
      <path d="M90,74 Q95,70 99,74" stroke="#4a6272" strokeWidth="0.7" fill="none" />
      {/* Bottom snow drifts */}
      <path
        d="M0,84 Q14,78 28,83 Q42,78 56,83 Q70,77 84,83 Q92,80 100,84 V100 H0 Z"
        fill="#3a5060"
      />
      {/* Snow surface sheen */}
      <path
        d="M5,88 Q25,85 45,88 Q65,85 85,88"
        stroke="#4a6474"
        strokeWidth="0.8"
        fill="none"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface SceneForegroundProps {
  scene: SceneKind;
}

export function SceneForeground({ scene }: SceneForegroundProps) {
  switch (scene) {
    case 'forest': return <ForestForeground />;
    case 'meadow': return <MeadowForeground />;
    case 'beach':  return <BeachForeground />;
    case 'cave':   return <CaveForeground />;
    case 'snow':   return <SnowForeground />;
  }
}
