// SvgCreature — 12 original inline SVG characters + 88 new ones via batch files.
// All shapes are original artwork, no external assets required.
// Each fits a 100×100 viewBox. The CSS filter in Creature.tsx handles the
// hidden/found visual states (brightness, drop-shadow).
// Each creature wraps its content in <g className="creature-{anim}"> so it
// animates on its own rhythm (bob/wiggle/flutter/spin-slow/pulse/bounce-hop/sway).

import type { CreatureKind } from '../levels/levels';
import { SVG_BATCH_A } from '../creatures/svgs-a';
import { SVG_BATCH_B } from '../creatures/svgs-b';
import { SVG_BATCH_C } from '../creatures/svgs-c';

export const SVG_KINDS = new Set<CreatureKind>([
  // Original 12
  'bunny', 'bear-cub', 'owl', 'frog-pal', 'bee-buzz',
  'kitty', 'turtle-shell', 'star-pal', 'moon-kid',
  'fox-pup', 'penguin-pal', 'duck-bill',
  // Batch A (29)
  ...(Object.keys(SVG_BATCH_A) as CreatureKind[]),
  // Batch B (29)
  ...(Object.keys(SVG_BATCH_B) as CreatureKind[]),
  // Batch C (30)
  ...(Object.keys(SVG_BATCH_C) as CreatureKind[]),
]);

export function isSvgKind(kind: CreatureKind): boolean {
  return SVG_KINDS.has(kind);
}

// ---------------------------------------------------------------------------
// Original 12 creatures — each wrapped in its personality animation.
// ---------------------------------------------------------------------------

function Bunny() {
  return (
    <g className="creature-bounce-hop">
      <ellipse cx="36" cy="26" rx="7" ry="17" fill="#ede8e0"/>
      <ellipse cx="36" cy="26" rx="4.5" ry="13" fill="#f4b8c0"/>
      <ellipse cx="64" cy="26" rx="7" ry="17" fill="#ede8e0"/>
      <ellipse cx="64" cy="26" rx="4.5" ry="13" fill="#f4b8c0"/>
      <ellipse cx="50" cy="72" rx="22" ry="18" fill="#ede8e0"/>
      <circle cx="50" cy="50" r="22" fill="#ede8e0"/>
      <circle cx="42" cy="45" r="5" fill="#1a1a2e"/>
      <circle cx="58" cy="45" r="5" fill="#1a1a2e"/>
      <circle cx="44" cy="43" r="2" fill="white"/>
      <circle cx="60" cy="43" r="2" fill="white"/>
      <ellipse cx="50" cy="54" rx="3.5" ry="2.5" fill="#f4b8c0"/>
      <path d="M46 57 Q50 62 54 57" fill="none" stroke="#c4a0a8" strokeWidth="1.8" strokeLinecap="round"/>
    </g>
  );
}

function BearCub() {
  return (
    <g className="creature-bob">
      <circle cx="32" cy="27" r="13" fill="#8b5e3c"/>
      <circle cx="68" cy="27" r="13" fill="#8b5e3c"/>
      <circle cx="32" cy="27" r="8" fill="#c4845a"/>
      <circle cx="68" cy="27" r="8" fill="#c4845a"/>
      <ellipse cx="50" cy="72" rx="26" ry="20" fill="#8b5e3c"/>
      <circle cx="50" cy="50" r="26" fill="#8b5e3c"/>
      <ellipse cx="50" cy="59" rx="15" ry="11" fill="#c4845a"/>
      <circle cx="40" cy="44" r="5.5" fill="#1a1a2e"/>
      <circle cx="60" cy="44" r="5.5" fill="#1a1a2e"/>
      <circle cx="42" cy="42" r="2" fill="white"/>
      <circle cx="62" cy="42" r="2" fill="white"/>
      <ellipse cx="50" cy="55" rx="4" ry="3" fill="#2d1a0e"/>
      <path d="M46 60 Q50 65 54 60" fill="none" stroke="#5a3020" strokeWidth="1.8" strokeLinecap="round"/>
    </g>
  );
}

function Owl() {
  return (
    <g className="creature-bob">
      <ellipse cx="50" cy="68" rx="24" ry="26" fill="#9e7a4a"/>
      <ellipse cx="28" cy="68" rx="10" ry="18" fill="#7a5e38" transform="rotate(-12 28 68)"/>
      <ellipse cx="72" cy="68" rx="10" ry="18" fill="#7a5e38" transform="rotate(12 72 68)"/>
      <circle cx="50" cy="42" r="24" fill="#9e7a4a"/>
      <polygon points="36,24 28,10 42,20" fill="#7a5e38"/>
      <polygon points="64,24 72,10 58,20" fill="#7a5e38"/>
      <circle cx="40" cy="42" r="11" fill="#f8f0e0"/>
      <circle cx="60" cy="42" r="11" fill="#f8f0e0"/>
      <circle cx="40" cy="42" r="7" fill="#1a1a2e"/>
      <circle cx="60" cy="42" r="7" fill="#1a1a2e"/>
      <circle cx="42" cy="40" r="2.5" fill="white"/>
      <circle cx="62" cy="40" r="2.5" fill="white"/>
      <polygon points="50,49 44,56 56,56" fill="#e0a030"/>
      <ellipse cx="50" cy="68" rx="15" ry="18" fill="#c4a870"/>
      <path d="M42 62 Q50 65 58 62" fill="none" stroke="#9e7a4a" strokeWidth="1.5"/>
      <path d="M40 70 Q50 74 60 70" fill="none" stroke="#9e7a4a" strokeWidth="1.5"/>
    </g>
  );
}

function FrogPal() {
  return (
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="70" rx="28" ry="24" fill="#5cb85c"/>
      <ellipse cx="50" cy="73" rx="18" ry="16" fill="#a8e6a0"/>
      <circle cx="50" cy="46" r="26" fill="#5cb85c"/>
      <circle cx="36" cy="28" r="11" fill="#5cb85c"/>
      <circle cx="64" cy="28" r="11" fill="#5cb85c"/>
      <circle cx="36" cy="28" r="8" fill="#f8f0e0"/>
      <circle cx="64" cy="28" r="8" fill="#f8f0e0"/>
      <circle cx="36" cy="28" r="5" fill="#1a1a2e"/>
      <circle cx="64" cy="28" r="5" fill="#1a1a2e"/>
      <circle cx="37" cy="26" r="2" fill="white"/>
      <circle cx="65" cy="26" r="2" fill="white"/>
      <path d="M36 57 Q50 70 64 57" fill="none" stroke="#3a8a3a" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="45" cy="50" r="2.5" fill="#3a8a3a"/>
      <circle cx="55" cy="50" r="2.5" fill="#3a8a3a"/>
    </g>
  );
}

function BeeBuzz() {
  return (
    <g className="creature-flutter">
      <ellipse cx="28" cy="36" rx="16" ry="10" fill="rgba(200,228,255,0.80)" transform="rotate(-22 28 36)"/>
      <ellipse cx="72" cy="36" rx="16" ry="10" fill="rgba(200,228,255,0.80)" transform="rotate(22 72 36)"/>
      <ellipse cx="24" cy="47" rx="12" ry="8" fill="rgba(200,228,255,0.65)" transform="rotate(-28 24 47)"/>
      <ellipse cx="76" cy="47" rx="12" ry="8" fill="rgba(200,228,255,0.65)" transform="rotate(28 76 47)"/>
      <ellipse cx="50" cy="62" rx="20" ry="28" fill="#f5c518"/>
      <rect x="30" y="50" width="40" height="8" rx="2" fill="#1a1a2e"/>
      <rect x="30" y="63" width="40" height="8" rx="2" fill="#1a1a2e"/>
      <polygon points="50,90 45,80 55,80" fill="#e0a030"/>
      <circle cx="50" cy="33" r="18" fill="#f5c518"/>
      <circle cx="42" cy="30" r="5" fill="#1a1a2e"/>
      <circle cx="58" cy="30" r="5" fill="#1a1a2e"/>
      <circle cx="44" cy="28" r="2" fill="white"/>
      <circle cx="60" cy="28" r="2" fill="white"/>
      <path d="M44 16 Q36 6 28 8" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M56 16 Q64 6 72 8" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="28" cy="8" r="3.5" fill="#1a1a2e"/>
      <circle cx="72" cy="8" r="3.5" fill="#1a1a2e"/>
      <path d="M44 38 Q50 43 56 38" fill="none" stroke="#8b5e00" strokeWidth="1.8" strokeLinecap="round"/>
    </g>
  );
}

function Kitty() {
  return (
    <g className="creature-wiggle">
      <path d="M72 70 Q88 56 88 42 Q84 32 76 38 Q80 50 76 62 Q74 68 72 70" fill="#e8924a"/>
      <path d="M72 70 Q86 57 85 44 Q82 36 76 40 Q79 51 76 63 Q74 68 72 70" fill="#f5d0a8"/>
      <ellipse cx="46" cy="73" rx="28" ry="21" fill="#e8924a"/>
      <ellipse cx="46" cy="76" rx="17" ry="14" fill="#f5d0a8"/>
      <circle cx="46" cy="47" r="26" fill="#e8924a"/>
      <polygon points="26,33 20,12 40,28" fill="#e8924a"/>
      <polygon points="66,33 72,12 54,28" fill="#e8924a"/>
      <polygon points="28,31 24,16 38,27" fill="#f4b8c0"/>
      <polygon points="64,31 68,16 56,27" fill="#f4b8c0"/>
      <circle cx="38" cy="43" r="6.5" fill="#4a9e4a"/>
      <circle cx="58" cy="43" r="6.5" fill="#4a9e4a"/>
      <ellipse cx="38" cy="43" rx="3.5" ry="5.5" fill="#1a1a2e"/>
      <ellipse cx="58" cy="43" rx="3.5" ry="5.5" fill="#1a1a2e"/>
      <circle cx="40" cy="40" r="1.8" fill="white"/>
      <circle cx="60" cy="40" r="1.8" fill="white"/>
      <ellipse cx="46" cy="54" rx="3" ry="2.5" fill="#f4b8c0"/>
      <path d="M32 52 L43 55" stroke="#8b5e38" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M32 56 L43 56" stroke="#8b5e38" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M49 55 L60 52" stroke="#8b5e38" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M49 56 L60 56" stroke="#8b5e38" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M42 58 Q46 63 50 58" fill="none" stroke="#c4845a" strokeWidth="1.8" strokeLinecap="round"/>
    </g>
  );
}

function TurtleShell() {
  return (
    <g className="creature-bob">
      <ellipse cx="25" cy="64" rx="11" ry="9" fill="#5a9e4a" transform="rotate(-20 25 64)"/>
      <ellipse cx="75" cy="64" rx="11" ry="9" fill="#5a9e4a" transform="rotate(20 75 64)"/>
      <ellipse cx="28" cy="80" rx="11" ry="9" fill="#5a9e4a" transform="rotate(12 28 80)"/>
      <ellipse cx="72" cy="80" rx="11" ry="9" fill="#5a9e4a" transform="rotate(-12 72 80)"/>
      <ellipse cx="50" cy="63" rx="30" ry="26" fill="#4a7c2a"/>
      <polygon points="50,42 37,52 41,68 59,68 63,52" fill="#3a6020" opacity="0.55"/>
      <polygon points="33,55 20,62 26,76 41,73" fill="#3a6020" opacity="0.45"/>
      <polygon points="67,55 80,62 74,76 59,73" fill="#3a6020" opacity="0.45"/>
      <ellipse cx="50" cy="63" rx="30" ry="26" fill="none" stroke="#3a6020" strokeWidth="2"/>
      <circle cx="50" cy="37" r="16" fill="#5a9e4a"/>
      <circle cx="44" cy="33" r="5" fill="#1a1a2e"/>
      <circle cx="56" cy="33" r="5" fill="#1a1a2e"/>
      <circle cx="46" cy="31" r="2" fill="white"/>
      <circle cx="58" cy="31" r="2" fill="white"/>
      <path d="M44 42 Q50 48 56 42" fill="none" stroke="#3a7030" strokeWidth="2" strokeLinecap="round"/>
    </g>
  );
}

function StarPal() {
  return (
    <g className="creature-spin-slow">
      <polygon
        points="50,8 60,36 90,36 66,54 76,82 50,64 24,82 34,54 10,36 40,36"
        fill="#f5c518" stroke="#d4a020" strokeWidth="1.5" strokeLinejoin="round"
      />
      <polygon
        points="50,18 57,36 76,36 61,47 66,65 50,55 34,65 39,47 24,36 43,36"
        fill="#f8d840" opacity="0.45"
      />
      <circle cx="43" cy="46" r="5.5" fill="#1a1a2e"/>
      <circle cx="57" cy="46" r="5.5" fill="#1a1a2e"/>
      <circle cx="45" cy="44" r="2" fill="white"/>
      <circle cx="59" cy="44" r="2" fill="white"/>
      <path d="M43 56 Q50 63 57 56" fill="none" stroke="#a07020" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="3" fill="#f8d840"/>
      <circle cx="80" cy="18" r="2.5" fill="#f8d840"/>
      <circle cx="14" cy="52" r="2" fill="#f8d840"/>
      <circle cx="86" cy="52" r="3" fill="#f8d840"/>
    </g>
  );
}

function MoonKid() {
  return (
    <g className="creature-pulse">
      <circle cx="50" cy="50" r="38" fill="#6ec6e8"/>
      <circle cx="66" cy="43" r="30" fill="#0a0e1e"/>
      <circle cx="34" cy="48" r="6" fill="#1a1a2e"/>
      <circle cx="44" cy="36" r="5" fill="#1a1a2e"/>
      <circle cx="36" cy="46" r="2.2" fill="white"/>
      <circle cx="46" cy="34" r="2" fill="white"/>
      <path d="M30 57 Q37 65 45 59" fill="none" stroke="#1e4a6e" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M70 22 L72 16 L74 22 L80 24 L74 26 L72 32 L70 26 L64 24 Z" fill="#f8eedd" opacity="0.9"/>
      <path d="M80 60 L81.5 55 L83 60 L88 62 L83 64 L81.5 69 L80 64 L75 62 Z" fill="#f8eedd" opacity="0.8"/>
      <circle cx="78" cy="36" r="2.5" fill="#f8eedd"/>
      <circle cx="74" cy="76" r="3" fill="#f8eedd"/>
    </g>
  );
}

function FoxPup() {
  return (
    <g className="creature-wiggle">
      <path d="M68 78 Q88 68 90 50 Q92 34 80 32 Q72 40 76 55 Q78 68 68 78" fill="#e8694a"/>
      <path d="M68 78 Q86 70 87 52 Q88 38 80 36 Q73 43 76 56 Q77 66 68 78" fill="#f5f0e8"/>
      <ellipse cx="45" cy="72" rx="28" ry="21" fill="#e8694a"/>
      <ellipse cx="45" cy="75" rx="16" ry="14" fill="#f5f0e8"/>
      <circle cx="45" cy="46" r="26" fill="#e8694a"/>
      <polygon points="24,33 18,10 38,27" fill="#e8694a"/>
      <polygon points="66,33 70,10 54,27" fill="#e8694a"/>
      <polygon points="26,31 22,14 36,26" fill="#c94a2a"/>
      <polygon points="64,31 68,14 56,26" fill="#c94a2a"/>
      <ellipse cx="45" cy="54" rx="15" ry="11" fill="#f5f0e8"/>
      <circle cx="37" cy="41" r="6" fill="#1a1a2e"/>
      <circle cx="55" cy="41" r="6" fill="#1a1a2e"/>
      <circle cx="39" cy="39" r="2" fill="white"/>
      <circle cx="57" cy="39" r="2" fill="white"/>
      <ellipse cx="45" cy="50" rx="3.5" ry="2.5" fill="#2d1a0e"/>
      <path d="M41 55 Q45 60 49 55" fill="none" stroke="#8b3a2a" strokeWidth="1.8" strokeLinecap="round"/>
    </g>
  );
}

function PenguinPal() {
  return (
    <g className="creature-bounce-hop">
      <ellipse cx="50" cy="66" rx="26" ry="30" fill="#1a1a2e"/>
      <ellipse cx="50" cy="69" rx="15" ry="22" fill="#f5f0e8"/>
      <ellipse cx="23" cy="65" rx="9" ry="20" fill="#1a1a2e" transform="rotate(-10 23 65)"/>
      <ellipse cx="77" cy="65" rx="9" ry="20" fill="#1a1a2e" transform="rotate(10 77 65)"/>
      <circle cx="50" cy="37" r="22" fill="#1a1a2e"/>
      <circle cx="41" cy="33" r="9.5" fill="#f5f0e8"/>
      <circle cx="59" cy="33" r="9.5" fill="#f5f0e8"/>
      <circle cx="41" cy="33" r="6" fill="#1a1a2e"/>
      <circle cx="59" cy="33" r="6" fill="#1a1a2e"/>
      <circle cx="43" cy="31" r="2.2" fill="white"/>
      <circle cx="61" cy="31" r="2.2" fill="white"/>
      <polygon points="50,41 44,50 56,50" fill="#e0800a"/>
      <polygon points="35,96 26,88 44,88" fill="#e0800a"/>
      <polygon points="65,96 56,88 74,88" fill="#e0800a"/>
    </g>
  );
}

function DuckBill() {
  return (
    <g className="creature-bob">
      <ellipse cx="50" cy="67" rx="28" ry="25" fill="#f5c518"/>
      <ellipse cx="50" cy="70" rx="23" ry="17" fill="#e0a820" opacity="0.55"/>
      <circle cx="50" cy="41" r="22" fill="#f5c518"/>
      <ellipse cx="50" cy="57" rx="15" ry="7" fill="#f0a030"/>
      <ellipse cx="50" cy="53" rx="15" ry="5.5" fill="#e0800a"/>
      <circle cx="44" cy="53" r="2" fill="#c06820"/>
      <circle cx="56" cy="53" r="2" fill="#c06820"/>
      <circle cx="40" cy="37" r="5.5" fill="#1a1a2e"/>
      <circle cx="60" cy="37" r="5.5" fill="#1a1a2e"/>
      <circle cx="42" cy="35" r="2" fill="white"/>
      <circle cx="62" cy="35" r="2" fill="white"/>
      <path d="M42 25 Q50 20 58 25 Q52 30 48 30 Q44 30 42 25" fill="#4a9ecf"/>
      <path d="M42 25 L37 18 L46 21 Z" fill="#3a8bbf"/>
      <path d="M58 25 L63 18 L54 21 Z" fill="#3a8bbf"/>
      <circle cx="50" cy="25" r="4" fill="#4a9ecf"/>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Merged creature map — original 12 + all three batches.
// ---------------------------------------------------------------------------

const ORIGINAL_MAP: Partial<Record<CreatureKind, () => React.ReactElement>> = {
  'bunny':        Bunny,
  'bear-cub':     BearCub,
  'owl':          Owl,
  'frog-pal':     FrogPal,
  'bee-buzz':     BeeBuzz,
  'kitty':        Kitty,
  'turtle-shell': TurtleShell,
  'star-pal':     StarPal,
  'moon-kid':     MoonKid,
  'fox-pup':      FoxPup,
  'penguin-pal':  PenguinPal,
  'duck-bill':    DuckBill,
};

const CREATURE_MAP: Partial<Record<CreatureKind, () => React.ReactElement>> = {
  ...ORIGINAL_MAP,
  ...(SVG_BATCH_A as Partial<Record<CreatureKind, () => React.ReactElement>>),
  ...(SVG_BATCH_B as Partial<Record<CreatureKind, () => React.ReactElement>>),
  ...(SVG_BATCH_C as Partial<Record<CreatureKind, () => React.ReactElement>>),
};

interface Props {
  kind: CreatureKind;
  className?: string;
  style?: React.CSSProperties;
}

export function SvgCreature({ kind, className, style }: Props) {
  const Body = CREATURE_MAP[kind];
  if (!Body) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-full w-full${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden
    >
      <Body />
    </svg>
  );
}
