// Tiny sound module. Generates a friendly "ping" via Web Audio API
// rather than shipping audio files — keeps the bundle small and the
// app fully offline-capable.
//
// iOS Safari note: AudioContext must be created AND resumed inside a
// synchronous user-gesture handler (click/touchstart). We expose
// unlockAudio() which should be called from the Tutorial "Let's begin"
// button click so that later playPing() calls from the rAF loop succeed.

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

/**
 * Pre-unlock the AudioContext on the first user gesture.
 * Must be called synchronously inside a click / touchstart / pointerdown
 * handler so iOS Safari grants permission to start audio.
 * Safe to call multiple times.
 */
export function unlockAudio(): void {
  const a = ensureCtx();
  if (!a) return;
  // iOS Safari requires resume() called synchronously inside a user gesture.
  if (a.state === 'suspended') {
    a.resume().catch(() => {});
  }
}

/** Short ascending two-tone "you found one" chime. */
export function playPing() {
  const a = ensureCtx();
  if (!a) return;
  // Belt-and-suspenders resume in case the context was auto-suspended
  // after a period of silence (Safari will do this).
  if (a.state === 'suspended') a.resume().catch(() => {});

  const ctxLocal: AudioContext = a;
  const now = ctxLocal.currentTime;

  function tone(freq: number, t0: number, dur: number, gain = 0.18) {
    const osc = ctxLocal.createOscillator();
    const env = ctxLocal.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env).connect(ctxLocal.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
  }

  tone(660, now,         0.18);
  tone(880, now + 0.08,  0.22);
}

/** Cheerful chord on level complete. */
export function playFanfare() {
  const a = ensureCtx();
  if (!a) return;
  if (a.state === 'suspended') a.resume().catch(() => {});

  const ctxLocal: AudioContext = a;
  const now = ctxLocal.currentTime;
  function chord(freqs: number[], t0: number, dur: number, gain = 0.12) {
    for (const f of freqs) {
      const osc = ctxLocal.createOscillator();
      const env = ctxLocal.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(gain, t0 + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(env).connect(ctxLocal.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    }
  }
  chord([523, 659, 784], now,         0.45);
  chord([659, 784, 988], now + 0.20,  0.55);
}
