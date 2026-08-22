import { useState } from "react";
import type { BowProfile } from "../gearTypes";
import type { Amplitude, Handedness, HorizontalTear, VerticalTear } from "../tuning";
import { diagnosePaperTuning } from "../tuning";
import { TuningOptionGroup } from "./TuningOptionGroup";
import { TuningResultCard } from "./TuningResultCard";

interface PaperTuningWizardProps {
  bows: BowProfile[];
  onBack: () => void;
  onCreateCommit: (bowId: string, draft: { message: string; highlightKeys: string[] }) => void;
}

export function PaperTuningWizard({ bows, onBack, onCreateCommit }: PaperTuningWizardProps) {
  const [handedness, setHandedness] = useState<Handedness>("droitier");
  const [vertical, setVertical] = useState<VerticalTear>("aucun");
  const [horizontal, setHorizontal] = useState<HorizontalTear>("aucun");
  const [amplitude, setAmplitude] = useState<Amplitude>("léger");

  const diagnosis = diagnosePaperTuning({ vertical, horizontal, handedness, amplitude });

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>📄 Paper tuning</h1>
      </header>

      <p className="text-muted gear-intro">
        Tends une feuille de papier dans un cadre à ~2 m devant la cible, tire une flèche au
        travers, et regarde la forme du trou (position du nock par rapport au point).
      </p>

      <TuningOptionGroup
        label="Tu es"
        value={handedness}
        onChange={setHandedness}
        options={[
          { value: "droitier", label: "Droitier" },
          { value: "gaucher", label: "Gaucher" },
        ]}
      />

      <TuningOptionGroup
        label="Déchirure verticale"
        value={vertical}
        onChange={setVertical}
        options={[
          { value: "aucun", label: "Aucune" },
          { value: "haut", label: "Nock haut" },
          { value: "bas", label: "Nock bas" },
        ]}
      />

      <TuningOptionGroup
        label="Déchirure horizontale"
        value={horizontal}
        onChange={setHorizontal}
        options={[
          { value: "aucun", label: "Aucune" },
          { value: "gauche", label: "Nock gauche" },
          { value: "droite", label: "Nock droite" },
        ]}
      />

      {(vertical !== "aucun" || horizontal !== "aucun") && (
        <TuningOptionGroup
          label="Amplitude"
          value={amplitude}
          onChange={setAmplitude}
          options={[
            { value: "léger", label: "Léger" },
            { value: "modéré", label: "Modéré" },
            { value: "important", label: "Important" },
          ]}
        />
      )}

      <TuningResultCard diagnosis={diagnosis} bows={bows} onCreateCommit={onCreateCommit} />
    </div>
  );
}
