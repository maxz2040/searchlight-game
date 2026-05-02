import { describe, expect, it } from 'vitest'
import { circleHitsRect, creatureRect } from '../collision'

describe('circleHitsRect', () => {
  // Unit rectangle at the origin: covers x∈[0,10], y∈[0,10].
  const r = { x: 0, y: 0, w: 10, h: 10 } as const

  it('hits when circle centre is inside the rect', () => {
    expect(circleHitsRect({ cx: 5, cy: 5, r: 1 }, r)).toBe(true)
  })

  it('hits when circle just touches the right edge', () => {
    // closest point is (10, 5); dx = 0; dist = 0.
    expect(circleHitsRect({ cx: 10, cy: 5, r: 0.001 }, r)).toBe(true)
  })

  it('hits when circle reaches the corner exactly', () => {
    // closest point = corner (10,10); distance √2 ≈ 1.414. r=1.5 hits.
    expect(circleHitsRect({ cx: 11, cy: 11, r: 1.5 }, r)).toBe(true)
  })

  it('misses when circle is just clear of the rect', () => {
    // closest point = (10, 5); distance 1; r=0.5 → miss.
    expect(circleHitsRect({ cx: 11, cy: 5, r: 0.5 }, r)).toBe(false)
  })

  it('misses on the diagonal when distance exceeds r', () => {
    // closest = corner (10,10); dist √(4+4) ≈ 2.828. r=2 → miss.
    expect(circleHitsRect({ cx: 12, cy: 12, r: 2 }, r)).toBe(false)
  })

  it('misses when circle is far away', () => {
    expect(circleHitsRect({ cx: 100, cy: 100, r: 5 }, r)).toBe(false)
  })

  it('handles rectangles not at origin', () => {
    const off = { x: 50, y: 50, w: 20, h: 20 }
    expect(circleHitsRect({ cx: 60, cy: 60, r: 1 }, off)).toBe(true)
    expect(circleHitsRect({ cx: 5, cy: 5, r: 1 }, off)).toBe(false)
  })

  it('treats zero radius as a point', () => {
    expect(circleHitsRect({ cx: 5, cy: 5, r: 0 }, r)).toBe(true)
    expect(circleHitsRect({ cx: 11, cy: 5, r: 0 }, r)).toBe(false)
  })
})

describe('creatureRect (no expansion)', () => {
  // 0.5,0.5 is the centre of the surface. With a 1000x500 surface and
  // a 0.10-wide, 0.20-tall creature centred at 0.50 → w=100, h=100.
  it('converts percent coordinates to a centre-anchored pixel rect', () => {
    const c = { x: 0.5, y: 0.5, w: 0.1, h: 0.2 }
    const r = creatureRect(c, 1000, 500)
    expect(r.w).toBeCloseTo(100)
    expect(r.h).toBeCloseTo(100)
    expect(r.x).toBeCloseTo(450) // 500 - 50
    expect(r.y).toBeCloseTo(200) // 250 - 50
  })

  it('corner case at the top-left', () => {
    const c = { x: 0, y: 0, w: 0.2, h: 0.2 }
    const r = creatureRect(c, 100, 100)
    // centre at (0,0), so rect runs from -10..+10 — half is off-canvas.
    expect(r.x).toBeCloseTo(-10)
    expect(r.y).toBeCloseTo(-10)
  })
})

describe('creatureRect with expansion', () => {
  it('expansion=1.0 default matches no-expansion call', () => {
    const c = { x: 0.5, y: 0.5, w: 0.1, h: 0.2 }
    expect(creatureRect(c, 1000, 500)).toEqual(creatureRect(c, 1000, 500, 1.0))
  })

  it('expansion=1.25 scales w and h by 1.25 while keeping centre unchanged', () => {
    const c = { x: 0.5, y: 0.5, w: 0.1, h: 0.1 }
    const r = creatureRect(c, 1000, 1000, 1.25)
    // Width and height scaled.
    expect(r.w).toBeCloseTo(125)
    expect(r.h).toBeCloseTo(125)
    // Centre preserved: centre_x = r.x + r.w/2 = 500, centre_y = r.y + r.h/2 = 500.
    expect(r.x + r.w / 2).toBeCloseTo(500)
    expect(r.y + r.h / 2).toBeCloseTo(500)
  })

  it('expanded rect hits where the original rect misses (25% expansion)', () => {
    // Creature at centre (0.5, 0.5), w=h=0.10 on a 1000×1000 surface.
    // Original half-width = 50px → right edge at x=550.
    // Expanded (×1.25) half-width = 62.5px → right edge at x=562.5.
    // A point at x=558, y=500 (tiny circle r=0.001):
    //   • outside original bbox (558 > 550) → miss
    //   • inside expanded bbox  (558 < 562.5) → hit
    const c = { x: 0.5, y: 0.5, w: 0.1, h: 0.1 }
    const probe = { cx: 558, cy: 500, r: 0.001 }
    expect(circleHitsRect(probe, creatureRect(c, 1000, 1000, 1.0))).toBe(false)
    expect(circleHitsRect(probe, creatureRect(c, 1000, 1000, 1.25))).toBe(true)
  })

  it('expansion=2.0 doubles the dimensions', () => {
    const c = { x: 0.4, y: 0.6, w: 0.08, h: 0.12 }
    const base = creatureRect(c, 800, 600, 1.0)
    const big  = creatureRect(c, 800, 600, 2.0)
    expect(big.w).toBeCloseTo(base.w * 2)
    expect(big.h).toBeCloseTo(base.h * 2)
    // Centre unchanged.
    expect(big.x + big.w / 2).toBeCloseTo(base.x + base.w / 2)
    expect(big.y + big.h / 2).toBeCloseTo(base.y + base.h / 2)
  })
})
