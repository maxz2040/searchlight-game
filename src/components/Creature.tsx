// Creature sprite — AI-generated chibi mascot PNGs (Higgsfield Flux 2.0)
// keyed by `kind`. The PNGs ship in /public/creatures/ so Vite copies
// them verbatim and the service worker caches them for offline play.
//
// Two visual states:
//   * `found = true`  → bright sprite, pops against the dim scene
//   * `found = false` → silhouette form (CSS filter darkens to a near-solid
//                        shadow against the night palette), so kids see the
//                        outline and know "something's hiding here" once
//                        the spotlight grazes the area.
//
// CSS filter chain reasoning:
//   `brightness(0)` flattens every colour to black. `drop-shadow` then
//   gives back a faint navy outline so the silhouette doesn't disappear
//   into the background entirely. Cheaper than shipping two PNGs per kind.

import type { CreatureKind } from '../levels/levels';

interface Props {
  kind: CreatureKind;
  /** When false, render the silhouette only (the hidden-in-the-dark form). */
  found: boolean;
}

const SPRITE_BY_KIND: Record<CreatureKind, string> = {
  'leaf-pup':     '/creatures/leaf-pup.png',
  'flame-cub':    '/creatures/flame-cub.png',
  'aqua-spark':   '/creatures/aqua-spark.png',
  'bolt-bunny':   '/creatures/bolt-bunny.png',
  'puff-bird':    '/creatures/puff-bird.png',
  'shroom-buddy': '/creatures/shroom-buddy.png',
  'pebble-pal':   '/creatures/pebble-pal.png',
  'star-fish':    '/creatures/star-fish.png',
};

export function Creature({ kind, found }: Props) {
  const src = SPRITE_BY_KIND[kind];
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      decoding="async"
      loading="eager"
      draggable={false}
      // Intrinsic 1:1 dimensions kill any aspect-ratio jump while the
      // chroma-keyed PNG decodes. Container sets visual size via class.
      width={256}
      height={256}
      className="h-full w-full object-contain select-none pointer-events-none"
      style={
        found
          ? { filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))' }
          : { filter: 'brightness(0.18) saturate(0) opacity(0.85)' }
      }
    />
  );
}
