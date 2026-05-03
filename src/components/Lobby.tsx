// Lobby — level-select screen shown between Complete and Tutorial.
//
// 25 levels in a scrollable responsive grid (3 columns portrait / 5 columns
// landscape ≥ 1100 px). Cards show scene thumbnail, level number, mechanic
// variant badge, best star rating, creature count and time limit.

import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { LEVELS } from '../levels/levels';
import { PawIcon, PlayIcon } from './icons';

const SCENE_IMG: Record<string, string> = {
  forest: '/scenes/lvl-1-forest.png',
  meadow: '/scenes/lvl-2-meadow.png',
  beach:  '/scenes/lvl-3-shore.png',
  cave:   '/scenes/lvl-4-cave.png',
  snow:   '/scenes/lvl-5-snow.png',
};

// ---------------------------------------------------------------------------
// Per-level metadata
// ---------------------------------------------------------------------------

interface LevelMeta {
  num:        number;
  difficulty: string;
  diffColor:  string;
}

const LEVEL_META: Record<string, LevelMeta> = {
  // ── Original composited levels ───────────────────────────────────────────
  'lvl-1':  { num:  1, difficulty: 'Beginner',    diffColor: '#78c47a' },
  'lvl-2':  { num:  2, difficulty: 'Explorer',    diffColor: '#d4a73c' },
  'lvl-3':  { num:  3, difficulty: 'Adventurer',  diffColor: '#e07a5f' },
  'lvl-4':  { num:  4, difficulty: 'Expert',      diffColor: '#c97ae0' },
  'lvl-5':  { num:  5, difficulty: 'Master',      diffColor: '#e05f5f' },
  // ── Group A — Classic ────────────────────────────────────────────────────
  'lvl-6':  { num:  6, difficulty: 'Classic',     diffColor: '#78c47a' },
  'lvl-7':  { num:  7, difficulty: 'Classic',     diffColor: '#78c47a' },
  'lvl-8':  { num:  8, difficulty: 'Classic',     diffColor: '#78c47a' },
  'lvl-9':  { num:  9, difficulty: 'Classic',     diffColor: '#78c47a' },
  // ── Group B — Quick Dwell ────────────────────────────────────────────────
  'lvl-10': { num: 10, difficulty: 'Quick Dwell', diffColor: '#f5c518' },
  'lvl-11': { num: 11, difficulty: 'Quick Dwell', diffColor: '#f5c518' },
  'lvl-12': { num: 12, difficulty: 'Quick Dwell', diffColor: '#f5c518' },
  'lvl-13': { num: 13, difficulty: 'Quick Dwell', diffColor: '#f5c518' },
  // ── Group C — Wide Beam ──────────────────────────────────────────────────
  'lvl-14': { num: 14, difficulty: 'Wide Beam',   diffColor: '#4ab4e0' },
  'lvl-15': { num: 15, difficulty: 'Wide Beam',   diffColor: '#4ab4e0' },
  'lvl-16': { num: 16, difficulty: 'Wide Beam',   diffColor: '#4ab4e0' },
  'lvl-17': { num: 17, difficulty: 'Wide Beam',   diffColor: '#4ab4e0' },
  // ── Group D — Pinhole ────────────────────────────────────────────────────
  'lvl-18': { num: 18, difficulty: 'Pinhole',     diffColor: '#c084e0' },
  'lvl-19': { num: 19, difficulty: 'Pinhole',     diffColor: '#c084e0' },
  'lvl-20': { num: 20, difficulty: 'Pinhole',     diffColor: '#c084e0' },
  'lvl-21': { num: 21, difficulty: 'Pinhole',     diffColor: '#c084e0' },
  // ── Group E — Endless ────────────────────────────────────────────────────
  'lvl-22': { num: 22, difficulty: 'Endless',     diffColor: '#f08060' },
  'lvl-23': { num: 23, difficulty: 'Endless',     diffColor: '#f08060' },
  'lvl-24': { num: 24, difficulty: 'Endless',     diffColor: '#f08060' },
  'lvl-25': { num: 25, difficulty: 'Endless',     diffColor: '#f08060' },
  // ── WALDO EDITION ────────────────────────────────────────────────────────
  // ── Group F — Waldo Classic ──────────────────────────────────────────────
  'lvl-26': { num: 26, difficulty: 'Waldo Classic',     diffColor: '#5ec48a' },
  'lvl-27': { num: 27, difficulty: 'Waldo Classic',     diffColor: '#5ec48a' },
  'lvl-28': { num: 28, difficulty: 'Waldo Classic',     diffColor: '#5ec48a' },
  'lvl-29': { num: 29, difficulty: 'Waldo Classic',     diffColor: '#5ec48a' },
  // ── Group G — Waldo Quick Dwell ──────────────────────────────────────────
  'lvl-30': { num: 30, difficulty: 'Waldo Quick',       diffColor: '#e0c030' },
  'lvl-31': { num: 31, difficulty: 'Waldo Quick',       diffColor: '#e0c030' },
  'lvl-32': { num: 32, difficulty: 'Waldo Quick',       diffColor: '#e0c030' },
  'lvl-33': { num: 33, difficulty: 'Waldo Quick',       diffColor: '#e0c030' },
  // ── Group H — Waldo Wide Beam ────────────────────────────────────────────
  'lvl-34': { num: 34, difficulty: 'Waldo Wide',        diffColor: '#38a8d8' },
  'lvl-35': { num: 35, difficulty: 'Waldo Wide',        diffColor: '#38a8d8' },
  'lvl-36': { num: 36, difficulty: 'Waldo Wide',        diffColor: '#38a8d8' },
  'lvl-37': { num: 37, difficulty: 'Waldo Wide',        diffColor: '#38a8d8' },
  // ── Group I — Waldo Pinhole ──────────────────────────────────────────────
  'lvl-38': { num: 38, difficulty: 'Waldo Pinhole',     diffColor: '#b870d8' },
  'lvl-39': { num: 39, difficulty: 'Waldo Pinhole',     diffColor: '#b870d8' },
  'lvl-40': { num: 40, difficulty: 'Waldo Pinhole',     diffColor: '#b870d8' },
  'lvl-41': { num: 41, difficulty: 'Waldo Pinhole',     diffColor: '#b870d8' },
  // ── Group J — Waldo Endless ──────────────────────────────────────────────
  'lvl-42': { num: 42, difficulty: 'Waldo Endless',     diffColor: '#e86848' },
  'lvl-43': { num: 43, difficulty: 'Waldo Endless',     diffColor: '#e86848' },
  'lvl-44': { num: 44, difficulty: 'Waldo Endless',     diffColor: '#e86848' },
  'lvl-45': { num: 45, difficulty: 'Waldo Endless',     diffColor: '#e86848' },
};

// First level of each mechanic group — gets a ⭐ "Best Start" badge.
const BEST_START = new Set([
  'lvl-6',  'lvl-10', 'lvl-14', 'lvl-18', 'lvl-22',
  'lvl-26', 'lvl-30', 'lvl-34', 'lvl-38', 'lvl-42',
]);

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
// MiniStars
// ---------------------------------------------------------------------------
function MiniStars({ filled, total = 3 }: { filled: number; total?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-5 w-5">
          {i < filled ? (
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
  levelId:      string;
  title:        string;
  scene:        string;
  creatureCount:number;
  timeLimit:    number;
  earnedStars:  number;
  isActive:     boolean;
  index:        number;
  onSelect:     (id: string) => void;
}

function LevelCard({
  levelId, title, scene, creatureCount, timeLimit,
  earnedStars, isActive, index, onSelect,
}: LevelCardProps) {
  const meta    = LEVEL_META[levelId];
  const imgSrc  = SCENE_IMG[scene];
  const endless = timeLimit >= 9000;
  const minutes = Math.floor(timeLimit / 60);
  const secs    = timeLimit % 60;
  const timeStr = endless
    ? '∞'
    : minutes > 0 ? `${minutes}:${String(secs).padStart(2, '0')}` : `${secs}s`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 36, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.06 + (index % 10) * 0.06, duration: 0.52, ease: EASE }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(levelId)}
      data-testid={`level-card-${levelId}`}
      className={`relative flex flex-col overflow-hidden rounded-3xl shadow-2xl focus:outline-none ${
        isActive
          ? 'ring-[3px] ring-spotlight-edge shadow-[0_0_28px_rgba(212,167,60,0.45)]'
          : 'ring-1 ring-[rgba(245,238,222,0.15)]'
      }`}
      aria-label={`Play ${title}`}
      style={{ minWidth: 0 }}
    >
      {/* Scene image */}
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={imgSrc}
          alt=""
          aria-hidden
          decoding="async"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'brightness(0.58) saturate(1.04)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(5,7,20,0) 30%, rgba(5,7,20,0.80) 100%)',
          }}
        />
        {/* Level number badge — top left */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="rounded-full bg-night-deep/80 px-2 py-0.5 text-xs font-black uppercase tracking-widest text-paper/80 backdrop-blur-sm">
            {meta?.num ?? '?'}
          </div>
        </div>
        {/* Stars — top right */}
        <div className="absolute top-2 right-2">
          <MiniStars filled={earnedStars} />
        </div>
        {/* Mechanic variant badge — bottom left */}
        {meta && (
          <div
            className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[0.68rem] font-bold backdrop-blur-sm"
            style={{
              color:      meta.diffColor,
              background: `${meta.diffColor}22`,
              border:     `1px solid ${meta.diffColor}55`,
            }}
          >
            {meta.difficulty}
          </div>
        )}
        {/* Best-start star — first level of each mechanic group */}
        {BEST_START.has(levelId) && (
          <div className="absolute bottom-2 right-2 rounded-full bg-spotlight-edge/90 px-1.5 py-0.5 text-[0.65rem] font-black text-night-deep shadow-md backdrop-blur-sm">
            ⭐ Best Start
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="surface-chrome-strong flex flex-col gap-1 p-2.5">
        <h3 className="font-display text-[0.95rem] font-bold text-paper leading-tight text-left line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-paper/55">
          <PawIcon className="h-3 w-3 shrink-0" />
          <span>{creatureCount}</span>
          <span className="text-paper/25">·</span>
          <span>{timeStr}</span>
        </div>

        {/* Play CTA */}
        <div
          className={`mt-0.5 flex items-center justify-center gap-1 rounded-full py-1.5 text-xs font-bold transition-colors ${
            isActive
              ? 'bg-spotlight-edge text-night-deep'
              : 'bg-[rgba(245,238,222,0.10)] text-paper'
          }`}
        >
          {isActive ? 'Continue' : 'Play'}
          <PlayIcon className="h-3 w-3 shrink-0" />
        </div>
      </div>

      {/* Hover warm glow */}
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
      className="absolute inset-0 z-20 flex flex-col items-center overflow-y-auto bg-night-deep"
    >
      {/* Background sparkle particles (fixed behind scroll) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {SPARKLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-spotlight-warm animate-float-particle"
            style={{
              left:   `${p.x}%`,
              top:    `${p.y}%`,
              width:  p.s,
              height: p.s,
              '--dur':       `${p.d}s`,
              animationDelay:`${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 45%, rgba(212,167,60,0.09) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.44, ease: EASE }}
        className="relative z-10 mt-8 mb-5 flex flex-col items-center gap-2"
      >
        <h1 className="font-display text-[2.369rem] font-bold text-paper leading-none tracking-[-0.01em]">
          Choose Your World
        </h1>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-paper/45">
          {LEVELS.length} adventures await
        </p>

        {/* Mechanic group legend */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {(
            [
              { label: 'Classic',    color: '#78c47a' },
              { label: 'Quick Dwell',color: '#f5c518' },
              { label: 'Wide Beam',  color: '#4ab4e0' },
              { label: 'Pinhole',    color: '#c084e0' },
              { label: 'Endless',    color: '#f08060' },
            ] as const
          ).map(({ label, color }) => (
            <span
              key={label}
              className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold"
              style={{
                color,
                background: `${color}22`,
                border:     `1px solid ${color}55`,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Level cards grid */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-3 min-[1100px]:grid-cols-5 gap-3 px-4 pb-10">
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
        className="relative z-10 mb-6 text-xs font-medium text-paper/35 tracking-wide"
      >
        Tap any world to begin
      </motion.p>
    </motion.div>
  );
}
