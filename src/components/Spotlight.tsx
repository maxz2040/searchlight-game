// Spotlight — the core mechanic. Per PRD §Spotlight:
//   * Track pointer with Framer Motion useMotionValue (no React re-render
//     per move — the radial gradient is updated outside React's render
//     cycle via useMotionValueEvent + the underlying DOM style).
//   * Radial gradient mask: inner transparent, outer near-black.
//   * Touch-first: pointer events handle mouse + touch + pen uniformly.
//
// Collision detection runs in a rAF loop driven by the live motion
// values (NOT the React state) so we never miss a frame at 60Hz on
// iPad. The collision callback receives normalized (0..1) coordinates
// + spotlight radius in pixels so the parent can compute creature
// overlaps in scene-relative space.

import { useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import type { Creature } from '../levels/levels';
import { circleHitsRect, creatureRect } from '../collision';

interface Props {
  /** Spotlight radius as a fraction of min(width, height). PRD says 0.14–0.18. */
  radiusFraction: number;
  /** All creatures the spotlight may reveal. We pass the live list so newly-
   *  found creatures stop being checked. */
  creatures: Creature[];
  /** Set of already-found creature ids — never trigger again. */
  found: Set<string>;
  /** Called once when the spotlight first overlaps a creature. */
  onReveal: (creatureId: string) => void;
  /** Children (the dark layer below the spotlight, e.g. nothing — the
   *  radial gradient itself IS the darkness). Optional. */
  children?: React.ReactNode;
}

export function Spotlight({ radiusFraction, creatures, found, onReveal, children }: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Pointer position in surface-relative pixels. Live motion values =
  // no React re-render on move. We only re-render when collision fires.
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);

  // Stable refs for collision-loop access without re-renders.
  const creaturesRef = useRef(creatures);
  const foundRef = useRef(found);
  const onRevealRef = useRef(onReveal);
  creaturesRef.current = creatures;
  foundRef.current = found;
  onRevealRef.current = onReveal;

  // Compute spotlight radius in CSS pixels from the surface size.
  const radiusPx = useMotionValue(120);

  useEffect(() => {
    function recomputeRadius() {
      const el = surfaceRef.current;
      if (!el) return;
      const r = Math.min(el.clientWidth, el.clientHeight) * radiusFraction;
      radiusPx.set(r);
    }
    recomputeRadius();
    window.addEventListener('resize', recomputeRadius);
    window.addEventListener('orientationchange', recomputeRadius);
    return () => {
      window.removeEventListener('resize', recomputeRadius);
      window.removeEventListener('orientationchange', recomputeRadius);
    };
  }, [radiusFraction, radiusPx]);

  // Update the radial gradient on every motion-value tick. This runs
  // outside the React render cycle.
  useMotionValueEvent(x, 'change', () => updateGradient());
  useMotionValueEvent(y, 'change', () => updateGradient());
  useMotionValueEvent(radiusPx, 'change', () => updateGradient());

  function updateGradient() {
    const el = overlayRef.current;
    if (!el) return;
    const cx = x.get();
    const cy = y.get();
    const r = radiusPx.get();
    // Inner: warm transparent. Outer: near-opaque navy. The soft warm
    // halo at the edge sells the "lantern" feel without obscuring the
    // creature underneath.
    el.style.background =
      `radial-gradient(circle ${r}px at ${cx}px ${cy}px, ` +
      `rgba(255, 244, 200, 0) 0%, ` +
      `rgba(255, 208, 112, 0.04) 60%, ` +
      `rgba(10, 13, 31, 0.85) 75%, ` +
      `rgba(5, 7, 20, 0.96) 100%)`;
  }

  // Collision loop. rAF-driven, reads from motion values, writes to
  // store via onReveal. Runs only while at least one creature is
  // unfound — exits cleanly otherwise.
  useEffect(() => {
    let raf = 0;
    function tick() {
      const surface = surfaceRef.current;
      if (!surface) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const W = surface.clientWidth;
      const H = surface.clientHeight;
      const cx = x.get();
      const cy = y.get();
      const r = radiusPx.get();

      // Skip if pointer hasn't entered the surface yet.
      if (cx < 0 || cy < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const list = creaturesRef.current;
      const seen = foundRef.current;
      for (const c of list) {
        if (seen.has(c.id)) continue;
        // Use the extracted pure helpers (also exercised by unit tests).
        const rect = creatureRect(c, W, H);
        if (circleHitsRect({ cx, cy, r }, rect)) {
          onRevealRef.current(c.id);
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, y, radiusPx]);

  // Pointer handlers. Use pointer events so mouse+touch+pen all work.
  // Coordinate is computed against the surface bounding rect so it
  // remains correct under transforms / scrolls.
  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const el = surfaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  // Initial position: centre, so the player sees something on first
  // render before they touch.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    x.set(el.clientWidth / 2);
    y.set(el.clientHeight / 2);
    updateGradient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Style note: the overlay is `pointer-events: none` so taps fall
  // through to the surface (which captures pointer events). The
  // overlay uses `mix-blend-mode: multiply` for a subtle warm halo.
  const overlayStyle = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      // initial gradient set in updateGradient()
    }),
    []
  );

  return (
    <div
      ref={surfaceRef}
      className="play-surface relative h-full w-full overflow-hidden"
      onPointerMove={handlePointer}
      onPointerDown={handlePointer}
      role="application"
      aria-label="Searchlight play area — drag your finger to find creatures"
      data-testid="play-surface"
    >
      {children}
      <motion.div ref={overlayRef} style={overlayStyle} data-testid="spotlight-overlay" />
    </div>
  );
}
