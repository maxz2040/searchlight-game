import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tutorial } from '../components/Tutorial'
import { useGame } from '../store/gameStore'
import { LEVELS } from '../levels/levels'

describe('Tutorial', () => {
  beforeEach(() => {
    useGame.setState({
      phase: 'tutorial',
      levelId: LEVELS[0].id,
      found: new Set(),
      startedAt: null,
      completedAt: null,
    })
  })

  it('renders the tutorial heading and copy', () => {
    render(<Tutorial />)
    expect(screen.getByRole('heading', { name: /find the hidden friends/i })).toBeInTheDocument()
    expect(screen.getByText(/drag your finger/i)).toBeInTheDocument()
  })

  it('exposes a Start playing button', () => {
    render(<Tutorial />)
    expect(screen.getByRole('button', { name: /start playing/i })).toBeInTheDocument()
  })

  it('clicking the start button transitions the store to playing', async () => {
    const user = userEvent.setup()
    render(<Tutorial />)
    await user.click(screen.getByRole('button', { name: /start playing/i }))
    const state = useGame.getState()
    expect(state.phase).toBe('playing')
    expect(state.startedAt).toBeTypeOf('number')
  })
})
