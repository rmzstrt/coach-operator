import type { Arrow, ArrowValue, BowType, Discipline, End, Session, TargetType } from "./types";

export function arrowNumericValue(v: ArrowValue): number {
  if (v === "X") return 10;
  if (v === "M") return 0;
  return v;
}

export function endTotal(end: End): number {
  return end.arrows.reduce<number>((sum, a) => sum + arrowNumericValue(a.value), 0);
}

/**
 * Filter out free-shooting ends (ends with isFree = true).
 * These don't count toward stats (badges, averages, objectives, etc.).
 * This allows mixing warm-up/free-shooting with scored rounds in the same session.
 */
export function scoredEnds(session: Session): End[] {
  return session.ends.filter((e) => !e.isFree);
}

export function sessionTotal(session: Session): number {
  return scoredEnds(session).reduce<number>((sum, e) => sum + endTotal(e), 0);
}

export function bestEndTotal(session: Session): number {
  const ends = scoredEnds(session);
  if (ends.length === 0) return 0;
  return ends.reduce((max, e) => Math.max(max, endTotal(e)), 0);
}

export function sessionArrowCount(session: Session): number {
  return scoredEnds(session).reduce((sum, e) => sum + e.arrows.length, 0);
}

export function sessionAverage(session: Session): number {
  const count = sessionArrowCount(session);
  if (count === 0) return 0;
  return sessionTotal(session) / count;
}

export function sessionXCount(session: Session): number {
  return scoredEnds(session).reduce(
    (sum, e) => sum + e.arrows.filter((a) => a.value === "X").length,
    0,
  );
}

export function sessionHasNoMiss(session: Session): boolean {
  const arrows = scoredEnds(session).flatMap((e) => e.arrows);
  return arrows.length > 0 && arrows.every((a) => a.value !== "M");
}

export function isSessionComplete(session: Session): boolean {
  // Only scored ends (not free-shooting) count toward session completion.
  // A session is complete when all required scored ends are filled.
  // Free-shooting ends (isFree=true) are optional and don't affect completion.
  const scored = scoredEnds(session);
  return (
    scored.length === session.numberOfEnds &&
    scored.every((e) => e.arrows.length === session.arrowsPerEnd)
  );
}

/** Meilleure moyenne parmi les séances complètes de la même discipline, hors la séance passée en argument. */
export function personalBestAverage(
  sessions: Session[],
  discipline: Session["discipline"],
  excludeId?: string,
): number | null {
  const candidates = sessions.filter(
    (s) =>
      s.discipline === discipline &&
      s.id !== excludeId &&
      isSessionComplete(s) &&
      sessionArrowCount(s) > 0,
  );
  if (candidates.length === 0) return null;
  return Math.max(...candidates.map(sessionAverage));
}

/** Zone la plus basse représentée sur le blason : 1 pour un blason complet, 6 pour un spot Vegas. */
export function minScoreFor(targetType: TargetType): number {
  return targetType === "vegas" ? 6 : 1;
}

/**
 * Un arc à poulie en salle (indoor 18m/25m) suit une règle de score différente du classique :
 * seul l'anneau X (centre) vaut 10, le reste du jaune (l'ancien anneau "10") ne vaut que 9.
 * En extérieur, ou pour un classique, tout le jaune vaut 10 (le X ne sert qu'au départage).
 */
export function usesCompoundIndoorRule(bowType: BowType | undefined, discipline: Discipline): boolean {
  return bowType === "compound" && (discipline === "Indoor 18m" || discipline === "Indoor 25m");
}

/**
 * Calcule le score d'une flèche à partir d'une position tapée sur le blason, normalisée
 * par rapport au centre (0 = centre, 1 = bord du blason, distance euclidienne).
 * - "full" : blason World Archery à 10 zones (1 à 10) + anneau X (demi-largeur de la zone 10)
 * - "vegas" : spot Vegas indoor 18m/25m, seulement 5 zones (6 à 10)
 * `compoundIndoorRule` applique la règle poulie en salle (voir `usesCompoundIndoorRule`).
 */
export function scoreFromNormalizedPosition(
  nx: number,
  ny: number,
  targetType: TargetType = "full",
  compoundIndoorRule = false,
): ArrowValue {
  const d = Math.sqrt(nx * nx + ny * ny);
  if (d > 1) return "M";
  const minScore = minScoreFor(targetType);
  const ringCount = 10 - minScore + 1;
  const ringWidth = 1 / ringCount;
  const xBoundary = ringWidth / 2;

  if (d < xBoundary) return "X"; // centre parfait : vaut toujours 10, quel que soit le type d'arc

  if (compoundIndoorRule && d < ringWidth) {
    // Reste du jaune (ancien anneau "10") : ne compte que 9 pour un arc à poulie en salle.
    return 9;
  }

  const score = 10 - Math.floor(d / ringWidth);
  return Math.max(minScore, Math.min(10, score));
}

/** Toutes les flèches positionnées (mode Cible) d'une séance, pour l'affichage du groupement. */
export function positionedArrows(session: Session): Arrow[] {
  return scoredEnds(session)
    .flatMap((e) => e.arrows)
    .filter((a) => a.x !== undefined && a.y !== undefined);
}
