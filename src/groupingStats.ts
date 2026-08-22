import type { Arrow, Session } from "./types";

export interface Point {
  x: number;
  y: number;
}

/** Toutes les flèches de la séance qui ont une position tapée (mode "Cible"). */
export function positionedArrows(session: Session): Array<Arrow & { x: number; y: number }> {
  return session.ends
    .flatMap((e) => e.arrows)
    .filter((a): a is Arrow & { x: number; y: number } => a.x !== undefined && a.y !== undefined);
}

/** Il faut au moins 2 flèches positionnées pour qu'un "groupement" ait un sens. */
export function hasGroupingData(session: Session): boolean {
  return positionedArrows(session).length >= 2;
}

export function centroid(points: Point[]): Point {
  const n = points.length;
  return {
    x: points.reduce((s, p) => s + p.x, 0) / n,
    y: points.reduce((s, p) => s + p.y, 0) / n,
  };
}

/** Distance maximale entre deux flèches quelconques du groupe — la mesure classique de "taille de groupement". */
export function extremeSpread(points: Point[]): number {
  let max = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      if (d > max) max = d;
    }
  }
  return max;
}

/** Convertit une distance normalisée (0 = centre, 1 = bord) en centimètres réels sur le blason. */
export function normalizedToCm(normalized: number, targetFaceCm: number): number {
  return normalized * (targetFaceCm / 2);
}
