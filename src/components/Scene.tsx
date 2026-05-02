// Scene — composes background + creatures + spotlight + HUD.
//
// Visual uplift v3:
//   * FoundBurst: 3 concentric expanding rings (warm/amber/brass) + glow core
//     + name label with spring bounce. Far more celebratory.
//   * TimerDisplay: 🔥 flame indicator under 10 s; stronger critical pulse.
//   * TargetVignette: larger creature card (h-32 w-32), bolder "FIND!" pill.
//   * ProgressPill: stripped to the essential number ratio, spring animation.
//   * RemainingTray: moved to bottom-centre, slots pop when a creature is found.
//   * SceneHud: compact level label stays top-left for orientation.

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spotlight } from './Spotlight';
import { Creature } from './Creature';
import { SceneBackground } from './SceneBackground';
import { useGame } from '../store/gameStore';
import { playPing } from '../sound';
import type { Creature as LevelCreature } from '../levels/levels';
import { SparkleIcon } from './icons';

// ---------------------------------------------------------------------------
// FoundBurst — 3-ring celebration at the creature's scene position.
// ---------------------------------------------------------------------------

interface BurstEntry {
  id: string;
  x: number;
  y: number;
  name: string;
}

function FoundBurst({ bursts }: { bursts: BurstEntry[] }) {
  return (
    <>
      {bursts.map((b) => (
        <div
          key={b.id}
          className="pointer-events-none absolute z-20"
          style={{
            left: `${b.x * 100}%`,
            top:  `${b.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Glow core — immediate warm disc */}
          <motion.div
            className="absolute rounded-full bg-spotlight-warm/75 blur-xl"
            style={{ width: 56, height: 56, marginLeft: -28, marginTop: -28 }}
            initial={{ opacity: 1, scale: 0.3 }}
            animate={{ opacity: 0, scale: 2.6 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Ring 1 — inner warm ivory */}
          <motion.div
            className="absolute rounded-full border-[5px] border-spotlight-warm"
            style={{ width: 60, height: 60, marginLeft: -30, marginTop: -30 }}
            initial={{ opacity: 0.98, scale: 0.18 }}
            animate={{ opacity: 0, scale: 3.4 }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Ring 2 — mid amber */}
          <motion.div
            className="absolute rounded-full border-[4px] border-spotlight-edge"
            style={{ width: 80, height: 80, marginLeft: -40, marginTop: -40 }}
            initial={{ opacity: 0.82, scale: 0.18 }}
            animate={{ opacity: 0, scale: 3.1 }}
            transition={{ duration: 0.85, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Ring 3 — outer brass */}
          <motion.div
            className="absolute rounded-full border-[3px] border-accent/80"
            style={{ width: 108, height: 108, marginLeft: -54, marginTop: -54 }}
            initial={{ opacity: 0.60, scale: 0.18 }}
            animate={{ opacity: 0, scale: 2.9 }}
            transition={{ duration: 1.08, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      ))}

      {/* Name labels — spring-bounce in, float up and fade */}
      {bursts.map((b) => (
        <motion.div
          key={`label-${b.id}`}
          className="pointer-events-none absolute z-20"
          style={{
            left: `${b.x * 100}%`,
            top:  `${b.y * 100}%`,
            transform: 'translate(-50%, -175%)',
          }}
          initial={{ opacity: 0, y: 18, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24, delay: 0.1 }}
        >
          <div className="surface-chrome-strong flex items-center gap-1.5 rounded-full px-4 py-1.5 text-base font-bold text-paper shadow-2xl whitespace-nowrap">
            <SparkleIcon className="h-4 w-4 text-spotlight-edge shrink-0" />
            {b.name}
          </div>
        </motion.div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// TimerDisplay — top-right countdown.
// ---------------------------------------------------------------------------

function TimerDisplay({ timeLeft, total }: { timeLeft: number; total: number }) {
  const urgent   = timeLeft <= 20;
  const critical = timeLeft <= 10;
  const pct      = total === 0 ? 0 : Math.max(0, timeLeft / total);
  const m        = Math.floor(timeLeft / 60);
  const s        = timeLeft % 60;
  const label    = m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;

  return (
    <motion.div
      key={urgent ? 'urgent' : 'normal'}
      initial={{ scale: urgent ? 1.20 : 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 20 }}
      className={`surface-chrome-strong pointer-events-none absolute top-4 right-4 z-10 safe-top flex flex-col items-center gap-1.5 rounded-2xl px-4 py-2.5 shadow-xl min-w-[76px] ${
        critical ? 'ring-2 ring-red-400 shadow-[0_0_16px_rgba(248,113,113,0.35)]'
        : urgent  ? 'ring-2 ring-red-400/60'
                  : ''
      }`}
    >
      <div className="flex items-center gap-1.5">
        {critical && <span aria-hidden>🔥</span>}
        <span
          className={`font-display text-[1.333rem] font-bold tabular-nums leading-none ${
            urgent ? 'text-red-400' : 'text-spotlight-edge'
          }`}
        >
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper/15">
        <motion.div
          className={`h-full rounded-full ${urgent ? 'bg-red-400' : 'bg-spotlight-edge'}`}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.85, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export function Scene() {
  const level      = useGame((s) => s.level());
  const found      = useGame((s) => s.found);
  const remaining  = useGame((s) => s.remaining());
  const markFound  = useGame((s) => s.markFound);
  const timeUp     = useGame((s) => s.timeUp);
  const phase      = useGame((s) => s.phase);

  // ── Countdown timer ──────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);

  useEffect(() => {
    setTimeLeft(level.timeLimit);
  }, [level.id, level.timeLimit]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { timeUp(); return; }
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { window.clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timeLeft, timeUp, phase]);

  // ── Found bursts ─────────────────────────────────────────────────────────
  const [bursts, setBursts]     = useState<BurstEntry[]>([]);
  const burstTimeout            = useRef<Map<string, number>>(new Map());

  // ── Idle hint ─────────────────────────────────────────────────────────────
  const [hintFor, setHintFor]   = useState<string | null>(null);
  const idleTimer               = useRef<number | null>(null);
  const surfaceWrapRef          = useRef<HTMLDivElement>(null);

  function bumpIdle() {
    setHintFor(null);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    // 3.5 s idle before the gentle hint ring appears — long enough that it
    // only shows when a 3-year-old is genuinely stuck, not on every pause.
    idleTimer.current = window.setTimeout(() => {
      const next = level.creatures.find((c) => !found.has(c.id));
      if (next) setHintFor(next.id);
    }, 3500);
  }

  useEffect(() => {
    bumpIdle();
    return () => { if (idleTimer.current) window.clearTimeout(idleTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id, found]);

  const onReveal = useCallback(
    (creatureId: string) => {
      if (found.has(creatureId)) return;
      markFound(creatureId);
      playPing();
      // 60 ms is clearly perceptible on iPad without being startling for toddlers.
      if ('vibrate' in navigator) navigator.vibrate?.([60]);

      const c = level.creatures.find((cr) => cr.id === creatureId);
      // Announce to screen readers.
      const announcer = document.getElementById('find-announce');
      if (c && announcer) announcer.textContent = `Found ${c.name}!`;
      if (c) {
        const burstId = `${creatureId}-${Date.now()}`;
        setBursts((prev) => [...prev, { id: burstId, x: c.x, y: c.y, name: c.name }]);
        const tid = window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== burstId));
          burstTimeout.current.delete(burstId);
        }, 1300);
        burstTimeout.current.set(burstId, tid);
      }
    },
    [found, markFound, level.creatures],
  );

  useEffect(() => {
    return () => { burstTimeout.current.forEach((tid) => window.clearTimeout(tid)); };
  }, []);

  const total        = level.creatures.length;
  const foundCount   = total - remaining;
  const activeTarget = level.creatures.find((c) => !found.has(c.id));

  // Creature to show the idle hint ring on (after 3.5 s of no movement).
  const hintCreature = hintFor
    ? level.creatures.find((c) => c.id === hintFor && !found.has(c.id)) ?? null
    : null;

  return (
    <div
      ref={surfaceWrapRef}
      className="absolute inset-0"
      onPointerMove={bumpIdle}
      onPointerDown={bumpIdle}
    >
      <Spotlight
        radiusFraction={level.spotlight}
        creatures={level.creatures}
        found={found}
        activeId={activeTarget?.id}
        onReveal={onReveal}
      >
        <SceneBackground scene={level.scene} />

        {level.creatures.map((c) => {
          const isFound = found.has(c.id);
          return (
            <div
              key={c.id}
              className="pointer-events-none absolute"
              style={{
                left:      `${c.x * 100}%`,
                top:       `${c.y * 100}%`,
                width:     `${c.w * 100}%`,
                height:    `${c.h * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              data-testid={`creature-${c.id}`}
              data-found={isFound ? 'true' : 'false'}
            />
          );
        })}

        <AnimatePresence>
          <FoundBurst bursts={bursts} />
        </AnimatePresence>
      </Spotlight>

      {/* Idle hint — amber glow ring pulses at the unfound target creature
          after 3.5 s of no pointer movement. Rendered ABOVE the spotlight
          overlay so it pierces the darkness and guides young players. */}
      {hintCreature && (
        <div
          aria-hidden
          className="pointer-events-none absolute animate-hint-pulse"
          style={{
            left:         `${hintCreature.x * 100}%`,
            top:          `${hintCreature.y * 100}%`,
            width:        `${Math.max(hintCreature.w, hintCreature.h) * 160}%`,
            height:       `${Math.max(hintCreature.w, hintCreature.h) * 160}%`,
            transform:    'translate(-50%, -50%)',
            zIndex:       8,
            borderRadius: '50%',
            background:   'rgba(212,167,60,0.14)',
            border:       '3px solid rgba(212,167,60,0.55)',
            boxShadow:    '0 0 32px rgba(212,167,60,0.50), 0 0 12px rgba(212,167,60,0.30)',
          }}
        />
      )}

      {/* Hidden aria-live region — announces creature finds to screen readers. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="find-announce"
      />

      {/* HUD */}
      <SceneHud title={level.title} />
      <TimerDisplay timeLeft={timeLeft} total={level.timeLimit} />
      <TargetVignette creatures={level.creatures} found={found} />
      <RemainingTray creatures={level.creatures} found={found} />
      <ProgressPill found={foundCount} total={total} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TargetVignette — left-side "Find this!" card.
// ---------------------------------------------------------------------------

function TargetVignette({
  creatures,
  found,
}: {
  creatures: LevelCreature[];
  found: Set<string>;
}) {
  const target = creatures.find((c) => !found.has(c.id));
  return (
    <div className="pointer-events-none absolute left-4 top-24 safe-top z-10">
      <AnimatePresence mode="wait">
        {target ? (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, scale: 0.80, x: -12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.90, x: -8 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            className="flex flex-col items-center gap-2"
          >
            {/* "FIND!" badge */}
            <div className="rounded-full bg-spotlight-edge px-4 py-1 text-[0.78rem] font-black uppercase tracking-[0.24em] text-night-deep shadow-lg">
              FIND!
            </div>

            {/* Creature card — larger for iPad */}
            <div className="surface-card relative h-32 w-32 rounded-3xl p-2 shadow-2xl ring-2 ring-spotlight-warm/50 sm:h-28 sm:w-28">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-spotlight-warm/50 blur-2xl animate-pulse-soft" />
              <Creature kind={target.kind} found />
            </div>

            {/* Creature name */}
            <div className="surface-chrome-strong rounded-full px-4 py-1.5 text-base font-bold text-paper shadow-md">
              {target.name}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="all-found"
            initial={{ opacity: 0, scale: 0.80 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            className="surface-chrome-strong flex items-center gap-2 rounded-2xl px-5 py-3 text-lg font-bold text-paper shadow-xl"
          >
            <SparkleIcon className="h-6 w-6 text-spotlight-edge" />
            All found!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SceneHud — compact level title top-left.
// ---------------------------------------------------------------------------

function SceneHud({ title }: { title: string }) {
  return (
    <div className="pointer-events-none absolute top-3 left-4 safe-top z-10">
      <div className="surface-chrome rounded-full px-4 py-1.5 shadow-md">
        <h2 className="font-display text-[1.1rem] font-semibold text-paper/90 tracking-[-0.005em]">
          {title}
        </h2>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProgressPill — top-centre found / total count.
// ---------------------------------------------------------------------------

function ProgressPill({ found, total }: { found: number; total: number }) {
  const allDone = found >= total;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`pp-${found}`}
        initial={{ opacity: 0, y: -5, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        className="surface-chrome-strong pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 safe-top flex items-center gap-2 rounded-full px-5 py-2 shadow-lg"
      >
        {allDone ? (
          <span className="flex items-center gap-1.5 text-base font-bold text-spotlight-edge">
            <SparkleIcon className="h-5 w-5" />
            All found!
          </span>
        ) : (
          <>
            <span className="font-display text-[1.333rem] font-bold text-spotlight-edge tabular-nums leading-none">
              {found}
            </span>
            <span className="text-paper/40 font-bold text-lg leading-none">/</span>
            <span className="font-display text-[1.333rem] font-bold text-paper tabular-nums leading-none">
              {total}
            </span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// RemainingTray — bottom-centre collection strip.
// ---------------------------------------------------------------------------

function RemainingTray({
  creatures,
  found,
}: {
  creatures: LevelCreature[];
  found: Set<string>;
}) {
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 safe-bottom z-10"
      aria-label="Creatures found"
      role="group"
    >
      <div className="surface-chrome-strong flex items-center gap-2 rounded-3xl p-2.5 shadow-2xl">
        {creatures.map((c) => {
          const isFound = found.has(c.id);
          return (
            <motion.div
              // Re-mounting on state change triggers the slot-found animation.
              key={`${c.id}-${isFound ? 'found' : 'hidden'}`}
              initial={isFound ? { scale: 0.62, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                isFound
                  ? { type: 'spring', stiffness: 400, damping: 22 }
                  : {}
              }
              className={`relative h-14 w-14 overflow-hidden rounded-2xl transition-[background-color,box-shadow] duration-[260ms] ${
                isFound
                  ? 'surface-card ring-2 ring-spotlight-edge shadow-[0_0_14px_rgba(212,167,60,0.45)]'
                  : 'bg-[rgba(12,14,26,0.88)] ring-1 ring-[rgba(245,238,222,0.14)]'
              }`}
              aria-label={isFound ? c.name : 'hidden'}
              title={isFound ? c.name : 'hidden'}
            >
              {isFound && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-spotlight-warm/22" />
              )}
              <Creature kind={c.kind} found={isFound} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
