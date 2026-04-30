// Brief one-screen tutorial overlay. Shows the spotlight icon + the
// "drag your finger" message. Auto-dismisses after first pointer-down,
// or via the big start button.
//
// v1: replaced emoji (🔦, ✨) with inline SVG so the icons render on
// devices/fonts without colour-emoji glyphs. Now also displays the level
// title + scene name so returning kids know which level they're starting.

import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { LanternIcon, SparkleIcon } from './icons';

const SCENE_LABEL: Record<string, string> = {
  forest: 'Whispering Forest',
  meadow: 'Meadow at Dusk',
  beach: 'Starlit Shore',
};

export function Tutorial() {
  const begin = useGame((s) => s.beginPlaying);
  const level = useGame((s) => s.level());
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-night-deep/95 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-7 px-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
          className="relative h-32 w-32"
        >
          <div className="absolute inset-0 rounded-full bg-spotlight-warm/40 blur-3xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-spotlight-warm to-spotlight-edge text-night-deep shadow-2xl">
            <LanternIcon className="h-16 w-16" />
          </div>
        </motion.div>

        {/* Level chip — paper pill so kids see what they're entering. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex items-center gap-2 rounded-full bg-paper/15 px-4 py-1.5 ring-1 ring-paper/25"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/70">
            {SCENE_LABEL[level.scene] === level.title ? 'Level' : level.scene}
          </span>
          <span className="text-base font-bold text-paper">{level.title}</span>
        </motion.div>

        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.24 }}
          className="font-display text-4xl font-bold text-paper"
        >
          Find the hidden friends!
        </motion.h1>
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="max-w-sm text-lg text-paper/85"
        >
          Drag your finger across the screen. Move the lantern light to find every
          creature hiding in the dark.
        </motion.p>
        <motion.button
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          onClick={begin}
          className="mt-4 inline-flex min-h-[60px] min-w-[200px] items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-xl font-bold text-paper shadow-2xl active:scale-95 transition-transform"
          aria-label="Start playing"
        >
          Let's go
          <SparkleIcon className="h-6 w-6" />
        </motion.button>
      </div>
    </motion.div>
  );
}
