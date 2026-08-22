import type { Session } from "./types";
import { positionedArrows, sessionAverage } from "./scoring";

export interface DriftAnalysis {
  totalArrows: number;
  centerX: number; // moyenne position X (normalized)
  centerY: number; // moyenne position Y (normalized)
  driftDirection: "none" | "left" | "right" | "up" | "down" | "up-left" | "up-right" | "down-left" | "down-right";
  driftMagnitude: number; // distance from center (0-1)
  corrections: string[]; // suggestions de correction
  confidence: number; // 0-1 based on number of arrows
}

export function analyzeDrift(sessions: Session[]): DriftAnalysis {
  // Filter sessions with positioned arrows and decent performance
  const qualitySessions = sessions.filter(s => sessionAverage(s) > 6);

  if (qualitySessions.length === 0) {
    return {
      totalArrows: 0,
      centerX: 0,
      centerY: 0,
      driftDirection: "none",
      driftMagnitude: 0,
      corrections: [],
      confidence: 0,
    };
  }

  // Get all positioned arrows from recent quality sessions
  const allArrows = qualitySessions.flatMap(s => positionedArrows(s));

  if (allArrows.length < 10) {
    return {
      totalArrows: allArrows.length,
      centerX: 0,
      centerY: 0,
      driftDirection: "none",
      driftMagnitude: 0,
      corrections: ["Besoin de plus de flèches positionnées pour une analyse fiable"],
      confidence: allArrows.length / 30, // 30 = min pour confiance
    };
  }

  // Calculate center of mass
  const centerX = allArrows.reduce((sum, a) => sum + (a.x ?? 0), 0) / allArrows.length;
  const centerY = allArrows.reduce((sum, a) => sum + (a.y ?? 0), 0) / allArrows.length;

  // Calculate drift magnitude (distance from center)
  const driftMagnitude = Math.sqrt(centerX * centerX + centerY * centerY);

  // Detect drift direction (threshold: 0.05 normalized)
  const threshold = 0.05;
  let driftDirection: DriftAnalysis["driftDirection"] = "none";
  const corrections: string[] = [];

  if (driftMagnitude < threshold) {
    driftDirection = "none";
    corrections.push("✅ Groupement centré — pas de dérive détectée");
  } else {
    // Horizontal drift
    const horizontalDrift = Math.abs(centerX);
    const verticalDrift = Math.abs(centerY);

    if (horizontalDrift > threshold && verticalDrift > threshold) {
      // Diagonal
      if (centerX > 0 && centerY > 0) {
        driftDirection = "up-right";
      } else if (centerX > 0 && centerY < 0) {
        driftDirection = "down-right";
      } else if (centerX < 0 && centerY > 0) {
        driftDirection = "up-left";
      } else {
        driftDirection = "down-left";
      }
    } else if (horizontalDrift > threshold) {
      driftDirection = centerX > 0 ? "right" : "left";
    } else if (verticalDrift > threshold) {
      driftDirection = centerY > 0 ? "up" : "down";
    }

    // Generate corrections based on drift
    if (centerX > threshold) {
      corrections.push(`🔴 Dérive droite (${(centerX * 100).toFixed(1)}%)`);
      corrections.push("→ Ajuste le centershot vers la GAUCHE (3-5mm)");
      corrections.push("→ Ou tenue: main trop avancée");
    } else if (centerX < -threshold) {
      corrections.push(`🔴 Dérive gauche (${(Math.abs(centerX) * 100).toFixed(1)}%)`);
      corrections.push("→ Ajuste le centershot vers la DROITE (3-5mm)");
    }

    if (centerY > threshold) {
      corrections.push(`🔴 Dérive vers le haut (${(centerY * 100).toFixed(1)}%)`);
      corrections.push("→ Point d'encochage: vérifier l'angle de nocking");
      corrections.push("→ Ou posture: épaule/menton trop haut");
    } else if (centerY < -threshold) {
      corrections.push(`🔴 Dérive vers le bas (${(Math.abs(centerY) * 100).toFixed(1)}%)`);
      corrections.push("→ Point d'encochage: trop bas ?");
      corrections.push("→ Ou technique: relâchement prématuré");
    }
  }

  return {
    totalArrows: allArrows.length,
    centerX,
    centerY,
    driftDirection,
    driftMagnitude,
    corrections,
    confidence: Math.min(1, allArrows.length / 100), // Confiance: 100 arrows = 100%
  };
}

/**
 * Format drift magnitude as percentage for display
 */
export function formatDriftPercent(magnitude: number): string {
  return `${(magnitude * 100).toFixed(1)}%`;
}
