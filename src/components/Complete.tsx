// Level complete screen. Star rating + creature gallery + replay / next.
//
// Visual uplift v3:
//   * Stars are significantly larger (h-14 w-14 / 56px) with a richer SVG shape.
//   * Ambient sparkle particles drift behind the card.
//   * Background has a warm radial celebration glow.
//   * Creature gallery cards are larger with better padding.
//   * "Time's up!" state has a distinct red glow instead of the amber celebration.
//   * "Let's begin" / CTA button uses the shimmer-sweep keyframe.

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

// Deterministic sparkle positions for the Complete background.
const SPARKLES = [
  { x:  7, y: 12, s: 3, d: 3.4, delay: 0.0  },
  { x: 21, y: 80, s: 2, d: 4.0, delay: 0.7  },
  { x: 40, y:  8, s: 4, d: 3.7, delay: 1.4  },
  { x: 57, y: 84, s: 2, d: 2.8, delay: 0.2  },
  { x: 73, y: 20, s: 3, d: 4.5, delay: 1.0  },
  { x: 88, y: 62, s: 2, d: 3.2, delay: 0.6  },
  { x: 14, y: 52, s: 2, d: 3.9, delay: 1.8  },
  { x: 65, y: 44, s: 3, d: 2.9, delay: 0.9  },
  { x: 80, y: 88, s: 2, d: 4.2, delay: 0.15 },
  { x: 34, y: 30, s: 2, d: 3.6, delay: 1.3  },
  { x: 93, y: 35, s: 3, d: 3.0, delay: 0.5  },
  { x: 28, y: 68, s: 2, d: 4.1, delay: 1.6  },
];

// ---------------------------------------------------------------------------
// Star rating — large warm amber stars.
// ---------------------------------------------------------------------------

function StarRating({ stars, timeExpired }: { stars: number; timeExpired: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <motion.div
          key={n}
          initial={{ scale: 0, rotate: -24 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.52 + n * 0.14,
            type: 'spring',
            stiffness: 280,
            damping: 18,
          }}
        >
          <svg viewBox="0 0 40 40" className="h-14 w-14 drop-shadow-lg">
            {n <= stars ? (
              // Filled star — warm amber gradient
              // sRGB hex: oklch(82% 0.16 72)→#d4a73c  oklch(64% 0.16 58)→#a07828
              <>
                <defs>
                  <linearGradient id={`sg-${n}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f8eedd" />
                    <stop offset="100%" stopColor="#d4a73c" />
                  </linearGradient>
                </defs>
                <path
                  d="M20 3.5 L24.5 14.5 L36.5 16 L27.5 24.5 L29.5 36.5 L20 30.5 L10.5 36.5 L12.5 24.5 L3.5 16 L15.5 14.5 Z"
                  fill={`url(#sg-${n})`}
                  stroke="#a07828"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </>
            ) : (
              // Empty star — subtle dim outline
              <path
                d="M20 3.5 L24.5 14.5 L36.5 16 L27.5 24.5 L29.5 36.5 L20 30.5 L10.5 36.5 L12.5 24.5 L3.5 16 L15.5 14.5 Z"
                fill={timeExpired ? 'rgba(248,113,113,0.12)' : 'rgba(245,238,222,0.08)'}
                stroke={timeExpired ? 'rgba(248,113,113,0.35)' : 'rgba(245,238,222,0.28)'}
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

// ---------------------------------------------------------------------------
// Complete
// ---------------------------------------------------------------------------

export function Complete() {
  const level       = useGame((s) => s.level());
  const elapsed     = useGame((s) => s.elapsedMs());
  const stars       = useGame((s) => s.stars());
  const timeExpired = useGame((s) => s.timeExpired);
  const replay      = useGame((s) => s.replay);
  const next        = useGame((s) => s.next);
  const goToLobby   = useGame((s) => s.goToLobby);

  const videoUrl = VIDEO_URL[level.id];
  const [phase, setPhase] = useState<'video' | 'card'>(
    videoUrl && !timeExpired ? 'video' : 'card',
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (phase === 'card') {
      playFanfare();
      // Celebratory triple-pulse — satisfying for young players on iPad.
      if ('vibrate' in navigator) navigator.vibrate?.([60, 40, 80, 40, 100]);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'video') return;
    const fallback = window.setTimeout(() => setPhase('card'), 9_500);
    return () => window.clearTimeout(fallback);
  }, [phase]);

  const headline = timeExpired ? "Time's up!" : 'You found them all!';
  const subline  = timeExpired
    ? `${level.title} · try again!`
    : `${level.title} · ${formatMs(elapsed)}`;

  // ── Video phase ────────────────────────────────────────────────────────
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
          className="surface-chrome-strong absolute top-8 left-1/2 -translate-x-1/2 rounded-full px-7 py-2.5 text-paper font-display text-[1.778rem] font-semibold safe-top shadow-2xl"
        >
          You found them all!
        </motion.div>
        <button
          onClick={() => setPhase('card')}
          className="absolute bottom-6 right-6 inline-flex min-h-[52px] min-w-[96px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 py-2.5 text-base font-bold text-paper shadow-lg active:scale-95 transition-transform safe-bottom"
        >
          Skip
          <PlayIcon className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  // ── Card phase ─────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
      className="surface-overlay absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden safe-bottom safe-top py-8"
    >
      {/* Ambient sparkle particles */}
      {SPARKLES.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full animate-float-particle pointer-events-none ${
            timeExpired ? 'bg-red-400/60' : 'bg-spotlight-warm'
          }`}
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  p.s,
            height: p.s,
            '--dur': `${p.d}s`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Background celebration radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: timeExpired
            ? 'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(248,113,113,0.10) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(212,167,60,0.14) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex max-w-lg w-full flex-col items-center gap-5 px-6 text-center overflow-y-auto">

        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0.80, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          className="relative h-24 w-24"
        >
          <div
            className={`absolute inset-[-18%] rounded-full blur-3xl animate-pulse-soft ${
              timeExpired ? 'bg-red-400/30' : 'bg-spotlight-warm/38'
            }`}
          />
          <div
            className={`absolute inset-[-6%] rounded-full blur-2xl ${
              timeExpired ? 'bg-red-400/30' : 'bg-spotlight-warm/48'
            }`}
          />
          <ConfettiIcon className="relative h-full w-full drop-shadow-2xl" />
        </motion.div>

        {/* Star rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.38, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
        >
          <StarRating stars={stars} timeExpired={timeExpired} />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.14, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className={`font-display text-[2.6rem] font-bold leading-[1.06] ${
            timeExpired ? 'text-red-300' : 'text-paper'
          }`}
        >
          {headline}
        </motion.h2>

        {/* Subline */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.0625rem] text-paper/75 tabular-nums"
        >
          {subline}
        </motion.p>

        {/* Creature gallery */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="surface-chrome-strong grid grid-cols-5 gap-3 rounded-3xl p-4 shadow-xl"
        >
          {level.creatures.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.48 + i * 0.055,
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="surface-card h-16 w-16 rounded-2xl p-1.5 shadow-md ring-1 ring-spotlight-warm/30">
                <Creature kind={c.kind} found />
              </div>
              <div className="text-xs font-bold text-paper/80 leading-tight">{c.name}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.76, duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1 flex flex-wrap items-center justify-center gap-3"
        >
          {/* All Worlds — opens level-select lobby */}
          <button
            onClick={goToLobby}
            data-testid="lobby-btn"
            className="surface-chrome min-h-[60px] min-w-[136px] rounded-full px-6 py-3 text-base font-bold text-paper/80 active:scale-95 transition-transform duration-[120ms] shadow-md"
          >
            All Worlds
          </button>
          <button
            onClick={replay}
            className="surface-chrome min-h-[60px] min-w-[136px] rounded-full px-6 py-3 text-base font-bold text-paper active:scale-95 transition-transform duration-[120ms] shadow-md"
          >
            Play again
          </button>
          <button
            onClick={next}
            className="relative inline-flex min-h-[60px] min-w-[148px] items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-7 py-3 text-lg font-bold text-paper shadow-[0_4px_20px_rgba(160,120,40,0.45)] active:scale-95 transition-transform duration-[120ms]"
          >
            {/* Shimmer sweep */}
            <span
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,248,210,0.28) 50%, transparent 100%)',
                animation: 'shimmer-sweep 2.4s ease-in-out infinite',
              }}
            />
            <span className="relative">Next level</span>
            <ArrowRightIcon className="relative h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
