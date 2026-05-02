// Spotlight — the core mechanic. Per PRD §Spotlight:
//   * Track pointer with Framer Motion useMotionValue (no React re-render
//     per move — the radial gradient is updated outside React's render
//     cycle via useMotionValueEvent + the underlying DOM style).
//   * Radial gradient mask: inner transparent, outer near-black.
//   * Touch-first: pointer events handle mouse + touch + pen uniformly.
//
// iPad Safari hardening (v3):
//   * setPointerCapture on pointerdown — ensures tracking continues even
//     if the finger slides past the element boundary (common on edge-to-
//     edge iPad play). Without this, touchmove outside the div drops
//     the pointer and the lantern freezes mid-swipe.
//   * gesturestart / gesturechange / gestureend preventDefault — Apple's
//     proprietary multi-touch gesture events. Prevents pinch-zoom from
//     hijacking two-finger input during gameplay even on older iOS where
//     the viewport meta tag is not fully respected.
//   * pointercancel handler — releases capture cleanly on iOS interrupt
//     (incoming call, home button, Control Centre swipe).

import { useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import type { Creature } from '../levels/levels';
import { circleHitsRect, creatureRect } from '../collision';

interface Props {
  radiusFraction: number;
  creatures: Creature[];
  found: Set<string>;
  activeId?: string;
  onReveal: (creatureId: string) => void;
  children?: React.ReactNode;
}

export function Spotlight({ radiusFraction, creatures, found, activeId, onReveal, children }: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);

  const creaturesRef = useRef(creatures);
  const foundRef = useRef(found);
  const activeIdRef = useRef(activeId);
  const onRevealRef = useRef(onReveal);
  creaturesRef.current = creatures;
  foundRef.current = found;
  activeIdRef.current = activeId;
  onRevealRef.current = onReveal;

  const pointerInteractedRef = useRef(false);

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

  useMotionValueEvent(x, 'change', () => updateGradient());
  useMotionValueEvent(y, 'change', () => updateGradient());
  useMotionValueEvent(radiusPx, 'change', () => updateGradient());

  function updateGradient() {
    const el = overlayRef.current;
    if (!el) return;
    const cx = x.get();
    const cy = y.get();
    const r = radiusPx.get();
    el.style.background =
      `radial-gradient(circle ${r}px at ${cx}px ${cy}px, ` +
      `rgba(255, 244, 200, 0) 0%, ` +
      `rgba(255, 208, 112, 0.04) 60%, ` +
      `rgba(10, 13, 31, 0.85) 75%, ` +
      `rgba(5, 7, 20, 0.96) 100%)`;
  }

  // ── Gesture prevention (iPad Safari) ────────────────────────────────────
  // Apple's proprietary gesturestart/change/end events fire for pinch/rotate
  // multi-touch. preventDefault() here is belt-and-suspenders on top of the
  // viewport meta tag's user-scalable=no, which some iOS versions ignore.
  useEffect(() => {
    function blockGesture(e: Event) {
      e.preventDefault();
    }
    // passive: false required to call preventDefault
    document.addEventListener('gesturestart',  blockGesture, { passive: false });
    document.addEventListener('gesturechange', blockGesture, { passive: false });
    document.addEventListener('gestureend',    blockGesture, { passive: false });
    return () => {
      document.removeEventListener('gesturestart',  blockGesture);
      document.removeEventListener('gesturechange', blockGesture);
      document.removeEventListener('gestureend',    blockGesture);
    };
  }, []);

  // ── Collision loop ───────────────────────────────────────────────────────
  const DWELL_MS = 1400;
  const FIND_COOLDOWN_MS = 800;

  useEffect(() => {
    let raf = 0;
    const overlapStart: Record<string, number | undefined> = {};
    let lastFoundAt = 0;

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

      if (cx < 0 || cy < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!pointerInteractedRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();

      if (now - lastFoundAt < FIND_COOLDOWN_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const seen = foundRef.current;
      const target = activeIdRef.current;
      const c = target && !seen.has(target)
        ? creaturesRef.current.find((cr) => cr.id === target)
        : undefined;
      if (c) {
        const rect = creatureRect(c, W, H);
        const overlapping = circleHitsRect({ cx, cy, r }, rect);
        if (overlapping) {
          if (overlapStart[c.id] == null) overlapStart[c.id] = now;
          else if (now - overlapStart[c.id]! >= DWELL_MS) {
            lastFoundAt = now;
            onRevealRef.current(c.id);
            overlapStart[c.id] = undefined;
          }
        } else {
          overlapStart[c.id] = undefined;
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, y, radiusPx]);

  // ── Pointer handlers ─────────────────────────────────────────────────────
  // Split into down/move so we can call setPointerCapture only on down.
  // setPointerCapture routes all subsequent pointer events for this
  // pointerId to this element even if the finger drifts off its edge —
  // critical for edge-to-edge play on iPad.

  function updatePosition(e: React.PointerEvent<HTMLDivElement>) {
    const el = surfaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    pointerInteractedRef.current = true;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    updatePosition(e);
    // Capture so touchmove outside the element still tracks.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // setPointerCapture can throw if the pointer is already released;
      // ignore silently.
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    updatePosition(e);
  }

  // Release capture on cancel (incoming call, home button swipe, etc.)
  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    x.set(el.clientWidth / 2);
    y.set(el.clientHeight / 2);
    updateGradient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayStyle = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
    }),
    []
  );

  return (
    <div
      ref={surfaceRef}
      className="play-surface relative h-full w-full overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerCancel={handlePointerCancel}
      role="application"
      aria-label="Searchlight play area — drag your finger to find creatures"
      data-testid="play-surface"
    >
      {children}
      <motion.div ref={overlayRef} style={overlayStyle} data-testid="spotlight-overlay" />
    </div>
  );
}
