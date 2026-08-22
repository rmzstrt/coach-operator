import type { BowProfile, SetupCommit } from "../gearTypes";
import { diffCommits } from "../gearDiff";

interface SetupDiffViewProps {
  bow: BowProfile;
  a: SetupCommit; // le plus ancien des deux
  b: SetupCommit; // le plus récent des deux
  onBack: () => void;
  onRevertToA: () => void;
}

export function SetupDiffView({ bow, a, b, onBack, onRevertToA }: SetupDiffViewProps) {
  const diff = diffCommits(a, b);
  const changedCount = diff.filter((f) => f.changed).length;

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>Comparer — {bow.name}</h1>
      </header>

      <div className="diff-heads">
        <div className="card diff-head">
          <div className="text-muted">Avant</div>
          <div className="diff-head__message">{a.message}</div>
          <div className="text-muted">{formatDateTime(a.timestamp)}</div>
        </div>
        <div className="diff-arrow">→</div>
        <div className="card diff-head">
          <div className="text-muted">Après</div>
          <div className="diff-head__message">{b.message}</div>
          <div className="text-muted">{formatDateTime(b.timestamp)}</div>
        </div>
      </div>

      <p className="text-muted" style={{ textAlign: "center" }}>
        {changedCount === 0 ? "Aucun changement" : `${changedCount} changement${changedCount > 1 ? "s" : ""}`}
      </p>

      <div className="commit-diff commit-diff--full">
        {diff.map((f) => (
          <div key={f.key} className={`commit-diff__row ${f.changed ? "commit-diff__row--changed" : ""}`}>
            <span className="commit-diff__label">{f.label}</span>
            <span className="commit-diff__value">
              {f.changed && (
                <span className="commit-diff__before">
                  {f.before !== null ? `${f.before}${f.unit ? ` ${f.unit}` : ""}` : "—"}
                </span>
              )}
              <span className={f.changed ? "commit-diff__after" : ""}>
                {f.after !== null ? `${f.after}${f.unit ? ` ${f.unit}` : ""}` : "—"}
              </span>
            </span>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary btn-block" onClick={onRevertToA}>
        ↩ Revenir au setup "{a.message}"
      </button>
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
