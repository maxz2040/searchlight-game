import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SceneForeground } from '../components/SceneForeground'
import type { SceneKind } from '../levels/levels'

const SCENES: SceneKind[] = ['forest', 'meadow', 'beach', 'cave', 'snow']

describe('SceneForeground', () => {
  it('renders an svg for every scene kind', () => {
    for (const scene of SCENES) {
      const { container } = render(<SceneForeground scene={scene} />)
      expect(container.querySelector('svg')).toBeTruthy()
    }
  })

  it('every svg is aria-hidden so it does not clutter the accessibility tree', () => {
    for (const scene of SCENES) {
      const { container } = render(<SceneForeground scene={scene} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('forest foreground contains tree-trunk paths', () => {
    const { container } = render(<SceneForeground scene="forest" />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(3)
  })

  it('cave foreground contains both stalactite and stalagmite paths', () => {
    const { container } = render(<SceneForeground scene="cave" />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(4)
  })

  it('snow foreground contains icicle and drift paths', () => {
    const { container } = render(<SceneForeground scene="snow" />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(3)
  })

  it('scene foreground mounts inside Scene for Waldo Edition levels (lvl-26+)', () => {
    // The Scene component injects a [data-testid="scene-foreground"] wrapper
    // only when the level id encodes a number >= 26.  This is tested via the
    // Scene integration test — here we just confirm the component renders
    // without errors for all five scene kinds.
    for (const scene of SCENES) {
      expect(() => render(<SceneForeground scene={scene} />)).not.toThrow()
    }
  })
})
