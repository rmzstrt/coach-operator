import type { Session } from "../types";
import { allBadges } from "../badges";
import { isSessionComplete, sessionArrowCount } from "../scoring";

interface PalmaresProps {
  sessions: Session[];
  onBack: () => void;
}

export function Palmares({ sessions, onBack }: PalmaresProps) {
  const badges = allBadges(sessions);
  const completedCount = sessions.filter(isSessionComplete).length;
  const totalArrows = sessions.reduce((sum, s) => sum + sessionArrowCount(s), 0);

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>🏆 Palmarès</h1>
      </header>

      <div className="score-summary">
        <div className="score-summary__item">
          <span className="score-summary__value">{completedCount}</span>
          <span className="score-summary__label">Séances</span>
        </div>
        <div className="score-summary__item">
          <span className="score-summary__value">{totalArrows}</span>
          <span className="score-summary__label">Flèches tirées</span>
        </div>
        <div className="score-summary__item">
          <span className="score-summary__value">{badges.length}</span>
          <span className="score-summary__label">Badges</span>
        </div>
      </div>

      {badges.length === 0 ? (
        <p className="empty-state">
          Aucun badge pour l'instant. Termine une séance pour commencer à débloquer des
          records !
        </p>
      ) : (
        <ul className="badge-list badge-list--page">
          {badges.map((b, i) => (
            <li key={`${b.id}-${b.date}-${i}`} className="badge-list__item">
              <span className="badge-list__emoji">{b.emoji}</span>
              <span>
                <strong>{b.label}</strong>
                <br />
                <span className="text-muted">{b.detail}</span>
                <br />
                <span className="text-muted">
                  {formatDate(b.date)} · {b.discipline}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
