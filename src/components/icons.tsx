// Inline SVG icons. Replaces emoji that previously rendered as missing-
// glyph boxes when the bundled Fredoka font (and the system font fallback
// in headless chromium / iPad Safari without colour-emoji glyphs) couldn't
// resolve them. Keeping them as React components means the components
// can colour them from CSS variables.
//
// All icons use currentColor for stroke/fill so a parent `text-paper` (or
// any tailwind text-* class) controls the colour.

import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

/** Glowing lantern — used in the loader and the tutorial entry. */
export function LanternIcon(props: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      {/* handle */}
      <path
        d="M19 8h10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* top cap */}
      <rect
        x="16"
        y="9"
        width="16"
        height="4"
        rx="1.5"
        fill="currentColor"
        opacity="0.85"
      />
      {/* body */}
      <path
        d="M14 17 L34 17 L32 38 L16 38 Z"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* flame */}
      <path
        d="M24 21c-3 2-4 4-4 6.5C20 30.5 22 32 24 32s4-1.5 4-4.5c0-2.5-1-4.5-4-6.5Z"
        fill="currentColor"
      />
      {/* base */}
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

/** 4-pointed sparkle. Used wherever a celebratory accent was needed. */
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

/** Right-pointing chevron — replaces the "→" in the Next-level CTA. */
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

/** Solid play triangle — replaces the "▶" in the skip button. */
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

/** Lantern bloom — used as the celebration crown on Complete card.
 *  v3 (impeccable) re-tone: every fill/stroke is in the SAME warm hue
 *  family (paper / lantern-100 / lantern-500 / brass), no rainbow
 *  primaries. The shape brief picks Restrained — one brand hue, neutrals
 *  tinted toward it. The bloom reads as "the lantern just flared with
 *  oil" instead of "party confetti" (which fights the bedtime scene).
 *  Fills use OKLCH literals matching the index.css primitives.
 */
export function ConfettiIcon(props: Props) {
  // Hue family: oklch(... 70-82) — tungsten amber.
  const c100 = 'oklch(96% 0.04 82)';     // soft glow
  const c300 = 'oklch(88% 0.10 76)';     // mid warm
  const c500 = 'oklch(82% 0.16 72)';     // flame edge (brand)
  const c700 = 'oklch(64% 0.16 58)';     // brass accent
  const c200 = 'oklch(92% 0.07 80)';     // pale halo
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      {/* Lantern light radiating outward — concentric warm discs. */}
      <circle cx="32" cy="32" r="14" fill={c100} />
      <circle cx="32" cy="32" r="9" fill={c500} />
      {/* Four warm rays — same hue family, varying lightness. */}
      <path d="M32 32 L 12 8"  stroke={c700} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 32 L 56 12" stroke={c500} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 32 L 8 36"  stroke={c300} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 32 L 58 50" stroke={c700} strokeWidth="3.5" strokeLinecap="round" />
      {/* Spark dots — also in-family, lightness-stepped. */}
      <circle cx="11" cy="11" r="2.5" fill={c700} />
      <circle cx="55" cy="14" r="2.2" fill={c500} />
      <circle cx="9"  cy="38" r="2.2" fill={c200} />
      <circle cx="56" cy="50" r="2.4" fill={c500} />
    </svg>
  );
}
