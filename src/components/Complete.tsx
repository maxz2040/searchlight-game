// Level complete screen. Shows star rating + time-to-complete + a row
// of all the creatures the player found, plus replay/next buttons.
//
// Stars are awarded based on how quickly the player completed:
//   3 stars — finished in ≤40% of the time limit (fast)
//   2 stars — finished in ≤70% of the time limit (good)
//   1 star  — finished in any remaining time, or time expired

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/gameStore';
import { Creature } from './Creature';
import { playFanfare } from '../sound';
import { ConfettiIcon, ArrowRightIcon, PlayIcon } from './icons';

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

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <motion.div
          key={n}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.55 + n * 0.12,
            type: 'spring',
            stiffness: 280,
            damping: 20,
          }}
        >
          <svg viewBox="0 0 32 32" className="h-10 w-10 drop-shadow-md">
            {n <= stars ? (
              // Filled star — warm amber
              <path
                d="M16 3 L19.6 11.8 L29 12.9 L22.5 19.2 L24.3 28.5 L16 24 L7.7 28.5 L9.5 19.2 L3 12.9 L12.4 11.8 Z"
                fill="oklch(82% 0.16 72)"
                stroke="oklch(64% 0.16 58)"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            ) : (
              // Empty star — dim outline
              <path
                d="M16 3 L19.6 11.8 L29 12.9 L22.5 19.2 L24.3 28.5 L16 24 L7.7 28.5 L9.5 19.2 L3 12.9 L12.4 11.8 Z"
                fill="none"
                stroke="oklch(96% 0.018 80 / 0.3)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function Complete() {
  const level = useGame((s) => s.level());
  const elapsed = useGame((s) => s.elapsedMs());
  const stars = useGame((s) => s.stars());
  const timeExpired = useGame((s) => s.timeExpired);
  const replay = useGame((s) => s.replay);
  const next = useGame((s) => s.next);

  const videoUrl = VIDEO_URL[level.id];
  const [phase, setPhase] = useState<'video' | 'card'>(videoUrl && !timeExpired ? 'video' : 'card');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (phase === 'card') playFanfare();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'video') return;
    const fallback = window.setTimeout(() => setPhase('card'), 9_500);
    return () => window.clearTimeout(fallback);
  }, [phase]);

  const headline = timeExpired ? "Time's up!" : 'You found them all';
  const subline = timeExpired
    ? `${level.title} · keep trying!`
    : `${level.title} · ${formatMs(elapsed)}`;

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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="surface-chrome-strong absolute top-8 left-1/2 -translate-x-1/2 rounded-full px-6 py-2 text-paper font-display text-[1.778rem] font-semibold safe-top shadow-2xl"
        >
          You found them all
        </motion.div>
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
      <div className="flex max-w-md flex-col items-center gap-5 px-6 text-center">
        <motion.div
          initial={{ scale: 0.84, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          className="relative h-20 w-20"
        >
          <div className="absolute inset-[-15%] rounded-full bg-spotlight-warm/35 blur-3xl animate-pulse-soft" />
          <div className="absolute inset-[-5%] rounded-full bg-spotlight-warm/45 blur-2xl" />
          <ConfettiIcon className="relative h-full w-full drop-shadow-2xl" />
        </motion.div>

        {/* Star rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          <StarRating stars={stars} />
        </motion.div>

        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[2.369rem] font-semibold text-paper leading-[1.1]"
        >
          {headline}
        </motion.h2>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.0625rem] text-paper/80 tabular-nums"
        >
          {subline}
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
