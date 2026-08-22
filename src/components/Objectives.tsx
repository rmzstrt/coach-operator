import { useState } from "react";
import type { Session } from "../types";
import { getObjectiveProgress, addObjective, deleteObjective, type Objective, type ObjectiveType } from "../objectives";
import "./Objectives.css";

interface ObjectivesProps {
  sessions: Session[];
}

export function Objectives({ sessions }: ObjectivesProps) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ObjectiveType>("arrows_per_week");
  const [target, setTarget] = useState("");

  const progress = getObjectiveProgress(sessions);

  const handleAddObjective = () => {
    if (!label || !target) return;
    const objective: Objective = {
      id: "obj-" + Date.now(),
      type,
      label,
      targetValue: parseFloat(target),
      unit: type === "arrows_per_week" || type === "total_arrows" ? "flèches" : "pts/flèche",
      createdAt: new Date().toISOString(),
      enabled: true,
    };
    addObjective(objective);
    setLabel("");
    setTarget("");
    setType("arrows_per_week");
    setShowForm(false);
  };

  return (
    <div className="objectives">
      <div className="objectives__header">
        <h3>🎯 Mes défis</h3>
        <button
          className={`btn btn-sm ${showForm ? "btn--active" : ""}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕" : "+ Nouveau"}
        </button>
      </div>

      {showForm && (
        <div className="objectives__form">
          <div className="form-field">
            <label>Objectif</label>
            <select value={type} onChange={(e) => setType(e.target.value as ObjectiveType)}>
              <option value="arrows_per_week">Flèches par semaine</option>
              <option value="avg_score_per_session">Moyenne score par séance</option>
              <option value="avg_score_per_volley">Moyenne score par volée</option>
              <option value="total_arrows">Total flèches</option>
            </select>
          </div>
          <div className="form-field">
            <label>Description</label>
            <input
              type="text"
              placeholder="Ex: Atteindre 200 flèches"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Valeur cible</label>
            <input
              type="number"
              step="0.1"
              placeholder="200"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" onClick={handleAddObjective}>
            Créer le défi
          </button>
        </div>
      )}

      {progress.length === 0 ? (
        <p className="empty-state">Aucun défi pour l'instant. Crée-en un pour commencer ! 🚀</p>
      ) : (
        <div className="objectives__list">
          {progress.map((p) => (
            <div key={p.objective.id} className={`objective-item ${p.achieved ? "objective-item--achieved" : ""}`}>
              <div className="objective-item__content">
                <div className="objective-item__header">
                  <span className="objective-item__label">{p.objective.label}</span>
                  {p.achieved && <span className="objective-item__badge">✓ Atteint !</span>}
                </div>
                <div className="objective-item__progress">
                  <div className="progress-bar">
                    <div className="progress-bar__fill" style={{ width: `${p.progress}%` }}></div>
                  </div>
                  <div className="progress-bar__text">
                    {p.currentValue.toFixed(p.objective.type === "arrows_per_week" || p.objective.type === "total_arrows" ? 0 : 2)} / {p.objective.targetValue.toFixed(p.objective.type === "arrows_per_week" || p.objective.type === "total_arrows" ? 0 : 2)} {p.objective.unit}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => deleteObjective(p.objective.id)}
                title="Supprimer ce défi"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
