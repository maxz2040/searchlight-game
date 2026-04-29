import { describe, expect, it } from 'vitest'
import { loadScene, prefetchScene } from '../sceneLoader'
import { LEVELS } from '../levels/levels'

describe('loadScene', () => {
  it('returns the level data for a known id', async () => {
    const payload = await loadScene(LEVELS[0].id)
    expect(payload.level.id).toBe(LEVELS[0].id)
    expect(payload.level.creatures.length).toBeGreaterThan(0)
  })

  it('falls back to LEVELS[0] for an unknown id (kid-friendly: never errors)', async () => {
    const payload = await loadScene('not-a-real-id')
    expect(payload.level.id).toBe(LEVELS[0].id)
  })

  it('completes within 2s (PRD §Performance)', async () => {
    const t0 = Date.now()
    await loadScene(LEVELS[1].id)
    expect(Date.now() - t0).toBeLessThan(2000)
  })
})

describe('prefetchScene', () => {
  it('does not throw for known or unknown ids', () => {
    expect(() => prefetchScene(LEVELS[0].id)).not.toThrow()
    expect(() => prefetchScene('not-a-real-id')).not.toThrow()
  })
})
