import type { Session } from "../types";
import {
  aggregateByWeek,
  aggregateByMonth,
  getTrainingQuality,
} from "../dashboard";
import { sessionTotal } from "../scoring";
import { Objectives } from "./Objectives";
import "./Dashboard.css";

interface DashboardProps {
  sessions: Session[];
}

function formatWeekLabel(week: string): string {
  const [year, w] = week.split("-W");
  return `S${w} ${year}`;
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const months = ["", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  return `${months[parseInt(m)]} ${year}`;
}

export function Dashboard({ sessions }: DashboardProps) {
  const weekly = aggregateByWeek(sessions);
  const monthly = aggregateByMonth(sessions);
  const quality = getTrainingQuality(sessions);

  // Last 12 weeks
  const last12weeks = weekly.slice(-12);
  // Last 12 months
  const last12months = monthly.slice(-12);

  return (
    <div className="dashboard">
      <h2>📊 Tableau de bord</h2>

      {/* Quality metrics */}
      <div className="dashboard__metrics">
        <div className="metric-card">
          <div className="metric-label">Moyenne générale</div>
          <div className="metric-value">{quality.avgScoreAllTime.toFixed(2)}</div>
          <div className="metric-unit">points/flèche</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Meilleure semaine</div>
          <div className="metric-value">{quality.bestWeeklyAvg.toFixed(2)}</div>
          <div className="metric-unit">points/flèche</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Semaine actuelle</div>
          <div className="metric-value">{quality.currentWeekAvg.toFixed(2)}</div>
          <div className="metric-unit">points/flèche</div>
        </div>
        <div className={`metric-card metric-card--${quality.trend}`}>
          <div className="metric-label">Tendance</div>
          <div className="metric-value">
            {quality.trend === "improving" && "📈"}
            {quality.trend === "stable" && "→"}
            {quality.trend === "declining" && "📉"}
          </div>
          <div className="metric-unit">
            {quality.trend === "improving" && "En progression"}
            {quality.trend === "stable" && "Stable"}
            {quality.trend === "declining" && "En baisse"}
          </div>
        </div>
      </div>

      {/* Objectives */}
      <Objectives sessions={sessions} />

      {/* Volume by week */}
      <div className="dashboard__section">
        <h3>📅 Volume par semaine (dernières 12 semaines)</h3>
        {last12weeks.length > 0 ? (
          <div className="chart-container">
            <div className="simple-bar-chart">
              {last12weeks.map((w) => (
                <div key={w.week} className="bar-item">
                  <div className="bar-label">{formatWeekLabel(w.week)}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: `${(w.arrowCount / Math.max(...last12weeks.map((x) => x.arrowCount))) * 100}%`,
                      }}
                    >
                      <span className="bar-value">{w.arrowCount}</span>
                    </div>
                  </div>
                  <div className="bar-subtext">{w.sessionsCount} séance{w.sessionsCount > 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state">Aucune donnée pour le moment.</p>
        )}
      </div>

      {/* Average score by week */}
      <div className="dashboard__section">
        <h3>🎯 Qualité par semaine (dernières 12 semaines)</h3>
        {last12weeks.length > 0 ? (
          <div className="chart-container">
            <div className="score-chart">
              {last12weeks.map((w) => (
                <div key={w.week} className="score-point">
                  <div className="score-dot" style={{ opacity: 0.3 + (w.avgScore / 10) * 0.7 }}></div>
                  <div className="score-label">{formatWeekLabel(w.week)}</div>
                  <div className="score-value">{w.avgScore.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state">Aucune donnée pour le moment.</p>
        )}
      </div>

      {/* Volume by month */}
      <div className="dashboard__section">
        <h3>📆 Volume par mois (derniers 12 mois)</h3>
        {last12months.length > 0 ? (
          <div className="chart-container">
            <div className="simple-bar-chart">
              {last12months.map((m) => (
                <div key={m.month} className="bar-item">
                  <div className="bar-label">{formatMonthLabel(m.month)}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar bar--month"
                      style={{
                        width: `${(m.arrowCount / Math.max(...last12months.map((x) => x.arrowCount))) * 100}%`,
                      }}
                    >
                      <span className="bar-value">{m.arrowCount}</span>
                    </div>
                  </div>
                  <div className="bar-subtext">{m.sessionsCount} séance{m.sessionsCount > 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state">Aucune donnée pour le moment.</p>
        )}
      </div>

      {/* Summary stats */}
      <div className="dashboard__summary">
        <h3>📈 Résumé global</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Total flèches</div>
            <div className="summary-value">
              {sessions.reduce((sum, s) => sum + s.ends.length * s.arrowsPerEnd, 0)}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Séances complètes</div>
            <div className="summary-value">{sessions.length}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Score total</div>
            <div className="summary-value">
              {sessions.reduce((sum, s) => sum + sessionTotal(s), 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
