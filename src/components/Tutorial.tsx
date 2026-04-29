// Brief one-screen tutorial overlay. Shows the spotlight icon + the
// "drag your finger" message. Auto-dismisses after first pointer-down,
// or via the big start button.

import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';

export function Tutorial() {
  const begin = useGame((s) => s.beginPlaying);
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
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-spotlight-warm to-spotlight-edge text-5xl">
            🔦
          </div>
        </motion.div>
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
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
          className="mt-4 min-h-[60px] min-w-[200px] rounded-full bg-accent px-8 py-4 text-xl font-bold text-paper shadow-2xl active:scale-95 transition-transform"
          aria-label="Start playing"
        >
          Let's go ✨
        </motion.button>
      </div>
    </motion.div>
  );
}
