// Lobby — level-select screen shown between Complete and Tutorial.
//
// Three scene cards are displayed side-by-side (iPad landscape) with the
// real AI-generated scene PNGs as card backgrounds. Each card shows:
//   * Scene image (dimmed, vignette overlay)
//   * Level number badge + difficulty pill
//   * Best star score (amber ★ filled, dim ☆ empty)
//   * Creature count + time limit
//   * Large tap target ("Play") that calls selectLevel()
//
// Animation:
//   * Cards stagger in from below (0.08 s per card) with expo-out easing.
//   * Active level (current levelId in store) gets a warm amber ring.
//   * Sparkle particles drift in the background.

import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { LEVELS } from '../levels/levels';

// Scene thumbnail paths (same PNGs used by SceneBackground).
const SCENE_IMG: Record<string, string> = {
  forest: '/scenes/lvl-1-forest.png',
  meadow: '/scenes/lvl-2-meadow.png',
  beach:  '/scenes/lvl-3-shore.png',
};

// Per-level metadata shown on the card.
const LEVEL_META: Record<string, { num: number; difficulty: string; diffColor: string }> = {
  'lvl-1': { num: 1, difficulty: 'Beginner',   diffColor: '#78c47a' },
  'lvl-2': { num: 2, difficulty: 'Explorer',   diffColor: '#d4a73c' },
  'lvl-3': { num: 3, difficulty: 'Adventurer', diffColor: '#e07a5f' },
};

// Deterministic sparkle positions.
const SPARKLES = [
  { x:  6, y: 18, s: 3, d: 3.5, delay: 0.0  },
  { x: 20, y: 75, s: 2, d: 4.1, delay: 0.8  },
  { x: 38, y:  9, s: 4, d: 3.7, delay: 1.45 },
  { x: 55, y: 86, s: 2, d: 2.9, delay: 0.25 },
  { x: 72, y: 24, s: 3, d: 4.5, delay: 1.05 },
  { x: 88, y: 60, s: 2, d: 3.2, delay: 0.6  },
  { x: 13, y: 54, s: 2, d: 3.9, delay: 1.8  },
  { x: 63, y: 42, s: 3, d: 2.8, delay: 0.95 },
  { x: 80, y: 88, s: 2, d: 4.3, delay: 0.15 },
  { x: 47, y: 33, s: 2, d: 3.6, delay: 1.3  },
  { x: 94, y: 36, s: 3, d: 3.0, delay: 0.5  },
  { x: 30, y: 65, s: 2, d: 4.0, delay: 1.65 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Mini star row — reused inside each card.
// ---------------------------------------------------------------------------
function MiniStars({ filled, total = 3 }: { filled: number; total?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-5 w-5">
          {i < filled ? (
            // Filled — amber gradient
            <>
              <defs>
                <linearGradient id={`ls-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#f8eedd" />
                  <stop offset="100%" stopColor="#d4a73c" />
                </linearGradient>
              </defs>
              <path
                d="M10 2 L12.4 7.4 L18.5 8.2 L14 12.5 L15.3 18.5 L10 15.5 L4.7 18.5 L6 12.5 L1.5 8.2 L7.6 7.4 Z"
                fill={`url(#ls-${i})`}
                stroke="#a07828"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            </>
          ) : (
            // Empty — dim outline
            <path
              d="M10 2 L12.4 7.4 L18.5 8.2 L14 12.5 L15.3 18.5 L10 15.5 L4.7 18.5 L6 12.5 L1.5 8.2 L7.6 7.4 Z"
              fill="rgba(245,238,222,0.07)"
              stroke="rgba(245,238,222,0.28)"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
          )}
        </svg>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LevelCard
// ---------------------------------------------------------------------------
interface LevelCardProps {
  levelId: string;
  title: string;
  scene: string;
  creatureCount: number;
  timeLimit: number;
  earnedStars: number;
  isActive: boolean;
  index: number;
  onSelect: (id: string) => void;
}

function LevelCard({
  levelId, title, scene, creatureCount, timeLimit,
  earnedStars, isActive, index, onSelect,
}: LevelCardProps) {
  const meta = LEVEL_META[levelId];
  const imgSrc = SCENE_IMG[scene];
  const minutes = Math.floor(timeLimit / 60);
  const secs    = timeLimit % 60;
  const timeStr = minutes > 0 ? `${minutes}:${String(secs).padStart(2, '0')}` : `${secs}s`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 36, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.52, ease: EASE }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(levelId)}
      className={`relative flex flex-col overflow-hidden rounded-3xl shadow-2xl focus:outline-none ${
        isActive
          ? 'ring-[3px] ring-spotlight-edge shadow-[0_0_28px_rgba(212,167,60,0.45)]'
          : 'ring-1 ring-[rgba(245,238,222,0.15)]'
      }`}
      aria-label={`Play ${title}`}
      style={{ minWidth: 0 }}
    >
      {/* Scene image — same dimming treatment as SceneBackground */}
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={imgSrc}
          alt=""
          aria-hidden
          decoding="async"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'brightness(0.58) saturate(1.04)' }}
        />
        {/* Bottom-fade so info panel blends in */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(5,7,20,0) 30%, rgba(5,7,20,0.80) 100%)',
          }}
        />
        {/* Level badge — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className="rounded-full bg-night-deep/80 px-2.5 py-0.5 text-xs font-black uppercase tracking-widest text-paper/80 backdrop-blur-sm">
            Level {meta?.num ?? '?'}
          </div>
        </div>
        {/* Stars — top right */}
        <div className="absolute top-3 right-3">
          <MiniStars filled={earnedStars} />
        </div>
        {/* Difficulty badge — bottom left of image */}
        {meta && (
          <div
            className="absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm"
            style={{
              color: meta.diffColor,
              background: `${meta.diffColor}22`,
              border: `1px solid ${meta.diffColor}55`,
            }}
          >
            {meta.difficulty}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="surface-chrome-strong flex flex-col gap-2 p-4">
        <h3 className="font-display text-[1.2rem] font-bold text-paper leading-tight text-left">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-xs font-semibold text-paper/60">
          <span>{creatureCount} creatures</span>
          <span className="text-paper/30">·</span>
          <span>{timeStr}</span>
        </div>

        {/* Play CTA */}
        <div
          className={`mt-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-base font-bold transition-colors ${
            isActive
              ? 'bg-spotlight-edge text-night-deep'
              : 'bg-[rgba(245,238,222,0.10)] text-paper'
          }`}
        >
          {isActive ? 'Continue ▶' : 'Play ▶'}
        </div>
      </div>

      {/* Hover warm glow overlay — visible on focus/hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-[260ms] hover:opacity-100"
        style={{ background: 'rgba(212,167,60,0.06)' }}
      />
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Lobby
// ---------------------------------------------------------------------------

export function Lobby() {
  const selectLevel = useGame((s) => s.selectLevel);
  const levelStars  = useGame((s) => s.levelStars);
  const currentId   = useGame((s) => s.levelId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.44, ease: EASE }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-night-deep"
    >
      {/* Background sparkle particles */}
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

      {/* Radial warm glow behind cards */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 55%, rgba(212,167,60,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.44, ease: EASE }}
        className="relative z-10 mb-8 flex flex-col items-center gap-2"
      >
        <h1 className="font-display text-[2.4rem] font-bold text-paper leading-none tracking-[-0.01em]">
          Choose Your World
        </h1>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-paper/45">
          {LEVELS.length} adventures await
        </p>
      </motion.div>

      {/* Level cards — 3-column row on iPad landscape */}
      <div className="relative z-10 grid w-full max-w-4xl grid-cols-3 gap-5 px-8">
        {LEVELS.map((level, i) => (
          <LevelCard
            key={level.id}
            levelId={level.id}
            title={level.title}
            scene={level.scene}
            creatureCount={level.creatures.length}
            timeLimit={level.timeLimit}
            earnedStars={levelStars[level.id] ?? 0}
            isActive={level.id === currentId}
            index={i}
            onSelect={selectLevel}
          />
        ))}
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52, duration: 0.44, ease: EASE }}
        className="relative z-10 mt-8 text-xs font-medium text-paper/35 tracking-wide"
      >
        Tap any world to begin
      </motion.p>
    </motion.div>
  );
}
