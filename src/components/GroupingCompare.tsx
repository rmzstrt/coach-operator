import type { Session } from "../types";
import { extremeSpread, normalizedToCm, positionedArrows } from "../groupingStats";
import { GroupingOverlay } from "./GroupingOverlay";

interface GroupingCompareProps {
  a: Session;
  b: Session;
  onBack: () => void;
}

const COLOR_A = "#4fb3ff";
const COLOR_B = "#ff9d4d";

export function GroupingCompare({ a, b, onBack }: GroupingCompareProps) {
  const arrowsA = positionedArrows(a);
  const arrowsB = positionedArrows(b);
  const spreadA = normalizedToCm(extremeSpread(arrowsA), a.targetFace);
  const spreadB = normalizedToCm(extremeSpread(arrowsB), b.targetFace);
  const delta = spreadB - spreadA;
  const tightened = delta <= 0;

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1>🎯 Groupement</h1>
      </header>

      <div className="diff-heads">
        <div className="card diff-head" style={{ boxShadow: `inset 0 3px 0 ${COLOR_A}` }}>
          <div className="text-muted">Séance A</div>
          <div className="diff-head__message">{formatDate(a.date)}</div>
          <div className="text-muted">
            {a.discipline} · {arrowsA.length} flèches
          </div>
        </div>
        <div className="diff-arrow">vs</div>
        <div className="card diff-head" style={{ boxShadow: `inset 0 3px 0 ${COLOR_B}` }}>
          <div className="text-muted">Séance B</div>
          <div className="diff-head__message">{formatDate(b.date)}</div>
          <div className="text-muted">
            {b.discipline} · {arrowsB.length} flèches
          </div>
        </div>
      </div>

      <div className="target-wrap">
        <GroupingOverlay a={{ arrows: arrowsA, color: COLOR_A }} b={{ arrows: arrowsB, color: COLOR_B }} />
        <div className="grouping-legend">
          <span className="grouping-legend__item">
            <span className="grouping-legend__swatch" style={{ background: COLOR_A }} /> A
          </span>
          <span className="grouping-legend__item">
            <span className="grouping-legend__swatch" style={{ background: COLOR_B }} /> B
          </span>
          <span className="text-muted">le + est aussi le centroïde du groupe</span>
        </div>
      </div>

      <div className="score-summary">
        <div className="score-summary__item">
          <span className="score-summary__value" style={{ color: COLOR_A }}>
            {spreadA.toFixed(1)} cm
          </span>
          <span className="score-summary__label">Groupement A</span>
        </div>
        <div className="score-summary__item">
          <span className="score-summary__value" style={{ color: COLOR_B }}>
            {spreadB.toFixed(1)} cm
          </span>
          <span className="score-summary__label">Groupement B</span>
        </div>
        <div className="score-summary__item">
          <span className={`score-summary__value ${tightened ? "grouping-better" : "grouping-worse"}`}>
            {tightened ? "↓" : "↑"} {Math.abs(delta).toFixed(1)} cm
          </span>
          <span className="score-summary__label">{tightened ? "Resserré" : "Élargi"}</span>
        </div>
      </div>

      <p className="text-muted" style={{ textAlign: "center" }}>
        Groupement = écart maximal entre deux flèches de la séance (converti en cm sur son
        propre blason).
      </p>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
