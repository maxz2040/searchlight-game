import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Complete } from '../components/Complete'
import { useGame } from '../store/gameStore'
import { LEVELS } from '../levels/levels'

vi.mock('../sound', () => ({
  playPing: vi.fn(),
  playFanfare: vi.fn(),
}))

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

  it('renders the success heading and elapsed time', () => {
    render(<Complete />)
    expect(screen.getByRole('heading', { name: /you found them all/i })).toBeInTheDocument()
    // Elapsed roughly 5s.
    expect(screen.getByText(/Whispering Forest.*\d+s/)).toBeInTheDocument()
  })

  it('lists every creature from the level', () => {
    render(<Complete />)
    for (const c of LEVELS[0].creatures) {
      expect(screen.getByText(c.name)).toBeInTheDocument()
    }
  })

  it('Play again resets to tutorial of the same level', async () => {
    const user = userEvent.setup()
    render(<Complete />)
    await user.click(screen.getByRole('button', { name: /play again/i }))
    const s = useGame.getState()
    expect(s.phase).toBe('tutorial')
    expect(s.levelId).toBe(LEVELS[0].id)
    expect(s.found.size).toBe(0)
  })

  it('Next level advances to a different level and resets state', async () => {
    const user = userEvent.setup()
    render(<Complete />)
    await user.click(screen.getByRole('button', { name: /next level/i }))
    const s = useGame.getState()
    expect(s.phase).toBe('tutorial')
    expect(s.levelId).not.toBe(LEVELS[0].id)
    expect(s.found.size).toBe(0)
  })

  it('plays the fanfare when mounting', async () => {
    const sound = await import('../sound')
    render(<Complete />)
    expect(sound.playFanfare).toHaveBeenCalled()
  })
})
