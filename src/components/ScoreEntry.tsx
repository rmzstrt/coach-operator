import { useEffect, useState } from "react";
import type { Arrow, ArrowValue, Session } from "../types";
import {
  endTotal,
  isSessionComplete,
  positionedArrows,
  scoreFromNormalizedPosition,
  sessionAverage,
  sessionTotal,
  usesCompoundIndoorRule,
} from "../scoring";
import { newlyEarnedBadges } from "../badges";
import { TargetFace } from "./TargetFace";
import { useChrono } from "../useChrono";
import { ChronoPanel } from "./ChronoPanel";

interface ScoreEntryProps {
  session: Session;
  allSessions: Session[];
  onChange: (session: Session) => void;
  onBack: () => void;
  onFreeShooting?: () => void;
}

const MODE_KEY = "coach-operator-input-mode";

/** Boutons chiffres disponibles selon le type de blason et la règle poulie en salle. */
function valuesFor(targetType: Session["targetType"], compoundIndoor: boolean): ArrowValue[] {
  const scored: number[] =
    targetType === "vegas" ? [10, 9, 8, 7, 6] : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  // Impossible de scorer un "10" hors X pour un arc à poulie en salle (seul le X vaut 10).
  const withoutPlainTen = compoundIndoor ? scored.filter((v) => v !== 10) : scored;
  return ["X", ...withoutPlainTen, "M"];
}

type InputMode = "buttons" | "target";

export function ScoreEntry({ session, allSessions, onChange, onBack, onFreeShooting }: ScoreEntryProps) {
  const [current, setCurrent] = useState<Arrow[]>([]);
  const [mode, setMode] = useState<InputMode>(
    () => (localStorage.getItem(MODE_KEY) as InputMode) || "buttons",
  );
  const [showChrono, setShowChrono] = useState(false);
  const chrono = useChrono();
  const complete = isSessionComplete(session);
  const endIndexBeingFilled = session.ends.length; // 0-based
  const canAddEnd = endIndexBeingFilled < session.numberOfEnds;
  const compoundIndoor = usesCompoundIndoorRule(session.bowType, session.discipline);

  function changeMode(next: InputMode) {
    setMode(next);
    localStorage.setItem(MODE_KEY, next);
  }

  function launchChrono() {
    setShowChrono(true);
    chrono.start();
  }

  // Dès que la volée en cours atteint le nombre de flèches attendu, on la committe
  // dans la séance (comme volée comptée, pas libre).
  // On passe par un effect (plutôt que de le faire directement dans addArrow)
  // pour rester correct même si plusieurs taps arrivent dans le même tick.
  useEffect(() => {
    if (current.length > 0 && current.length === session.arrowsPerEnd && canAddEnd) {
      const provisional: Session = {
        ...session,
        ends: [...session.ends, { arrows: current }],
      };
      const justCompleted = provisional.ends.length === provisional.numberOfEnds;
      const badges = justCompleted ? newlyEarnedBadges(provisional, allSessions) : [];
      const updated: Session = justCompleted ? { ...provisional, badges } : provisional;

      onChange(updated);
      setCurrent([]);

      if (justCompleted && badges.length > 0 && "vibrate" in navigator) {
        navigator.vibrate?.([40, 30, 40, 30, 40]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function addArrow(arrow: Arrow) {
    if (!canAddEnd) return;
    setCurrent((prev) => (prev.length >= session.arrowsPerEnd ? prev : [...prev, arrow]));
  }

  function handleTap(nx: number, ny: number) {
    addArrow({
      value: scoreFromNormalizedPosition(nx, ny, session.targetType, compoundIndoor),
      x: nx,
      y: ny,
    });
  }

  function undoArrow() {
    if (current.length > 0) {
      setCurrent((prev) => prev.slice(0, -1));
    } else if (session.ends.length > 0) {
      const lastEnd = session.ends[session.ends.length - 1];
      const updated: Session = { ...session, ends: session.ends.slice(0, -1), badges: undefined };
      onChange(updated);
      setCurrent(lastEnd.arrows.slice(0, -1));
    }
  }

  const groupMarks = positionedArrows(session);
  const values = valuesFor(session.targetType, compoundIndoor);

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <div>
          <h1>{session.discipline}</h1>
          <div className="subtitle">
            {formatDate(session.date)} · {session.distance}m · blason {session.targetFace}cm
            {session.targetType === "vegas" && " · spot Vegas"}
            {compoundIndoor && " · poulie (X=10, jaune=9)"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {!complete && onFreeShooting && (
            <button className="btn btn-icon" onClick={onFreeShooting} aria-label="Tir libre">
              🎯
            </button>
          )}
          {!complete && (
            <button className="btn btn-icon" onClick={launchChrono} aria-label="Lancer le chrono">
              ⏱️
            </button>
          )}
        </div>
      </header>

      <div className="score-summary">
        <div className="score-summary__item">
          <span className="score-summary__value">{sessionTotal(session)}</span>
          <span className="score-summary__label">Total</span>
        </div>
        <div className="score-summary__item">
          <span className="score-summary__value">{sessionAverage(session).toFixed(2)}</span>
          <span className="score-summary__label">Moyenne / flèche</span>
        </div>
        <div className="score-summary__item">
          <span className="score-summary__value">
            {session.ends.length}/{session.numberOfEnds}
          </span>
          <span className="score-summary__label">Volées</span>
        </div>
      </div>

      {complete ? (
        <div className="card celebration-card">
          🎯 Séance terminée — {sessionTotal(session)} points, moyenne{" "}
          {sessionAverage(session).toFixed(2)}
          {session.badges && session.badges.length > 0 && (
            <ul className="badge-list">
              {session.badges.map((b) => (
                <li key={b.id} className="badge-list__item">
                  <span className="badge-list__emoji">{b.emoji}</span>
                  <span>
                    <strong>{b.label}</strong>
                    <br />
                    <span className="text-muted">{b.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : showChrono ? (
        <ChronoPanel {...chrono} onClose={() => setShowChrono(false)} />
      ) : (
        <>
          <div className="mode-toggle">
            <button
              className={`mode-toggle__btn ${mode === "buttons" ? "mode-toggle__btn--active" : ""}`}
              onClick={() => changeMode("buttons")}
            >
              🔢 Chiffres
            </button>
            <button
              className={`mode-toggle__btn ${mode === "target" ? "mode-toggle__btn--active" : ""}`}
              onClick={() => changeMode("target")}
            >
              🎯 Cible
            </button>
          </div>

          <div className="current-end">
            {Array.from({ length: session.arrowsPerEnd }).map((_, i) => (
              <span
                key={i}
                className={`arrow-slot ${current[i] !== undefined ? "arrow-slot--filled" : ""}`}
              >
                {current[i] !== undefined ? current[i].value : ""}
              </span>
            ))}
          </div>

          {mode === "target" ? (
            <div className="target-wrap">
              <TargetFace
                marks={current}
                onTap={handleTap}
                targetType={session.targetType}
                compoundIndoorRule={compoundIndoor}
              />
              <p className="subtitle target-hint">
                Maintiens sur le blason, ajuste avec la loupe, relâche pour valider
              </p>
            </div>
          ) : (
            <div className="value-grid">
              {values.map((v) => (
                <button
                  key={v}
                  className={`value-btn value-btn--${v}`}
                  onClick={() => addArrow({ value: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          <button className="btn btn-secondary btn-block" onClick={undoArrow}>
            ↩ Annuler la dernière flèche
          </button>
        </>
      )}

      {groupMarks.length > 0 && (
        <div className="card group-section">
          <h2>Groupement</h2>
          <div className="target-wrap">
            <TargetFace marks={groupMarks} size={220} targetType={session.targetType} />
          </div>
          <p className="subtitle">
            {groupMarks.length} flèche{groupMarks.length > 1 ? "s" : ""} positionnée
            {groupMarks.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {session.ends.length > 0 && (
        <div className="ends-history">
          <h2>Volées</h2>
          <ul>
            {session.ends.map((end, i) => (
              <li key={i} className={`end-row ${end.isFree ? "end-row--free" : ""}`}>
                <span className="end-row__index">V{i + 1}{end.isFree && " 🎯"}</span>
                <span className="end-row__arrows">
                  {end.arrows.map((a, j) => (
                    <span key={j} className="arrow-chip">
                      {a.value}
                    </span>
                  ))}
                </span>
                <span className="end-row__total">{endTotal(end)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
