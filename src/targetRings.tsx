/**
 * Rendu SVG des anneaux d'un blason, partagé entre `TargetFace` (saisie interactive) et
 * `GroupingOverlay` (superposition comparative de groupement).
 */

// Couleurs officielles World Archery par zone de score (1-10).
export const RING_COLORS: Record<number, string> = {
  1: "#f5f5f0",
  2: "#f5f5f0",
  3: "#22252b",
  4: "#22252b",
  5: "#2f7bc4",
  6: "#2f7bc4",
  7: "#d94848",
  8: "#d94848",
  9: "#f4c542",
  10: "#f4c542",
};

export function ringElements(ringCount: number, minScore: number, center: number, radius: number) {
  return Array.from({ length: ringCount }, (_, i) => {
    const score = minScore + i;
    const r = ((11 - score) / ringCount) * radius;
    return (
      <circle
        key={score}
        cx={center}
        cy={center}
        r={r}
        fill={RING_COLORS[score]}
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={0.6}
      />
    );
  });
}

/**
 * Position écran (dans le repère du viewBox) d'une flèche à partir de sa position
 * normalisée (0 = centre, ±1 = bord du blason) — un "manqué" tapé loin de la cible est
 * ramené près du bord pour rester lisible.
 */
export function arrowPosition(x: number, y: number, center: number, radius: number) {
  const d = Math.sqrt(x * x + y * y);
  const clamp = d > 1.15 ? 1.15 / d : 1;
  return { cx: center + x * clamp * radius, cy: center + y * clamp * radius };
}
