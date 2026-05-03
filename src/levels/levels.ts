// levels.ts — all level definitions.
//
// Levels 1–5: baked-in AI-composite scenes (creatures are part of the PNG;
//   hitbox divs in Scene.tsx are invisible detectors only).
//
// Levels 6–25: SVG-creature levels. Four mechanic groups for split-testing:
//   Group A "Classic"    (lvl-6  – lvl-9):  900ms dwell, spotlight 0.15
//   Group B "Quick Dwell"(lvl-10 – lvl-13): 500ms dwell, spotlight 0.15
//   Group C "Wide Beam"  (lvl-14 – lvl-17): 900ms dwell, spotlight 0.24
//   Group D "Pinhole"    (lvl-18 – lvl-21): 900ms dwell, spotlight 0.10
//   Group E "Endless"    (lvl-22 – lvl-25): 900ms dwell, no timer (9999)
//
// SVG creatures are placed in the upper half (y ≤ 0.50) of each scene to
// avoid overlapping with baked-in sprites that occupy the lower half in
// levels 1–5 when the same scene PNG is reused.

// Import roster-derived type so the 100-character union is the single source
// of truth for all SVG kinds. PNG kinds are listed explicitly below.
import type { CreatureKind as RosterKind } from '../creatures/roster';

export type CreatureKind =
  // ── Original PNG kinds (baked into scene backgrounds) ──────────────────
  | 'leaf-pup'
  | 'flame-cub'
  | 'aqua-spark'
  | 'bolt-bunny'
  | 'puff-bird'
  | 'shroom-buddy'
  | 'pebble-pal'
  | 'star-fish'
  // ── All 100 SVG kinds via the roster (covers original 12 + 88 new) ─────
  | RosterKind;

export interface Creature {
  id: string;
  kind: CreatureKind;
  /** centre-x as fraction of play surface width (0..1) */
  x: number;
  /** centre-y as fraction of play surface height (0..1) */
  y: number;
  /** bounding-box width as fraction of play surface width */
  w: number;
  /** bounding-box height as fraction of play surface height */
  h: number;
  /** display label revealed on find */
  name: string;
}

export type SceneKind = 'forest' | 'meadow' | 'beach' | 'cave' | 'snow';

export interface Level {
  id: string;
  title: string;
  scene: SceneKind;
  /** Spotlight radius as fraction of play surface min(w, h). */
  spotlight: number;
  /** Time limit in seconds. Use 9999 for "no timer" (Endless mode). */
  timeLimit: number;
  /** Dwell time in ms before a creature is found. Default 900. */
  dwellMs?: number;
  creatures: Creature[];
}

export const LEVELS: Level[] = [
  // ── Levels 1–5: baked-in composites ──────────────────────────────────────
  {
    id: 'lvl-1',
    title: 'Whispering Forest',
    scene: 'forest',
    spotlight: 0.16,
    timeLimit: 120,
    creatures: [
      { id: 'c1', kind: 'leaf-pup',     x: 0.105, y: 0.605, w: 0.105, h: 0.19,  name: 'Leafu'    },
      { id: 'c2', kind: 'leaf-pup',     x: 0.205, y: 0.7,   w: 0.115, h: 0.11,  name: 'Sprout'   },
      { id: 'c3', kind: 'pebble-pal',   x: 0.295, y: 0.625, w: 0.075, h: 0.085, name: 'Roxxo'    },
      { id: 'c4', kind: 'shroom-buddy', x: 0.435, y: 0.66,  w: 0.08,  h: 0.14,  name: 'Shroomi'  },
      { id: 'c5', kind: 'pebble-pal',   x: 0.52,  y: 0.73,  w: 0.115, h: 0.135, name: 'Cobble'   },
      { id: 'c6', kind: 'puff-bird',    x: 0.605, y: 0.77,  w: 0.075, h: 0.09,  name: 'Puffi'    },
      { id: 'c7', kind: 'puff-bird',    x: 0.685, y: 0.785, w: 0.075, h: 0.085, name: 'Featherly' },
      { id: 'c8', kind: 'shroom-buddy', x: 0.73,  y: 0.555, w: 0.075, h: 0.14,  name: 'Capper'   },
      { id: 'c9', kind: 'puff-bird',    x: 0.79,  y: 0.51,  w: 0.06,  h: 0.075, name: 'Chirpie'  },
    ],
  },
  {
    id: 'lvl-2',
    title: 'Meadow at Dusk',
    scene: 'meadow',
    spotlight: 0.16,
    timeLimit: 100,
    creatures: [
      { id: 'c1', kind: 'pebble-pal',  x: 0.08,  y: 0.555, w: 0.075, h: 0.15,  name: 'Roxxo'  },
      { id: 'c2', kind: 'puff-bird',   x: 0.205, y: 0.7,   w: 0.09,  h: 0.18,  name: 'Puffi'  },
      { id: 'c3', kind: 'bolt-bunny',  x: 0.31,  y: 0.555, w: 0.085, h: 0.26,  name: 'Zappo'  },
      { id: 'c4', kind: 'bolt-bunny',  x: 0.395, y: 0.585, w: 0.085, h: 0.26,  name: 'Sparky' },
      { id: 'c5', kind: 'flame-cub',   x: 0.5,   y: 0.76,  w: 0.09,  h: 0.23,  name: 'Emberi' },
      { id: 'c6', kind: 'leaf-pup',    x: 0.625, y: 0.52,  w: 0.08,  h: 0.18,  name: 'Leafu'  },
      { id: 'c7', kind: 'flame-cub',   x: 0.76,  y: 0.49,  w: 0.075, h: 0.15,  name: 'Cinder' },
      { id: 'c8', kind: 'leaf-pup',    x: 0.89,  y: 0.56,  w: 0.08,  h: 0.18,  name: 'Sprout' },
    ],
  },
  {
    id: 'lvl-3',
    title: 'Starlit Shore',
    scene: 'beach',
    spotlight: 0.16,
    timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'star-fish',  x: 0.13,  y: 0.7,   w: 0.11,  h: 0.27,  name: 'Twinkli' },
      { id: 'c2', kind: 'aqua-spark', x: 0.345, y: 0.58,  w: 0.09,  h: 0.25,  name: 'Splashu' },
      { id: 'c3', kind: 'puff-bird',  x: 0.475, y: 0.62,  w: 0.08,  h: 0.18,  name: 'Puffi'   },
      { id: 'c4', kind: 'aqua-spark', x: 0.595, y: 0.7,   w: 0.08,  h: 0.22,  name: 'Drizzle' },
      { id: 'c5', kind: 'pebble-pal', x: 0.755, y: 0.745, w: 0.085, h: 0.18,  name: 'Roxxo'   },
      { id: 'c6', kind: 'star-fish',  x: 0.835, y: 0.51,  w: 0.06,  h: 0.14,  name: 'Glimmer' },
      { id: 'c7', kind: 'pebble-pal', x: 0.91,  y: 0.7,   w: 0.075, h: 0.15,  name: 'Cobble'  },
    ],
  },
  {
    id: 'lvl-4',
    title: 'Crystal Caves',
    scene: 'cave',
    spotlight: 0.15,
    timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'aqua-spark',   x: 0.09,  y: 0.62,  w: 0.09,  h: 0.22,  name: 'Glowfi'  },
      { id: 'c2', kind: 'bolt-bunny',   x: 0.20,  y: 0.57,  w: 0.085, h: 0.25,  name: 'Zapli'   },
      { id: 'c3', kind: 'puff-bird',    x: 0.32,  y: 0.71,  w: 0.08,  h: 0.18,  name: 'Lumini'  },
      { id: 'c4', kind: 'star-fish',    x: 0.45,  y: 0.65,  w: 0.10,  h: 0.24,  name: 'Sparkli' },
      { id: 'c5', kind: 'flame-cub',    x: 0.57,  y: 0.69,  w: 0.09,  h: 0.22,  name: 'Embero'  },
      { id: 'c6', kind: 'shroom-buddy', x: 0.68,  y: 0.59,  w: 0.08,  h: 0.16,  name: 'Mushoo'  },
      { id: 'c7', kind: 'pebble-pal',   x: 0.79,  y: 0.74,  w: 0.08,  h: 0.16,  name: 'Crysto'  },
      { id: 'c8', kind: 'leaf-pup',     x: 0.90,  y: 0.57,  w: 0.085, h: 0.19,  name: 'Mossi'   },
    ],
  },
  {
    id: 'lvl-5',
    title: 'Snowy Peak',
    scene: 'snow',
    spotlight: 0.14,
    timeLimit: 75,
    creatures: [
      { id: 'c1', kind: 'pebble-pal',  x: 0.10,  y: 0.68,  w: 0.09,  h: 0.18,  name: 'Frosty'   },
      { id: 'c2', kind: 'bolt-bunny',  x: 0.23,  y: 0.55,  w: 0.085, h: 0.26,  name: 'Snowball' },
      { id: 'c3', kind: 'leaf-pup',    x: 0.37,  y: 0.72,  w: 0.09,  h: 0.19,  name: 'Icicle'   },
      { id: 'c4', kind: 'puff-bird',   x: 0.50,  y: 0.60,  w: 0.08,  h: 0.18,  name: 'Blizzi'   },
      { id: 'c5', kind: 'aqua-spark',  x: 0.63,  y: 0.65,  w: 0.09,  h: 0.22,  name: 'Sleeto'   },
      { id: 'c6', kind: 'star-fish',   x: 0.76,  y: 0.55,  w: 0.08,  h: 0.20,  name: 'Aurora'   },
      { id: 'c7', kind: 'flame-cub',   x: 0.89,  y: 0.70,  w: 0.085, h: 0.20,  name: 'Embrus'   },
    ],
  },

  // ── Group A — Classic (900ms dwell, spotlight 0.15, 5 creatures, 90s) ────
  {
    id: 'lvl-6', title: 'Twilight Hollow', scene: 'forest',
    spotlight: 0.15, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'bunny',   x: 0.20, y: 0.22, w: 0.13, h: 0.13, name: 'Hoppy'    },
      { id: 'c2', kind: 'owl',     x: 0.52, y: 0.20, w: 0.13, h: 0.13, name: 'Hooty'    },
      { id: 'c3', kind: 'bear-cub',x: 0.82, y: 0.22, w: 0.13, h: 0.13, name: 'Bruno'    },
      { id: 'c4', kind: 'fox-pup', x: 0.35, y: 0.44, w: 0.13, h: 0.13, name: 'Rusty'    },
      { id: 'c5', kind: 'kitty',   x: 0.68, y: 0.44, w: 0.13, h: 0.13, name: 'Mittens'  },
    ],
  },
  {
    id: 'lvl-7', title: 'Dusk Meadow', scene: 'meadow',
    spotlight: 0.15, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'frog-pal', x: 0.18, y: 0.22, w: 0.13, h: 0.13, name: 'Ribbit'     },
      { id: 'c2', kind: 'bee-buzz', x: 0.52, y: 0.20, w: 0.12, h: 0.12, name: 'Bumble'     },
      { id: 'c3', kind: 'bunny',    x: 0.82, y: 0.22, w: 0.13, h: 0.13, name: 'Cottontail' },
      { id: 'c4', kind: 'kitty',    x: 0.30, y: 0.44, w: 0.13, h: 0.13, name: 'Whiskers'   },
      { id: 'c5', kind: 'bear-cub', x: 0.68, y: 0.44, w: 0.13, h: 0.13, name: 'Cinnamon'   },
    ],
  },
  {
    id: 'lvl-8', title: 'Night Tide', scene: 'beach',
    spotlight: 0.16, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'star-pal',    x: 0.20, y: 0.22, w: 0.12, h: 0.12, name: 'Twinkle' },
      { id: 'c2', kind: 'moon-kid',    x: 0.52, y: 0.20, w: 0.12, h: 0.12, name: 'Luna'    },
      { id: 'c3', kind: 'penguin-pal', x: 0.82, y: 0.22, w: 0.13, h: 0.13, name: 'Waddles' },
      { id: 'c4', kind: 'duck-bill',   x: 0.30, y: 0.44, w: 0.12, h: 0.12, name: 'Quacky'  },
      { id: 'c5', kind: 'turtle-shell',x: 0.68, y: 0.44, w: 0.13, h: 0.13, name: 'Shelly'  },
    ],
  },
  {
    id: 'lvl-9', title: 'Cave Glow', scene: 'cave',
    spotlight: 0.15, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'owl',      x: 0.18, y: 0.24, w: 0.13, h: 0.13, name: 'Blinky'   },
      { id: 'c2', kind: 'star-pal', x: 0.52, y: 0.20, w: 0.12, h: 0.12, name: 'Sparky'   },
      { id: 'c3', kind: 'moon-kid', x: 0.82, y: 0.22, w: 0.12, h: 0.12, name: 'Crescent' },
      { id: 'c4', kind: 'bear-cub', x: 0.28, y: 0.46, w: 0.13, h: 0.13, name: 'Cubby'    },
      { id: 'c5', kind: 'fox-pup',  x: 0.65, y: 0.44, w: 0.13, h: 0.13, name: 'Amber'    },
    ],
  },

  // ── Group B — Quick Dwell (500ms dwell, spotlight 0.15, 5 creatures, 75s) ─
  {
    id: 'lvl-10', title: 'Flash Forest', scene: 'forest',
    spotlight: 0.15, timeLimit: 75, dwellMs: 500,
    creatures: [
      { id: 'c1', kind: 'bunny',   x: 0.20, y: 0.22, w: 0.13, h: 0.13, name: 'Snowpuff' },
      { id: 'c2', kind: 'kitty',   x: 0.52, y: 0.20, w: 0.13, h: 0.13, name: 'Patches'  },
      { id: 'c3', kind: 'fox-pup', x: 0.82, y: 0.22, w: 0.13, h: 0.13, name: 'Foxy'     },
      { id: 'c4', kind: 'owl',     x: 0.35, y: 0.44, w: 0.13, h: 0.13, name: 'Twinkles' },
      { id: 'c5', kind: 'bear-cub',x: 0.68, y: 0.44, w: 0.13, h: 0.13, name: 'Grizzly'  },
    ],
  },
  {
    id: 'lvl-11', title: 'Quick Meadow', scene: 'meadow',
    spotlight: 0.15, timeLimit: 75, dwellMs: 500,
    creatures: [
      { id: 'c1', kind: 'frog-pal',    x: 0.18, y: 0.22, w: 0.13, h: 0.13, name: 'Hopscotch' },
      { id: 'c2', kind: 'bee-buzz',    x: 0.52, y: 0.18, w: 0.12, h: 0.12, name: 'Honey'     },
      { id: 'c3', kind: 'bunny',       x: 0.82, y: 0.22, w: 0.13, h: 0.13, name: 'Lola'      },
      { id: 'c4', kind: 'turtle-shell',x: 0.30, y: 0.44, w: 0.13, h: 0.13, name: 'Slowpoke'  },
      { id: 'c5', kind: 'penguin-pal', x: 0.68, y: 0.44, w: 0.13, h: 0.13, name: 'Pingu'     },
    ],
  },
  {
    id: 'lvl-12', title: 'Speedy Shore', scene: 'beach',
    spotlight: 0.15, timeLimit: 75, dwellMs: 500,
    creatures: [
      { id: 'c1', kind: 'star-pal',    x: 0.22, y: 0.22, w: 0.12, h: 0.12, name: 'Starla' },
      { id: 'c2', kind: 'duck-bill',   x: 0.55, y: 0.20, w: 0.12, h: 0.12, name: 'Donald' },
      { id: 'c3', kind: 'moon-kid',    x: 0.82, y: 0.22, w: 0.12, h: 0.12, name: 'Moony'  },
      { id: 'c4', kind: 'penguin-pal', x: 0.30, y: 0.44, w: 0.13, h: 0.13, name: 'Tux'    },
      { id: 'c5', kind: 'kitty',       x: 0.70, y: 0.44, w: 0.13, h: 0.13, name: 'Sandy'  },
    ],
  },
  {
    id: 'lvl-13', title: 'Rapid Cave', scene: 'cave',
    spotlight: 0.15, timeLimit: 75, dwellMs: 500,
    creatures: [
      { id: 'c1', kind: 'fox-pup',  x: 0.20, y: 0.24, w: 0.13, h: 0.13, name: 'Redtail' },
      { id: 'c2', kind: 'moon-kid', x: 0.55, y: 0.20, w: 0.12, h: 0.12, name: 'Gloomy'  },
      { id: 'c3', kind: 'bear-cub', x: 0.82, y: 0.24, w: 0.13, h: 0.13, name: 'Nutmeg'  },
      { id: 'c4', kind: 'star-pal', x: 0.35, y: 0.46, w: 0.12, h: 0.12, name: 'Gleam'   },
      { id: 'c5', kind: 'owl',      x: 0.70, y: 0.44, w: 0.13, h: 0.13, name: 'Dusk'    },
    ],
  },

  // ── Group C — Wide Beam (spotlight 0.24, 6 creatures, 120s) ──────────────
  {
    id: 'lvl-14', title: 'Lantern Forest', scene: 'forest',
    spotlight: 0.24, timeLimit: 120,
    creatures: [
      { id: 'c1', kind: 'bunny',   x: 0.18, y: 0.20, w: 0.13, h: 0.13, name: 'Floppsy' },
      { id: 'c2', kind: 'bear-cub',x: 0.50, y: 0.18, w: 0.13, h: 0.13, name: 'Teddy'   },
      { id: 'c3', kind: 'owl',     x: 0.82, y: 0.20, w: 0.13, h: 0.13, name: 'Wiser'   },
      { id: 'c4', kind: 'frog-pal',x: 0.26, y: 0.44, w: 0.13, h: 0.13, name: 'Leapy'   },
      { id: 'c5', kind: 'kitty',   x: 0.57, y: 0.44, w: 0.13, h: 0.13, name: 'Tiger'   },
      { id: 'c6', kind: 'fox-pup', x: 0.84, y: 0.44, w: 0.13, h: 0.13, name: 'Blaze'   },
    ],
  },
  {
    id: 'lvl-15', title: 'Bright Meadow', scene: 'meadow',
    spotlight: 0.24, timeLimit: 120,
    creatures: [
      { id: 'c1', kind: 'bee-buzz',    x: 0.18, y: 0.20, w: 0.12, h: 0.12, name: 'Buzzy'  },
      { id: 'c2', kind: 'duck-bill',   x: 0.50, y: 0.18, w: 0.12, h: 0.12, name: 'Daffy'  },
      { id: 'c3', kind: 'bunny',       x: 0.82, y: 0.20, w: 0.13, h: 0.13, name: 'Biscuit'},
      { id: 'c4', kind: 'frog-pal',    x: 0.26, y: 0.44, w: 0.13, h: 0.13, name: 'Puddles'},
      { id: 'c5', kind: 'turtle-shell',x: 0.57, y: 0.44, w: 0.13, h: 0.13, name: 'Mossy'  },
      { id: 'c6', kind: 'penguin-pal', x: 0.84, y: 0.44, w: 0.13, h: 0.13, name: 'Tuxedo' },
    ],
  },
  {
    id: 'lvl-16', title: 'Glow Shore', scene: 'beach',
    spotlight: 0.24, timeLimit: 120,
    creatures: [
      { id: 'c1', kind: 'star-pal',    x: 0.18, y: 0.20, w: 0.12, h: 0.12, name: 'Comet'   },
      { id: 'c2', kind: 'moon-kid',    x: 0.50, y: 0.18, w: 0.12, h: 0.12, name: 'Selene'  },
      { id: 'c3', kind: 'duck-bill',   x: 0.82, y: 0.20, w: 0.12, h: 0.12, name: 'Duckie'  },
      { id: 'c4', kind: 'turtle-shell',x: 0.26, y: 0.44, w: 0.13, h: 0.13, name: 'Rocky'   },
      { id: 'c5', kind: 'penguin-pal', x: 0.57, y: 0.44, w: 0.13, h: 0.13, name: 'Snowball'},
      { id: 'c6', kind: 'bear-cub',    x: 0.84, y: 0.44, w: 0.13, h: 0.13, name: 'Polar'   },
    ],
  },
  {
    id: 'lvl-17', title: 'Radiant Cave', scene: 'cave',
    spotlight: 0.24, timeLimit: 120,
    creatures: [
      { id: 'c1', kind: 'owl',      x: 0.18, y: 0.22, w: 0.13, h: 0.13, name: 'Minerva' },
      { id: 'c2', kind: 'star-pal', x: 0.50, y: 0.18, w: 0.12, h: 0.12, name: 'Lumina'  },
      { id: 'c3', kind: 'moon-kid', x: 0.82, y: 0.22, w: 0.12, h: 0.12, name: 'Eclipse' },
      { id: 'c4', kind: 'fox-pup',  x: 0.26, y: 0.46, w: 0.13, h: 0.13, name: 'Ember'   },
      { id: 'c5', kind: 'bear-cub', x: 0.57, y: 0.44, w: 0.13, h: 0.13, name: 'Cavey'   },
      { id: 'c6', kind: 'bunny',    x: 0.84, y: 0.46, w: 0.13, h: 0.13, name: 'Crystal' },
    ],
  },

  // ── Group D — Pinhole (spotlight 0.10, 4 creatures, 90s) ─────────────────
  {
    id: 'lvl-18', title: 'Needle Forest', scene: 'forest',
    spotlight: 0.10, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'bunny',   x: 0.25, y: 0.24, w: 0.13, h: 0.13, name: 'Squint' },
      { id: 'c2', kind: 'owl',     x: 0.70, y: 0.22, w: 0.13, h: 0.13, name: 'Peek'   },
      { id: 'c3', kind: 'bear-cub',x: 0.22, y: 0.46, w: 0.13, h: 0.13, name: 'Shadow' },
      { id: 'c4', kind: 'fox-pup', x: 0.72, y: 0.46, w: 0.13, h: 0.13, name: 'Slink'  },
    ],
  },
  {
    id: 'lvl-19', title: 'Pin Meadow', scene: 'meadow',
    spotlight: 0.10, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'frog-pal', x: 0.25, y: 0.26, w: 0.13, h: 0.13, name: 'Speck'  },
      { id: 'c2', kind: 'kitty',    x: 0.70, y: 0.24, w: 0.13, h: 0.13, name: 'Stealth'},
      { id: 'c3', kind: 'bee-buzz', x: 0.22, y: 0.46, w: 0.12, h: 0.12, name: 'Sting'  },
      { id: 'c4', kind: 'bunny',    x: 0.72, y: 0.46, w: 0.13, h: 0.13, name: 'Veil'   },
    ],
  },
  {
    id: 'lvl-20', title: 'Slim Shore', scene: 'beach',
    spotlight: 0.10, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'star-pal',    x: 0.22, y: 0.24, w: 0.12, h: 0.12, name: 'Dim'     },
      { id: 'c2', kind: 'penguin-pal', x: 0.72, y: 0.22, w: 0.13, h: 0.13, name: 'Flicker' },
      { id: 'c3', kind: 'duck-bill',   x: 0.25, y: 0.46, w: 0.12, h: 0.12, name: 'Hush'    },
      { id: 'c4', kind: 'turtle-shell',x: 0.70, y: 0.44, w: 0.13, h: 0.13, name: 'Shade'   },
    ],
  },
  {
    id: 'lvl-21', title: 'Dark Cave', scene: 'cave',
    spotlight: 0.10, timeLimit: 90,
    creatures: [
      { id: 'c1', kind: 'moon-kid', x: 0.25, y: 0.24, w: 0.12, h: 0.12, name: 'Nox'   },
      { id: 'c2', kind: 'bear-cub', x: 0.70, y: 0.22, w: 0.13, h: 0.13, name: 'Murk'  },
      { id: 'c3', kind: 'star-pal', x: 0.28, y: 0.46, w: 0.12, h: 0.12, name: 'Glint' },
      { id: 'c4', kind: 'fox-pup',  x: 0.72, y: 0.44, w: 0.13, h: 0.13, name: 'Wisp'  },
    ],
  },

  // ── Group E — Endless (spotlight 0.16, no timer, 6–7 creatures) ──────────
  {
    id: 'lvl-22', title: 'Dreamy Forest', scene: 'forest',
    spotlight: 0.16, timeLimit: 9999,
    creatures: [
      { id: 'c1', kind: 'bunny',   x: 0.18, y: 0.20, w: 0.13, h: 0.13, name: 'Doodle' },
      { id: 'c2', kind: 'bear-cub',x: 0.50, y: 0.18, w: 0.13, h: 0.13, name: 'Mochi'  },
      { id: 'c3', kind: 'owl',     x: 0.82, y: 0.20, w: 0.13, h: 0.13, name: 'Wise'   },
      { id: 'c4', kind: 'fox-pup', x: 0.25, y: 0.44, w: 0.13, h: 0.13, name: 'Maple'  },
      { id: 'c5', kind: 'kitty',   x: 0.56, y: 0.44, w: 0.13, h: 0.13, name: 'Cookie' },
      { id: 'c6', kind: 'frog-pal',x: 0.82, y: 0.44, w: 0.13, h: 0.13, name: 'Clover' },
    ],
  },
  {
    id: 'lvl-23', title: 'Forever Meadow', scene: 'meadow',
    spotlight: 0.16, timeLimit: 9999,
    creatures: [
      { id: 'c1', kind: 'bee-buzz',    x: 0.18, y: 0.22, w: 0.12, h: 0.12, name: 'Poppy'  },
      { id: 'c2', kind: 'bunny',       x: 0.50, y: 0.18, w: 0.13, h: 0.13, name: 'Daisy'  },
      { id: 'c3', kind: 'duck-bill',   x: 0.82, y: 0.22, w: 0.12, h: 0.12, name: 'Sunny'  },
      { id: 'c4', kind: 'frog-pal',    x: 0.26, y: 0.44, w: 0.13, h: 0.13, name: 'Misty'  },
      { id: 'c5', kind: 'turtle-shell',x: 0.57, y: 0.44, w: 0.13, h: 0.13, name: 'Pebble' },
      { id: 'c6', kind: 'penguin-pal', x: 0.82, y: 0.44, w: 0.13, h: 0.13, name: 'Breezy' },
    ],
  },
  {
    id: 'lvl-24', title: 'Ocean Dreams', scene: 'beach',
    spotlight: 0.16, timeLimit: 9999,
    creatures: [
      { id: 'c1', kind: 'star-pal',    x: 0.16, y: 0.18, w: 0.12, h: 0.12, name: 'Glitter' },
      { id: 'c2', kind: 'moon-kid',    x: 0.46, y: 0.16, w: 0.12, h: 0.12, name: 'Perle'   },
      { id: 'c3', kind: 'duck-bill',   x: 0.78, y: 0.18, w: 0.12, h: 0.12, name: 'Pudding' },
      { id: 'c4', kind: 'penguin-pal', x: 0.22, y: 0.38, w: 0.13, h: 0.13, name: 'Freezy'  },
      { id: 'c5', kind: 'turtle-shell',x: 0.54, y: 0.38, w: 0.13, h: 0.13, name: 'Drifty'  },
      { id: 'c6', kind: 'bear-cub',    x: 0.82, y: 0.38, w: 0.13, h: 0.13, name: 'Sandy'   },
      { id: 'c7', kind: 'bunny',       x: 0.38, y: 0.50, w: 0.13, h: 0.13, name: 'Coral'   },
    ],
  },
  {
    id: 'lvl-25', title: 'Blizzard Peaks', scene: 'snow',
    spotlight: 0.16, timeLimit: 9999,
    creatures: [
      { id: 'c1', kind: 'owl',      x: 0.16, y: 0.20, w: 0.13, h: 0.13, name: 'Blizzard' },
      { id: 'c2', kind: 'fox-pup',  x: 0.48, y: 0.18, w: 0.13, h: 0.13, name: 'Frost'    },
      { id: 'c3', kind: 'bear-cub', x: 0.82, y: 0.20, w: 0.13, h: 0.13, name: 'Glacier'  },
      { id: 'c4', kind: 'kitty',    x: 0.22, y: 0.38, w: 0.13, h: 0.13, name: 'Snowbell' },
      { id: 'c5', kind: 'star-pal', x: 0.54, y: 0.38, w: 0.12, h: 0.12, name: 'Aurora'   },
      { id: 'c6', kind: 'moon-kid', x: 0.82, y: 0.38, w: 0.12, h: 0.12, name: 'Boreal'   },
      { id: 'c7', kind: 'bunny',    x: 0.38, y: 0.50, w: 0.13, h: 0.13, name: 'Sleet'    },
    ],
  },
];

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function nextLevelId(current: string): string | null {
  const idx = LEVELS.findIndex((l) => l.id === current);
  if (idx < 0 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1].id;
}
