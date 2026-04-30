import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Loader } from '../components/Loader'

describe('Loader', () => {
  it('renders the lantern label and progress bar', () => {
    render(<Loader onReady={() => {}} />)
    // Copy: "Lighting the lantern…" (v3 impeccable copy update — quieter
    // active verb matching the bedtime shape brief).
    expect(screen.getByText(/lighting the lantern/i)).toBeInTheDocument()
  })

  it('starts at 0% width', () => {
    const { container } = render(<Loader onReady={() => {}} />)
    const bar = container.querySelector('div[style*="width"]') as HTMLElement
    expect(bar).toBeTruthy()
    expect(bar.style.width).toBe('0%')
  })

  it('calls onReady once after the progress completes', () => {
    vi.useFakeTimers()
    try {
      const onReady = vi.fn()
      render(<Loader onReady={onReady} />)
      // 16 frames * 45ms = 720ms to hit 100%, then 250ms delay → ~970ms.
      act(() => {
        vi.advanceTimersByTime(1500)
      })
      expect(onReady).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
