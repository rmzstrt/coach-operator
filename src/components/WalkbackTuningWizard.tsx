import { useState } from "react";
import type { BowProfile } from "../gearTypes";
import type { Amplitude, Handedness, HorizontalTear } from "../tuning";
import { diagnoseWalkback } from "../tuning";
import { TuningOptionGroup } from "./TuningOptionGroup";
import { TuningResultCard } from "./TuningResultCard";

interface WalkbackTuningWizardProps {
  bows: BowProfile[];
  onBack: () => void;
  onCreateCommit: (bowId: string, draft: { message: string; highlightKeys: string[] }) => void;
}

export function WalkbackTuningWizard({ bows, onBack, onCreateCommit }: WalkbackTuningWizardProps) {
  const [handedness, setHandedness] = useState<Handedness>("droitier");
  const [drift, setDrift] = useState<HorizontalTear>("aucun");
  const [amplitude, setAmplitude] = useState<Amplitude>("léger");

  const diagnosis = diagnoseWalkback({ drift, handedness, amplitude });

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>📏 Walk-back tuning</h1>
      </header>

      <p className="text-muted gear-intro">
        Accroche un fil à plomb (ou une ligne verticale) sur la cible. Tire à distance
        croissante (ex: 5, 10, 15, 20 m) en visant la ligne à chaque fois, sans bouger le
        point de visée horizontal.
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
        label="En reculant, les impacts dérivent"
        value={drift}
        onChange={setDrift}
        options={[
          { value: "aucun", label: "Ne dérivent pas" },
          { value: "gauche", label: "Vers la gauche" },
          { value: "droite", label: "Vers la droite" },
        ]}
      />

      {drift !== "aucun" && (
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
