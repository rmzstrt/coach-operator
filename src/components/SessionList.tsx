import type { Session } from "../types";
import { isSessionComplete, sessionAverage, sessionTotal } from "../scoring";
import { Sparkline } from "./Sparkline";
import { Dashboard } from "./Dashboard";
import { useState } from "react";

interface SessionListProps {
  sessions: Session[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenPalmares: () => void;
  onOpenGear: () => void;
  onOpenGrouping: () => void;
  onOpenGroupingAnalysis: () => void;
  onOpenTuning: () => void;
  onOpenChrono: () => void;
}

export function SessionList({
  sessions,
  onOpen,
  onNew,
  onDelete,
  onOpenPalmares,
  onOpenGear,
  onOpenGrouping,
  onOpenGroupingAnalysis,
  onOpenTuning,
  onOpenChrono,
}: SessionListProps) {
  const [showDashboard, setShowDashboard] = useState(false);
  const completed = [...sessions]
    .filter(isSessionComplete)
    .sort((a, b) => a.date.localeCompare(b.date));
  const trend = completed.slice(-10).map(sessionAverage);
  const badgeCount = sessions.reduce((sum, s) => sum + (s.badges?.length ?? 0), 0);

  return (
    <div className="view">
      <header className="view-header">
        <h1>🏹 Mes séances</h1>
        <div className="view-header__actions">
          <button
            className={`btn btn-icon ${showDashboard ? "btn--active" : ""}`}
            onClick={() => setShowDashboard(!showDashboard)}
            aria-label="Dashboard"
          >
            📊
          </button>
          <button className="btn btn-icon" onClick={onOpenPalmares} aria-label="Palmarès">
            🏆
            {badgeCount > 0 && <span className="icon-badge-count">{badgeCount}</span>}
          </button>
          <button className="btn btn-icon" onClick={onOpenGear} aria-label="Matériel">
            🔧
          </button>
          <button className="btn btn-icon" onClick={onOpenGrouping} aria-label="Groupement">
            🎯
          </button>
          <button className="btn btn-icon" onClick={onOpenGroupingAnalysis} aria-label="Analyse dérive">
            📈
          </button>
          <button className="btn btn-icon" onClick={onOpenTuning} aria-label="Tuning">
            🩺
          </button>
          <button className="btn btn-icon" onClick={onOpenChrono} aria-label="Chrono">
            ⏱️
          </button>
          <button className="btn btn-primary" onClick={onNew}>
            + Nouvelle séance
          </button>
        </div>
      </header>

      {trend.length >= 2 && (
        <div className="card trend-card">
          <div className="trend-card__label">Tendance (moyenne / flèche, 10 dernières)</div>
          <Sparkline values={trend} />
        </div>
      )}

      {showDashboard && completed.length > 0 && <Dashboard sessions={completed} />}

      {sessions.length === 0 ? (
        <p className="empty-state">
          Aucune séance pour l'instant. Crée ta première séance pour commencer à
          suivre tes scores.
        </p>
      ) : (
        <ul className="session-list">
          {sessions.map((s) => {
            const complete = isSessionComplete(s);
            return (
              <li key={s.id} className="session-item" onClick={() => onOpen(s.id)}>
                <div className="session-item__main">
                  <span className="session-item__date">{formatDate(s.date)}</span>
                  <span className="session-item__discipline">{s.discipline}</span>
                </div>
                <div className="session-item__stats">
                  {complete ? (
                    <>
                      <span className="badge">{sessionTotal(s)} pts</span>
                      <span className="badge badge-muted">
                        {sessionAverage(s).toFixed(2)} moy.
                      </span>
                    </>
                  ) : (
                    <span className="badge badge-warn">en cours</span>
                  )}
                </div>
                <button
                  className="btn btn-icon"
                  aria-label="Supprimer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Supprimer cette séance ?")) onDelete(s.id);
                  }}
                >
                  ✕
                </button>
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
