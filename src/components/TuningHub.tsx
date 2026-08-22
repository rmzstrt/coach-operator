export type TuningWizard = "paper" | "bareshaft" | "walkback" | "cams";

interface TuningHubProps {
  onSelect: (wizard: TuningWizard) => void;
  onBack: () => void;
}

const WIZARDS: Array<{ id: TuningWizard; emoji: string; title: string; description: string }> = [
  {
    id: "paper",
    emoji: "📄",
    title: "Paper tuning",
    description: "Tir à travers une feuille de papier — diagnostic à partir de la forme du trou.",
  },
  {
    id: "bareshaft",
    emoji: "🎯",
    title: "Bareshaft tuning",
    description: "Compare l'impact d'une flèche sans empennage au groupe empenné.",
  },
  {
    id: "walkback",
    emoji: "📏",
    title: "Walk-back tuning",
    description: "Tir à distances croissantes sur une ligne verticale — vérifie le centershot.",
  },
  {
    id: "cams",
    emoji: "⚙️",
    title: "Synchro cames & cam lean",
    description: "Checklist de vérification et suivi des réglages de cames dans le temps.",
  },
];

export function TuningHub({ onSelect, onBack }: TuningHubProps) {
  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>🩺 Tuning</h1>
      </header>

      <p className="text-muted gear-intro">
        Assistants de tuning guidés — chaque méthode te donne un diagnostic tout de suite.
        Si tu as un arc enregistré dans 🔧 Matériel, tu peux aussi garder le diagnostic
        comme commit, mais ce n'est pas obligatoire.
      </p>

      <ul className="session-list">
        {WIZARDS.map((w) => (
          <li key={w.id} className="session-item" onClick={() => onSelect(w.id)}>
            <div className="session-item__main">
              <span className="session-item__date">
                {w.emoji} {w.title}
              </span>
              <span className="session-item__discipline">{w.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
