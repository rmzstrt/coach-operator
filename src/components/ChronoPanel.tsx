import type { ChronoState } from "../useChrono";
import { CHRONO_PRESETS } from "../useChrono";

interface ChronoPanelProps extends ChronoState {
  /** Fourni quand le panneau est intégré ailleurs (ex: ScoreEntry) plutôt qu'en écran plein. */
  onClose?: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ChronoPanel({
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
  onClose,
}: ChronoPanelProps) {
  const urgent = phase === "shoot" && remaining > 0 && remaining <= 3;

  // Intégré (ex: ScoreEntry) : "Arrêter" quitte le chrono et revient direct à ce qu'il y
  // avait avant, plutôt que de rouvrir l'écran de réglages du chrono.
  function stop() {
    reset();
    onClose?.();
  }

  if (phase === "idle") {
    return (
      <div className="chrono-panel">
        {onClose && (
          <div className="chrono-panel__topbar">
            <button className="btn btn-icon" onClick={onClose} aria-label="Fermer le chrono">
              ✕
            </button>
          </div>
        )}

        <p className="text-muted gear-intro">
          Réglage en deux temps : un temps de préparation, puis le temps pour tirer la
          volée — avec des bips à 30 s et 10 s restantes.
        </p>

        <div className="chrono-presets">
          {CHRONO_PRESETS.map((p) => (
            <button key={p.id} type="button" className="btn btn-secondary" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="field-row">
          <label className="field">
            <span>Préparation (s)</span>
            <input
              type="number"
              min={0}
              max={300}
              value={prepSeconds}
              onChange={(e) => setPrepSeconds(Math.max(0, Number(e.target.value)))}
            />
          </label>
          <label className="field">
            <span>Volée (s)</span>
            <input
              type="number"
              min={5}
              max={600}
              value={shootSeconds}
              onChange={(e) => setShootSeconds(Math.max(5, Number(e.target.value)))}
            />
          </label>
        </div>

        <button className="btn btn-primary btn-block" onClick={start}>
          ▶ Démarrer
        </button>
      </div>
    );
  }

  return (
    <div className={`chrono-stage chrono-stage--${phase} ${urgent ? "chrono-stage--urgent" : ""}`}>
      <div className="chrono-stage__label">
        {phase === "prep" && "Préparation"}
        {phase === "shoot" && "Tir"}
        {phase === "done" && "Terminé"}
      </div>
      <div className="chrono-stage__time">{phase === "done" ? "0:00" : formatTime(remaining)}</div>

      {phase !== "done" && (
        <div className="chrono-controls">
          <button className="btn btn-secondary" onClick={togglePause}>
            {running ? "⏸ Pause" : "▶ Reprendre"}
          </button>
          {phase === "prep" && (
            <button className="btn btn-secondary" onClick={skipPrep}>
              ⏭ Passer
            </button>
          )}
          <button className="btn btn-secondary" onClick={stop}>
            ⏹ Arrêter
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="chrono-controls">
          <button className="btn btn-primary" onClick={start}>
            🔁 Recommencer
          </button>
          <button className="btn btn-secondary" onClick={onClose ?? reset}>
            {onClose ? "🎯 Noter mes scores" : "Réglages"}
          </button>
        </div>
      )}
    </div>
  );
}
