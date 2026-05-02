// Creature sprite — handles both original PNG kinds (baked into scene images)
// and new SVG kinds (rendered inline).
//
// Two visual states:
//   found = true  → bright sprite with a warm amber glow halo
//   found = false → dim cool-blue silhouette (visible in spotlight beam)

import type { CreatureKind } from '../levels/levels';
import { isSvgKind, SvgCreature } from './SvgCreature';

interface Props {
  kind: CreatureKind;
  found: boolean;
}

const PNG_SPRITE: Partial<Record<CreatureKind, string>> = {
  'leaf-pup':     '/creatures/leaf-pup.png',
  'flame-cub':    '/creatures/flame-cub.png',
  'aqua-spark':   '/creatures/aqua-spark.png',
  'bolt-bunny':   '/creatures/bolt-bunny.png',
  'puff-bird':    '/creatures/puff-bird.png',
  'shroom-buddy': '/creatures/shroom-buddy.png',
  'pebble-pal':   '/creatures/pebble-pal.png',
  'star-fish':    '/creatures/star-fish.png',
};

const FOUND_FILTER =
  'drop-shadow(0 0 10px rgba(212,167,60,0.55)) ' +
  'drop-shadow(0 3px 8px rgba(0,0,0,0.30))';

// brightness(0.22): clearly "hidden" in full darkness but leaves a traceable
// shadow hint when the spotlight passes over it — helps 3-year-olds aim.
const HIDDEN_FILTER =
  'brightness(0.22) saturate(0.15) sepia(0.4) hue-rotate(200deg) opacity(0.95)';

export function Creature({ kind, found }: Props) {
  const filter = found ? FOUND_FILTER : HIDDEN_FILTER;

  if (isSvgKind(kind)) {
    return (
      <SvgCreature
        kind={kind}
        className="select-none pointer-events-none"
        style={{ filter }}
      />
    );
  }

  const src = PNG_SPRITE[kind];
  if (!src) return null;
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
      style={{ filter }}
    />
  );
}
