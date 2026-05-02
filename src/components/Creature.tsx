// Creature sprite — AI-generated chibi mascot PNGs.
//
// Two visual states:
//   found = true  → bright sprite with a warm amber glow halo
//   found = false → mysterious silhouette with a cool moonlit blue tint
//
// CSS filter reasoning:
//   Found: drop-shadow with two layers — outer amber glow (matches lantern
//   palette) + inner dark shadow for depth. Makes found creatures pop
//   against the light card background.
//
//   Hidden: brightness(0.12) darkens to near-black, saturate(0.15) keeps
//   a ghost of colour, sepia(0.4) + hue-rotate(200deg) shifts the remnant
//   colour toward cool blue-indigo so the silhouette reads as moonlit
//   shadow rather than flat grey. opacity(0.88) softens it slightly.

import type { CreatureKind } from '../levels/levels';

interface Props {
  kind: CreatureKind;
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
      width={256}
      height={256}
      className="h-full w-full object-contain select-none pointer-events-none"
      style={
        found
          ? {
              filter:
                'drop-shadow(0 0 10px rgba(212,167,60,0.55)) ' +
                'drop-shadow(0 3px 8px rgba(0,0,0,0.30))',
            }
          : {
              // brightness(0.22) is still clearly "hidden" in full darkness but
              // gives a subtle shadow hint when the spotlight sweeps over the
              // creature — helping 3-year-olds aim at the right spot.
              filter:
                'brightness(0.22) saturate(0.15) sepia(0.4) ' +
                'hue-rotate(200deg) opacity(0.95)',
            }
      }
    />
  );
}
