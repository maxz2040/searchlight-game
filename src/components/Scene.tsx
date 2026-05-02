// Scene composes the background + creatures + spotlight + HUD into a
// playable level. Owns the per-level state subscription and feeds the
// Spotlight component its creature list.
//
// Polish additions:
//   * Countdown timer — visible top-right, turns red in the last 20s.
//     Calls timeUp() when it hits zero.
//   * FoundBurst — a sparkle ring that expands then fades at the exact
//     scene position of each creature the moment it's found.

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
// FoundBurst — a warm ring + sparkle that expands and fades at the
// creature's scene-relative position. Renders for 1.2 seconds.
// ---------------------------------------------------------------------------

interface BurstEntry {
  id: string;
  x: number; // fraction 0..1
  y: number; // fraction 0..1
  name: string;
}

function FoundBurst({ bursts }: { bursts: BurstEntry[] }) {
  return (
    <>
      {bursts.map((b) => (
        <motion.div
          key={b.id}
          className="pointer-events-none absolute z-20 flex flex-col items-center gap-1"
          style={{
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 1, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Expanding warm ring */}
          <div className="absolute h-20 w-20 rounded-full border-4 border-spotlight-edge/70" />
          {/* Inner glow disc */}
          <div className="h-12 w-12 rounded-full bg-spotlight-warm/55 blur-sm" />
        </motion.div>
      ))}
      {/* Name pop labels — separate so they fade slower */}
      {bursts.map((b) => (
        <motion.div
          key={`label-${b.id}`}
          className="pointer-events-none absolute z-20"
          style={{
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            transform: 'translate(-50%, -140%)',
          }}
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="surface-chrome-strong rounded-full px-3 py-1 text-sm font-bold text-paper shadow-lg whitespace-nowrap">
            ✦ {b.name}
          </div>
        </motion.div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// TimerDisplay — top-right countdown. Red + pulse in the last 20s.
// ---------------------------------------------------------------------------

function TimerDisplay({ timeLeft, total }: { timeLeft: number; total: number }) {
  const urgent = timeLeft <= 20;
  const pct = total === 0 ? 0 : Math.max(0, timeLeft / total);
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const label = m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;

  return (
    <motion.div
      key={urgent ? 'urgent' : 'normal'}
      initial={{ scale: urgent ? 1.15 : 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`surface-chrome-strong pointer-events-none absolute top-4 right-4 z-10 safe-top flex flex-col items-center gap-1 rounded-2xl px-4 py-2 shadow-lg min-w-[72px] ${
        urgent ? 'ring-2 ring-red-400/70' : ''
      }`}
    >
      <span
        className={`font-display text-[1.333rem] font-bold tabular-nums ${
          urgent ? 'text-red-400' : 'text-spotlight-edge'
        }`}
      >
        {label}
      </span>
      {/* Depleting wick bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper/15">
        <motion.div
          className={`h-full rounded-full ${urgent ? 'bg-red-400' : 'bg-spotlight-edge'}`}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export function Scene() {
  const level = useGame((s) => s.level());
  const found = useGame((s) => s.found);
  const remaining = useGame((s) => s.remaining());
  const markFound = useGame((s) => s.markFound);
  const timeUp = useGame((s) => s.timeUp);
  const phase = useGame((s) => s.phase);

  // ── Countdown timer — only runs while phase === 'playing' ───────────────
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);

  // Reset when the level changes or when we go back to tutorial
  useEffect(() => {
    setTimeLeft(level.timeLimit);
  }, [level.id, level.timeLimit]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      timeUp();
      return;
    }
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timeLeft, timeUp, phase]);

  // ── Found bursts ─────────────────────────────────────────────────────────
  const [bursts, setBursts] = useState<BurstEntry[]>([]);
  const burstTimeout = useRef<Map<string, number>>(new Map());

  // ── Idle hint ─────────────────────────────────────────────────────────────
  const [hintFor, setHintFor] = useState<string | null>(null);
  const idleTimer = useRef<number | null>(null);
  const surfaceWrapRef = useRef<HTMLDivElement>(null);

  function bumpIdle() {
    setHintFor(null);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      const next = level.creatures.find((c) => !found.has(c.id));
      if (next) setHintFor(next.id);
    }, 1600);
  }

  useEffect(() => {
    bumpIdle();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id, found]);

  const onReveal = useCallback(
    (creatureId: string) => {
      if (found.has(creatureId)) return;
      markFound(creatureId);
      playPing();
      if ('vibrate' in navigator) navigator.vibrate?.(12);

      // Trigger a burst at the creature's scene position
      const c = level.creatures.find((cr) => cr.id === creatureId);
      if (c) {
        const burstId = `${creatureId}-${Date.now()}`;
        setBursts((prev) => [...prev, { id: burstId, x: c.x, y: c.y, name: c.name }]);
        // Remove after animation completes
        const tid = window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== burstId));
          burstTimeout.current.delete(burstId);
        }, 1300);
        burstTimeout.current.set(burstId, tid);
      }
    },
    [found, markFound, level.creatures]
  );

  // Cleanup burst timers on unmount
  useEffect(() => {
    return () => {
      burstTimeout.current.forEach((tid) => window.clearTimeout(tid));
    };
  }, []);

  const total = level.creatures.length;
  const foundCount = total - remaining;
  const activeTarget = level.creatures.find((c) => !found.has(c.id));

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
          void hintFor;
          return (
            <div
              key={c.id}
              className="pointer-events-none absolute"
              style={{
                left: `${c.x * 100}%`,
                top: `${c.y * 100}%`,
                width: `${c.w * 100}%`,
                height: `${c.h * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              data-testid={`creature-${c.id}`}
              data-found={isFound ? 'true' : 'false'}
            />
          );
        })}

        {/* Found burst animations — rendered inside the spotlight surface
            so they sit in the correct coordinate space */}
        <AnimatePresence>
          <FoundBurst bursts={bursts} />
        </AnimatePresence>
      </Spotlight>

      {/* HUD — title top-left, timer top-right */}
      <SceneHud title={level.title} />
      <TimerDisplay timeLeft={timeLeft} total={level.timeLimit} />

      {/* "Find this!" target vignette */}
      <TargetVignette creatures={level.creatures} found={found} />

      {/* Remaining tray — bottom-right */}
      <RemainingTray creatures={level.creatures} found={found} />

      {/* Progress pill — top-centre */}
      <ProgressPill found={foundCount} total={total} />
    </div>
  );
}

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
            initial={{ opacity: 0, scale: 0.85, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="rounded-full bg-spotlight-edge px-3 py-0.5 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-night-deep shadow-md">
              Find this
            </div>
            <div className="surface-card relative h-28 w-28 rounded-3xl p-1.5 shadow-2xl sm:h-24 sm:w-24">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-spotlight-warm/40 blur-xl animate-pulse-soft" />
              <Creature kind={target.kind} found />
            </div>
            <div className="surface-chrome-strong rounded-full px-3 py-1 text-base font-semibold text-paper shadow">
              {target.name}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="all-found"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="surface-chrome-strong flex items-center gap-1.5 rounded-2xl px-4 py-2 text-base font-semibold text-paper shadow-lg"
          >
            <SparkleIcon className="h-5 w-5 text-spotlight-edge" />
            All found
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SceneHud({ title }: { title: string }) {
  return (
    <div className="pointer-events-none absolute top-3 left-4 right-4 flex items-start justify-between safe-top z-10">
      <div className="surface-chrome-strong rounded-2xl px-4 py-1.5 shadow-lg">
        <h2 className="font-display text-[1.333rem] font-semibold text-paper tracking-[-0.005em]">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ProgressPill({ found, total }: { found: number; total: number }) {
  const remaining = total - found;
  const pct = total === 0 ? 0 : Math.round((found / total) * 100);
  const allDone = remaining === 0;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`progress-${found}-${total}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        className="surface-chrome-strong absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 rounded-2xl px-5 py-2 min-w-[148px] shadow-lg safe-top z-10"
      >
        <div className="flex items-baseline gap-1.5 text-paper tabular-nums">
          <span className="font-display text-[1.333rem] font-bold text-spotlight-edge">
            {found}
          </span>
          <span className="text-sm font-medium text-paper/65">/</span>
          <span className="font-display text-base font-semibold text-paper/85">
            {total}
          </span>
          <span className="ml-1 text-sm font-medium text-paper/85 tabular-nums">
            {allDone ? 'all found' : remaining === 1 ? 'one to go' : 'found'}
          </span>
        </div>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-paper/15">
          <motion.div
            className="h-full rounded-full bg-spotlight-edge"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function RemainingTray({
  creatures,
  found,
}: {
  creatures: LevelCreature[];
  found: Set<string>;
}) {
  const cols = Math.min(creatures.length, 9);
  return (
    <div
      className="pointer-events-none absolute bottom-4 right-4 safe-bottom z-10 max-w-[88%]"
      aria-label="Creatures found"
      role="group"
    >
      <div
        className="surface-chrome-strong grid gap-2 rounded-3xl p-2.5 shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {creatures.map((c) => {
          const isFound = found.has(c.id);
          return (
            <div
              key={c.id}
              className={`relative h-14 w-14 overflow-hidden rounded-2xl transition-[background-color,box-shadow] duration-[260ms] ${
                isFound
                  ? 'surface-card shadow-md ring-2 ring-spotlight-edge'
                  : 'bg-[oklch(11%_0.03_275/0.85)] ring-2 ring-[oklch(96%_0.018_80/0.22)]'
              }`}
              aria-label={isFound ? c.name : 'hidden'}
              title={isFound ? c.name : 'hidden'}
            >
              {isFound && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-spotlight-warm/18" />
              )}
              <Creature kind={c.kind} found={isFound} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
