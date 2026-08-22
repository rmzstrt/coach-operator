import { useState } from "react";
import type { BowProfile } from "../gearTypes";
import type { Amplitude, Handedness, HorizontalTear, VerticalTear } from "../tuning";
import { diagnoseBareshaft } from "../tuning";
import { TuningOptionGroup } from "./TuningOptionGroup";
import { TuningResultCard } from "./TuningResultCard";

interface BareshaftTuningWizardProps {
  bows: BowProfile[];
  onBack: () => void;
  onCreateCommit: (bowId: string, draft: { message: string; highlightKeys: string[] }) => void;
}

export function BareshaftTuningWizard({ bows, onBack, onCreateCommit }: BareshaftTuningWizardProps) {
  const [handedness, setHandedness] = useState<Handedness>("droitier");
  const [vertical, setVertical] = useState<VerticalTear>("aucun");
  const [horizontal, setHorizontal] = useState<HorizontalTear>("aucun");
  const [amplitude, setAmplitude] = useState<Amplitude>("léger");

  const diagnosis = diagnoseBareshaft({ vertical, horizontal, handedness, amplitude });

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>🎯 Bareshaft tuning</h1>
      </header>

      <p className="text-muted gear-intro">
        Tire un groupe de flèches empennées puis une flèche sans empennage (bare shaft) sur
        la même cible, à 10-20 m. Compare où le bare shaft touche par rapport au groupe.
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
        label="Écart vertical du bare shaft"
        value={vertical}
        onChange={setVertical}
        options={[
          { value: "aucun", label: "Aucun" },
          { value: "haut", label: "Au-dessus" },
          { value: "bas", label: "En dessous" },
        ]}
      />

      <TuningOptionGroup
        label="Écart horizontal du bare shaft"
        value={horizontal}
        onChange={setHorizontal}
        options={[
          { value: "aucun", label: "Aucun" },
          { value: "gauche", label: "À gauche" },
          { value: "droite", label: "À droite" },
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
