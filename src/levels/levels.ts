// Level data. v0 ships hand-authored placeholder scenes (rendered as
// illustrated SVG backgrounds in src/components/SceneBackground.tsx)
// with creature positions hand-tuned for variety.
//
// FUTURE EXTENSION (PRD §Backend):
//   The scene "background" field will become a URL pointing at an
//   AI-generated image (GPT-Image / SD via /api/scene). The existing
//   structure already supports that — replace `kind: 'svg'` with
//   `kind: 'image'` + `url: string` and the renderer will pick it up.
//
// Coordinates are stored as percentages (0-1) of the play surface so
// scenes adapt to portrait, landscape, and any iPad size.

export type CreatureKind =
  | 'leaf-pup'
  | 'flame-cub'
  | 'aqua-spark'
  | 'bolt-bunny'
  | 'puff-bird'
  | 'shroom-buddy'
  | 'pebble-pal'
  | 'star-fish';

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

export type SceneKind = 'forest' | 'meadow' | 'beach';

export interface Level {
  id: string;
  title: string;
  scene: SceneKind;
  /** Spotlight radius as fraction of play surface min(w, h). */
  spotlight: number;
  creatures: Creature[];
}

export const LEVELS: Level[] = [
  {
    id: 'lvl-1',
    title: 'Whispering Forest',
    scene: 'forest',
    spotlight: 0.18,
    creatures: [
      { id: 'c1', kind: 'leaf-pup',   x: 0.15, y: 0.35, w: 0.10, h: 0.10, name: 'Leafu'   },
      { id: 'c2', kind: 'shroom-buddy', x: 0.62, y: 0.72, w: 0.10, h: 0.10, name: 'Shroomi' },
      { id: 'c3', kind: 'puff-bird',  x: 0.85, y: 0.22, w: 0.09, h: 0.09, name: 'Puffi'   },
      { id: 'c4', kind: 'pebble-pal', x: 0.42, y: 0.85, w: 0.09, h: 0.09, name: 'Roxxo'   },
    ],
  },
  {
    id: 'lvl-2',
    title: 'Meadow at Dusk',
    scene: 'meadow',
    spotlight: 0.16,
    creatures: [
      { id: 'c1', kind: 'flame-cub',  x: 0.22, y: 0.62, w: 0.10, h: 0.10, name: 'Emberi'  },
      { id: 'c2', kind: 'bolt-bunny', x: 0.78, y: 0.42, w: 0.09, h: 0.09, name: 'Voltu'   },
      { id: 'c3', kind: 'puff-bird',  x: 0.55, y: 0.18, w: 0.09, h: 0.09, name: 'Cloudi'  },
      { id: 'c4', kind: 'leaf-pup',   x: 0.10, y: 0.82, w: 0.10, h: 0.10, name: 'Sprout'  },
      { id: 'c5', kind: 'shroom-buddy', x: 0.88, y: 0.85, w: 0.09, h: 0.09, name: 'Capi'  },
    ],
  },
  {
    id: 'lvl-3',
    title: 'Starlit Shore',
    scene: 'beach',
    spotlight: 0.14,
    creatures: [
      { id: 'c1', kind: 'aqua-spark', x: 0.35, y: 0.55, w: 0.10, h: 0.10, name: 'Splashu' },
      { id: 'c2', kind: 'star-fish',  x: 0.18, y: 0.78, w: 0.09, h: 0.09, name: 'Twinki'  },
      { id: 'c3', kind: 'pebble-pal', x: 0.82, y: 0.78, w: 0.09, h: 0.09, name: 'Sandi'   },
      { id: 'c4', kind: 'bolt-bunny', x: 0.65, y: 0.30, w: 0.09, h: 0.09, name: 'Zappi'   },
      { id: 'c5', kind: 'puff-bird',  x: 0.50, y: 0.10, w: 0.09, h: 0.09, name: 'Skye'    },
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
