// Loader — "Lighting the lantern…" splash.
// Visual uplift v3:
//   * Ambient sparkle particles float in the background.
//   * Progress bar uses a warm amber → ivory gradient fill.
//   * Fixed: shadow-[] uses sRGB rgba instead of oklch() which Safari < 15.4
//     can't parse inside arbitrary Tailwind values.

import { useEffect, useState } from 'react';
import { LanternIcon } from './icons';

interface Props {
  onReady: () => void;
}

// Fixed deterministic sparkle positions — no Math.random, consistent SSR.
const SPARKLES = [
  { x: 11, y: 24, s: 3, d: 3.3, delay: 0.0 },
  { x: 27, y: 71, s: 2, d: 4.0, delay: 0.75 },
  { x: 43, y: 16, s: 4, d: 3.7, delay: 1.4  },
  { x: 59, y: 81, s: 2, d: 2.9, delay: 0.3  },
  { x: 76, y: 33, s: 3, d: 4.4, delay: 1.05 },
  { x: 89, y: 58, s: 2, d: 3.1, delay: 0.6  },
  { x: 14, y: 50, s: 2, d: 3.9, delay: 1.75 },
  { x: 66, y: 47, s: 3, d: 2.8, delay: 0.9  },
  { x: 37, y: 88, s: 2, d: 4.2, delay: 0.2  },
  { x: 82, y: 78, s: 3, d: 3.5, delay: 1.3  },
];

export function Loader({ onReady }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    const id = window.setInterval(() => {
      if (cancelled) return;
      frame += 1;
      const p = Math.min(100, Math.floor((frame / 16) * 100));
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(id);
        window.setTimeout(onReady, 280);
      }
    }, 45);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [onReady]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-night-deep overflow-hidden">

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

      {/* Background radial warm glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 42%, rgba(212,167,60,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-8 z-10">

        {/* Lantern icon with layered halos */}
        <div className="relative h-36 w-36">
          <div className="absolute inset-[-35%] rounded-full bg-spotlight-warm/14 blur-3xl animate-pulse-soft" />
          <div className="absolute inset-[-16%] rounded-full bg-spotlight-warm/28 blur-2xl animate-pulse-soft"
               style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-[-5%] rounded-full bg-spotlight-warm/40 blur-xl" />
          {/* sRGB shadow: oklch(82% 0.16 72 / 0.55) ≈ rgba(212,167,60,0.55) */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-spotlight-edge text-night-deep shadow-[0_0_64px_rgba(212,167,60,0.55),0_0_24px_rgba(212,167,60,0.35)]">
            <LanternIcon className="h-18 w-18" style={{ width: 72, height: 72 }} />
          </div>
        </div>

        <p className="font-display text-[1.778rem] font-semibold text-paper tracking-[-0.005em]">
          Lighting the lantern&hellip;
        </p>

        {/* Progress bar — gradient fill */}
        <div
          className="h-2.5 w-60 overflow-hidden rounded-full surface-chrome-strong"
          role="progressbar"
          aria-label="Loading"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full transition-[width] duration-[260ms]"
            style={{
              width: `${progress}%`,
              transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
              background: 'linear-gradient(90deg, #a07828 0%, #d4a73c 50%, #f8eedd 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
