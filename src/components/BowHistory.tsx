import { useState } from "react";
import type { BowProfile, SetupCommit } from "../gearTypes";
import type { Session } from "../types";
import { changedFieldCount, diffCommits, previousCommit } from "../gearDiff";
import { commitImpact } from "../gearPerformance";

interface BowHistoryProps {
  bow: BowProfile;
  commits: SetupCommit[]; // déjà filtrés pour cet arc, triés du plus récent au plus ancien
  sessions: Session[];
  onBack: () => void;
  onNewCommit: () => void;
  onRevert: (commit: SetupCommit) => void;
  onCompare: (aId: string, bId: string) => void;
}

export function BowHistory({
  bow,
  commits,
  sessions,
  onBack,
  onNewCommit,
  onRevert,
  onCompare,
}: BowHistoryProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleSelect(id: string) {
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
        <h1>{bow.name}</h1>
        <button className="btn btn-primary" onClick={onNewCommit}>
          + Commit
        </button>
      </header>

      {selected.length === 2 && (
        <button
          className="btn btn-secondary btn-block"
          onClick={() => onCompare(selected[0], selected[1])}
        >
          ⇄ Comparer les 2 commits sélectionnés
        </button>
      )}

      {commits.length === 0 ? (
        <p className="empty-state">
          Aucun commit pour l'instant. Enregistre le réglage actuel pour commencer
          l'historique.
        </p>
      ) : (
        <ul className="commit-list">
          {commits.map((commit, i) => {
            const isLatest = i === 0;
            const prev = previousCommit(commits, commit);
            const nChanged = changedFieldCount(prev, commit);
            const isExpanded = expanded === commit.id;
            const isSelected = selected.includes(commit.id);
            const diff = isExpanded ? diffCommits(prev, commit) : [];
            const impact = commitImpact(commits, commit, sessions);
            const groupingDelta =
              impact?.before?.avgGroupingCm != null && impact.after.avgGroupingCm != null
                ? impact.after.avgGroupingCm - impact.before.avgGroupingCm
                : null;
            const scoreDelta =
              impact?.before?.avgScore != null && impact.after.avgScore != null
                ? impact.after.avgScore - impact.before.avgScore
                : null;

            return (
              <li key={commit.id} className={`commit-item ${isLatest ? "commit-item--latest" : ""}`}>
                <div className="commit-item__row">
                  <label className="commit-item__checkbox" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(commit.id)}
                    />
                  </label>
                  <div
                    className="commit-item__main"
                    onClick={() => setExpanded(isExpanded ? null : commit.id)}
                  >
                    <div className="commit-item__message">
                      {isLatest && <span className="badge badge-warn">actuel</span>} {commit.message}
                    </div>
                    <div className="commit-item__meta text-muted">
                      {formatDateTime(commit.timestamp)}
                      {prev && nChanged > 0 && ` · ${nChanged} changement${nChanged > 1 ? "s" : ""}`}
                      {!prev && " · premier commit"}
                      {groupingDelta !== null && (
                        <span className={groupingDelta <= 0 ? "grouping-better" : "grouping-worse"}>
                          {" · 🎯 "}
                          {groupingDelta <= 0 ? "↓" : "↑"} {Math.abs(groupingDelta).toFixed(1)} cm
                        </span>
                      )}
                    </div>
                  </div>
                  {!isLatest && (
                    <button
                      className="btn btn-icon"
                      aria-label="Revenir à cette version"
                      title="Revenir à cette version"
                      onClick={() => {
                        if (confirm(`Créer un nouveau commit qui restaure "${commit.message}" ?`)) {
                          onRevert(commit);
                        }
                      }}
                    >
                      ↩
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="commit-diff">
                    {diff.map((f) => (
                      <div key={f.key} className={`commit-diff__row ${f.changed ? "commit-diff__row--changed" : ""}`}>
                        <span className="commit-diff__label">{f.label}</span>
                        <span className="commit-diff__value">
                          {f.changed && f.before !== null && (
                            <span className="commit-diff__before">
                              {f.before}
                              {f.unit ? ` ${f.unit}` : ""}
                            </span>
                          )}
                          <span className={f.changed ? "commit-diff__after" : ""}>
                            {f.after !== null ? `${f.after}${f.unit ? ` ${f.unit}` : ""}` : "—"}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && impact && (
                  <div className="commit-impact">
                    <div className="commit-impact__title">📊 Impact mesuré</div>
                    {impact.before === null ? (
                      <p className="text-muted">
                        Réglage initial — {impact.after.count} séance{impact.after.count > 1 ? "s" : ""}{" "}
                        tirée{impact.after.count > 1 ? "s" : ""} avec, rien à comparer avant.
                      </p>
                    ) : impact.after.count === 0 ? (
                      <p className="text-muted">
                        Aucune séance tirée avec ce réglage pour l'instant — l'impact s'affichera ici
                        automatiquement dès la prochaine séance liée à "{bow.name}".
                      </p>
                    ) : (
                      <>
                        {groupingDelta !== null && impact.before.avgGroupingCm !== null && (
                          <div className="commit-impact__row">
                            <span className="text-muted">Groupement</span>
                            <span>
                              {impact.before.avgGroupingCm.toFixed(1)} → {impact.after.avgGroupingCm!.toFixed(1)} cm{" "}
                              <span className={groupingDelta <= 0 ? "grouping-better" : "grouping-worse"}>
                                ({groupingDelta <= 0 ? "↓" : "↑"} {Math.abs(groupingDelta).toFixed(1)} cm)
                              </span>
                            </span>
                          </div>
                        )}
                        {scoreDelta !== null && impact.before.avgScore !== null && (
                          <div className="commit-impact__row">
                            <span className="text-muted">Score moyen</span>
                            <span>
                              {impact.before.avgScore.toFixed(2)} → {impact.after.avgScore!.toFixed(2)}{" "}
                              <span className={scoreDelta >= 0 ? "grouping-better" : "grouping-worse"}>
                                ({scoreDelta >= 0 ? "+" : ""}
                                {scoreDelta.toFixed(2)})
                              </span>
                            </span>
                          </div>
                        )}
                        {groupingDelta === null && scoreDelta === null && (
                          <p className="text-muted">
                            Pas encore assez de séances complètes (ou en mode Cible) avant/après ce
                            changement pour mesurer un effet.
                          </p>
                        )}
                        <p className="text-muted commit-impact__count">
                          {impact.before.count} séance{impact.before.count > 1 ? "s" : ""} avant ·{" "}
                          {impact.after.count} après
                        </p>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
