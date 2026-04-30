// Brief one-screen tutorial overlay. Shows the spotlight icon + the
// "drag your finger" message. Auto-dismisses after first pointer-down,
// or via the big start button.
//
// v1: replaced emoji (🔦, ✨) with inline SVG so the icons render on
// devices/fonts without colour-emoji glyphs. Now also displays the level
// title + scene name so returning kids know which level they're starting.
//
// v3 (impeccable): springs re-tuned to overshoot-free (damping ≥ 28),
// chrome blur reduced to a subtle blur-sm so the bedroom-behind-the-lantern
// reading earns its keep without the cliché glassmorphism stack. Copy
// "Let's go" → "Let's begin" — quieter language matching the bedtime
// shape brief. The lantern halo blooms warmly per the Expressive moment.

import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { LanternIcon } from './icons';

const SCENE_LABEL: Record<string, string> = {
  forest: 'Whispering Forest',
  meadow: 'Meadow at Dusk',
  beach: 'Starlit Shore',
};

// Quiet entry timing — exit ≈ 75% of entrance, expo-out for entries.
// Matches the impeccable motion buckets (640ms entrance, 260ms state).
const ENTRY = { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const };

export function Tutorial() {
  const begin = useGame((s) => s.beginPlaying);
  const level = useGame((s) => s.level());
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={ENTRY}
      className="surface-overlay absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-7 px-6 text-center">
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 200, damping: 28 }}
          className="relative h-32 w-32"
        >
          {/* Warm halo — pulse kept (it IS the lantern's breathing flame). */}
          <div className="absolute inset-[-12%] rounded-full bg-spotlight-warm/30 blur-3xl animate-pulse-soft" />
          <div className="absolute inset-[-2%] rounded-full bg-spotlight-warm/45 blur-2xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-spotlight-edge text-night-deep shadow-2xl">
            <LanternIcon className="h-16 w-16" />
          </div>
        </motion.div>

        {/* Level chip — warm pill so kids see what they're entering.
            Solid surface (no alpha-soup) replaces the v2 paper/15 + ring/25
            stack. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTRY, delay: 0.16 }}
          className="surface-chrome flex items-center gap-2 rounded-full px-4 py-1.5"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/75">
            {SCENE_LABEL[level.scene] === level.title ? 'Level' : level.scene}
          </span>
          <span className="text-base font-bold text-paper">{level.title}</span>
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...ENTRY, delay: 0.22 }}
          className="font-display text-[2.369rem] font-semibold text-paper leading-[1.1]"
        >
          Find the hidden friends
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...ENTRY, delay: 0.30 }}
          className="max-w-sm text-[1.0625rem] leading-[1.55] text-paper/85"
        >
          Drag your finger across the screen. Move the lantern's light
          to find every creature hiding in the dark.
        </motion.p>
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...ENTRY, delay: 0.42 }}
          onClick={begin}
          className="mt-4 inline-flex min-h-[60px] min-w-[200px] items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-xl font-semibold text-paper shadow-2xl active:scale-95 transition-transform duration-[120ms]"
          aria-label="Start playing"
        >
          Let&rsquo;s begin
          <LanternIcon className="h-5 w-5 opacity-95" />
        </motion.button>
      </div>
    </motion.div>
  );
}
