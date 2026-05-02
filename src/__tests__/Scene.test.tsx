import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Scene } from '../components/Scene'
import { useGame } from '../store/gameStore'
import { LEVELS } from '../levels/levels'

vi.mock('../sound', () => ({
  playPing: vi.fn(),
  playFanfare: vi.fn(),
}))

describe('Scene', () => {
  beforeEach(() => {
    useGame.setState({
      phase: 'playing',
      levelId: LEVELS[0].id,
      found: new Set(),
      startedAt: Date.now(),
      completedAt: null,
    })
  })

  it('renders the level title', () => {
    render(<Scene />)
    expect(screen.getByRole('heading', { name: LEVELS[0].title })).toBeInTheDocument()
  })

  it('renders one creature element per creature in the level', () => {
    const { container } = render(<Scene />)
    const all = container.querySelectorAll('[data-testid^="creature-"]')
    // Each creature appears twice (play surface + remaining tray).
    expect(all.length).toBeGreaterThanOrEqual(LEVELS[0].creatures.length)
    for (const c of LEVELS[0].creatures) {
      expect(container.querySelector(`[data-testid="creature-${c.id}"]`)).toBeTruthy()
    }
  })

  it('starts every creature as data-found="false"', () => {
    const { container } = render(<Scene />)
    for (const c of LEVELS[0].creatures) {
      const tag = container.querySelector(`[data-testid="creature-${c.id}"]`) as HTMLElement
      expect(tag.getAttribute('data-found')).toBe('false')
    }
  })

  it('flips data-found to "true" when the store marks the creature found', () => {
    const { container } = render(<Scene />)
    const c = LEVELS[0].creatures[0]
    act(() => {
      useGame.getState().markFound(c.id)
    })
    const tag = container.querySelector(`[data-testid="creature-${c.id}"]`) as HTMLElement
    expect(tag.getAttribute('data-found')).toBe('true')
  })

  it('shows the initial 0/total progress on the pill', () => {
    const { container } = render(<Scene />)
    const total = LEVELS[0].creatures.length
    // ProgressPill renders {found}/{total} across multiple span elements
    // (so getByText with a regex won't match — text is broken up). Walk
    // the DOM and assert on textContent of the pill instead.
    const text = (container.textContent ?? '').replace(/\s+/g, ' ')
    expect(text).toMatch(new RegExp(`0\\s*/\\s*${total}`))
  })

  it('updates the store-derived remaining count when a creature is found', () => {
    render(<Scene />)
    const total = LEVELS[0].creatures.length
    expect(useGame.getState().remaining()).toBe(total)
    act(() => {
      useGame.getState().markFound(LEVELS[0].creatures[0].id)
    })
    // The count toast is wrapped in AnimatePresence mode="wait" so its DOM
    // text only swaps after the exit animation completes — out of scope for
    // happy-dom's static frame. Assert on the store-derived value instead;
    // the E2E suite covers the visible text update.
    expect(useGame.getState().remaining()).toBe(total - 1)
  })

  it('renders the play-surface test handle', () => {
    const { container } = render(<Scene />)
    expect(container.querySelector('[data-testid="spotlight-surface"]')).toBeTruthy()
  })
})
