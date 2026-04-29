// Creature sprite — hand-drawn SVG inline so it scales crisply on
// any iPad pixel density. Each `kind` is a distinct silhouette so
// kids learn to recognise them across levels.
//
// FUTURE EXTENSION: when AI-generated scenes ship, individual creature
// PNGs/WebPs can be served from /api/creatures/<kind>.webp; this
// component can branch on a `srcUrl` prop while keeping the SVG path
// as the offline / pre-cached fallback.

import type { CreatureKind } from '../levels/levels';

interface Props {
  kind: CreatureKind;
  /** When false, render the silhouette only (the hidden-in-the-dark form). */
  found: boolean;
}

/** Palette per kind. The "dark" form is a near-solid silhouette tinted
 *  toward the night palette so it almost — but not quite — disappears
 *  into the background until the spotlight hits. */
const PALETTE: Record<CreatureKind, { body: string; accent: string; eye: string }> = {
  'leaf-pup':       { body: '#4ade80', accent: '#16a34a', eye: '#0a0d1f' },
  'flame-cub':      { body: '#fb923c', accent: '#dc2626', eye: '#0a0d1f' },
  'aqua-spark':     { body: '#60a5fa', accent: '#1d4ed8', eye: '#0a0d1f' },
  'bolt-bunny':     { body: '#fde047', accent: '#a16207', eye: '#0a0d1f' },
  'puff-bird':      { body: '#f9a8d4', accent: '#be185d', eye: '#0a0d1f' },
  'shroom-buddy':   { body: '#c084fc', accent: '#7e22ce', eye: '#0a0d1f' },
  'pebble-pal':     { body: '#a8a29e', accent: '#57534e', eye: '#0a0d1f' },
  'star-fish':      { body: '#facc15', accent: '#ca8a04', eye: '#0a0d1f' },
};

export function Creature({ kind, found }: Props) {
  const p = PALETTE[kind];
  const body = found ? p.body : '#0e1426';
  const accent = found ? p.accent : '#1a2138';
  const eye = found ? p.eye : '#0a0d1f';
  const opacity = found ? 1 : 0.85;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      style={{ opacity }}
      aria-hidden
    >
      {renderShape(kind, body, accent, eye)}
    </svg>
  );
}

function renderShape(kind: CreatureKind, body: string, accent: string, eye: string) {
  switch (kind) {
    case 'leaf-pup':
      return (
        <>
          <ellipse cx="50" cy="60" rx="32" ry="28" fill={body} />
          <path d="M50 28 Q40 14 38 30 Q44 32 50 28 Q56 32 62 30 Q60 14 50 28" fill={accent} />
          <circle cx="42" cy="58" r="3.5" fill={eye} />
          <circle cx="58" cy="58" r="3.5" fill={eye} />
          <path d="M44 70 Q50 74 56 70" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    case 'flame-cub':
      return (
        <>
          <ellipse cx="50" cy="62" rx="30" ry="26" fill={body} />
          <path d="M30 38 Q35 20 42 36 Q47 22 50 36 Q53 22 58 36 Q65 20 70 38 Z" fill={accent} />
          <circle cx="42" cy="60" r="3" fill={eye} />
          <circle cx="58" cy="60" r="3" fill={eye} />
          <ellipse cx="50" cy="72" rx="3" ry="2" fill={accent} />
        </>
      );
    case 'aqua-spark':
      return (
        <>
          <path d="M50 18 L72 50 L62 50 L70 82 L50 64 L30 82 L38 50 L28 50 Z" fill={body} />
          <circle cx="44" cy="48" r="2.5" fill={eye} />
          <circle cx="56" cy="48" r="2.5" fill={eye} />
          <circle cx="50" cy="55" r="3" fill={accent} opacity="0.6" />
        </>
      );
    case 'bolt-bunny':
      return (
        <>
          <ellipse cx="50" cy="62" rx="26" ry="24" fill={body} />
          <path d="M36 38 L32 18 L42 30 Z" fill={body} />
          <path d="M64 38 L68 18 L58 30 Z" fill={body} />
          <circle cx="42" cy="60" r="3" fill={eye} />
          <circle cx="58" cy="60" r="3" fill={eye} />
          <path d="M48 70 L52 70 L50 76 Z" fill={accent} />
        </>
      );
    case 'puff-bird':
      return (
        <>
          <ellipse cx="50" cy="55" rx="32" ry="30" fill={body} />
          <ellipse cx="50" cy="50" rx="22" ry="20" fill="white" opacity="0.4" />
          <circle cx="42" cy="52" r="3" fill={eye} />
          <circle cx="58" cy="52" r="3" fill={eye} />
          <path d="M48 60 L52 60 L50 65 Z" fill={accent} />
          <path d="M22 50 Q14 45 22 40" stroke={accent} strokeWidth="3" fill="none" />
          <path d="M78 50 Q86 45 78 40" stroke={accent} strokeWidth="3" fill="none" />
        </>
      );
    case 'shroom-buddy':
      return (
        <>
          <path d="M22 50 Q22 22 50 22 Q78 22 78 50 Z" fill={accent} />
          {[28, 42, 56, 70].map((cx) => (
            <circle key={cx} cx={cx} cy={42} r="4" fill="white" opacity="0.85" />
          ))}
          <rect x="38" y="50" width="24" height="32" rx="6" fill={body} />
          <circle cx="44" cy="62" r="2.5" fill={eye} />
          <circle cx="56" cy="62" r="2.5" fill={eye} />
          <path d="M44 72 Q50 76 56 72" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    case 'pebble-pal':
      return (
        <>
          <path d="M22 60 Q24 36 50 30 Q76 36 78 60 Q78 80 50 82 Q22 80 22 60 Z" fill={body} />
          <path d="M28 50 Q30 36 50 32 Q70 36 72 50" fill={accent} opacity="0.55" />
          <circle cx="42" cy="58" r="3" fill={eye} />
          <circle cx="58" cy="58" r="3" fill={eye} />
          <path d="M44 68 Q50 70 56 68" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    case 'star-fish':
      return (
        <>
          <path
            d="M50 10 L60 38 L90 40 L65 58 L75 88 L50 70 L25 88 L35 58 L10 40 L40 38 Z"
            fill={body}
          />
          <circle cx="44" cy="48" r="3" fill={eye} />
          <circle cx="56" cy="48" r="3" fill={eye} />
          <path d="M44 56 Q50 60 56 56" stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
  }
}
