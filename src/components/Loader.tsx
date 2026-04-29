// Friendly loader. Per PRD: scenes load within 2s; show progress.
// v0 fakes a short progress for the bundled SVG scenes; future
// AI-generated scenes will hook in real /api/scene fetch progress.

import { useEffect, useState } from 'react';

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
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-spotlight-warm/30 blur-2xl animate-pulse-soft" />
          <div className="relative h-full w-full rounded-full bg-spotlight-warm/90" />
        </div>
        <div className="font-display text-2xl font-bold text-paper">
          Tuning the lantern...
        </div>
        <div className="h-2 w-56 overflow-hidden rounded-full bg-night/80">
          <div
            className="h-full rounded-full bg-spotlight-warm transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
