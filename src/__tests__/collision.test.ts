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

describe('creatureRect', () => {
  // 0.5,0.5 is the centre of the surface. With a 1024x768 surface and
  // a 0.10-wide creature that's centred at 0.50 → x = 512 - 51.2 = 460.8.
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
