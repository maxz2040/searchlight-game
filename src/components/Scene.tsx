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
  // Active target = the creature shown in the Find-this vignette =
  // the FIRST unfound creature in level order. Spotlight collision is
  // gated on this id so panning past other unfound creatures does NOT
  // accidentally mark them.
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

        {/* Creatures are PAINTED INTO the scene (composited via Higgsfield —
            see docs/v1-compositing.md). We only render INVISIBLE hit-zones
            for spotlight collision; no overlay pills, no sprite, no labels
            on the scene itself. The "what to look for" cue lives in the
            floating <TargetVignette> chip in the corner. data-testid kept
            for E2E. */}
        {level.creatures.map((c) => {
          const isFound = found.has(c.id);
          // hintFor would normally drive an animated glow; v1 UAT removed
          // anchored visual markers entirely (bbox imprecision made them
          // feel like wrong-place ovals). Hint now lives in the
          // TargetVignette chip pulse only.
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
            >
              {/* No visible marker on the painted creature itself — the
                  bbox detection is ~70-80% accurate so any anchored ring
                  reads as a wrong-place oval per UAT. Reveal feedback now
                  lives entirely in: the spotlight beam (it brightens the
                  area where the kid found something), the ProgressPill
                  count tick, the ping sound, and haptic vibration. */}
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
            initial={{ opacity: 0, scale: 0.85, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            className="flex flex-col items-center gap-1.5"
          >
            {/* "Find this" caps label — solid lantern surface, no alpha-95
                glassmorphism. Caps tracking 18% per impeccable. */}
            <div className="rounded-full bg-spotlight-edge px-3 py-0.5 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-night-deep shadow-md">
              Find this
            </div>
            <div className="surface-card relative h-28 w-28 rounded-3xl p-1.5 shadow-2xl sm:h-24 sm:w-24">
              {/* Warm halo behind — the lantern flame quietly breathing. */}
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
      {/* Title plate — solid warm-tinted-night surface, no backdrop-blur
          glassmorphism (banned-pattern fix). Demoted to <h2> because there
          is already an <h1> on the page in the tutorial; one h1 per page. */}
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
  // Hold the pill at a stable min-width so the trailing copy
  // ("all found" / "one to go" / "found") doesn't jitter the layout.
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
        {/* Progress wick — burns down warm. Solid lantern colour, no rainbow
            gradient. Easing matches the project's ease-entry token. */}
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
              {/* Found check-glow — soft warm halo so the kid feels rewarded
                  every time their eye scans the tray. */}
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
