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
  it('renders an aria-hidden img element', () => {
    const { container } = render(<Creature kind="leaf-pup" found />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img!.getAttribute('aria-hidden')).toBe('true')
  })

  it.each(KINDS)('renders a kind-specific sprite URL for %s', (kind) => {
    const { container } = render(<Creature kind={kind} found />)
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe(`/creatures/${kind}.png`)
  })

  it('applies a flat-silhouette filter when not found', () => {
    const { container } = render(<Creature kind="leaf-pup" found={false} />)
    const img = container.querySelector('img') as HTMLImageElement
    // brightness darkens to near-black; saturate + sepia + hue-rotate gives
    // a cool moonlit blue silhouette. The kid sees a hideable shape but no
    // bright colour information.
    expect(img.style.filter).toContain('brightness(')
    expect(img.style.filter).toContain('saturate(')
    expect(img.style.filter).toContain('sepia(')
  })

  it('applies a drop-shadow when found', () => {
    const { container } = render(<Creature kind="leaf-pup" found />)
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.style.filter).toContain('drop-shadow')
  })

  it('is non-draggable and non-interactive', () => {
    const { container } = render(<Creature kind="bolt-bunny" found />)
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('draggable')).toBe('false')
    expect(img.className).toContain('pointer-events-none')
  })
})
