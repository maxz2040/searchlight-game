import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Complete } from '../components/Complete'
import { useGame } from '../store/gameStore'
import { LEVELS } from '../levels/levels'

vi.mock('../sound', () => ({
  playPing: vi.fn(),
  playFanfare: vi.fn(),
}))

// Complete renders a `phase: 'video'` first when a reward video is wired
// for the level (which it is for all 3 production levels). The video phase
// auto-advances to the card phase via either onEnded, onError, or a 9.5s
// fallback timer. happy-dom doesn't actually load <video src> so we use
// fake timers and advance past the fallback to land on the card we want
// to assert against.
function renderCompleteOnCard() {
  vi.useFakeTimers()
  const utils = render(<Complete />)
  act(() => { vi.advanceTimersByTime(10_000) })
  vi.useRealTimers()
  return utils
}

describe('Complete screen', () => {
  beforeEach(() => {
    const lvl = LEVELS[0]
    useGame.setState({
      phase: 'complete',
      levelId: lvl.id,
      found: new Set(lvl.creatures.map((c) => c.id)),
      startedAt: Date.now() - 5_000,
      completedAt: Date.now(),
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the success heading and elapsed time', () => {
    renderCompleteOnCard()
    expect(screen.getByRole('heading', { name: /you found them all/i })).toBeInTheDocument()
    expect(screen.getByText(/Whispering Forest.*\d+s/)).toBeInTheDocument()
  })

  it('lists every creature from the level', () => {
    renderCompleteOnCard()
    // v1 levels can have multiple instances of the same character kind
    // sharing a curated name (Claude-vision detection found 4 shroom-buddies
    // but the kind only has 3 unique names — Shroomi, Capper, Spotty — so
    // duplicates are expected). Use getAllByText and assert ≥1 instance per
    // creature row.
    for (const c of LEVELS[0].creatures) {
      expect(screen.getAllByText(c.name).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('Play again resets to tutorial of the same level', async () => {
    renderCompleteOnCard()
    // userEvent doesn't mix well with fake timers (renderCompleteOnCard
    // advances them then restores real timers). Click via fireEvent
    // synchronously instead — the store mutation we care about is sync.
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    const s = useGame.getState()
    expect(s.phase).toBe('tutorial')
    expect(s.levelId).toBe(LEVELS[0].id)
    expect(s.found.size).toBe(0)
  })

  it('Next level advances to a different level and resets state', async () => {
    renderCompleteOnCard()
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(screen.getByRole('button', { name: /next level/i }))
    const s = useGame.getState()
    expect(s.phase).toBe('tutorial')
    expect(s.levelId).not.toBe(LEVELS[0].id)
    expect(s.found.size).toBe(0)
  })

  it('plays the fanfare when the celebration card mounts', async () => {
    const sound = await import('../sound')
    renderCompleteOnCard()
    expect(sound.playFanfare).toHaveBeenCalled()
  })
})
