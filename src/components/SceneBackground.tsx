// Hand-painted SVG backgrounds for v0. Each scene is a layered SVG
// with parallax-friendly silhouettes, designed to be visually pleasing
// when partially revealed by the spotlight.
//
// FUTURE EXTENSION: replace this component with an <img src={url} />
// pulling from /api/scene once the AI generation pipeline is wired
// (PRD §Backend). The component contract is intentionally narrow —
// it just renders something that fills the parent.

import type { SceneKind } from '../levels/levels';

export function SceneBackground({ scene }: { scene: SceneKind }) {
  switch (scene) {
    case 'forest':
      return <Forest />;
    case 'meadow':
      return <Meadow />;
    case 'beach':
      return <Beach />;
  }
}

function Forest() {
  return (
    <svg
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky-forest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2e4f" />
          <stop offset="60%" stopColor="#2c5b6b" />
          <stop offset="100%" stopColor="#3f6e3a" />
        </linearGradient>
        <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="700" fill="url(#sky-forest)" />
      <circle cx="800" cy="120" r="60" fill="#fff8e7" opacity="0.85" />
      <circle cx="800" cy="120" r="180" fill="url(#moon-glow)" />
      {/* Distant hills */}
      <path d="M0 460 Q150 380 300 440 T600 420 T1000 460 L1000 700 L0 700 Z" fill="#1f3a3a" />
      {/* Mid trees */}
      {[80, 220, 360, 540, 700, 870].map((cx, i) => (
        <g key={i} transform={`translate(${cx} 380)`}>
          <ellipse cx="0" cy="0" rx="55" ry="80" fill="#2d5230" />
          <rect x="-10" y="60" width="20" height="80" fill="#1a1410" />
        </g>
      ))}
      {/* Foreground bushes */}
      <path d="M0 600 Q120 540 250 600 T500 600 T750 600 T1000 600 L1000 700 L0 700 Z" fill="#0f2014" />
      {/* Fireflies */}
      {[
        [120, 280], [340, 220], [560, 340], [780, 260], [180, 480], [620, 510],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#ffe070" opacity="0.85" />
      ))}
    </svg>
  );
}

function Meadow() {
  return (
    <svg
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a1f5a" />
          <stop offset="40%" stopColor="#9d3a82" />
          <stop offset="80%" stopColor="#e8945c" />
          <stop offset="100%" stopColor="#f0b87f" />
        </linearGradient>
      </defs>
      <rect width="1000" height="700" fill="url(#sky-meadow)" />
      {/* Sun */}
      <circle cx="500" cy="450" r="90" fill="#ffd57a" opacity="0.95" />
      <circle cx="500" cy="450" r="160" fill="#ffd57a" opacity="0.18" />
      {/* Distant mountains */}
      <path d="M0 470 L160 320 L300 430 L480 290 L640 430 L820 340 L1000 460 L1000 700 L0 700 Z" fill="#5a2e6e" opacity="0.8" />
      {/* Mid hills */}
      <path d="M0 540 Q200 480 400 540 T800 540 T1000 540 L1000 700 L0 700 Z" fill="#3a1f5a" />
      {/* Tall grass tufts */}
      {Array.from({ length: 14 }).map((_, i) => (
        <path
          key={i}
          d={`M${50 + i * 70} 600 Q${55 + i * 70} 560 ${60 + i * 70} 600`}
          stroke="#1a0f2e"
          strokeWidth="3"
          fill="none"
        />
      ))}
      {/* Foreground silhouette */}
      <path d="M0 620 Q150 600 300 625 T600 620 T900 625 T1000 625 L1000 700 L0 700 Z" fill="#0a0518" />
    </svg>
  );
}

function Beach() {
  return (
    <svg
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky-beach" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a3a" />
          <stop offset="100%" stopColor="#1f2a5a" />
        </linearGradient>
        <linearGradient id="sea-beach" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3a6e" />
          <stop offset="100%" stopColor="#0f1f44" />
        </linearGradient>
      </defs>
      <rect width="1000" height="700" fill="url(#sky-beach)" />
      {/* Stars */}
      {[
        [80, 80], [160, 140], [240, 60], [320, 180], [420, 90], [520, 160],
        [620, 70], [720, 130], [820, 200], [900, 110], [60, 220], [180, 260],
        [380, 280], [580, 300], [780, 250], [880, 320],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} opacity="0.9">
          <circle r="2" fill="#fff8e7" />
          <circle r="6" fill="#fff8e7" opacity="0.15" />
        </g>
      ))}
      {/* Sea */}
      <rect x="0" y="380" width="1000" height="200" fill="url(#sea-beach)" />
      {/* Reflection of stars */}
      {[120, 380, 640, 880].map((x, i) => (
        <circle key={i} cx={x} cy={420 + i * 10} r="1.5" fill="#fff8e7" opacity="0.5" />
      ))}
      {/* Sand */}
      <path d="M0 580 Q200 560 400 580 T800 580 T1000 580 L1000 700 L0 700 Z" fill="#3d2a1a" />
      <path d="M0 620 Q150 605 300 625 T600 620 T900 625 T1000 620 L1000 700 L0 700 Z" fill="#1a0f08" />
      {/* Subtle tide line */}
      <path d="M0 580 Q200 575 400 582 T800 580 T1000 582" stroke="#e8c8a0" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  );
}
