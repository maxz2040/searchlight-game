// Level complete screen. Shows time-to-complete + a row of all the
// creatures the player found, plus replay/next buttons.
//
// v1: when the kid finds the final creature, the level's reward video
// (Higgsfield seedance_2.0, 8s 1080p, scene-comes-to-life) plays full-
// frame as the celebration. Generated offline at build time and shipped
// as static MP4 in /public/videos/{level-id}.mp4.
//
// v1 UAT fixes: emoji replaced with inline SVG (font fallback rendered
// missing-glyph boxes); Skip button enlarged to 48-px touch target;
// celebration card re-anchored higher so iPad portrait reads top-down
// instead of bunching content above a void.

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore';
import { Creature } from './Creature';
import { playFanfare } from '../sound';
import { ConfettiIcon, ArrowRightIcon, PlayIcon } from './icons';

// Map level id → reward video URL. Same convention as scene/creature maps.
const VIDEO_URL: Record<string, string> = {
  'lvl-1': '/videos/lvl-1-forest.mp4',
  'lvl-2': '/videos/lvl-2-meadow.mp4',
  'lvl-3': '/videos/lvl-3-shore.mp4',
};

function formatMs(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function Complete() {
  const level = useGame((s) => s.level());
  const elapsed = useGame((s) => s.elapsedMs());
  const replay = useGame((s) => s.replay);
  const next = useGame((s) => s.next);

  // The reward sequence: video plays first (8s, autoplay muted), then the
  // celebration card slides in. If the video file is missing (e.g. older
  // build) we just show the card immediately.
  const videoUrl = VIDEO_URL[level.id];
  const [phase, setPhase] = useState<'video' | 'card'>(videoUrl ? 'video' : 'card');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fanfare aligns with the END of the video (or fires immediately when
    // there's no video) so the audio peak lands with the card reveal.
    if (phase === 'card') playFanfare();
  }, [phase]);

  // If the video fails to load (e.g. blocked autoplay), fall through to
  // the card after a short timeout so the kid is never stuck.
  useEffect(() => {
    if (phase !== 'video') return;
    const fallback = window.setTimeout(() => setPhase('card'), 9_500);
    return () => window.clearTimeout(fallback);
  }, [phase]);

  if (phase === 'video' && videoUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-30 bg-night-deep"
      >
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted
          playsInline
          onEnded={() => setPhase('card')}
          onError={() => setPhase('card')}
          className="h-full w-full object-cover"
        />
        {/* Subtle "you found them all" caption layered on the video. Solid
            surface-chrome instead of bg-night + backdrop-blur stack. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="surface-chrome-strong absolute top-8 left-1/2 -translate-x-1/2 rounded-full px-6 py-2 text-paper font-display text-[1.778rem] font-semibold safe-top shadow-2xl"
        >
          You found them all
        </motion.div>
        {/* Skip-to-celebration button bottom-right (kid agency). 48-px target.
            Now uses brass accent (warm family) instead of paper-on-near-black,
            which avoided readable contrast but read as cliché. */}
        <button
          onClick={() => setPhase('card')}
          className="absolute bottom-6 right-6 inline-flex min-h-[48px] min-w-[88px] items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2 text-base font-semibold text-paper shadow-lg active:scale-95 transition-transform safe-bottom"
        >
          Skip
          <PlayIcon className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="surface-overlay absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-sm safe-bottom safe-top overflow-y-auto py-10"
    >
      <div className="flex max-w-md flex-col items-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.84, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          className="relative h-24 w-24"
        >
          <div className="absolute inset-[-15%] rounded-full bg-spotlight-warm/35 blur-3xl animate-pulse-soft" />
          <div className="absolute inset-[-5%] rounded-full bg-spotlight-warm/45 blur-2xl" />
          <ConfettiIcon className="relative h-full w-full drop-shadow-2xl" />
        </motion.div>
        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[2.369rem] font-semibold text-paper leading-[1.1]"
        >
          You found them all
        </motion.h2>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.0625rem] text-paper/80 tabular-nums"
        >
          {level.title} · {formatMs(elapsed)}
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="surface-chrome-strong grid grid-cols-5 gap-3 rounded-2xl p-4 shadow-xl"
        >
          {level.creatures.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.5 + i * 0.05,
                type: 'spring',
                stiffness: 200,
                damping: 28,
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="surface-card h-14 w-14 rounded-2xl p-1 shadow-md">
                <Creature kind={c.kind} found />
              </div>
              <div className="text-xs font-semibold text-paper/85">{c.name}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.78, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={replay}
            className="surface-chrome min-h-[56px] min-w-[140px] rounded-full px-6 py-3 text-lg font-semibold text-paper active:scale-95 transition-transform duration-[120ms]"
          >
            Play again
          </button>
          <button
            onClick={next}
            className="inline-flex min-h-[56px] min-w-[140px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 py-3 text-lg font-semibold text-paper shadow-lg active:scale-95 transition-transform duration-[120ms]"
          >
            Next level
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
