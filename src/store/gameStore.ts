// Game state via Zustand. Lightweight, no providers, no re-renders for
// fast-changing pointer state (that lives in Framer Motion motion values
// inside the Spotlight component).

import { create } from 'zustand';
import { LEVELS, type Level, getLevel, nextLevelId } from '../levels/levels';

export type Phase = 'loading' | 'tutorial' | 'playing' | 'complete';

interface GameState {
  phase: Phase;
  levelId: string;
  found: Set<string>;
  startedAt: number | null;
  completedAt: number | null;

  // Derived selectors
  level(): Level;
  remaining(): number;
  elapsedMs(): number;

  // Actions
  start(): void;
  beginPlaying(): void;
  markFound(creatureId: string): void;
  selectLevel(id: string): void;
  replay(): void;
  next(): void;
}

export const useGame = create<GameState>((set, get) => ({
  phase: 'loading',
  levelId: LEVELS[0].id,
  found: new Set<string>(),
  startedAt: null,
  completedAt: null,

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

  start() {
    set({ phase: 'tutorial' });
  },
  beginPlaying() {
    const { levelId } = get();
    const level = getLevel(levelId);
    const now = Date.now();
    // Degenerate level (no creatures) — auto-complete instead of leaving
    // the kid stranded on an empty scene with a "0 / 0 found" pill.
    if (level && level.creatures.length === 0) {
      set({ phase: 'complete', startedAt: now, completedAt: now });
      return;
    }
    set({ phase: 'playing', startedAt: now, completedAt: null });
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
      ...(isComplete
        ? { phase: 'complete', completedAt: Date.now() }
        : {}),
    });
  },
  selectLevel(id: string) {
    set({
      levelId: id,
      found: new Set(),
      phase: 'tutorial',
      startedAt: null,
      completedAt: null,
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
    });
  },
  next() {
    const { levelId } = get();
    const nxt = nextLevelId(levelId);
    if (!nxt) {
      // Loop back to first level — kid-friendly, never a dead-end.
      set({
        levelId: LEVELS[0].id,
        found: new Set(),
        phase: 'tutorial',
        startedAt: null,
        completedAt: null,
      });
      return;
    }
    set({
      levelId: nxt,
      found: new Set(),
      phase: 'tutorial',
      startedAt: null,
      completedAt: null,
    });
  },
}));
