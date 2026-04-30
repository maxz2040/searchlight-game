// Scene composes the background + creatures + spotlight + HUD into a
// playable level. Owns the per-level state subscription and feeds the
// Spotlight component its creature list.
//
// Hint glow: when the player has been idle for more than 1.6s, the
// nearest unfound creature gently pulses to nudge them toward it.
// Disabled once the spotlight is moving again. Improves accessibility
// for younger players (PRD §UI/UX).

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spotlight } from './Spotlight';
import { Creature } from './Creature';
import { SceneBackground } from './SceneBackground';
import { useGame } from '../store/gameStore';
import { playPing } from '../sound';
import type { Creature as LevelCreature } from '../levels/levels';

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

      {/* HUD — top corners. 48px touch targets. */}
      <SceneHud title={level.title} remaining={remaining} total={level.creatures.length} />

      {/* "Find this!" floating vignette — shows the next creature the kid
          should hunt. Replaces the per-creature name pills which were
          inaccurate (bbox detection ~50%) and visually noisy. */}
      <TargetVignette creatures={level.creatures} found={found} />

      {/* Remaining icons — bottom-right. */}
      <RemainingTray creatures={level.creatures} found={found} />

      {/* Count toast — top-centre. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`count-${remaining}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.32 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-night/80 px-5 py-2 text-paper font-semibold text-lg backdrop-blur-sm safe-top"
        >
          {remaining} {remaining === 1 ? 'left to find' : 'left to find'}
        </motion.div>
      </AnimatePresence>
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
    <div className="pointer-events-none absolute left-4 top-20 safe-top">
      <AnimatePresence mode="wait">
        {target ? (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, scale: 0.7, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/85 drop-shadow">
              Find this!
            </div>
            <div className="relative h-24 w-24 rounded-3xl bg-paper/95 p-1 shadow-2xl ring-4 ring-spotlight-warm/60">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-spotlight-warm/40 blur-xl animate-pulse-soft" />
              <Creature kind={target.kind} found />
            </div>
            <div className="rounded-full bg-night/80 px-3 py-0.5 text-sm font-bold text-paper backdrop-blur-sm">
              {target.name}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="all-found"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-leaf/90 px-4 py-2 text-sm font-bold text-night-deep shadow-lg"
          >
            ✨ All found!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SceneHud({ title }: { title: string; remaining: number; total: number }) {
  return (
    <div className="pointer-events-none absolute top-3 left-4 right-4 flex items-start justify-between safe-top">
      <h1 className="font-display text-2xl font-bold text-paper drop-shadow-lg">{title}</h1>
    </div>
  );
}

function RemainingTray({
  creatures,
  found,
}: {
  creatures: LevelCreature[];
  found: Set<string>;
}) {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 flex flex-wrap gap-2 rounded-2xl bg-night/70 p-2 backdrop-blur-sm safe-bottom max-w-[60%] justify-end">
      {creatures.map((c) => {
        const isFound = found.has(c.id);
        return (
          <div
            key={c.id}
            className={`h-11 w-11 overflow-hidden rounded-full transition-colors ${
              isFound ? 'bg-paper/90 ring-2 ring-spotlight-edge' : 'bg-night/80 border border-paper/30'
            }`}
            title={isFound ? c.name : 'hidden'}
          >
            <Creature kind={c.kind} found={isFound} />
          </div>
        );
      })}
    </div>
  );
}
