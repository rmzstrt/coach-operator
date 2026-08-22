import { useEffect, useState } from "react";
import { beep, beepSequence } from "./audio";

export type ChronoPhase = "idle" | "prep" | "shoot" | "done";

export interface ChronoPreset {
  id: string;
  label: string;
  prepSeconds: number;
  shootSeconds: number;
}

export const CHRONO_PRESETS: ChronoPreset[] = [
  { id: "3-arrows", label: "3 flèches (2 min)", prepSeconds: 10, shootSeconds: 120 },
  { id: "6-arrows", label: "6 flèches (4 min)", prepSeconds: 10, shootSeconds: 240 },
  { id: "rythme", label: "Rythme (30 s)", prepSeconds: 5, shootSeconds: 30 },
];

const SETTINGS_KEY = "coach-operator-chrono-settings";

interface StoredSettings {
  prepSeconds: number;
  shootSeconds: number;
}

function loadSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { prepSeconds: 10, shootSeconds: 120 };
    const parsed = JSON.parse(raw);
    return {
      prepSeconds: typeof parsed.prepSeconds === "number" ? parsed.prepSeconds : 10,
      shootSeconds: typeof parsed.shootSeconds === "number" ? parsed.shootSeconds : 120,
    };
  } catch {
    return { prepSeconds: 10, shootSeconds: 120 };
  }
}

/**
 * Moteur du chrono de tir : deux phases (préparation, volée), réglages retenus d'une
 * visite à l'autre. Partagé entre l'écran autonome (`Chrono.tsx`) et le panneau intégré
 * à la saisie de scores (`ScoreEntry.tsx`) via `ChronoPanel`.
 */
export function useChrono() {
  const initial = loadSettings();
  const [prepSeconds, setPrepSeconds] = useState(initial.prepSeconds);
  const [shootSeconds, setShootSeconds] = useState(initial.shootSeconds);
  const [phase, setPhase] = useState<ChronoPhase>("idle");
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ prepSeconds, shootSeconds }));
  }, [prepSeconds, shootSeconds]);

  // Le décompte : une seconde par tick tant que ça tourne.
  useEffect(() => {
    if (!running || (phase !== "prep" && phase !== "shoot")) return;
    const id = setInterval(() => setRemaining((r) => Math.max(r - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [running, phase]);

  // Transitions de phase + avertissements sonores, déclenchés par le changement de `remaining`.
  useEffect(() => {
    if (phase === "prep" || phase === "shoot") {
      if (remaining > 0) {
        if (phase === "shoot" && (remaining === 30 || remaining === 10)) {
          beep(760, 120);
          navigator.vibrate?.(60);
        }
        return;
      }
      if (phase === "prep") {
        beepSequence(2, 880, 120, 90);
        navigator.vibrate?.([80, 60, 80]);
        setPhase("shoot");
        setRemaining(shootSeconds);
      } else {
        beepSequence(3, 660, 200, 100);
        navigator.vibrate?.([150, 80, 150, 80, 150]);
        setPhase("done");
        setRunning(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  function start() {
    setPhase("prep");
    setRemaining(prepSeconds);
    setRunning(true);
  }

  function skipPrep() {
    setPhase("shoot");
    setRemaining(shootSeconds);
  }

  function togglePause() {
    setRunning((r) => !r);
  }

  function reset() {
    setPhase("idle");
    setRunning(false);
    setRemaining(0);
  }

  function applyPreset(preset: ChronoPreset) {
    setPrepSeconds(preset.prepSeconds);
    setShootSeconds(preset.shootSeconds);
  }

  return {
    prepSeconds,
    setPrepSeconds,
    shootSeconds,
    setShootSeconds,
    phase,
    remaining,
    running,
    start,
    skipPrep,
    togglePause,
    reset,
    applyPreset,
  };
}

export type ChronoState = ReturnType<typeof useChrono>;
