// Friendly loader. Per PRD: scenes load within 2s; show progress.
// v0 fakes a short progress for the bundled SVG scenes; future
// AI-generated scenes will hook in real /api/scene fetch progress.
//
// v1 UAT polish: the disc now reads as a glowing lantern with radiating
// warm rays — same design language as the spotlight overlay. The lantern
// SVG sits at the centre so the loader matches the tutorial entry icon.

import { useEffect, useState } from 'react';
import { LanternIcon } from './icons';

interface Props {
  onReady: () => void;
}

export function Loader({ onReady }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    const id = window.setInterval(() => {
      if (cancelled) return;
      frame += 1;
      // 0..100 in ~700ms (16 frames @ 45ms).
      const p = Math.min(100, Math.floor((frame / 16) * 100));
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(id);
        // Slight delay so the user sees "100%" briefly.
        window.setTimeout(onReady, 250);
      }
    }, 45);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [onReady]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-night-deep">
      <div className="flex flex-col items-center gap-7">
        <div className="relative h-32 w-32">
          {/* Outermost atmospheric haze — the lantern's room-glow. */}
          <div className="absolute inset-[-30%] rounded-full bg-spotlight-warm/18 blur-3xl animate-pulse-soft" />
          {/* Mid halo. */}
          <div className="absolute inset-[-10%] rounded-full bg-spotlight-warm/35 blur-2xl" />
          {/* Lantern disc — solid warm-amber, no rainbow gradient (impeccable
              banned the gradient stack on small chrome). The shape brief's
              "iPad IS the lantern" moment lives in this halo + the disc. */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-spotlight-edge text-night-deep shadow-[0_0_60px_oklch(82%_0.16_72/0.55)]">
            <LanternIcon className="h-16 w-16" />
          </div>
        </div>
        <div className="font-display text-[1.778rem] font-semibold text-paper tracking-[-0.005em]">
          Lighting the lantern&hellip;
        </div>
        <div
          className="h-2 w-56 overflow-hidden rounded-full surface-chrome-strong"
          role="progressbar"
          aria-label="Loading"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-spotlight-edge transition-[width] duration-[260ms]"
            style={{ width: `${progress}%`, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
          />
        </div>
      </div>
    </div>
  );
}
