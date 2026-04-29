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

        {/* Creatures positioned absolutely as % of the surface. The
            Creature component renders silhouette vs revealed based on
            `found`. */}
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
            >
              {isHinted && (
                <div className="absolute inset-0 rounded-full bg-spotlight-warm/60 blur-2xl animate-hint-pulse" />
              )}
              <div className={isFound ? 'animate-reveal-pop' : ''}>
                <Creature kind={c.kind} found={isFound} />
              </div>
              {isFound && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper/90 px-3 py-1 text-sm font-semibold text-night animate-pulse-soft">
                  {c.name}
                </div>
              )}
            </div>
          );
        })}
      </Spotlight>

      {/* HUD — top corners. 48px touch targets. */}
      <SceneHud title={level.title} remaining={remaining} total={level.creatures.length} />

      {/* Remaining icons — bottom-right (PRD §UX corner list). */}
      <RemainingTray
        creatures={level.creatures}
        found={found}
      />

      {/* Reveal toast appears when a creature is found. Uses
          AnimatePresence on the count so kids see "3 left" → "2 left". */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`count-${remaining}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.32 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-night/80 px-5 py-2 text-paper font-semibold text-lg backdrop-blur-sm safe-top"
        >
          {remaining} {remaining === 1 ? 'creature' : 'creatures'} hiding
        </motion.div>
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
  creatures: ReturnType<typeof useGame>['levelId'] extends string
    ? import('../levels/levels').Creature[]
    : never;
  found: Set<string>;
}) {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 flex gap-2 rounded-2xl bg-night/60 p-2 backdrop-blur-sm safe-bottom">
      {creatures.map((c) => {
        const isFound = found.has(c.id);
        return (
          <div
            key={c.id}
            className={`h-12 w-12 rounded-full ${isFound ? 'bg-paper/90' : 'bg-night/80 border border-paper/30'}`}
            title={isFound ? c.name : 'hidden'}
          >
            <Creature kind={c.kind} found={isFound} />
          </div>
        );
      })}
    </div>
  );
}
