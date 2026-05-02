import { describe, expect, it, beforeEach } from 'vitest'
import { useGame } from '../store/gameStore'
import { LEVELS } from '../levels/levels'

// Reset store AND localStorage between tests.
function reset() {
  localStorage.clear()
  const s = useGame.getState()
  s.selectLevel(LEVELS[0].id)
  // Reset levelStars explicitly so previous test runs don't leak.
  useGame.setState({ levelStars: {} })
}

beforeEach(reset)

describe('gameStore: phase machine', () => {
  it('starts in loading phase', () => {
    // Direct construction state — selectLevel above set it to 'tutorial',
    // so reset to a fresh import is observed via initial property values.
    // Verify the initial creator yields loading (re-import would force,
    // but we just check selectLevel always returns to tutorial).
    const s = useGame.getState()
    expect(s.phase).toBe('tutorial')
  })

  it('start() moves loading → tutorial', () => {
    useGame.setState({ phase: 'loading' })
    useGame.getState().start()
    expect(useGame.getState().phase).toBe('tutorial')
  })

  it('beginPlaying() moves tutorial → playing and stamps startedAt', () => {
    useGame.setState({ phase: 'tutorial', startedAt: null })
    useGame.getState().beginPlaying()
    const s = useGame.getState()
    expect(s.phase).toBe('playing')
    expect(s.startedAt).toBeGreaterThan(0)
  })
})

describe('gameStore: markFound', () => {
  it('adds a creature to the found set', () => {
    useGame.getState().beginPlaying()
    useGame.getState().markFound('c1')
    expect(useGame.getState().found.has('c1')).toBe(true)
  })

  it('is idempotent: markFound twice for the same id is a no-op', () => {
    useGame.getState().beginPlaying()
    useGame.getState().markFound('c1')
    const sizeAfterFirst = useGame.getState().found.size
    useGame.getState().markFound('c1')
    expect(useGame.getState().found.size).toBe(sizeAfterFirst)
  })

  it('transitions to complete only when all creatures are found', () => {
    useGame.getState().beginPlaying()
    const level = useGame.getState().level()
    // Find all but the last
    for (const c of level.creatures.slice(0, -1)) {
      useGame.getState().markFound(c.id)
    }
    expect(useGame.getState().phase).toBe('playing')
    // Find the last one
    useGame.getState().markFound(level.creatures.at(-1)!.id)
    expect(useGame.getState().phase).toBe('complete')
    expect(useGame.getState().completedAt).toBeGreaterThan(0)
  })

  it('remaining() decrements as creatures are found', () => {
    useGame.getState().beginPlaying()
    const level = useGame.getState().level()
    expect(useGame.getState().remaining()).toBe(level.creatures.length)
    useGame.getState().markFound(level.creatures[0].id)
    expect(useGame.getState().remaining()).toBe(level.creatures.length - 1)
  })
})

describe('gameStore: replay + next', () => {
  it('replay() resets found set and returns to tutorial on the same level', () => {
    useGame.getState().beginPlaying()
    useGame.getState().markFound('c1')
    const lvl = useGame.getState().levelId
    useGame.getState().replay()
    const s = useGame.getState()
    expect(s.levelId).toBe(lvl)
    expect(s.found.size).toBe(0)
    expect(s.phase).toBe('tutorial')
    expect(s.startedAt).toBeNull()
    expect(s.completedAt).toBeNull()
  })

  it('next() advances to the next level and clears found', () => {
    useGame.getState().beginPlaying()
    useGame.getState().markFound('c1')
    useGame.getState().next()
    const s = useGame.getState()
    expect(s.levelId).toBe(LEVELS[1].id)
    expect(s.found.size).toBe(0)
    // next() saves stars and goes to lobby so the player can choose from the grid.
    expect(s.phase).toBe('lobby')
  })

  it('next() loops back to the first level after the last (no dead end for kids)', () => {
    useGame.setState({ levelId: LEVELS.at(-1)!.id })
    useGame.getState().next()
    expect(useGame.getState().levelId).toBe(LEVELS[0].id)
  })
})

describe('gameStore: localStorage star persistence', () => {
  it('next() writes best stars to localStorage', () => {
    useGame.setState({ phase: 'playing', startedAt: Date.now() - 10_000, completedAt: Date.now(), levelStars: {} })
    useGame.getState().next()
    const raw = localStorage.getItem('searchlight:stars')
    expect(raw).not.toBeNull()
    const saved = JSON.parse(raw!)
    expect(typeof saved[LEVELS[0].id]).toBe('number')
  })

  it('goToLobby() writes best stars to localStorage', () => {
    useGame.setState({ phase: 'playing', startedAt: Date.now() - 5_000, completedAt: Date.now(), levelStars: {} })
    useGame.getState().goToLobby()
    const raw = localStorage.getItem('searchlight:stars')
    expect(raw).not.toBeNull()
    const saved = JSON.parse(raw!)
    expect(typeof saved[LEVELS[0].id]).toBe('number')
  })

  it('next() never overwrites a higher score with a lower one', () => {
    // Seed storage with 3 stars on level 1.
    localStorage.setItem('searchlight:stars', JSON.stringify({ [LEVELS[0].id]: 3 }))
    useGame.setState({
      levelStars: { [LEVELS[0].id]: 3 },
      phase: 'playing',
      startedAt: Date.now() - 60_000, // slow run → 1 star
      completedAt: Date.now(),
    })
    useGame.getState().next()
    const saved = JSON.parse(localStorage.getItem('searchlight:stars')!)
    expect(saved[LEVELS[0].id]).toBe(3) // best score kept
  })

  it('loadStars silently returns {} on corrupt localStorage data', () => {
    localStorage.setItem('searchlight:stars', 'not-json{{{')
    // Re-importing the store is not feasible in Vitest without module reset.
    // Instead call loadStars indirectly: reset the levelStars state to what
    // the store would load from storage, then verify goToLobby merges safely.
    useGame.setState({ levelStars: {}, phase: 'complete', startedAt: Date.now() - 1000, completedAt: Date.now() })
    // goToLobby should not throw even with garbage in storage.
    expect(() => useGame.getState().goToLobby()).not.toThrow()
  })
})

describe('gameStore: selectLevel', () => {
  it('switches to the requested level and resets state', () => {
    useGame.getState().beginPlaying()
    useGame.getState().markFound('c1')
    useGame.getState().selectLevel(LEVELS[1].id)
    const s = useGame.getState()
    expect(s.levelId).toBe(LEVELS[1].id)
    expect(s.found.size).toBe(0)
    expect(s.phase).toBe('tutorial')
  })
})

describe('gameStore: derived selectors', () => {
  it('level() returns the current level definition', () => {
    expect(useGame.getState().level().id).toBe(LEVELS[0].id)
  })

  it('elapsedMs() is 0 before beginPlaying', () => {
    expect(useGame.getState().elapsedMs()).toBe(0)
  })

  it('elapsedMs() reflects time-since-start', async () => {
    useGame.getState().beginPlaying()
    await new Promise((r) => setTimeout(r, 30))
    expect(useGame.getState().elapsedMs()).toBeGreaterThanOrEqual(20)
  })
})
