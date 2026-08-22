import type { Session } from "./types";
import type { SetupCommit } from "./gearTypes";
import { extremeSpread, hasGroupingData, normalizedToCm, positionedArrows } from "./groupingStats";
import { isSessionComplete, sessionAverage } from "./scoring";

export interface EraStats {
  count: number;
  /** Moyenne des moyennes/flèche des séances complètes de la période — null si aucune. */
  avgScore: number | null;
  /** Moyenne du groupement (écart max, en cm) des séances en mode Cible de la période — null si aucune. */
  avgGroupingCm: number | null;
}

export interface CommitImpact {
  /** null uniquement pour le tout premier commit d'un arc : rien à comparer avant lui. */
  before: EraStats | null;
  after: EraStats;
}

/**
 * Période (bornes en date ISO yyyy-mm-dd) pendant laquelle un commit était le réglage
 * "actuel" de l'arc : du commit jusqu'au suivant chronologiquement (exclu), ou jusqu'à
 * aujourd'hui pour le commit le plus récent. `commitsDesc` doit être trié du plus récent
 * au plus ancien (comme dans BowHistory).
 */
function eraBounds(commitsDesc: SetupCommit[], index: number): { start: string; end: string | null } {
  return {
    start: commitsDesc[index].timestamp.slice(0, 10),
    end: index > 0 ? commitsDesc[index - 1].timestamp.slice(0, 10) : null,
  };
}

function sessionsInEra(
  sessions: Session[],
  bowId: string,
  era: { start: string; end: string | null },
): Session[] {
  return sessions.filter((s) => {
    if (s.bowId !== bowId) return false;
    if (s.date < era.start) return false;
    if (era.end !== null && s.date >= era.end) return false;
    return true;
  });
}

function eraStats(sessions: Session[]): EraStats {
  const complete = sessions.filter(isSessionComplete);
  const withGrouping = sessions.filter(hasGroupingData);
  return {
    count: sessions.length,
    avgScore:
      complete.length > 0
        ? complete.reduce((sum, s) => sum + sessionAverage(s), 0) / complete.length
        : null,
    avgGroupingCm:
      withGrouping.length > 0
        ? withGrouping.reduce(
            (sum, s) => sum + normalizedToCm(extremeSpread(positionedArrows(s)), s.targetFace),
            0,
          ) / withGrouping.length
        : null,
  };
}

/**
 * Compare automatiquement les séances tirées avec ce commit (ce réglage) à celles tirées
 * juste avant, avec le réglage précédent du même arc — aucune sélection manuelle requise,
 * uniquement basé sur les dates des séances vs celles des commits.
 */
export function commitImpact(
  commitsDesc: SetupCommit[],
  commit: SetupCommit,
  sessions: Session[],
): CommitImpact | null {
  const index = commitsDesc.findIndex((c) => c.id === commit.id);
  if (index < 0) return null;

  const after = eraStats(sessionsInEra(sessions, commit.bowId, eraBounds(commitsDesc, index)));

  if (index === commitsDesc.length - 1) {
    return { before: null, after }; // premier commit de l'historique : pas de "avant"
  }

  const before = eraStats(sessionsInEra(sessions, commit.bowId, eraBounds(commitsDesc, index + 1)));
  return { before, after };
}
