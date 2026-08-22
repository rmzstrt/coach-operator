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
        <button className="btn btn-primary" onClick={onNew}>
          + Nouvelle séance
        </button>
      </header>

      <nav className="nav-bar-list">
        <button
          className={`nav-bar ${showDashboard ? "nav-bar--active" : ""}`}
          onClick={() => setShowDashboard(!showDashboard)}
        >
          <span className="nav-bar__icon">📊</span>
          <span className="nav-bar__label">Dashboard</span>
          <span className="nav-bar__chevron">›</span>
        </button>
        <button className="nav-bar" onClick={onOpenPalmares}>
          <span className="nav-bar__icon">🏆</span>
          <span className="nav-bar__label">Palmarès</span>
          {badgeCount > 0 && <span className="nav-bar__count">{badgeCount}</span>}
          <span className="nav-bar__chevron">›</span>
        </button>
        <button className="nav-bar" onClick={onOpenGear}>
          <span className="nav-bar__icon">🔧</span>
          <span className="nav-bar__label">Matériel</span>
          <span className="nav-bar__chevron">›</span>
        </button>
        <button className="nav-bar" onClick={onOpenGrouping}>
          <span className="nav-bar__icon">🎯</span>
          <span className="nav-bar__label">Groupement</span>
          <span className="nav-bar__chevron">›</span>
        </button>
        <button className="nav-bar" onClick={onOpenGroupingAnalysis}>
          <span className="nav-bar__icon">📈</span>
          <span className="nav-bar__label">Analyse dérive</span>
          <span className="nav-bar__chevron">›</span>
        </button>
        <button className="nav-bar" onClick={onOpenTuning}>
          <span className="nav-bar__icon">🩺</span>
          <span className="nav-bar__label">Tuning</span>
          <span className="nav-bar__chevron">›</span>
        </button>
        <button className="nav-bar" onClick={onOpenChrono}>
          <span className="nav-bar__icon">⏱️</span>
          <span className="nav-bar__label">Chrono</span>
          <span className="nav-bar__chevron">›</span>
        </button>
      </nav>

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
