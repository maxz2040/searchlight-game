// Level complete screen. Shows time-to-complete + a row of all the
// creatures the player found, plus replay/next buttons.

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useGame } from '../store/gameStore';
import { Creature } from './Creature';
import { playFanfare } from '../sound';

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

  useEffect(() => {
    playFanfare();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-night-deep/95 backdrop-blur-sm safe-bottom safe-top"
    >
      <div className="flex max-w-md flex-col items-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="text-7xl"
        >
          🎉
        </motion.div>
        <motion.h2
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="font-display text-4xl font-bold text-paper"
        >
          You found them all!
        </motion.h2>
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="text-lg text-paper/80"
        >
          {level.title} · {formatMs(elapsed)}
        </motion.p>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-5 gap-3 rounded-2xl bg-night/50 p-3"
        >
          {level.creatures.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.55 + i * 0.06, type: 'spring', stiffness: 280, damping: 14 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="h-14 w-14">
                <Creature kind={c.kind} found />
              </div>
              <div className="text-xs font-semibold text-paper/85">{c.name}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={replay}
            className="min-h-[56px] min-w-[140px] rounded-full bg-night/60 px-6 py-3 text-lg font-semibold text-paper border border-paper/30 active:scale-95 transition-transform"
          >
            Play again
          </button>
          <button
            onClick={next}
            className="min-h-[56px] min-w-[140px] rounded-full bg-accent px-6 py-3 text-lg font-bold text-paper shadow-lg active:scale-95 transition-transform"
          >
            Next level →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
