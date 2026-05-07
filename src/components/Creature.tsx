// Creature sprite — PNG-first with explicit SvgCreature fallback.
//
// PNG_SPRITE is sourced from src/creatures/png-manifest.ts, an auto-generated
// file scanning public/creatures/*.png. Any kind that has a PNG renders the
// canonical painterly art via <img>; any kind without falls back to the
// inline SvgCreature placeholder. The asset coverage test
// (src/__tests__/creature-coverage.test.ts) enforces that every kind used in
// any level has at least one of these two paths available.
//
// Two visual states (handled here, common to both paths):
//   found = true  → bright sprite with a warm amber glow halo
//   found = false → dim cool-blue silhouette (visible in spotlight beam)

import type { CreatureKind } from '../levels/levels';
import { PNG_SPRITE } from '../creatures/png-manifest';
import { isSvgKind, SvgCreature } from './SvgCreature';

interface Props {
  kind: CreatureKind;
  found: boolean;
}

export { PNG_SPRITE };

const FOUND_FILTER =
  'drop-shadow(0 0 10px rgba(212,167,60,0.55)) ' +
  'drop-shadow(0 3px 8px rgba(0,0,0,0.30))';

// brightness(0.22): clearly "hidden" in full darkness but leaves a traceable
// shadow hint when the spotlight passes over it — helps 3-year-olds aim.
const HIDDEN_FILTER =
  'brightness(0.22) saturate(0.15) sepia(0.4) hue-rotate(200deg) opacity(0.95)';

const FILTER_TRANSITION = 'filter 320ms cubic-bezier(0.16, 1, 0.3, 1)';

export function Creature({ kind, found }: Props) {
  const filter = found ? FOUND_FILTER : HIDDEN_FILTER;

  // PNG path is preferred (canonical painterly art).
  const src = PNG_SPRITE[kind];
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        decoding="async"
        loading="eager"
        draggable={false}
        width={256}
        height={256}
        className="h-full w-full object-contain select-none pointer-events-none"
        style={{ filter, transition: FILTER_TRANSITION }}
      />
    );
  }

  // No PNG yet — render the SvgCreature placeholder.
  if (isSvgKind(kind)) {
    return (
      <SvgCreature
        kind={kind}
        className="select-none pointer-events-none"
        style={{ filter, transition: FILTER_TRANSITION }}
      />
    );
  }

  return null;
}
