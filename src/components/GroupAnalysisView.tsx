import type { Session } from "../types";
import { analyzeDrift, formatDriftPercent } from "../groupAnalysis";
import { TargetFace } from "./TargetFace";
import { positionedArrows } from "../scoring";

interface GroupAnalysisViewProps {
  sessions: Session[];
  onBack: () => void;
}

export function GroupAnalysisView({ sessions, onBack }: GroupAnalysisViewProps) {
  const analysis = analyzeDrift(sessions);

  // Collect arrows for visualization
  const recentQualitySessions = sessions
    .filter(s => s.ends.length === s.numberOfEnds)
    .slice(-20);
  const visualArrows = recentQualitySessions.flatMap(s => positionedArrows(s));

  const confidencePercent = Math.round(analysis.confidence * 100);

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <div>
          <h1>🎯 Analyse groupement</h1>
          <div className="subtitle">Dérive de tir détectée</div>
        </div>
      </header>

      {analysis.totalArrows === 0 ? (
        <div className="card">
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Aucune donnée pour l'analyse.<br />
            Tire en mode Cible pour enregistrer les positions.
          </p>
        </div>
      ) : (
        <>
          {/* Confidence indicator */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Confiance de l'analyse</strong>
                <div className="subtitle">{analysis.totalArrows} flèches positionnées</div>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: "700" }}>
                {confidencePercent}%
              </div>
            </div>
            {confidencePercent < 50 && (
              <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--accent)" }}>
                ⚠️ Peu de données — continue à tirer en mode Cible pour plus de précision
              </div>
            )}
          </div>

          {/* Drift visualization */}
          <div className="card">
            <h2 style={{ marginBottom: "12px", textAlign: "center" }}>Groupement</h2>
            <div className="target-wrap">
              <TargetFace
                marks={visualArrows}
                size={260}
                targetType="full"
              />
              <div style={{ marginTop: "12px", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                {analysis.driftDirection === "none" ? (
                  <strong style={{ color: "var(--success)" }}>✅ Centré</strong>
                ) : (
                  <>
                    <strong>Dérive: {analysis.driftDirection}</strong>
                    <br />
                    Magnitude: {formatDriftPercent(analysis.driftMagnitude)}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Corrections */}
          {analysis.corrections.length > 0 && (
            <div className="card">
              <h2>💡 Corrections suggérées</h2>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {analysis.corrections.map((correction, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "10px 12px",
                      background: correction.startsWith("✅") ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 197, 66, 0.1)",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      lineHeight: "1.4",
                      borderLeft: `3px solid ${correction.startsWith("✅") ? "var(--success)" : "var(--accent)"}`,
                    }}
                  >
                    {correction}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats */}
          <div className="card">
            <h2>📊 Statistiques</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Position X</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                  {analysis.centerX > 0 ? "+" : ""}{(analysis.centerX * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {analysis.centerX > 0 ? "→ droite" : analysis.centerX < 0 ? "← gauche" : "centré"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Position Y</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                  {analysis.centerY > 0 ? "+" : ""}{(analysis.centerY * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {analysis.centerY > 0 ? "↑ haut" : analysis.centerY < 0 ? "↓ bas" : "centré"}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
