/**
 * Bips sonores générés à la volée (Web Audio API) — pas de fichier audio à charger,
 * fonctionne hors-ligne comme le reste de l'appli. Utilisé par le chrono de tir.
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function beep(frequency = 880, durationMs = 150, volume = 0.25): void {
  const audioCtx = getContext();
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000);
}

export function beepSequence(count: number, frequency = 880, durationMs = 150, gapMs = 100): void {
  for (let i = 0; i < count; i++) {
    setTimeout(() => beep(frequency, durationMs), i * (durationMs + gapMs));
  }
}
