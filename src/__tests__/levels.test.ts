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

  it('every level has 4-15 creatures', () => {
    // Levels 1–5:   7–9 baked-in PNG creatures.
    // Levels 6–25:  4–7 SVG creatures (Pinhole group has 4, others 5–7).
    // Levels 26–45: 10–15 SVG creatures (Waldo Edition — full-scene scatter
    //               with SceneForeground hiding zones).
    for (const level of LEVELS) {
      expect(level.creatures.length).toBeGreaterThanOrEqual(4)
      expect(level.creatures.length).toBeLessThanOrEqual(15)
    }
  })

  it('Waldo Edition levels (26–45) each have at least 10 creatures', () => {
    const waldoLevels = LEVELS.filter((l) => {
      const n = parseInt(l.id.split('-')[1] ?? '0', 10)
      return n >= 26
    })
    expect(waldoLevels.length).toBe(20)
    for (const level of waldoLevels) {
      expect(level.creatures.length).toBeGreaterThanOrEqual(10)
    }
  })

  it('Waldo Edition levels use at least one foreground hiding zone per level', () => {
    // A creature is "in a hiding zone" when its x or y fraction falls inside
    // a documented foreground region (see SceneForeground.tsx).
    function inHidingZone(c: { x: number; y: number }, scene: string): boolean {
      if (scene === 'forest')
        return c.x <= 0.09 || c.x >= 0.91 || (c.x <= 0.32 && c.y <= 0.12) || c.y >= 0.77
      if (scene === 'meadow')
        return c.y >= 0.76 || (c.x <= 0.09 && c.y >= 0.57) || (c.x >= 0.91 && c.y >= 0.59)
      if (scene === 'beach')
        return c.y >= 0.80 || (c.x <= 0.13 && c.y >= 0.67) || (c.x >= 0.87 && c.y >= 0.64)
      if (scene === 'cave')
        return c.x <= 0.08 || c.x >= 0.92 || c.y <= 0.15 || c.y >= 0.77
      if (scene === 'snow')
        return c.y >= 0.79 || (c.x <= 0.11 && c.y >= 0.70) || (c.x >= 0.89 && c.y >= 0.70) || c.y <= 0.14
      return false
    }
    const waldoLevels = LEVELS.filter((l) => {
      const n = parseInt(l.id.split('-')[1] ?? '0', 10)
      return n >= 26
    })
    for (const level of waldoLevels) {
      const hiddenCount = level.creatures.filter((c) => inHidingZone(c, level.scene)).length
      expect(hiddenCount).toBeGreaterThanOrEqual(1)
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
