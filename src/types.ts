export type Discipline =
  | "Indoor 18m"
  | "Indoor 25m"
  | "Outdoor"
  | "3D"
  | "Campagne";

export type ArrowValue = number | "X" | "M"; // X = 10 (compte comme un X), M = manqué (0)

/**
 * Type de blason :
 * - "full" : blason complet World Archery, 10 zones (1 à 10) + anneau X
 * - "vegas" : spot Vegas (indoor 18m/25m), seulement 5 zones (6 à 10)
 */
export type TargetType = "full" | "vegas";

/**
 * Type d'arc — affecte la règle de score en salle : pour un arc à poulie en indoor,
 * seul l'anneau X (centre) compte 10 points, le reste du jaune ne vaut que 9
 * (contrairement au classique, où tout le jaune vaut 10 et le X ne sert qu'au départage).
 */
export type BowType = "compound" | "recurve";

export interface Arrow {
  value: ArrowValue;
  /**
   * Position tapée sur le blason en mode "Cible", normalisée par rapport au centre :
   * 0 = centre, ±1 = bord du blason. Absent si la flèche a été saisie au clavier numérique.
   */
  x?: number;
  y?: number;
}

export interface End {
  arrows: Arrow[];
  /**
   * Si true, cette volée est du tir libre (warm-up, volume).
   * Ne compte pas dans les stats globales (badges, moyenne, etc.).
   * Absent = false (rétro-compatibilité).
   */
  isFree?: boolean;
}

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  detail: string;
}

export interface Session {
  id: string;
  date: string; // ISO yyyy-mm-dd
  discipline: Discipline;
  distance: number; // mètres
  targetFace: number; // cm
  /** Absent = "full" (rétro-compatibilité avec les séances créées avant ce champ). */
  targetType?: TargetType;
  /** Absent = "recurve" (rétro-compatibilité avec les séances créées avant ce champ). */
  bowType?: BowType;
  /**
   * Id de l'arc (module Matériel) utilisé pour cette séance — optionnel, permet de relier
   * automatiquement un commit de réglage aux séances tirées avant/après (voir gearPerformance.ts).
   */
  bowId?: string;
  arrowsPerEnd: number;
  numberOfEnds: number;
  ends: End[];
  notes?: string;
  /** Badges débloqués au moment où cette séance a été complétée (figés, non recalculés). */
  badges?: Badge[];
}

export const DISCIPLINE_DEFAULTS: Record<
  Discipline,
  { distance: number; targetFace: number; arrowsPerEnd: number }
> = {
  "Indoor 18m": { distance: 18, targetFace: 40, arrowsPerEnd: 3 },
  "Indoor 25m": { distance: 25, targetFace: 60, arrowsPerEnd: 3 },
  Outdoor: { distance: 70, targetFace: 122, arrowsPerEnd: 6 },
  "3D": { distance: 0, targetFace: 0, arrowsPerEnd: 3 },
  Campagne: { distance: 0, targetFace: 0, arrowsPerEnd: 3 },
};
