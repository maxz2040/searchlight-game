// Pure circle-vs-axis-aligned-rectangle collision detection.
// Extracted from Spotlight.tsx so it can be unit-tested without the
// rAF loop / DOM machinery around it.
//
// All inputs/outputs are in the same coordinate space (pixels relative
// to the play surface). The function is the canonical "closest point on
// a rect to a point, then distance check" — see PRD §Collision.

export interface Circle {
  cx: number
  cy: number
  r: number
}

export interface Rect {
  /** Top-left corner X. */
  x: number
  /** Top-left corner Y. */
  y: number
  w: number
  h: number
}

/** Returns true iff the circle and rect overlap (including touching the edge). */
export function circleHitsRect(circle: Circle, rect: Rect): boolean {
  // Closest point on the rect to the circle's centre.
  const closestX = Math.max(rect.x, Math.min(circle.cx, rect.x + rect.w))
  const closestY = Math.max(rect.y, Math.min(circle.cy, rect.y + rect.h))
  const dx = circle.cx - closestX
  const dy = circle.cy - closestY
  return dx * dx + dy * dy <= circle.r * circle.r
}

/** Convert a creature's percent-coordinates + size to a pixel-space Rect
 *  centred on (c.x, c.y). */
export function creatureRect(
  c: { x: number; y: number; w: number; h: number },
  surfaceWidth: number,
  surfaceHeight: number,
): Rect {
  const w = c.w * surfaceWidth
  const h = c.h * surfaceHeight
  return {
    x: c.x * surfaceWidth - w / 2,
    y: c.y * surfaceHeight - h / 2,
    w,
    h,
  }
}
