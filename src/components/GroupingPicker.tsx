import { useState } from "react";
import type { Session } from "../types";
import { hasGroupingData, positionedArrows } from "../groupingStats";

interface GroupingPickerProps {
  sessions: Session[];
  onCompare: (aId: string, bId: string) => void;
  onBack: () => void;
}

export function GroupingPicker({ sessions, onCompare, onBack }: GroupingPickerProps) {
  const eligible = sessions.filter(hasGroupingData);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>🎯 Groupement</h1>
      </header>

      <p className="text-muted gear-intro">
        Compare la dispersion des flèches de deux séances saisies en mode "Cible" —
        pratique pour voir d'un coup d'œil si un changement de réglage a resserré le
        groupement.
      </p>

      {selected.length === 2 && (
        <button
          className="btn btn-secondary btn-block"
          onClick={() => onCompare(selected[0], selected[1])}
        >
          ⇄ Comparer les 2 séances sélectionnées
        </button>
      )}

      {eligible.length === 0 ? (
        <p className="empty-state">
          Aucune séance avec des flèches positionnées pour l'instant. Utilise le mode
          "Cible" pendant la saisie (au lieu de "Chiffres") pour pouvoir comparer tes
          groupements.
        </p>
      ) : (
        <ul className="session-list">
          {eligible.map((s) => {
            const isSelected = selected.includes(s.id);
            return (
              <li
                key={s.id}
                className={`session-item ${isSelected ? "session-item--selected" : ""}`}
                onClick={() => toggle(s.id)}
              >
                <label className="commit-item__checkbox" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggle(s.id)} />
                </label>
                <div className="session-item__main">
                  <span className="session-item__date">{formatDate(s.date)}</span>
                  <span className="session-item__discipline">
                    {s.discipline} · {positionedArrows(s).length} flèches positionnées
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
