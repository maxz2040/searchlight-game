// Tutorial overlay — "Find the hidden friends."
// Visual uplift v3:
//   * Ambient sparkle particles drift in the background.
//   * Lantern icon enlarged to h-40 w-40 for more visual impact.
//   * Warm radial background glow adds depth.
//   * "Let's begin" button has a shimmer sweep on hover.
//   * unlockAudio() called synchronously in the button handler so Web
//     Audio context is pre-unlocked before the first rAF tick that
//     might call playPing().

import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { LanternIcon } from './icons';
import { unlockAudio } from '../sound';

const SCENE_LABEL: Record<string, string> = {
  forest: 'Whispering Forest',
  meadow: 'Meadow at Dusk',
  beach:  'Starlit Shore',
};

const ENTRY = { duration: 0.44, ease: [0.16, 1, 0.3, 1] as const };

// Deterministic sparkle layout — no Math.random for SSR consistency.
const SPARKLES = [
  { x:  8, y: 14, s: 3, d: 3.4, delay: 0.0  },
  { x: 22, y: 78, s: 2, d: 4.1, delay: 0.8  },
  { x: 38, y:  9, s: 4, d: 3.7, delay: 1.5  },
  { x: 55, y: 88, s: 2, d: 2.8, delay: 0.25 },
  { x: 71, y: 22, s: 3, d: 4.5, delay: 1.1  },
  { x: 87, y: 65, s: 2, d: 3.2, delay: 0.6  },
  { x: 12, y: 55, s: 2, d: 3.9, delay: 1.85 },
  { x: 64, y: 42, s: 3, d: 2.9, delay: 0.95 },
  { x: 78, y: 85, s: 2, d: 4.3, delay: 0.15 },
  { x: 46, y: 32, s: 2, d: 3.6, delay: 1.35 },
  { x: 93, y: 38, s: 3, d: 3.0, delay: 0.55 },
  { x: 30, y: 62, s: 2, d: 4.0, delay: 1.65 },
];

export function Tutorial() {
  const begin = useGame((s) => s.beginPlaying);
  const level = useGame((s) => s.level());

  function handleBegin() {
    // Must run synchronously inside this user-gesture handler so iOS Safari
    // allows the Web Audio context to resume before rAF loop calls playPing().
    unlockAudio();
    begin();
  }

  const sceneName = SCENE_LABEL[level.scene] ?? level.title;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={ENTRY}
      className="surface-overlay absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Ambient sparkle particles */}
      {SPARKLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-spotlight-warm animate-float-particle pointer-events-none"
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

      {/* Background warm radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 48% at 50% 38%, rgba(212,167,60,0.13) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">

        {/* Large lantern icon */}
        <motion.div
          initial={{ scale: 0.78, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.06, type: 'spring', stiffness: 200, damping: 26 }}
          className="relative h-40 w-40"
        >
          <div className="absolute inset-[-35%] rounded-full bg-spotlight-warm/16 blur-3xl animate-pulse-soft" />
          <div className="absolute inset-[-18%] rounded-full bg-spotlight-warm/30 blur-2xl animate-pulse-soft"
               style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-[-5%] rounded-full bg-spotlight-warm/42 blur-xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-spotlight-edge text-night-deep shadow-[0_0_64px_rgba(212,167,60,0.55),0_0_24px_rgba(212,167,60,0.35)]">
            <LanternIcon style={{ width: 80, height: 80 }} />
          </div>
        </motion.div>

        {/* Level badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTRY, delay: 0.16 }}
          className="surface-chrome flex items-center gap-2 rounded-full px-5 py-2"
        >
          <span className="text-xs font-black uppercase tracking-[0.22em] text-paper/65">
            {sceneName}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...ENTRY, delay: 0.22 }}
          className="font-display text-[2.6rem] font-bold text-paper leading-[1.08]"
        >
          Find the<br />hidden friends
        </motion.h1>

        {/* Instruction */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...ENTRY, delay: 0.30 }}
          className="max-w-xs text-[1.0625rem] leading-[1.6] text-paper/80"
        >
          Drag your finger across the screen. Hold still over a creature
          until the ring fills — then it&rsquo;s found!
        </motion.p>

        {/* CTA button — shimmer effect via pseudo-element in shimmer-sweep keyframe */}
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...ENTRY, delay: 0.44 }}
          onClick={handleBegin}
          className="relative mt-4 inline-flex min-h-[64px] min-w-[220px] items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-10 py-4 text-xl font-bold text-paper shadow-[0_4px_24px_rgba(160,120,40,0.5)] active:scale-95 transition-transform duration-[120ms]"
          aria-label="Start playing"
        >
          {/* Shimmer sweep */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,248,210,0.28) 50%, transparent 100%)',
              animation: 'shimmer-sweep 2.4s ease-in-out infinite',
            }}
          />
          <span className="relative">Let&rsquo;s begin</span>
          <LanternIcon className="relative h-6 w-6 opacity-90" />
        </motion.button>
      </div>
    </motion.div>
  );
}
