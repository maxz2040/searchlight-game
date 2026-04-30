// Auto-generated from scratch/composite/*-creatures.json by
// scripts/levels-from-detected.ts. Each creature's {x,y,w,h} is the
// bounding box detected by Gemini Vision on the corresponding composited
// scene PNG in /public/scenes/. The sprite itself is BAKED INTO the scene
// — the overlay layer in Scene.tsx renders only the invisible hit-zone
// for spotlight collision and the name pill that pops in on find.
//
// Re-run: npm run levels:rebuild

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
    spotlight: 0.16,
    creatures: [
      { id: 'c1', kind: 'leaf-pup', x: 0.074, y: 0.627, w: 0.149, h: 0.255, name: 'Leafu' },
      { id: 'c2', kind: 'leaf-pup', x: 0.274, y: 0.671, w: 0.163, h: 0.07, name: 'Sprout' },
      { id: 'c3', kind: 'shroom-buddy', x: 0.523, y: 0.655, w: 0.101, h: 0.151, name: 'Shroomi' },
      { id: 'c4', kind: 'puff-bird', x: 0.697, y: 0.773, w: 0.101, h: 0.111, name: 'Puffi' },
      { id: 'c5', kind: 'pebble-pal', x: 0.869, y: 0.672, w: 0.066, h: 0.06, name: 'Roxxo' },
      { id: 'c6', kind: 'pebble-pal', x: 0.594, y: 0.757, w: 0.089, h: 0.106, name: 'Cobble' },
      { id: 'c7', kind: 'shroom-buddy', x: 0.244, y: 0.484, w: 0.05, h: 0.074, name: 'Capper' },
      { id: 'c8', kind: 'pebble-pal', x: 0.411, y: 0.556, w: 0.061, h: 0.088, name: 'Mossy' },
      { id: 'c9', kind: 'shroom-buddy', x: 0.785, y: 0.483, w: 0.046, h: 0.108, name: 'Spotty' },
      { id: 'c10', kind: 'puff-bird', x: 0.891, y: 0.497, w: 0.034, h: 0.069, name: 'Featherly' },
    ],
  },
  {
    id: 'lvl-2',
    title: 'Meadow at Dusk',
    scene: 'meadow',
    spotlight: 0.16,
    creatures: [
      { id: 'c1', kind: 'leaf-pup', x: 0.491, y: 0.07, w: 0.099, h: 0.139, name: 'Leafu' },
      { id: 'c2', kind: 'puff-bird', x: 0.683, y: 0.192, w: 0.154, h: 0.175, name: 'Puffi' },
      { id: 'c3', kind: 'bolt-bunny', x: 0.611, y: 0.338, w: 0.203, h: 0.238, name: 'Zappo' },
      { id: 'c4', kind: 'bolt-bunny', x: 0.583, y: 0.434, w: 0.181, h: 0.194, name: 'Sparky' },
      { id: 'c5', kind: 'flame-cub', x: 0.795, y: 0.513, w: 0.168, h: 0.19, name: 'Emberi' },
      { id: 'c6', kind: 'leaf-pup', x: 0.626, y: 0.675, w: 0.163, h: 0.174, name: 'Sprout' },
      { id: 'c7', kind: 'leaf-pup', x: 0.525, y: 0.515, w: 0.098, h: 0.107, name: 'Mintly' },
      { id: 'c8', kind: 'flame-cub', x: 0.454, y: 0.873, w: 0.116, h: 0.161, name: 'Cinder' },
    ],
  },
  {
    id: 'lvl-3',
    title: 'Starlit Shore',
    scene: 'beach',
    spotlight: 0.16,
    creatures: [
      { id: 'c1', kind: 'star-fish', x: 0.26, y: 0.694, w: 0.106, h: 0.087, name: 'Twinkli' },
      { id: 'c2', kind: 'aqua-spark', x: 0.408, y: 0.458, w: 0.106, h: 0.13, name: 'Splashu' },
      { id: 'c3', kind: 'puff-bird', x: 0.648, y: 0.598, w: 0.081, h: 0.115, name: 'Puffi' },
      { id: 'c4', kind: 'aqua-spark', x: 0.778, y: 0.566, w: 0.094, h: 0.12, name: 'Drizzle' },
      { id: 'c5', kind: 'pebble-pal', x: 0.86, y: 0.7, w: 0.111, h: 0.124, name: 'Roxxo' },
      { id: 'c6', kind: 'pebble-pal', x: 0.867, y: 0.576, w: 0.072, h: 0.093, name: 'Cobble' },
      { id: 'c7', kind: 'puff-bird', x: 0.932, y: 0.498, w: 0.089, h: 0.104, name: 'Featherly' },
      { id: 'c8', kind: 'star-fish', x: 0.889, y: 0.423, w: 0.092, h: 0.107, name: 'Glimmer' },
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
