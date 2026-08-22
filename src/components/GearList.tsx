import { useState } from "react";
import type { BowProfile, SetupCommit } from "../gearTypes";

interface GearListProps {
  bows: BowProfile[];
  commits: SetupCommit[];
  onOpenBow: (bowId: string) => void;
  onCreateBow: (bow: BowProfile) => void;
  onDeleteBow: (bowId: string) => void;
  onBack: () => void;
}

export function GearList({
  bows,
  commits,
  onOpenBow,
  onCreateBow,
  onDeleteBow,
  onBack,
}: GearListProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreateBow({ id: crypto.randomUUID(), name: trimmed, createdAt: new Date().toISOString() });
    setName("");
    setShowForm(false);
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>🔧 Matériel</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          + Nouvel arc
        </button>
      </header>

      <p className="text-muted gear-intro">
        Suis les réglages de chaque arc comme un historique Git : chaque changement devient un
        commit que tu peux comparer ou restaurer.
      </p>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nom de l'arc</span>
            <input
              type="text"
              placeholder="ex : Reckoning 39"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block">
            Créer
          </button>
        </form>
      )}

      {bows.length === 0 ? (
        <p className="empty-state">
          Aucun arc pour l'instant. Ajoute ton premier arc pour commencer à versionner ses
          réglages.
        </p>
      ) : (
        <ul className="session-list">
          {bows.map((bow) => {
            const bowCommits = commits.filter((c) => c.bowId === bow.id);
            const last = bowCommits[0];
            return (
              <li key={bow.id} className="session-item" onClick={() => onOpenBow(bow.id)}>
                <div className="session-item__main">
                  <span className="session-item__date">{bow.name}</span>
                  <span className="session-item__discipline">
                    {bowCommits.length === 0
                      ? "Aucun commit"
                      : `${bowCommits.length} commit${bowCommits.length > 1 ? "s" : ""} · dernier : ${formatDate(last.timestamp)}`}
                  </span>
                </div>
                <button
                  className="btn btn-icon"
                  aria-label="Supprimer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Supprimer "${bow.name}" et tout son historique ?`)) {
                      onDeleteBow(bow.id);
                    }
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
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
