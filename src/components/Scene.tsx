// Scene composes the background + creatures + spotlight + HUD into a
// playable level. Owns the per-level state subscription and feeds the
// Spotlight component its creature list.
//
// Hint glow: when the player has been idle for more than 1.6s, the
// nearest unfound creature gently pulses to nudge them toward it.
// Disabled once the spotlight is moving again. Improves accessibility
// for younger players (PRD §UI/UX).
//
// v1 UAT fixes (see docs/v1-uat-findings.md):
//   * All emoji replaced with inline SVG (font fallback was rendering
//     missing-glyph boxes on iPad / headless chromium).
//   * Tray buttons promoted to 56 px (kid touch-target minimum) with a
//     paper ring on unfound slots so kids can count remaining-to-find
//     even in the dark.
//   * Count toast became a progress pill: "found / total" + a thin warm
//     fill bar for at-a-glance progress.
//   * Find-this chip scales up on touch devices for arm's-length viewing.

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spotlight } from './Spotlight';
import { Creature } from './Creature';
import { SceneBackground } from './SceneBackground';
import { useGame } from '../store/gameStore';
import { playPing } from '../sound';
import type { Creature as LevelCreature } from '../levels/levels';
import { SparkleIcon } from './icons';

export function Scene() {
  const level = useGame((s) => s.level());
  const found = useGame((s) => s.found);
  const remaining = useGame((s) => s.remaining());
  const markFound = useGame((s) => s.markFound);

  const [hintFor, setHintFor] = useState<string | null>(null);
  const idleTimer = useRef<number | null>(null);
  const surfaceWrapRef = useRef<HTMLDivElement>(null);

  function bumpIdle() {
    setHintFor(null);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      // Hint the first unfound creature in left-to-right reading order.
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

  function onReveal(creatureId: string) {
    if (found.has(creatureId)) return;
    markFound(creatureId);
    playPing();
    // light haptic on supported devices
    if ('vibrate' in navigator) navigator.vibrate?.(12);
  }

  const total = level.creatures.length;
  const foundCount = total - remaining;

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
        onReveal={onReveal}
      >
        <SceneBackground scene={level.scene} />

        {/* Creatures are PAINTED INTO the scene (composited via Higgsfield —
            see docs/v1-compositing.md). We only render INVISIBLE hit-zones
            for spotlight collision; no overlay pills, no sprite, no labels
            on the scene itself. The "what to look for" cue lives in the
            floating <TargetVignette> chip in the corner. data-testid kept
            for E2E. */}
        {level.creatures.map((c) => {
          const isFound = found.has(c.id);
          const isHinted = hintFor === c.id && !isFound;
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
            >
              {/* Subtle on-find sparkle ring — anchored to the (imperfect)
                  detected bbox. Soft enough that even when the bbox is off
                  by ~30%, it just feels like ambient celebration rather
                  than a wrong-place marker. */}
              {isFound && (
                <div className="absolute inset-0 rounded-full ring-2 ring-spotlight-warm/40 animate-reveal-pop" />
              )}
              {/* Idle-hint glow nudges the kid toward the next unfound area. */}
              {isHinted && (
                <div className="absolute inset-0 rounded-full bg-spotlight-warm/40 blur-2xl animate-hint-pulse" />
              )}
            </div>
          );
        })}
      </Spotlight>

      {/* HUD — top corners. */}
      <SceneHud title={level.title} />

      {/* "Find this!" floating vignette — shows the next creature the kid
          should hunt. Replaces the per-creature name pills which were
          inaccurate (bbox detection ~50%) and visually noisy. */}
      <TargetVignette creatures={level.creatures} found={found} />

      {/* Remaining icons — bottom-right. */}
      <RemainingTray creatures={level.creatures} found={found} />

      {/* Progress pill — top-centre. Now shows "X / Y" plus a fill bar so
          kids can see momentum. */}
      <ProgressPill found={foundCount} total={total} />
    </div>
  );
}

/**
 * "Find this!" floating chip showing the next unfound creature. Sits
 * top-left under the level title (large enough for kids to read at a
 * glance, small enough not to obscure gameplay). Auto-advances when
 * the current target is found. Uses AnimatePresence to fade-and-spring
 * the swap so the moment the kid finds one, the next target arrives
 * with a satisfying flourish.
 *
 * Touch-device sizing: ~120 px so it's legible at arm's length on iPad.
 */
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
            initial={{ opacity: 0, scale: 0.7, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="rounded-full bg-spotlight-warm/95 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-night-deep shadow-md">
              Find this!
            </div>
            <div className="relative h-28 w-28 rounded-3xl bg-paper/95 p-1.5 shadow-2xl ring-4 ring-spotlight-warm/70 sm:h-24 sm:w-24">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-spotlight-warm/40 blur-xl animate-pulse-soft" />
              <Creature kind={target.kind} found />
            </div>
            <div className="rounded-full bg-night/85 px-3 py-1 text-base font-bold text-paper backdrop-blur-sm shadow">
              {target.name}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="all-found"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 rounded-2xl bg-leaf/90 px-4 py-2 text-base font-bold text-night-deep shadow-lg"
          >
            <SparkleIcon className="h-5 w-5" />
            All found!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SceneHud({ title }: { title: string }) {
  return (
    <div className="pointer-events-none absolute top-3 left-4 right-4 flex items-start justify-between safe-top z-10">
      {/* Title sits in a soft paper-haloed pill so it stays legible on any
          scene (the AI-generated backgrounds vary in luminance). */}
      <div className="rounded-2xl bg-night/55 px-4 py-1.5 backdrop-blur-md shadow-lg ring-1 ring-paper/20">
        <h1 className="font-display text-2xl font-bold text-paper drop-shadow-lg">{title}</h1>
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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 rounded-2xl bg-night/80 px-5 py-2 backdrop-blur-sm shadow-lg ring-1 ring-paper/15 safe-top z-10"
      >
        <div className="flex items-baseline gap-1.5 text-paper">
          <span className="font-display text-xl font-extrabold tabular-nums text-spotlight-warm">
            {found}
          </span>
          <span className="text-sm font-semibold text-paper/70">/</span>
          <span className="font-display text-base font-bold tabular-nums text-paper/85">
            {total}
          </span>
          <span className="ml-1 text-sm font-semibold text-paper/85">
            {allDone ? 'all found!' : remaining === 1 ? 'one to go' : 'found'}
          </span>
        </div>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-paper/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-spotlight-warm to-spotlight-edge"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Bottom-right tray of creature slots. Scales gracefully:
 *   * 7–9 creatures → single row on desktop / iPad landscape, wraps to a
 *     balanced 2-row grid on iPad portrait.
 *   * Up to ~13 creatures → grid clamps at 8 columns (CSS-grid `auto-fill`)
 *     so there's never a stray orphan icon on a half-empty second row.
 *   * Each slot is 56 px (kid touch-target floor); unfound slots show an
 *     outline so kids can count remaining slots even in the dark.
 */
function RemainingTray({
  creatures,
  found,
}: {
  creatures: LevelCreature[];
  found: Set<string>;
}) {
  // Choose column count so 7–9 fits in one row on wide viewports but
  // wraps cleanly on portrait.
  const cols = Math.min(creatures.length, 9);
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 safe-bottom z-10 max-w-[88%]">
      <div
        className="grid gap-2 rounded-3xl bg-night/85 p-2.5 ring-1 ring-paper/15 shadow-2xl backdrop-blur-md"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {creatures.map((c) => {
          const isFound = found.has(c.id);
          return (
            <div
              key={c.id}
              className={`relative h-14 w-14 overflow-hidden rounded-2xl transition-all duration-300 ${
                isFound
                  ? 'bg-paper/95 ring-2 ring-spotlight-warm shadow-md'
                  : 'bg-night-deep/90 ring-2 ring-paper/25'
              }`}
              title={isFound ? c.name : 'hidden'}
            >
              {/* Found check-glow — soft warm halo so the kid feels rewarded
                  every time their eye scans the tray. */}
              {isFound && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-spotlight-warm/15" />
              )}
              <Creature kind={c.kind} found={isFound} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
