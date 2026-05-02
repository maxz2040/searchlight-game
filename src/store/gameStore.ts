// Game state via Zustand. Lightweight, no providers, no re-renders for
// fast-changing pointer state (that lives in Framer Motion motion values
// inside the Spotlight component).
//
// Phase machine (v2 — lobby added):
//   loading → tutorial → playing → complete
//                   ↑                  |
//              lobby  ←────────────────┘
//                 ↑
//   (also reachable via "All Worlds" button on Complete)

import { create } from 'zustand';
import { LEVELS, type Level, getLevel, nextLevelId } from '../levels/levels';

export type Phase = 'loading' | 'tutorial' | 'playing' | 'complete' | 'lobby';

interface GameState {
  phase: Phase;
  levelId: string;
  found: Set<string>;
  startedAt: number | null;
  completedAt: number | null;
  timeExpired: boolean;
  /** Best star score achieved per level id — persists across replays. */
  levelStars: Record<string, number>;

  // Derived selectors
  level(): Level;
  remaining(): number;
  elapsedMs(): number;
  stars(): number;

  // Actions
  start(): void;
  beginPlaying(): void;
  markFound(creatureId: string): void;
  timeUp(): void;
  selectLevel(id: string): void;
  replay(): void;
  next(): void;
  goToLobby(): void;
}

export const useGame = create<GameState>((set, get) => ({
  phase: 'loading',
  levelId: LEVELS[0].id,
  found: new Set<string>(),
  startedAt: null,
  completedAt: null,
  timeExpired: false,
  levelStars: {},

  level() {
    const id = get().levelId;
    return getLevel(id) ?? LEVELS[0];
  },
  remaining() {
    const { found, levelId } = get();
    const level = getLevel(levelId);
    if (!level) return 0;
    return level.creatures.length - found.size;
  },
  elapsedMs() {
    const { startedAt, completedAt } = get();
    if (!startedAt) return 0;
    return (completedAt ?? Date.now()) - startedAt;
  },
  stars() {
    const { startedAt, completedAt, levelId, timeExpired } = get();
    if (timeExpired) return 1;
    if (!startedAt || !completedAt) return 0;
    const level = getLevel(levelId);
    if (!level) return 1;
    const elapsedSec = (completedAt - startedAt) / 1000;
    const ratio = elapsedSec / level.timeLimit;
    if (ratio <= 0.4) return 3;
    if (ratio <= 0.7) return 2;
    return 1;
  },

  start() {
    set({ phase: 'tutorial' });
  },
  beginPlaying() {
    const { levelId } = get();
    const level = getLevel(levelId);
    const now = Date.now();
    if (level && level.creatures.length === 0) {
      set({ phase: 'complete', startedAt: now, completedAt: now, timeExpired: false });
      return;
    }
    set({ phase: 'playing', startedAt: now, completedAt: null, timeExpired: false });
  },
  markFound(creatureId: string) {
    const { found, levelId } = get();
    if (found.has(creatureId)) return;
    const next = new Set(found);
    next.add(creatureId);
    const level = getLevel(levelId);
    const isComplete = level ? next.size >= level.creatures.length : false;
    set({
      found: next,
      ...(isComplete ? { phase: 'complete', completedAt: Date.now() } : {}),
    });
  },
  timeUp() {
    const { phase } = get();
    if (phase !== 'playing') return;
    set({ phase: 'complete', completedAt: Date.now(), timeExpired: true });
  },
  selectLevel(id: string) {
    set({
      levelId: id,
      found: new Set(),
      phase: 'tutorial',
      startedAt: null,
      completedAt: null,
      timeExpired: false,
    });
  },
  replay() {
    const { levelId } = get();
    set({
      levelId,
      found: new Set(),
      phase: 'tutorial',
      startedAt: null,
      completedAt: null,
      timeExpired: false,
    });
  },
  next() {
    // Save best stars for completed level, advance to next, show lobby.
    const { levelId, levelStars } = get();
    const earned = get().stars();
    const nxt = nextLevelId(levelId);
    set({
      levelId: nxt ?? LEVELS[0].id,
      found: new Set(),
      phase: 'lobby',
      startedAt: null,
      completedAt: null,
      timeExpired: false,
      levelStars: {
        ...levelStars,
        [levelId]: Math.max(levelStars[levelId] ?? 0, earned),
      },
    });
  },
  goToLobby() {
    // Save best stars, keep current levelId, show lobby.
    const { levelId, levelStars } = get();
    const earned = get().stars();
    set({
      phase: 'lobby',
      levelStars: {
        ...levelStars,
        [levelId]: Math.max(levelStars[levelId] ?? 0, earned),
      },
    });
  },
}));
