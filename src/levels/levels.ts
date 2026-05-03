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
  /** Override the pinhole-hint delay in ms. Falls back to spotlight-based heuristic. */
  hintMs?: number;
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

  // ════════════════════════════════════════════════════════════════════════════
  // WALDO EDITION — lvl-26 through lvl-45
  //
  // Research basis:
  //   • Where's Waldo / I Spy for ages 3–6 uses 10–15 targets scattered across
  //     the FULL scene (not just the top half). Visual density + full-field sweep
  //     drives 5–10 min engagement.
  //   • Size hierarchy: 1–2 large anchors (easy first find), 5–7 medium, 2–3
  //     small edge/corner hiders. Average find time ~30–45 s → 10 creatures ≈ 5 min.
  //   • Longer timers + per-group hint delays replace the old 75–120 s limits.
  //   • Thematic creature pools: each scene gets biome-appropriate critters so the
  //     roster depth actually appears in gameplay.
  //
  // Groups mirror A–E mechanics but are independent for split-test comparison:
  //   F  Classic      lvl-26–29   spotlight 0.15  10 creatures  300 s   hint 5 s
  //   G  Quick Dwell  lvl-30–33   spotlight 0.15  11 creatures  180 s   hint 4 s  500 ms dwell
  //   H  Wide Beam    lvl-34–37   spotlight 0.24  13 creatures  420 s   hint 6 s
  //   I  Pinhole      lvl-38–41   spotlight 0.10  14 creatures  600 s   hint 8 s
  //   J  Endless      lvl-42–45   spotlight 0.16  15 creatures  ∞       hint 12 s
  // ════════════════════════════════════════════════════════════════════════════

  // ── Group F — Classic Waldo (spotlight 0.15, 10 creatures, 300 s) ────────
  // Foreground hiding zones used (see SceneForeground.tsx):
  //   forest  — LEFT_TRUNK x≈0.06, RIGHT_TRUNK x≈0.94, TOP_BRANCH y≈0.08,
  //             BOTTOM_GRASS y≈0.81
  //   meadow  — LEFT_TUFT x≈0.06 y≈0.68, RIGHT_TUFT x≈0.93 y≈0.65,
  //             BOTTOM_GRASS y≈0.80
  //   beach   — LEFT_ROCK x≈0.07 y≈0.73, RIGHT_ROCK x≈0.92 y≈0.72,
  //             BOTTOM_SAND y≈0.83
  //   cave    — TOP_STALACTITE y≈0.08, LEFT_WALL x≈0.05,
  //             BOTTOM_STALAGMITE y≈0.82
  {
    id: 'lvl-26', title: 'Hollow Watch', scene: 'forest',
    spotlight: 0.15, timeLimit: 300, hintMs: 5000,
    creatures: [
      { id: 'c01', kind: 'bunny',          x: 0.50, y: 0.11, w: 0.12, h: 0.12, name: 'Hoppy'   },
      { id: 'c02', kind: 'owl',            x: 0.78, y: 0.20, w: 0.11, h: 0.11, name: 'Hooty'   },
      { id: 'c03', kind: 'bear-cub',       x: 0.06, y: 0.40, w: 0.12, h: 0.12, name: 'Bruno'   }, // LEFT_TRUNK
      { id: 'c04', kind: 'raccoon-mask',   x: 0.34, y: 0.26, w: 0.10, h: 0.10, name: 'Bandit'  },
      { id: 'c05', kind: 'fox-pup',        x: 0.62, y: 0.19, w: 0.10, h: 0.10, name: 'Rusty'   },
      { id: 'c06', kind: 'kitty',          x: 0.16, y: 0.08, w: 0.10, h: 0.10, name: 'Mittens' }, // TOP_BRANCH
      { id: 'c07', kind: 'deer-dot',       x: 0.46, y: 0.44, w: 0.11, h: 0.11, name: 'Dottie'  },
      { id: 'c08', kind: 'squirrel-nut',   x: 0.82, y: 0.48, w: 0.10, h: 0.10, name: 'Nutty'   },
      { id: 'c09', kind: 'hedgehog-roll',  x: 0.94, y: 0.34, w: 0.10, h: 0.10, name: 'Prickle' }, // RIGHT_TRUNK
      { id: 'c10', kind: 'chipmunk-cheek', x: 0.26, y: 0.81, w: 0.10, h: 0.10, name: 'Chippy'  }, // BOTTOM_GRASS
    ],
  },
  {
    id: 'lvl-27', title: 'Evening Meadow', scene: 'meadow',
    spotlight: 0.15, timeLimit: 300, hintMs: 5000,
    creatures: [
      { id: 'c01', kind: 'frog-pal',          x: 0.52, y: 0.12, w: 0.12, h: 0.12, name: 'Ribbit'   },
      { id: 'c02', kind: 'bee-buzz',          x: 0.22, y: 0.19, w: 0.10, h: 0.10, name: 'Bumble'   },
      { id: 'c03', kind: 'butterfly-blue',    x: 0.78, y: 0.14, w: 0.10, h: 0.10, name: 'Flutter'  },
      { id: 'c04', kind: 'dragonfly-zip',     x: 0.40, y: 0.28, w: 0.10, h: 0.10, name: 'Zippy'    },
      { id: 'c05', kind: 'ladybug-spot',      x: 0.68, y: 0.22, w: 0.10, h: 0.10, name: 'Dotty'    },
      { id: 'c06', kind: 'duck-bill',         x: 0.06, y: 0.44, w: 0.11, h: 0.11, name: 'Quacky'   },
      { id: 'c07', kind: 'snail-trail',       x: 0.84, y: 0.47, w: 0.10, h: 0.10, name: 'Slowpoke' },
      { id: 'c08', kind: 'hamster-round',     x: 0.06, y: 0.68, w: 0.10, h: 0.10, name: 'Rolly'    }, // LEFT_TUFT
      { id: 'c09', kind: 'caterpillar-green', x: 0.36, y: 0.80, w: 0.12, h: 0.10, name: 'Munchy'   }, // BOTTOM_GRASS
      { id: 'c10', kind: 'daisy-bud',         x: 0.93, y: 0.65, w: 0.10, h: 0.10, name: 'Daisy'    }, // RIGHT_TUFT
    ],
  },
  {
    id: 'lvl-28', title: 'Shore at Night', scene: 'beach',
    spotlight: 0.15, timeLimit: 300, hintMs: 5000,
    creatures: [
      { id: 'c01', kind: 'turtle-shell',  x: 0.50, y: 0.11, w: 0.11, h: 0.11, name: 'Shelly'  },
      { id: 'c02', kind: 'star-pal',      x: 0.22, y: 0.18, w: 0.10, h: 0.10, name: 'Twinkle' },
      { id: 'c03', kind: 'penguin-pal',   x: 0.78, y: 0.14, w: 0.12, h: 0.12, name: 'Waddles' },
      { id: 'c04', kind: 'moon-kid',      x: 0.38, y: 0.27, w: 0.10, h: 0.10, name: 'Luna'    },
      { id: 'c05', kind: 'crab-snap',     x: 0.66, y: 0.22, w: 0.10, h: 0.10, name: 'Snappy'  },
      { id: 'c06', kind: 'duck-bill',     x: 0.46, y: 0.44, w: 0.11, h: 0.11, name: 'Ducky'   },
      { id: 'c07', kind: 'seahorse-curl', x: 0.82, y: 0.47, w: 0.10, h: 0.10, name: 'Curly'   },
      { id: 'c08', kind: 'jellyfish-glow',x: 0.07, y: 0.73, w: 0.10, h: 0.10, name: 'Glowy'   }, // LEFT_ROCK
      { id: 'c09', kind: 'clownfish',     x: 0.28, y: 0.83, w: 0.10, h: 0.10, name: 'Nemo'    }, // BOTTOM_SAND
      { id: 'c10', kind: 'lobster-red',   x: 0.92, y: 0.72, w: 0.10, h: 0.10, name: 'Rocky'   }, // RIGHT_ROCK
    ],
  },
  {
    id: 'lvl-29', title: 'Crystal Cavern', scene: 'cave',
    spotlight: 0.15, timeLimit: 300, hintMs: 5000,
    creatures: [
      { id: 'c01', kind: 'owl',          x: 0.48, y: 0.08, w: 0.12, h: 0.12, name: 'Blinky'    }, // TOP_STALACTITE
      { id: 'c02', kind: 'star-pal',     x: 0.24, y: 0.18, w: 0.10, h: 0.10, name: 'Sparky'    },
      { id: 'c03', kind: 'moon-kid',     x: 0.72, y: 0.21, w: 0.10, h: 0.10, name: 'Crescent'  },
      { id: 'c04', kind: 'ufo-pal',      x: 0.42, y: 0.32, w: 0.10, h: 0.10, name: 'Zoomy'     },
      { id: 'c05', kind: 'bat-wing',     x: 0.62, y: 0.25, w: 0.10, h: 0.10, name: 'Nightwing' },
      { id: 'c06', kind: 'bear-cub',     x: 0.05, y: 0.44, w: 0.11, h: 0.11, name: 'Cubby'     }, // LEFT_WALL
      { id: 'c07', kind: 'firefly-glow', x: 0.48, y: 0.44, w: 0.10, h: 0.10, name: 'Glimmer'   },
      { id: 'c08', kind: 'luna-cat',     x: 0.82, y: 0.47, w: 0.10, h: 0.10, name: 'Selene'    },
      { id: 'c09', kind: 'fox-pup',      x: 0.20, y: 0.72, w: 0.11, h: 0.11, name: 'Amber'     },
      { id: 'c10', kind: 'comet-kid',    x: 0.60, y: 0.82, w: 0.10, h: 0.10, name: 'Blazer'    }, // BOTTOM_STALAGMITE
    ],
  },

  // ── Group G — Quick Dwell Waldo (500 ms dwell, 11 creatures, 180 s) ───────
  {
    id: 'lvl-30', title: 'Blink Forest', scene: 'forest',
    spotlight: 0.15, timeLimit: 180, dwellMs: 500, hintMs: 4000,
    creatures: [
      { id: 'c01', kind: 'bunny',         x: 0.42, y: 0.11, w: 0.11, h: 0.11, name: 'Snowpuff' },
      { id: 'c02', kind: 'owl',           x: 0.66, y: 0.10, w: 0.10, h: 0.10, name: 'Blinky'   },
      { id: 'c03', kind: 'bear-cub',      x: 0.82, y: 0.18, w: 0.11, h: 0.11, name: 'Grizzly'  },
      { id: 'c04', kind: 'fox-pup',       x: 0.22, y: 0.21, w: 0.10, h: 0.10, name: 'Foxy'     },
      { id: 'c05', kind: 'kitty',         x: 0.58, y: 0.19, w: 0.10, h: 0.10, name: 'Patches'  },
      { id: 'c06', kind: 'deer-dot',      x: 0.06, y: 0.28, w: 0.10, h: 0.10, name: 'Dottie'   }, // LEFT_TRUNK
      { id: 'c07', kind: 'acorn-buddy',   x: 0.44, y: 0.43, w: 0.10, h: 0.10, name: 'Acorn'    },
      { id: 'c08', kind: 'mushroom-cap',  x: 0.94, y: 0.42, w: 0.10, h: 0.10, name: 'Shroomi'  }, // RIGHT_TRUNK
      { id: 'c09', kind: 'hedgehog-roll', x: 0.20, y: 0.08, w: 0.10, h: 0.10, name: 'Prickle'  }, // TOP_BRANCH
      { id: 'c10', kind: 'squirrel-nut',  x: 0.56, y: 0.80, w: 0.10, h: 0.10, name: 'Nutty'    }, // BOTTOM_GRASS
      { id: 'c11', kind: 'firefly-glow',  x: 0.80, y: 0.68, w: 0.09, h: 0.09, name: 'Glimmer'  },
    ],
  },
  {
    id: 'lvl-31', title: 'Dart Meadow', scene: 'meadow',
    spotlight: 0.15, timeLimit: 180, dwellMs: 500, hintMs: 4000,
    creatures: [
      { id: 'c01', kind: 'frog-pal',          x: 0.44, y: 0.12, w: 0.11, h: 0.11, name: 'Hopscotch' },
      { id: 'c02', kind: 'bee-buzz',          x: 0.20, y: 0.10, w: 0.10, h: 0.10, name: 'Honey'     },
      { id: 'c03', kind: 'butterfly-blue',    x: 0.76, y: 0.13, w: 0.10, h: 0.10, name: 'Flutter'   },
      { id: 'c04', kind: 'hummingbird',       x: 0.36, y: 0.22, w: 0.10, h: 0.10, name: 'Hummy'     },
      { id: 'c05', kind: 'ladybug-spot',      x: 0.62, y: 0.20, w: 0.10, h: 0.10, name: 'Dotty'     },
      { id: 'c06', kind: 'snail-trail',       x: 0.84, y: 0.24, w: 0.10, h: 0.10, name: 'Slowpoke'  },
      { id: 'c07', kind: 'caterpillar-green', x: 0.07, y: 0.64, w: 0.11, h: 0.10, name: 'Munchy'    }, // LEFT_TUFT
      { id: 'c08', kind: 'duck-bill',         x: 0.46, y: 0.44, w: 0.10, h: 0.10, name: 'Donald'    },
      { id: 'c09', kind: 'sunflower-face',    x: 0.28, y: 0.80, w: 0.10, h: 0.10, name: 'Sunny'     }, // BOTTOM_GRASS
      { id: 'c10', kind: 'dragonfly-zip',     x: 0.68, y: 0.47, w: 0.10, h: 0.10, name: 'Zippy'     },
      { id: 'c11', kind: 'hamster-round',     x: 0.93, y: 0.67, w: 0.09, h: 0.09, name: 'Rolly'     }, // RIGHT_TUFT
    ],
  },
  {
    id: 'lvl-32', title: 'Speedy Cove', scene: 'beach',
    spotlight: 0.15, timeLimit: 180, dwellMs: 500, hintMs: 4000,
    creatures: [
      { id: 'c01', kind: 'turtle-shell',  x: 0.44, y: 0.11, w: 0.11, h: 0.11, name: 'Shelly'   },
      { id: 'c02', kind: 'star-pal',      x: 0.20, y: 0.09, w: 0.10, h: 0.10, name: 'Starla'   },
      { id: 'c03', kind: 'penguin-pal',   x: 0.74, y: 0.12, w: 0.11, h: 0.11, name: 'Tux'      },
      { id: 'c04', kind: 'dolphin-flip',  x: 0.32, y: 0.20, w: 0.10, h: 0.10, name: 'Flipper'  },
      { id: 'c05', kind: 'flamingo-pink', x: 0.62, y: 0.18, w: 0.10, h: 0.10, name: 'Pinky'    },
      { id: 'c06', kind: 'crab-snap',     x: 0.46, y: 0.43, w: 0.10, h: 0.10, name: 'Snappy'   },
      { id: 'c07', kind: 'seahorse-curl', x: 0.82, y: 0.46, w: 0.10, h: 0.10, name: 'Curly'    },
      { id: 'c08', kind: 'moon-kid',      x: 0.08, y: 0.73, w: 0.10, h: 0.10, name: 'Moony'    }, // LEFT_ROCK
      { id: 'c09', kind: 'clownfish',     x: 0.24, y: 0.82, w: 0.10, h: 0.10, name: 'Nemo'     }, // BOTTOM_SAND
      { id: 'c10', kind: 'jellyfish-glow',x: 0.62, y: 0.48, w: 0.10, h: 0.10, name: 'Glowy'    },
      { id: 'c11', kind: 'fish-fin',      x: 0.91, y: 0.71, w: 0.09, h: 0.09, name: 'Finley'   }, // RIGHT_ROCK
    ],
  },
  {
    id: 'lvl-33', title: 'Flash Cavern', scene: 'cave',
    spotlight: 0.15, timeLimit: 180, dwellMs: 500, hintMs: 4000,
    creatures: [
      { id: 'c01', kind: 'owl',          x: 0.22, y: 0.09, w: 0.11, h: 0.11, name: 'Dusk'      }, // TOP_STALACTITE
      { id: 'c02', kind: 'star-pal',     x: 0.56, y: 0.10, w: 0.10, h: 0.10, name: 'Gleam'     },
      { id: 'c03', kind: 'moon-kid',     x: 0.80, y: 0.18, w: 0.10, h: 0.10, name: 'Gloomy'    },
      { id: 'c04', kind: 'planet-ring',  x: 0.36, y: 0.23, w: 0.10, h: 0.10, name: 'Saturn'    },
      { id: 'c05', kind: 'star-scout',   x: 0.64, y: 0.20, w: 0.10, h: 0.10, name: 'Scout'     },
      { id: 'c06', kind: 'fox-pup',      x: 0.05, y: 0.38, w: 0.10, h: 0.10, name: 'Redtail'   }, // LEFT_WALL
      { id: 'c07', kind: 'crystal-blue', x: 0.44, y: 0.44, w: 0.10, h: 0.10, name: 'Prism'     },
      { id: 'c08', kind: 'nebula-pup',   x: 0.84, y: 0.47, w: 0.10, h: 0.10, name: 'Cosmo'     },
      { id: 'c09', kind: 'bat-wing',     x: 0.26, y: 0.74, w: 0.10, h: 0.10, name: 'Nightwing' },
      { id: 'c10', kind: 'firefly-glow', x: 0.95, y: 0.36, w: 0.09, h: 0.09, name: 'Sparky'    }, // RIGHT_WALL
      { id: 'c11', kind: 'bear-cub',     x: 0.58, y: 0.82, w: 0.10, h: 0.10, name: 'Nutmeg'    }, // BOTTOM_STALAGMITE
    ],
  },

  // ── Group H — Wide Beam Waldo (spotlight 0.24, 13 creatures, 420 s) ───────
  {
    id: 'lvl-34', title: 'Lantern Run', scene: 'forest',
    spotlight: 0.24, timeLimit: 420, hintMs: 6000,
    creatures: [
      { id: 'c01', kind: 'bunny',          x: 0.44, y: 0.11, w: 0.10, h: 0.10, name: 'Floppsy'   },
      { id: 'c02', kind: 'bear-cub',       x: 0.70, y: 0.09, w: 0.09, h: 0.09, name: 'Teddy'     },
      { id: 'c03', kind: 'owl',            x: 0.24, y: 0.18, w: 0.10, h: 0.10, name: 'Wiser'     },
      { id: 'c04', kind: 'raccoon-mask',   x: 0.56, y: 0.21, w: 0.09, h: 0.09, name: 'Bandit'    },
      { id: 'c05', kind: 'fox-pup',        x: 0.84, y: 0.16, w: 0.09, h: 0.09, name: 'Blaze'     },
      { id: 'c06', kind: 'kitty',          x: 0.06, y: 0.34, w: 0.09, h: 0.09, name: 'Tiger'     }, // LEFT_TRUNK
      { id: 'c07', kind: 'deer-dot',       x: 0.40, y: 0.44, w: 0.09, h: 0.09, name: 'Dottie'    },
      { id: 'c08', kind: 'mushroom-cap',   x: 0.72, y: 0.46, w: 0.09, h: 0.09, name: 'Shroomi'   },
      { id: 'c09', kind: 'squirrel-nut',   x: 0.94, y: 0.52, w: 0.09, h: 0.09, name: 'Nutty'     }, // RIGHT_TRUNK
      { id: 'c10', kind: 'chipmunk-cheek', x: 0.14, y: 0.08, w: 0.09, h: 0.09, name: 'Chippy'    }, // TOP_BRANCH
      { id: 'c11', kind: 'acorn-buddy',    x: 0.22, y: 0.62, w: 0.09, h: 0.09, name: 'Acorn'     },
      { id: 'c12', kind: 'hedgehog-roll',  x: 0.58, y: 0.80, w: 0.09, h: 0.09, name: 'Prickle'   }, // BOTTOM_GRASS
      { id: 'c13', kind: 'bat-wing',       x: 0.80, y: 0.65, w: 0.09, h: 0.09, name: 'Nightwing' },
    ],
  },
  {
    id: 'lvl-35', title: 'Bright Sweep', scene: 'meadow',
    spotlight: 0.24, timeLimit: 420, hintMs: 6000,
    creatures: [
      { id: 'c01', kind: 'frog-pal',          x: 0.44, y: 0.11, w: 0.10, h: 0.10, name: 'Leapy'    },
      { id: 'c02', kind: 'bee-buzz',          x: 0.20, y: 0.09, w: 0.09, h: 0.09, name: 'Buzzy'    },
      { id: 'c03', kind: 'butterfly-blue',    x: 0.72, y: 0.12, w: 0.09, h: 0.09, name: 'Biscuit'  },
      { id: 'c04', kind: 'hummingbird',       x: 0.32, y: 0.21, w: 0.09, h: 0.09, name: 'Hummy'    },
      { id: 'c05', kind: 'dragonfly-zip',     x: 0.58, y: 0.19, w: 0.09, h: 0.09, name: 'Zippy'    },
      { id: 'c06', kind: 'turtle-shell',      x: 0.84, y: 0.23, w: 0.09, h: 0.09, name: 'Mossy'    },
      { id: 'c07', kind: 'duck-bill',         x: 0.07, y: 0.66, w: 0.09, h: 0.09, name: 'Daffy'    }, // LEFT_TUFT
      { id: 'c08', kind: 'ladybug-spot',      x: 0.46, y: 0.44, w: 0.09, h: 0.09, name: 'Dotty'    },
      { id: 'c09', kind: 'snail-trail',       x: 0.70, y: 0.47, w: 0.09, h: 0.09, name: 'Slowpoke' },
      { id: 'c10', kind: 'caterpillar-green', x: 0.24, y: 0.80, w: 0.10, h: 0.09, name: 'Munchy'   }, // BOTTOM_GRASS
      { id: 'c11', kind: 'sunflower-face',    x: 0.54, y: 0.68, w: 0.09, h: 0.09, name: 'Sunny'    },
      { id: 'c12', kind: 'daisy-bud',         x: 0.93, y: 0.69, w: 0.09, h: 0.09, name: 'Daisy'    }, // RIGHT_TUFT
      { id: 'c13', kind: 'penguin-pal',       x: 0.38, y: 0.53, w: 0.09, h: 0.09, name: 'Tuxedo'   },
    ],
  },
  {
    id: 'lvl-36', title: 'Glow Cove', scene: 'beach',
    spotlight: 0.24, timeLimit: 420, hintMs: 6000,
    creatures: [
      { id: 'c01', kind: 'turtle-shell',  x: 0.44, y: 0.11, w: 0.10, h: 0.10, name: 'Rocky'    },
      { id: 'c02', kind: 'star-pal',      x: 0.20, y: 0.09, w: 0.09, h: 0.09, name: 'Comet'    },
      { id: 'c03', kind: 'penguin-pal',   x: 0.70, y: 0.12, w: 0.10, h: 0.10, name: 'Snowball' },
      { id: 'c04', kind: 'moon-kid',      x: 0.30, y: 0.21, w: 0.09, h: 0.09, name: 'Selene'   },
      { id: 'c05', kind: 'flamingo-pink', x: 0.58, y: 0.19, w: 0.09, h: 0.09, name: 'Pinky'    },
      { id: 'c06', kind: 'duck-bill',     x: 0.84, y: 0.23, w: 0.09, h: 0.09, name: 'Duckie'   },
      { id: 'c07', kind: 'crab-snap',     x: 0.07, y: 0.73, w: 0.09, h: 0.09, name: 'Snappy'   }, // LEFT_ROCK
      { id: 'c08', kind: 'seahorse-curl', x: 0.42, y: 0.45, w: 0.09, h: 0.09, name: 'Curly'    },
      { id: 'c09', kind: 'dolphin-flip',  x: 0.68, y: 0.47, w: 0.09, h: 0.09, name: 'Flipper'  },
      { id: 'c10', kind: 'jellyfish-glow',x: 0.22, y: 0.65, w: 0.09, h: 0.09, name: 'Glowy'    },
      { id: 'c11', kind: 'clownfish',     x: 0.54, y: 0.69, w: 0.09, h: 0.09, name: 'Nemo'     },
      { id: 'c12', kind: 'lobster-red',   x: 0.91, y: 0.71, w: 0.09, h: 0.09, name: 'Claw'     }, // RIGHT_ROCK
      { id: 'c13', kind: 'puffer-fish',   x: 0.40, y: 0.83, w: 0.09, h: 0.09, name: 'Puffy'    }, // BOTTOM_SAND
    ],
  },
  {
    id: 'lvl-37', title: 'Wide Cavern', scene: 'cave',
    spotlight: 0.24, timeLimit: 420, hintMs: 6000,
    creatures: [
      { id: 'c01', kind: 'owl',          x: 0.44, y: 0.09, w: 0.10, h: 0.10, name: 'Minerva' },
      { id: 'c02', kind: 'star-pal',     x: 0.68, y: 0.07, w: 0.09, h: 0.09, name: 'Lumina'  }, // TOP_STALACTITE
      { id: 'c03', kind: 'moon-kid',     x: 0.24, y: 0.17, w: 0.09, h: 0.09, name: 'Eclipse' },
      { id: 'c04', kind: 'ufo-pal',      x: 0.56, y: 0.21, w: 0.09, h: 0.09, name: 'Zoomy'   },
      { id: 'c05', kind: 'planet-ring',  x: 0.80, y: 0.18, w: 0.09, h: 0.09, name: 'Saturn'  },
      { id: 'c06', kind: 'bat-wing',     x: 0.05, y: 0.48, w: 0.09, h: 0.09, name: 'Darky'   }, // LEFT_WALL
      { id: 'c07', kind: 'fox-pup',      x: 0.38, y: 0.44, w: 0.09, h: 0.09, name: 'Ember'   },
      { id: 'c08', kind: 'crystal-blue', x: 0.64, y: 0.46, w: 0.09, h: 0.09, name: 'Prism'   },
      { id: 'c09', kind: 'bear-cub',     x: 0.94, y: 0.34, w: 0.09, h: 0.09, name: 'Cavey'   }, // RIGHT_WALL
      { id: 'c10', kind: 'luna-cat',     x: 0.22, y: 0.65, w: 0.09, h: 0.09, name: 'Selene'  },
      { id: 'c11', kind: 'nebula-pup',   x: 0.54, y: 0.68, w: 0.09, h: 0.09, name: 'Cosmo'   },
      { id: 'c12', kind: 'comet-kid',    x: 0.80, y: 0.66, w: 0.09, h: 0.09, name: 'Blazer'  },
      { id: 'c13', kind: 'star-scout',   x: 0.40, y: 0.82, w: 0.09, h: 0.09, name: 'Scout'   }, // BOTTOM_STALAGMITE
    ],
  },

  // ── Group I — Pinhole Waldo (spotlight 0.10, 14 creatures, 600 s) ─────────
  {
    id: 'lvl-38', title: 'Pin Forest', scene: 'forest',
    spotlight: 0.10, timeLimit: 600, hintMs: 8000,
    creatures: [
      { id: 'c01', kind: 'bunny',          x: 0.42, y: 0.11, w: 0.08, h: 0.08, name: 'Squint'   },
      { id: 'c02', kind: 'owl',            x: 0.70, y: 0.09, w: 0.08, h: 0.08, name: 'Peek'     },
      { id: 'c03', kind: 'bear-cub',       x: 0.06, y: 0.28, w: 0.08, h: 0.08, name: 'Shadow'   }, // LEFT_TRUNK
      { id: 'c04', kind: 'fox-pup',        x: 0.26, y: 0.19, w: 0.08, h: 0.08, name: 'Slink'    },
      { id: 'c05', kind: 'kitty',          x: 0.54, y: 0.21, w: 0.08, h: 0.08, name: 'Stealthy' },
      { id: 'c06', kind: 'deer-dot',       x: 0.84, y: 0.15, w: 0.08, h: 0.08, name: 'Fawn'     },
      { id: 'c07', kind: 'raccoon-mask',   x: 0.18, y: 0.07, w: 0.08, h: 0.08, name: 'Bandit'   }, // TOP_BRANCH
      { id: 'c08', kind: 'squirrel-nut',   x: 0.40, y: 0.43, w: 0.08, h: 0.08, name: 'Hider'    },
      { id: 'c09', kind: 'hedgehog-roll',  x: 0.68, y: 0.46, w: 0.08, h: 0.08, name: 'Prickle'  },
      { id: 'c10', kind: 'chipmunk-cheek', x: 0.93, y: 0.40, w: 0.07, h: 0.07, name: 'Speck'    }, // RIGHT_TRUNK
      { id: 'c11', kind: 'mushroom-cap',   x: 0.16, y: 0.60, w: 0.08, h: 0.08, name: 'Dimple'   },
      { id: 'c12', kind: 'acorn-buddy',    x: 0.52, y: 0.63, w: 0.07, h: 0.07, name: 'Tiny'     },
      { id: 'c13', kind: 'bat-wing',       x: 0.32, y: 0.81, w: 0.08, h: 0.08, name: 'Flick'    }, // BOTTOM_GRASS
      { id: 'c14', kind: 'firefly-glow',   x: 0.74, y: 0.80, w: 0.07, h: 0.07, name: 'Wink'     }, // BOTTOM_GRASS
    ],
  },
  {
    id: 'lvl-39', title: 'Pin Meadow', scene: 'meadow',
    spotlight: 0.10, timeLimit: 600, hintMs: 8000,
    creatures: [
      { id: 'c01', kind: 'frog-pal',          x: 0.42, y: 0.11, w: 0.08, h: 0.08, name: 'Speck'   },
      { id: 'c02', kind: 'bee-buzz',          x: 0.18, y: 0.09, w: 0.08, h: 0.08, name: 'Sting'   },
      { id: 'c03', kind: 'butterfly-blue',    x: 0.72, y: 0.12, w: 0.08, h: 0.08, name: 'Wisp'    },
      { id: 'c04', kind: 'ladybug-spot',      x: 0.28, y: 0.20, w: 0.08, h: 0.08, name: 'Teeny'   },
      { id: 'c05', kind: 'snail-trail',       x: 0.56, y: 0.19, w: 0.08, h: 0.08, name: 'Micro'   },
      { id: 'c06', kind: 'caterpillar-green', x: 0.82, y: 0.23, w: 0.09, h: 0.08, name: 'Morsel'  },
      { id: 'c07', kind: 'duck-bill',         x: 0.07, y: 0.65, w: 0.08, h: 0.08, name: 'Hush'    }, // LEFT_TUFT
      { id: 'c08', kind: 'hummingbird',       x: 0.40, y: 0.44, w: 0.08, h: 0.08, name: 'Zip'     },
      { id: 'c09', kind: 'dragonfly-zip',     x: 0.66, y: 0.47, w: 0.08, h: 0.08, name: 'Dart'    },
      { id: 'c10', kind: 'sunflower-face',    x: 0.18, y: 0.80, w: 0.08, h: 0.08, name: 'Dot'     }, // BOTTOM_GRASS
      { id: 'c11', kind: 'daisy-bud',         x: 0.50, y: 0.65, w: 0.07, h: 0.07, name: 'Petal'   },
      { id: 'c12', kind: 'hamster-round',     x: 0.80, y: 0.64, w: 0.07, h: 0.07, name: 'Blip'    },
      { id: 'c13', kind: 'turtle-shell',      x: 0.32, y: 0.53, w: 0.08, h: 0.08, name: 'Stealth' },
      { id: 'c14', kind: 'dewdrop-fairy',     x: 0.92, y: 0.66, w: 0.07, h: 0.07, name: 'Sparkle' }, // RIGHT_TUFT
    ],
  },
  {
    id: 'lvl-40', title: 'Slim Cove', scene: 'beach',
    spotlight: 0.10, timeLimit: 600, hintMs: 8000,
    creatures: [
      { id: 'c01', kind: 'turtle-shell',  x: 0.42, y: 0.11, w: 0.08, h: 0.08, name: 'Dim'     },
      { id: 'c02', kind: 'star-pal',      x: 0.18, y: 0.09, w: 0.08, h: 0.08, name: 'Flicker' },
      { id: 'c03', kind: 'penguin-pal',   x: 0.70, y: 0.12, w: 0.08, h: 0.08, name: 'Hush'    },
      { id: 'c04', kind: 'crab-snap',     x: 0.28, y: 0.21, w: 0.08, h: 0.08, name: 'Peeky'   },
      { id: 'c05', kind: 'seahorse-curl', x: 0.54, y: 0.19, w: 0.08, h: 0.08, name: 'Curly'   },
      { id: 'c06', kind: 'moon-kid',      x: 0.82, y: 0.23, w: 0.08, h: 0.08, name: 'Shade'   },
      { id: 'c07', kind: 'jellyfish-glow',x: 0.07, y: 0.73, w: 0.08, h: 0.08, name: 'Ghost'   }, // LEFT_ROCK
      { id: 'c08', kind: 'dolphin-flip',  x: 0.40, y: 0.44, w: 0.08, h: 0.08, name: 'Streak'  },
      { id: 'c09', kind: 'duck-bill',     x: 0.66, y: 0.47, w: 0.08, h: 0.08, name: 'Quill'   },
      { id: 'c10', kind: 'puffer-fish',   x: 0.18, y: 0.62, w: 0.08, h: 0.08, name: 'Spiny'   },
      { id: 'c11', kind: 'octopus-pal',   x: 0.50, y: 0.65, w: 0.08, h: 0.08, name: 'Inkblot' },
      { id: 'c12', kind: 'sea-turtle-jr', x: 0.80, y: 0.63, w: 0.07, h: 0.07, name: 'Mote'    },
      { id: 'c13', kind: 'clownfish',     x: 0.28, y: 0.83, w: 0.07, h: 0.07, name: 'Nemo'    }, // BOTTOM_SAND
      { id: 'c14', kind: 'fish-fin',      x: 0.91, y: 0.72, w: 0.07, h: 0.07, name: 'Sliver'  }, // RIGHT_ROCK
    ],
  },
  {
    id: 'lvl-41', title: 'Dark Hollow', scene: 'cave',
    spotlight: 0.10, timeLimit: 600, hintMs: 8000,
    creatures: [
      { id: 'c01', kind: 'moon-kid',     x: 0.40, y: 0.08, w: 0.08, h: 0.08, name: 'Nox'       }, // TOP_STALACTITE
      { id: 'c02', kind: 'star-pal',     x: 0.18, y: 0.17, w: 0.08, h: 0.08, name: 'Glint'     },
      { id: 'c03', kind: 'bear-cub',     x: 0.68, y: 0.12, w: 0.08, h: 0.08, name: 'Murk'      },
      { id: 'c04', kind: 'bat-wing',     x: 0.28, y: 0.22, w: 0.08, h: 0.08, name: 'Shadow'    },
      { id: 'c05', kind: 'owl',          x: 0.54, y: 0.20, w: 0.08, h: 0.08, name: 'Dusk'      },
      { id: 'c06', kind: 'fox-pup',      x: 0.05, y: 0.50, w: 0.08, h: 0.08, name: 'Wisp'      }, // LEFT_WALL
      { id: 'c07', kind: 'crystal-blue', x: 0.40, y: 0.43, w: 0.08, h: 0.08, name: 'Glimmer'   },
      { id: 'c08', kind: 'luna-cat',     x: 0.66, y: 0.46, w: 0.08, h: 0.08, name: 'Shiver'    },
      { id: 'c09', kind: 'firefly-glow', x: 0.82, y: 0.23, w: 0.08, h: 0.08, name: 'Flicker'   },
      { id: 'c10', kind: 'planet-ring',  x: 0.18, y: 0.62, w: 0.08, h: 0.08, name: 'Ringy'     },
      { id: 'c11', kind: 'astro-bear',   x: 0.50, y: 0.65, w: 0.08, h: 0.08, name: 'Cosmonaut' },
      { id: 'c12', kind: 'nebula-pup',   x: 0.94, y: 0.45, w: 0.07, h: 0.07, name: 'Cosmo'     }, // RIGHT_WALL
      { id: 'c13', kind: 'star-scout',   x: 0.28, y: 0.82, w: 0.07, h: 0.07, name: 'Recon'     }, // BOTTOM_STALAGMITE
      { id: 'c14', kind: 'comet-kid',    x: 0.62, y: 0.81, w: 0.07, h: 0.07, name: 'Streaker'  }, // BOTTOM_STALAGMITE
    ],
  },

  // ── Group J — Endless Waldo (spotlight 0.16, 15 creatures, no timer) ──────
  {
    id: 'lvl-42', title: 'Dream Forest', scene: 'forest',
    spotlight: 0.16, timeLimit: 9999, hintMs: 12000,
    creatures: [
      { id: 'c01', kind: 'bunny',          x: 0.40, y: 0.11, w: 0.08, h: 0.08, name: 'Doodle'  },
      { id: 'c02', kind: 'bear-cub',       x: 0.66, y: 0.09, w: 0.08, h: 0.08, name: 'Mochi'   },
      { id: 'c03', kind: 'owl',            x: 0.86, y: 0.15, w: 0.08, h: 0.08, name: 'Sage'    },
      { id: 'c04', kind: 'fox-pup',        x: 0.22, y: 0.21, w: 0.08, h: 0.08, name: 'Maple'   },
      { id: 'c05', kind: 'kitty',          x: 0.52, y: 0.21, w: 0.07, h: 0.07, name: 'Cookie'  },
      { id: 'c06', kind: 'deer-dot',       x: 0.06, y: 0.48, w: 0.08, h: 0.08, name: 'Fern'    }, // LEFT_TRUNK
      { id: 'c07', kind: 'squirrel-nut',   x: 0.76, y: 0.23, w: 0.07, h: 0.07, name: 'Walnut'  },
      { id: 'c08', kind: 'raccoon-mask',   x: 0.94, y: 0.30, w: 0.07, h: 0.07, name: 'Rascal'  }, // RIGHT_TRUNK
      { id: 'c09', kind: 'chipmunk-cheek', x: 0.36, y: 0.43, w: 0.07, h: 0.07, name: 'Pebble'  },
      { id: 'c10', kind: 'mushroom-cap',   x: 0.62, y: 0.46, w: 0.07, h: 0.07, name: 'Spore'   },
      { id: 'c11', kind: 'hedgehog-roll',  x: 0.16, y: 0.07, w: 0.07, h: 0.07, name: 'Spike'   }, // TOP_BRANCH
      { id: 'c12', kind: 'acorn-buddy',    x: 0.20, y: 0.63, w: 0.07, h: 0.07, name: 'Kernel'  },
      { id: 'c13', kind: 'bat-wing',       x: 0.50, y: 0.67, w: 0.07, h: 0.07, name: 'Dusk'    },
      { id: 'c14', kind: 'firefly-glow',   x: 0.76, y: 0.69, w: 0.07, h: 0.07, name: 'Twinkle' },
      { id: 'c15', kind: 'dragon-pup',     x: 0.42, y: 0.81, w: 0.08, h: 0.08, name: 'Cinder'  }, // BOTTOM_GRASS
    ],
  },
  {
    id: 'lvl-43', title: 'Forever Fields', scene: 'meadow',
    spotlight: 0.16, timeLimit: 9999, hintMs: 12000,
    creatures: [
      { id: 'c01', kind: 'frog-pal',          x: 0.40, y: 0.10, w: 0.08, h: 0.08, name: 'Poppy'  },
      { id: 'c02', kind: 'bee-buzz',          x: 0.66, y: 0.09, w: 0.07, h: 0.07, name: 'Nectar' },
      { id: 'c03', kind: 'butterfly-blue',    x: 0.86, y: 0.13, w: 0.08, h: 0.08, name: 'Wisp'   },
      { id: 'c04', kind: 'duck-bill',         x: 0.22, y: 0.22, w: 0.07, h: 0.07, name: 'Sunny'  },
      { id: 'c05', kind: 'ladybug-spot',      x: 0.52, y: 0.22, w: 0.07, h: 0.07, name: 'Dot'    },
      { id: 'c06', kind: 'dragonfly-zip',     x: 0.07, y: 0.66, w: 0.07, h: 0.07, name: 'Zippy'  }, // LEFT_TUFT
      { id: 'c07', kind: 'hummingbird',       x: 0.76, y: 0.23, w: 0.07, h: 0.07, name: 'Hummy'  },
      { id: 'c08', kind: 'snail-trail',       x: 0.36, y: 0.43, w: 0.07, h: 0.07, name: 'Slow'   },
      { id: 'c09', kind: 'caterpillar-green', x: 0.62, y: 0.47, w: 0.08, h: 0.07, name: 'Munchy' },
      { id: 'c10', kind: 'sunflower-face',    x: 0.86, y: 0.50, w: 0.07, h: 0.07, name: 'Soleil' },
      { id: 'c11', kind: 'hamster-round',     x: 0.18, y: 0.65, w: 0.07, h: 0.07, name: 'Pip'    },
      { id: 'c12', kind: 'daisy-bud',         x: 0.46, y: 0.67, w: 0.07, h: 0.07, name: 'Petal'  },
      { id: 'c13', kind: 'turtle-shell',      x: 0.74, y: 0.69, w: 0.07, h: 0.07, name: 'Mossy'  },
      { id: 'c14', kind: 'dewdrop-fairy',     x: 0.93, y: 0.65, w: 0.07, h: 0.07, name: 'Dew'    }, // RIGHT_TUFT
      { id: 'c15', kind: 'unicorn-spark',     x: 0.32, y: 0.81, w: 0.08, h: 0.08, name: 'Dream'  }, // BOTTOM_GRASS
    ],
  },
  {
    id: 'lvl-44', title: 'Ocean Depths', scene: 'beach',
    spotlight: 0.16, timeLimit: 9999, hintMs: 12000,
    creatures: [
      { id: 'c01', kind: 'turtle-shell',  x: 0.40, y: 0.10, w: 0.08, h: 0.08, name: 'Glitter' },
      { id: 'c02', kind: 'star-pal',      x: 0.66, y: 0.09, w: 0.07, h: 0.07, name: 'Perle'   },
      { id: 'c03', kind: 'penguin-pal',   x: 0.86, y: 0.13, w: 0.08, h: 0.08, name: 'Frosty'  },
      { id: 'c04', kind: 'moon-kid',      x: 0.22, y: 0.22, w: 0.07, h: 0.07, name: 'Pudding' },
      { id: 'c05', kind: 'crab-snap',     x: 0.52, y: 0.22, w: 0.07, h: 0.07, name: 'Pinchy'  },
      { id: 'c06', kind: 'seahorse-curl', x: 0.08, y: 0.73, w: 0.07, h: 0.07, name: 'Curly'   }, // LEFT_ROCK
      { id: 'c07', kind: 'dolphin-flip',  x: 0.76, y: 0.24, w: 0.07, h: 0.07, name: 'Flipper' },
      { id: 'c08', kind: 'jellyfish-glow',x: 0.38, y: 0.43, w: 0.07, h: 0.07, name: 'Jelly'   },
      { id: 'c09', kind: 'clownfish',     x: 0.62, y: 0.47, w: 0.07, h: 0.07, name: 'Nemo'    },
      { id: 'c10', kind: 'octopus-pal',   x: 0.86, y: 0.51, w: 0.07, h: 0.07, name: 'Inky'    },
      { id: 'c11', kind: 'fish-fin',      x: 0.18, y: 0.64, w: 0.07, h: 0.07, name: 'Finley'  },
      { id: 'c12', kind: 'lobster-red',   x: 0.46, y: 0.67, w: 0.07, h: 0.07, name: 'Freezy'  },
      { id: 'c13', kind: 'puffer-fish',   x: 0.74, y: 0.69, w: 0.07, h: 0.07, name: 'Drifty'  },
      { id: 'c14', kind: 'sea-turtle-jr', x: 0.32, y: 0.83, w: 0.07, h: 0.07, name: 'Tiny'    }, // BOTTOM_SAND
      { id: 'c15', kind: 'manta-ray',     x: 0.91, y: 0.72, w: 0.08, h: 0.08, name: 'Glider'  }, // RIGHT_ROCK
    ],
  },
  {
    id: 'lvl-45', title: 'Arctic Expanse', scene: 'snow',
    spotlight: 0.16, timeLimit: 9999, hintMs: 12000,
    creatures: [
      { id: 'c01', kind: 'penguin-pal',   x: 0.40, y: 0.10, w: 0.08, h: 0.08, name: 'Blizzard' },
      { id: 'c02', kind: 'polar-pup',     x: 0.66, y: 0.09, w: 0.07, h: 0.07, name: 'Frost'    },
      { id: 'c03', kind: 'snow-fox',      x: 0.86, y: 0.13, w: 0.08, h: 0.08, name: 'Glacier'  },
      { id: 'c04', kind: 'husky-pup',     x: 0.22, y: 0.22, w: 0.07, h: 0.07, name: 'Sled'     },
      { id: 'c05', kind: 'snowflake-kid', x: 0.52, y: 0.22, w: 0.07, h: 0.07, name: 'Crystal'  },
      { id: 'c06', kind: 'arctic-hare',   x: 0.07, y: 0.74, w: 0.07, h: 0.07, name: 'Snowbell' }, // LEFT_PILE
      { id: 'c07', kind: 'penguin-baby',  x: 0.76, y: 0.23, w: 0.07, h: 0.07, name: 'Sleet'    },
      { id: 'c08', kind: 'walrus-pal',    x: 0.36, y: 0.43, w: 0.07, h: 0.07, name: 'Tusker'   },
      { id: 'c09', kind: 'seal-pup',      x: 0.62, y: 0.47, w: 0.07, h: 0.07, name: 'Floe'     },
      { id: 'c10', kind: 'yeti-small',    x: 0.86, y: 0.51, w: 0.08, h: 0.08, name: 'Snowfoot' },
      { id: 'c11', kind: 'ice-bear',      x: 0.18, y: 0.65, w: 0.08, h: 0.08, name: 'Aurora'   },
      { id: 'c12', kind: 'narwhal-horn',  x: 0.46, y: 0.68, w: 0.07, h: 0.07, name: 'Tusk'     },
      { id: 'c13', kind: 'star-pal',      x: 0.74, y: 0.68, w: 0.07, h: 0.07, name: 'Boreal'   },
      { id: 'c14', kind: 'moon-kid',      x: 0.08, y: 0.07, w: 0.07, h: 0.07, name: 'Polaris'  }, // TOP_ICICLE
      { id: 'c15', kind: 'fox-pup',       x: 0.56, y: 0.83, w: 0.08, h: 0.08, name: 'Tundra'   }, // BOTTOM_DRIFT
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
