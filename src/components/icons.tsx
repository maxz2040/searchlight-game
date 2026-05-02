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
 * Lantern bloom — celebration crown on Complete card.
 * All colours are sRGB hex (computed from the OKLCH design tokens above)
 * so they render correctly on Safari < 15.4 where oklch() is unsupported
 * in SVG fill attributes.
 */
export function ConfettiIcon(props: Props) {
  // sRGB hex equivalents of the OKLCH design-system primitives.
  const c100 = '#f8eedd';  // lantern-100 / spotlight-warm
  const c200 = '#ead9a8';  // lantern-200
  const c300 = '#e0c87a';  // lantern-300
  const c500 = '#d4a73c';  // lantern-500 / spotlight-edge
  const c700 = '#a07828';  // lantern-700 / accent
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="32" r="14" fill={c100} />
      <circle cx="32" cy="32" r="9"  fill={c500} />
      <path d="M32 32 L 12 8"  stroke={c700} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 32 L 56 12" stroke={c500} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 32 L 8 36"  stroke={c300} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 32 L 58 50" stroke={c700} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="11" cy="11" r="2.5" fill={c700} />
      <circle cx="55" cy="14" r="2.2" fill={c500} />
      <circle cx="9"  cy="38" r="2.2" fill={c200} />
      <circle cx="56" cy="50" r="2.4" fill={c500} />
    </svg>
  );
}
