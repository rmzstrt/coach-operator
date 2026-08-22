import { useState } from "react";
import type { Arrow, Session } from "../types";
import { endTotal, usesCompoundIndoorRule } from "../scoring";
import { TargetFace } from "./TargetFace";
import { scoreFromNormalizedPosition } from "../scoring";

interface FreeShootingProps {
  session: Session;
  onChange: (session: Session) => void;
  onBack: () => void;
}

type InputMode = "buttons" | "target";

const MODE_KEY = "coach-operator-free-input-mode";

function valuesFor(targetType: Session["targetType"], compoundIndoor: boolean) {
  const scored: number[] =
    targetType === "vegas" ? [10, 9, 8, 7, 6] : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const withoutPlainTen = compoundIndoor ? scored.filter((v) => v !== 10) : scored;
  return ["X", ...withoutPlainTen, "M"];
}

export function FreeShooting({ session, onChange, onBack }: FreeShootingProps) {
  const [current, setCurrent] = useState<Arrow[]>([]);
  const [mode, setMode] = useState<InputMode>(
    () => (localStorage.getItem(MODE_KEY) as InputMode) || "buttons",
  );
  const compoundIndoor = usesCompoundIndoorRule(session.bowType, session.discipline);

  function changeMode(next: InputMode) {
    setMode(next);
    localStorage.setItem(MODE_KEY, next);
  }

  function addArrow(arrow: Arrow) {
    setCurrent((prev) => [...prev, arrow]);
  }

  function handleTap(nx: number, ny: number) {
    addArrow({
      value: scoreFromNormalizedPosition(nx, ny, session.targetType, compoundIndoor),
      x: nx,
      y: ny,
    });
  }

  function confirmEnd() {
    if (current.length === 0) return;
    const updated: Session = {
      ...session,
      ends: [...session.ends, { arrows: current, isFree: true }],
    };
    onChange(updated);
    setCurrent([]);
  }

  function undoArrow() {
    if (current.length > 0) {
      setCurrent((prev) => prev.slice(0, -1));
    }
  }

  const freeEnds = session.ends.filter((e) => e.isFree);
  const values = valuesFor(session.targetType, compoundIndoor);

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <div>
          <h1>🎯 Tir libre</h1>
          <div className="subtitle">{freeEnds.length} volée{freeEnds.length > 1 ? "s" : ""} libre{freeEnds.length > 1 ? "s" : ""}</div>
        </div>
      </header>

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
        {current.map((a, i) => (
          <span key={i} className="arrow-slot arrow-slot--filled">
            {a.value}
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
              onClick={() => addArrow({ value: v as any })}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button className="btn btn-secondary btn-block" onClick={undoArrow}>
          ↩ Annuler
        </button>
        <button
          className="btn btn-primary btn-block"
          onClick={confirmEnd}
          disabled={current.length === 0}
        >
          ✓ Valider volée
        </button>
      </div>

      {freeEnds.length > 0 && (
        <div className="ends-history">
          <h2>Volées libres</h2>
          <ul>
            {freeEnds.map((end, i) => (
              <li key={i} className="end-row end-row--free">
                <span className="end-row__index">🎯 V{i + 1}</span>
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
