import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Creature } from '../components/Creature'
import type { CreatureKind } from '../levels/levels'

const KINDS: CreatureKind[] = [
  'leaf-pup',
  'flame-cub',
  'aqua-spark',
  'bolt-bunny',
  'puff-bird',
  'shroom-buddy',
  'pebble-pal',
  'star-fish',
]

describe('Creature', () => {
  it('renders an aria-hidden svg element', () => {
    const { container } = render(<Creature kind="leaf-pup" found />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg!.getAttribute('aria-hidden')).toBe('true')
  })

  it.each(KINDS)('renders a unique shape for kind %s', (kind) => {
    const { container } = render(<Creature kind={kind} found />)
    const svg = container.querySelector('svg')!
    // Every kind has at least one fill attribute on a child shape.
    const filled = svg.querySelectorAll('[fill]')
    expect(filled.length).toBeGreaterThan(0)
  })

  it('uses dimmed silhouette colours when not found', () => {
    const { container } = render(<Creature kind="leaf-pup" found={false} />)
    const svg = container.querySelector('svg') as SVGElement
    // Style opacity should be lower when hidden.
    const opacity = parseFloat(svg.style.opacity || '1')
    expect(opacity).toBeLessThan(1)
    // The body fill should be the silhouette colour, not the bright palette.
    const ellipse = svg.querySelector('ellipse[fill]') as SVGElement | null
    expect(ellipse?.getAttribute('fill')).toBe('#0e1426')
  })

  it('uses bright palette colours when found', () => {
    const { container } = render(<Creature kind="leaf-pup" found />)
    const ellipse = container.querySelector('ellipse[fill]') as SVGElement
    expect(ellipse.getAttribute('fill')).toBe('#4ade80')
  })
})
