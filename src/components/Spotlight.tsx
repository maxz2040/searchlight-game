// Spotlight — the core mechanic.
//
// Architecture: all hot-path updates (gradient, dwell-ring position,
// arc progress) are done via direct DOM manipulation inside a rAF loop
// or useMotionValueEvent. Nothing goes through React state so there are
// zero re-renders per pointer-move frame.
//
// Dwell ring: a small 84×84 SVG ring that appears at the spotlight
// centre when the lantern is held over any unfound creature. The amber
// arc fills clockwise over DWELL_MS, giving kids a clear "keep holding"
// affordance. It fades in on first contact and fades out (CSS transition)
// when the finger moves away or after the find fires.
//
// Free-order discovery: the spotlight can reveal ANY unfound creature —
// not just the "active" (suggested) target. The active target is still
// prioritised when multiple bboxes overlap the spotlight so that the
// guided hint system remains consistent.
//
// iPad Safari hardening:
//   * setPointerCapture on pointerdown — tracking survives finger drift
//     past the element boundary.
//   * gesturestart/change/end preventDefault — blocks pinch-zoom on iOS
//     where the viewport meta tag is sometimes ignored.
//   * pointercancel handler — releases capture on iOS interrupt.

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

// Dwell-ring geometry (logical px).
// Larger ring (104 px / R=44) makes the fill-arc clearly legible for young
// children — the progress is satisfying and easy to track with a fingertip.
const RING_SIZE     = 104;
const RING_R        = 44;
const RING_CX       = RING_SIZE / 2;
const RING_STROKE   = 4;
const CIRCUMFERENCE = 2 * Math.PI * RING_R; // ≈ 276.5

// Mechanic constants.
const DWELL_MS         = 900;   // ms to hold still before a creature registers
const FIND_COOLDOWN_MS = 500;   // ms grace period after a find before next dwell starts

export function Spotlight({ radiusFraction, creatures, found, activeId, onReveal, children }: Props) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Dwell-ring DOM refs — updated directly in the rAF loop.
  const dwellSvgRef = useRef<SVGSVGElement>(null);
  const dwellArcRef = useRef<SVGCircleElement>(null);

  const x        = useMotionValue(-9999);
  const y        = useMotionValue(-9999);
  const radiusPx = useMotionValue(120);

  // Stable refs for closure-safe access inside rAF/effects.
  const creaturesRef = useRef(creatures);
  const foundRef     = useRef(found);
  const activeIdRef  = useRef(activeId);
  const onRevealRef  = useRef(onReveal);
  creaturesRef.current = creatures;
  foundRef.current     = found;
  activeIdRef.current  = activeId;
  onRevealRef.current  = onReveal;

  const pointerInteractedRef = useRef(false);

  // ── Radius computation ───────────────────────────────────────────────────
  useEffect(() => {
    function recomputeRadius() {
      const el = surfaceRef.current;
      if (!el) return;
      radiusPx.set(Math.min(el.clientWidth, el.clientHeight) * radiusFraction);
    }
    recomputeRadius();
    window.addEventListener('resize',            recomputeRadius);
    window.addEventListener('orientationchange', recomputeRadius);
    return () => {
      window.removeEventListener('resize',            recomputeRadius);
      window.removeEventListener('orientationchange', recomputeRadius);
    };
  }, [radiusFraction, radiusPx]);

  // ── Gradient (no React re-render) ────────────────────────────────────────
  function updateGradient() {
    const el = overlayRef.current;
    if (!el) return;
    const cx = x.get();
    const cy = y.get();
    const r  = radiusPx.get();
    el.style.background =
      `radial-gradient(circle ${r}px at ${cx}px ${cy}px, ` +
      `rgba(255, 248, 215, 0) 0%, `        +
      `rgba(255, 222, 130, 0.07) 52%, `    +
      `rgba(255, 160, 50, 0.04) 66%, `     +
      `rgba(8, 11, 27, 0.91) 76%, `        +
      `rgba(3, 5, 18, 0.97) 100%)`;
  }

  useMotionValueEvent(x,        'change', () => updateGradient());
  useMotionValueEvent(y,        'change', () => updateGradient());
  useMotionValueEvent(radiusPx, 'change', () => updateGradient());

  // ── iPad Safari: block Apple proprietary pinch/rotate gestures ──────────
  useEffect(() => {
    function blockGesture(e: Event) { e.preventDefault(); }
    document.addEventListener('gesturestart',  blockGesture, { passive: false });
    document.addEventListener('gesturechange', blockGesture, { passive: false });
    document.addEventListener('gestureend',    blockGesture, { passive: false });
    return () => {
      document.removeEventListener('gesturestart',  blockGesture);
      document.removeEventListener('gesturechange', blockGesture);
      document.removeEventListener('gestureend',    blockGesture);
    };
  }, []);

  // ── Collision + dwell-ring rAF loop ──────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    const overlapStart: Record<string, number | undefined> = {};
    let lastFoundAt = 0;

    function hideRing() {
      const svg = dwellSvgRef.current;
      if (svg) svg.style.opacity = '0';
    }
    function setRingProgress(cx: number, cy: number, progress: number) {
      const svg = dwellSvgRef.current;
      const arc = dwellArcRef.current;
      if (!svg || !arc) return;
      svg.style.transform = `translate(${cx - RING_CX}px, ${cy - RING_CX}px)`;
      svg.style.opacity   = '1';
      arc.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - progress)));
    }
    function resetArc() {
      const arc = dwellArcRef.current;
      if (arc) arc.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE));
    }

    function tick() {
      const surface = surfaceRef.current;
      if (!surface) { raf = requestAnimationFrame(tick); return; }

      const W  = surface.clientWidth;
      const H  = surface.clientHeight;
      const cx = x.get();
      const cy = y.get();
      const r  = radiusPx.get();

      if (cx < 0 || cy < 0)             { raf = requestAnimationFrame(tick); return; }
      if (!pointerInteractedRef.current) { raf = requestAnimationFrame(tick); return; }

      const now = performance.now();

      // Post-find cooldown — hide ring and skip collision until it expires.
      if (now - lastFoundAt < FIND_COOLDOWN_MS) {
        hideRing();
        raf = requestAnimationFrame(tick);
        return;
      }

      const seen     = foundRef.current;
      const activeId = activeIdRef.current;
      const all      = creaturesRef.current;

      // All unfound creatures, active target prioritised so it wins when
      // multiple bboxes overlap the spotlight at the same position.
      const unfound = all.filter((c) => !seen.has(c.id));
      const ordered = activeId
        ? [
            ...unfound.filter((c) => c.id === activeId),
            ...unfound.filter((c) => c.id !== activeId),
          ]
        : unfound;

      // Find the first overlapping creature.
      let hit: Creature | undefined;
      for (const c of ordered) {
        if (circleHitsRect({ cx, cy, r }, creatureRect(c, W, H))) {
          hit = c;
          break;
        }
      }

      if (hit) {
        const c = hit;
        if (overlapStart[c.id] == null) overlapStart[c.id] = now;

        const elapsed  = now - overlapStart[c.id]!;
        const progress = Math.min(1, elapsed / DWELL_MS);

        setRingProgress(cx, cy, progress);

        if (elapsed >= DWELL_MS) {
          hideRing();
          resetArc();
          lastFoundAt        = now;
          overlapStart[c.id] = undefined;
          onRevealRef.current(c.id);
        }

        // Reset dwell for every other unfound creature (single-focus).
        for (const other of unfound) {
          if (other.id !== c.id) overlapStart[other.id] = undefined;
        }
      } else {
        // Not overlapping any creature — hide ring, reset all dwell timers.
        hideRing();
        resetArc();
        for (const c of all) overlapStart[c.id] = undefined;
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, y, radiusPx]);

  // ── Pointer handlers ─────────────────────────────────────────────────────
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
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* already released */ }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    updatePosition(e);
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  }

  // Centre the spotlight on mount so there's something visible before first touch.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    x.set(el.clientWidth  / 2);
    y.set(el.clientHeight / 2);
    updateGradient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayStyle = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  }), []);

  const ringSvgStyle = useMemo<React.CSSProperties>(() => ({
    position:      'absolute',
    top:           0,
    left:          0,
    width:         RING_SIZE,
    height:        RING_SIZE,
    pointerEvents: 'none',
    opacity:       0,
    transition:    'opacity 180ms ease',
    willChange:    'transform, opacity',
  }), []);

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

      {/* Spotlight darkness overlay — gradient updated each frame in rAF */}
      <motion.div ref={overlayRef} style={overlayStyle} data-testid="spotlight-overlay" />

      {/* Dwell progress ring — amber arc fills clockwise while you hold still */}
      <svg
        ref={dwellSvgRef}
        style={ringSvgStyle}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden="true"
        data-testid="dwell-ring"
      >
        <circle
          cx={RING_CX}
          cy={RING_CX}
          r={RING_R}
          fill="none"
          stroke="rgba(212,167,60,0.25)"
          strokeWidth={RING_STROKE}
        />
        <circle
          ref={dwellArcRef}
          cx={RING_CX}
          cy={RING_CX}
          r={RING_R}
          fill="none"
          stroke="#d4a73c"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          transform={`rotate(-90 ${RING_CX} ${RING_CX})`}
        />
      </svg>
    </div>
  );
}
