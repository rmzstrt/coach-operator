import { useChrono } from "../useChrono";
import { ChronoPanel } from "./ChronoPanel";

interface ChronoProps {
  onBack: () => void;
}

export function Chrono({ onBack }: ChronoProps) {
  const chrono = useChrono();

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>⏱️ Chrono</h1>
      </header>

      <ChronoPanel {...chrono} />
    </div>
  );
}
