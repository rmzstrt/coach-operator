import { useState } from "react";
import type { BowType, Discipline, Session, TargetType } from "../types";
import { DISCIPLINE_DEFAULTS } from "../types";
import type { BowProfile } from "../gearTypes";

interface NewSessionFormProps {
  bows: BowProfile[];
  onCreate: (session: Session) => void;
  onCancel: () => void;
}

const DISCIPLINES: Discipline[] = ["Indoor 18m", "Indoor 25m", "Outdoor", "3D", "Campagne"];
const VEGAS_DISCIPLINES: Discipline[] = ["Indoor 18m", "Indoor 25m"];

export function NewSessionForm({ bows, onCreate, onCancel }: NewSessionFormProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [discipline, setDiscipline] = useState<Discipline>("Indoor 18m");
  const defaults = DISCIPLINE_DEFAULTS[discipline];
  const [distance, setDistance] = useState(defaults.distance);
  const [targetFace, setTargetFace] = useState(defaults.targetFace);
  const [targetType, setTargetType] = useState<TargetType>("vegas");
  const [bowType, setBowType] = useState<BowType>("compound");
  // Un seul arc enregistré : on le lie automatiquement, sans rien demander à l'utilisateur.
  const [bowId, setBowId] = useState<string>(() => (bows.length === 1 ? bows[0].id : ""));
  const [arrowsPerEnd, setArrowsPerEnd] = useState(defaults.arrowsPerEnd);
  const [numberOfEnds, setNumberOfEnds] = useState(10);

  function handleDisciplineChange(d: Discipline) {
    setDiscipline(d);
    const dd = DISCIPLINE_DEFAULTS[d];
    setDistance(dd.distance);
    setTargetFace(dd.targetFace);
    setArrowsPerEnd(dd.arrowsPerEnd);
    setTargetType(VEGAS_DISCIPLINES.includes(d) ? "vegas" : "full");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const session: Session = {
      id: crypto.randomUUID(),
      date,
      discipline,
      distance,
      targetFace,
      targetType,
      bowType,
      bowId: bowId || undefined,
      arrowsPerEnd,
      numberOfEnds,
      ends: [],
    };
    onCreate(session);
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onCancel} aria-label="Retour">
          ←
        </button>
        <h1>Nouvelle séance</h1>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label className="field">
          <span>Discipline</span>
          <select
            value={discipline}
            onChange={(e) => handleDisciplineChange(e.target.value as Discipline)}
          >
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Type d'arc</span>
          <select value={bowType} onChange={(e) => setBowType(e.target.value as BowType)}>
            <option value="compound">Poulie (compound)</option>
            <option value="recurve">Classique (recurve)</option>
          </select>
        </label>

        {VEGAS_DISCIPLINES.includes(discipline) && (
          <label className="field">
            <span>Type de blason</span>
            <select value={targetType} onChange={(e) => setTargetType(e.target.value as TargetType)}>
              <option value="vegas">Spot Vegas (6 à 10)</option>
              <option value="full">Blason complet (1 à 10)</option>
            </select>
          </label>
        )}

        {bows.length > 0 && (
          <label className="field">
            <span>Arc utilisé (module Matériel)</span>
            <select value={bowId} onChange={(e) => setBowId(e.target.value)}>
              <option value="">— non précisé —</option>
              {bows.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {bowType === "compound" && VEGAS_DISCIPLINES.includes(discipline) && (
          <p className="text-muted form-hint">
            Règle salle poulie : seul le X (centre) compte 10, le reste du jaune vaut 9.
          </p>
        )}

        <div className="field-row">
          <label className="field">
            <span>Distance (m)</span>
            <input
              type="number"
              min={0}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Blason (cm)</span>
            <input
              type="number"
              min={0}
              value={targetFace}
              onChange={(e) => setTargetFace(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Flèches / volée</span>
            <input
              type="number"
              min={1}
              max={12}
              value={arrowsPerEnd}
              onChange={(e) => setArrowsPerEnd(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Nombre de volées</span>
            <input
              type="number"
              min={1}
              max={60}
              value={numberOfEnds}
              onChange={(e) => setNumberOfEnds(Number(e.target.value))}
            />
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Commencer la saisie
        </button>
      </form>
    </div>
  );
}
