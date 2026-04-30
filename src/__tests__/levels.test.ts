import { describe, expect, it } from 'vitest'
import { LEVELS, getLevel, nextLevelId } from '../levels/levels'

describe('LEVELS', () => {
  it('has at least three levels', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(3)
  })

  it('every level has unique id', () => {
    const ids = LEVELS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every creature in every level has unique id within the level', () => {
    for (const level of LEVELS) {
      const ids = level.creatures.map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('every creature has coordinates inside the play surface (0..1)', () => {
    for (const level of LEVELS) {
      for (const c of level.creatures) {
        expect(c.x).toBeGreaterThanOrEqual(0)
        expect(c.x).toBeLessThanOrEqual(1)
        expect(c.y).toBeGreaterThanOrEqual(0)
        expect(c.y).toBeLessThanOrEqual(1)
        expect(c.w).toBeGreaterThan(0)
        expect(c.w).toBeLessThanOrEqual(1)
        expect(c.h).toBeGreaterThan(0)
        expect(c.h).toBeLessThanOrEqual(1)
      }
    }
  })

  it('every level has 5-15 creatures (v1 composited density)', () => {
    // v0 PRD pinned 3–5 hand-placed creatures. v1 composites 8–13
    // characters baked into the painting via Higgsfield + Claude-vision
    // detection (docs/v1-compositing.md), so the bound is wider.
    for (const level of LEVELS) {
      expect(level.creatures.length).toBeGreaterThanOrEqual(5)
      expect(level.creatures.length).toBeLessThanOrEqual(15)
    }
  })

  it('spotlight radius is between 0.10 and 0.25 — not too tiny, not too easy', () => {
    for (const level of LEVELS) {
      expect(level.spotlight).toBeGreaterThanOrEqual(0.10)
      expect(level.spotlight).toBeLessThanOrEqual(0.25)
    }
  })
})

describe('getLevel', () => {
  it('returns the level with the matching id', () => {
    expect(getLevel(LEVELS[0].id)?.id).toBe(LEVELS[0].id)
  })

  it('returns undefined for unknown id', () => {
    expect(getLevel('not-a-real-id')).toBeUndefined()
  })
})

describe('nextLevelId', () => {
  it('returns the next level id when one exists', () => {
    expect(nextLevelId(LEVELS[0].id)).toBe(LEVELS[1].id)
  })

  it('returns null for the last level', () => {
    expect(nextLevelId(LEVELS.at(-1)!.id)).toBeNull()
  })

  it('returns null for unknown level id', () => {
    expect(nextLevelId('not-a-real-id')).toBeNull()
  })
})
