import { useState } from "react";
import type { BowProfile } from "../gearTypes";
import type { TuningDiagnosis } from "../tuning";

interface TuningResultCardProps {
  diagnosis: TuningDiagnosis;
  /** Arcs enregistrés (module Matériel) — l'enregistrement en commit est optionnel. */
  bows: BowProfile[];
  onCreateCommit: (bowId: string, draft: { message: string; highlightKeys: string[] }) => void;
}

export function TuningResultCard({ diagnosis, bows, onCreateCommit }: TuningResultCardProps) {
  const [bowId, setBowId] = useState(bows.length === 1 ? bows[0].id : "");
  const hasSuggestion = diagnosis.highlightKeys.length > 0;

  return (
    <>
      <div className="card tuning-result">
        <div className="tuning-result__summary">{diagnosis.summary}</div>
        <ul className="tuning-result__list">
          {diagnosis.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {hasSuggestion && bows.length === 0 && (
        <p className="text-muted" style={{ textAlign: "center" }}>
          Ajoute un arc dans 🔧 Matériel si tu veux garder ce diagnostic dans son historique
          de réglages.
        </p>
      )}

      {hasSuggestion && bows.length > 0 && (
        <div className="tuning-commit-cta">
          {bows.length > 1 && (
            <label className="field">
              <span>Enregistrer sur l'arc</span>
              <select value={bowId} onChange={(e) => setBowId(e.target.value)}>
                <option value="">— choisir un arc —</option>
                {bows.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            className="btn btn-secondary btn-block"
            disabled={!bowId}
            onClick={() =>
              onCreateCommit(bowId, { message: diagnosis.message, highlightKeys: diagnosis.highlightKeys })
            }
          >
            💾 Garder ce diagnostic comme commit
          </button>
        </div>
      )}
    </>
  );
}
