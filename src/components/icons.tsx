// Inline SVG icons. Replaces emoji that previously rendered as missing-
// glyph boxes when the bundled Fredoka font (and the system font fallback
// in headless chromium / iPad Safari without colour-emoji glyphs) couldn't
// resolve them. Keeping them as React components means the components
// can colour them from CSS variables.
//
// iPad Safari note: SVG fill/stroke attributes in JSX do NOT go through
// PostCSS or Lightning CSS, so oklch() literals inside JS strings are NOT
// autoprefixed. All colours here use sRGB hex equivalents so they render
// correctly on Safari < 15.4 (which doesn't support oklch()). The hex
// values are computed from the design-system OKLCH primitives:
//   oklch(96% 0.04  82) → #f8eedd   (spotlight-warm / lantern-100)
//   oklch(92% 0.07  80) → #ead9a8   (lantern-200)
//   oklch(88% 0.10  76) → #e0c87a   (lantern-300)
//   oklch(82% 0.16  72) → #d4a73c   (spotlight-edge / lantern-500)
//   oklch(64% 0.16  58) → #a07828   (accent / lantern-700)

import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

export function LanternIcon(props: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M19 8h10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="16"
        y="9"
        width="16"
        height="4"
        rx="1.5"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M14 17 L34 17 L32 38 L16 38 Z"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 21c-3 2-4 4-4 6.5C20 30.5 22 32 24 32s4-1.5 4-4.5c0-2.5-1-4.5-4-6.5Z"
        fill="currentColor"
      />
      <rect
        x="14"
        y="38"
        width="20"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

export function SparkleIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2 L13.6 9.2 L21 12 L13.6 14.8 L12 22 L10.4 14.8 L3 12 L10.4 9.2 Z"
        fill="currentColor"
      />
      <circle cx="19" cy="5" r="1.4" fill="currentColor" opacity="0.7" />
      <circle cx="5" cy="19" r="1.1" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export function ArrowRightIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M9 6 L15 12 L9 18"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 5.5 L8 18.5 L19 12 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * Confetti trophy — celebration icon on Complete card.
 * Redesigned for maximum celebration energy: a warm radiant trophy surrounded
 * by colourful confetti bursts and floating dots.
 * All colours are sRGB hex (computed from the OKLCH design tokens above)
 * so they render correctly on Safari < 15.4 where oklch() is unsupported
 * in SVG fill attributes.
 */
export function PawIcon(props: Props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      {/* Two top toe-pads */}
      <ellipse cx="5.5"  cy="4.5" rx="2.2" ry="2.8" />
      <ellipse cx="10"   cy="3.2" rx="2.2" ry="2.8" />
      <ellipse cx="14.5" cy="4.5" rx="2.2" ry="2.8" />
      {/* Main palm pad */}
      <path d="M4.5 9.5 Q2 12.5 3.5 15.5 Q5 18 10 17.5 Q15 18 16.5 15.5 Q18 12.5 15.5 9.5 Q13 7.5 10 7.8 Q7 7.5 4.5 9.5Z" />
    </svg>
  );
}

export function ConfettiIcon(props: Props) {
  const c100 = '#f8eedd';  // lantern-100 / spotlight-warm
  const c200 = '#ead9a8';  // lantern-200
  const c300 = '#e0c87a';  // lantern-300
  const c500 = '#d4a73c';  // lantern-500 / spotlight-edge
  const c700 = '#a07828';  // lantern-700 / accent
  // Celebration colours for confetti bursts
  const red    = '#f87171';
  const green  = '#86efac';
  const blue   = '#93c5fd';
  const purple = '#c4b5fd';
  return (
    <svg viewBox="0 0 96 96" fill="none" {...props}>
      {/* Outer warm glow ring */}
      <circle cx="48" cy="48" r="38" fill={c500} opacity="0.10" />
      <circle cx="48" cy="48" r="29" fill={c500} opacity="0.14" />

      {/* Trophy cup body */}
      <path
        d="M34 28 L34 52 Q34 62 48 62 Q62 62 62 52 L62 28 Z"
        fill={c300}
        stroke={c700}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Trophy cup shine */}
      <path
        d="M38 32 L38 50 Q38 58 48 58"
        stroke={c100}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Trophy handles */}
      <path d="M34 34 Q24 34 24 42 Q24 50 34 50" stroke={c700} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M62 34 Q72 34 72 42 Q72 50 62 50" stroke={c700} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Trophy base stem */}
      <rect x="43" y="62" width="10" height="7" rx="1.5" fill={c700} />
      {/* Trophy base plate */}
      <rect x="36" y="68" width="24" height="5" rx="2.5" fill={c700} />
      {/* Star on cup */}
      <path
        d="M48 36 L50 41.5 L56 42 L51.5 46 L53 52 L48 49 L43 52 L44.5 46 L40 42 L46 41.5 Z"
        fill={c100}
        opacity="0.90"
      />

      {/* Confetti bursts — scattered around the trophy */}
      <rect x="14" y="14" width="6" height="6" rx="1.5" fill={red}    transform="rotate(20 17 17)" />
      <rect x="74" y="12" width="5" height="5" rx="1.2" fill={green}  transform="rotate(-15 77 15)" />
      <rect x="10" y="56" width="5" height="5" rx="1.2" fill={blue}   transform="rotate(35 13 59)" />
      <rect x="76" y="58" width="6" height="6" rx="1.5" fill={purple} transform="rotate(-25 79 61)" />
      <rect x="22" y="72" width="5" height="5" rx="1.2" fill={c300}   transform="rotate(10 25 75)" />
      <rect x="66" y="74" width="5" height="5" rx="1.2" fill={red}    transform="rotate(40 69 77)" />

      {/* Floating sparkle dots */}
      <circle cx="20" cy="30" r="3"   fill={c200}  />
      <circle cx="76" cy="28" r="2.5" fill={green} />
      <circle cx="16" cy="70" r="2.5" fill={purple}/>
      <circle cx="80" cy="72" r="3"   fill={c500}  />
      <circle cx="48" cy="10" r="2.5" fill={red}   />
      <circle cx="30" cy="82" r="2"   fill={blue}  />
      <circle cx="66" cy="82" r="2"   fill={c300}  />

      {/* Streamers */}
      <path d="M22 22 Q30 16 28 8"  stroke={red}    strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M74 20 Q68 14 72 8"  stroke={blue}   strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M18 48 Q10 42 12 34" stroke={green}  strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M78 46 Q86 40 84 32" stroke={purple} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
