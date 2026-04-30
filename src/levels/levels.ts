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
      { id: 'c1', kind: 'leaf-pup', x: 0.115, y: 0.605, w: 0.095, h: 0.23, name: 'Leafu' },
      { id: 'c2', kind: 'pebble-pal', x: 0.215, y: 0.66, w: 0.095, h: 0.155, name: 'Roxxo' },
      { id: 'c3', kind: 'shroom-buddy', x: 0.06, y: 0.795, w: 0.075, h: 0.18, name: 'Shroomi' },
      { id: 'c4', kind: 'shroom-buddy', x: 0.3, y: 0.475, w: 0.06, h: 0.155, name: 'Capper' },
      { id: 'c5', kind: 'shroom-buddy', x: 0.405, y: 0.64, w: 0.075, h: 0.18, name: 'Spotty' },
      { id: 'c6', kind: 'puff-bird', x: 0.53, y: 0.755, w: 0.075, h: 0.14, name: 'Puffi' },
      { id: 'c7', kind: 'shroom-buddy', x: 0.745, y: 0.475, w: 0.06, h: 0.155, name: 'Capper' },
      { id: 'c8', kind: 'pebble-pal', x: 0.84, y: 0.625, w: 0.08, h: 0.14, name: 'Cobble' },
      { id: 'c9', kind: 'shroom-buddy', x: 0.94, y: 0.815, w: 0.075, h: 0.18, name: 'Spotty' },
    ],
  },
  {
    id: 'lvl-2',
    title: 'Meadow at Dusk',
    scene: 'meadow',
    spotlight: 0.16,
    creatures: [
      { id: 'c1', kind: 'pebble-pal', x: 0.08, y: 0.555, w: 0.075, h: 0.15, name: 'Roxxo' },
      { id: 'c2', kind: 'puff-bird', x: 0.205, y: 0.7, w: 0.09, h: 0.18, name: 'Puffi' },
      { id: 'c3', kind: 'bolt-bunny', x: 0.31, y: 0.555, w: 0.085, h: 0.26, name: 'Zappo' },
      { id: 'c4', kind: 'bolt-bunny', x: 0.395, y: 0.585, w: 0.085, h: 0.26, name: 'Sparky' },
      { id: 'c5', kind: 'flame-cub', x: 0.5, y: 0.76, w: 0.09, h: 0.23, name: 'Emberi' },
      { id: 'c6', kind: 'leaf-pup', x: 0.625, y: 0.52, w: 0.08, h: 0.18, name: 'Leafu' },
      { id: 'c7', kind: 'flame-cub', x: 0.76, y: 0.49, w: 0.075, h: 0.15, name: 'Cinder' },
      { id: 'c8', kind: 'leaf-pup', x: 0.89, y: 0.56, w: 0.08, h: 0.18, name: 'Sprout' },
    ],
  },
  {
    id: 'lvl-3',
    title: 'Starlit Shore',
    scene: 'beach',
    spotlight: 0.16,
    creatures: [
      { id: 'c1', kind: 'star-fish', x: 0.13, y: 0.7, w: 0.11, h: 0.27, name: 'Twinkli' },
      { id: 'c2', kind: 'aqua-spark', x: 0.345, y: 0.58, w: 0.09, h: 0.25, name: 'Splashu' },
      { id: 'c3', kind: 'puff-bird', x: 0.475, y: 0.62, w: 0.08, h: 0.18, name: 'Puffi' },
      { id: 'c4', kind: 'aqua-spark', x: 0.595, y: 0.7, w: 0.08, h: 0.22, name: 'Drizzle' },
      { id: 'c5', kind: 'pebble-pal', x: 0.755, y: 0.745, w: 0.085, h: 0.18, name: 'Roxxo' },
      { id: 'c6', kind: 'star-fish', x: 0.835, y: 0.51, w: 0.06, h: 0.14, name: 'Glimmer' },
      { id: 'c7', kind: 'pebble-pal', x: 0.91, y: 0.7, w: 0.075, h: 0.15, name: 'Cobble' },
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
