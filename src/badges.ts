import type { Badge, Session } from "./types";
import {
  bestEndTotal,
  isSessionComplete,
  personalBestAverage,
  sessionArrowCount,
  sessionAverage,
  sessionHasNoMiss,
  sessionXCount,
} from "./scoring";

const SESSION_MILESTONES = [5, 10, 25, 50, 100, 200, 500];
const ARROW_MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000];

function bestOf(
  sessions: Session[],
  discipline: Session["discipline"],
  metric: (s: Session) => number,
): number | null {
  const candidates = sessions.filter(
    (s) => s.discipline === discipline && isSessionComplete(s),
  );
  if (candidates.length === 0) return null;
  return Math.max(...candidates.map(metric));
}

/**
 * Badges nouvellement débloqués par `session` (déjà complète), en comparant l'état
 * "avant" (les autres séances complètes) à l'état "après" (avec celle-ci incluse).
 * `allSessions` peut contenir une version antérieure de `session` (moins de volées) :
 * elle est exclue du groupe "avant" par id.
 */
export function newlyEarnedBadges(session: Session, allSessions: Session[]): Badge[] {
  if (!isSessionComplete(session)) return [];
  const before = allSessions.filter((s) => s.id !== session.id);
  const badges: Badge[] = [];

  const prevAvg = personalBestAverage(before, session.discipline);
  if (prevAvg === null || sessionAverage(session) > prevAvg) {
    badges.push({
      id: "pb-average",
      emoji: "🏆",
      label: "Record de moyenne",
      detail: `${sessionAverage(session).toFixed(2)} / flèche en ${session.discipline}`,
    });
  }

  const prevBestEnd = bestOf(before, session.discipline, bestEndTotal);
  const thisBestEnd = bestEndTotal(session);
  if (prevBestEnd === null || thisBestEnd > prevBestEnd) {
    badges.push({
      id: "pb-end",
      emoji: "🎯",
      label: "Record de volée",
      detail: `${thisBestEnd} points en une volée (${session.discipline})`,
    });
  }

  const prevBestX = bestOf(before, session.discipline, sessionXCount);
  const thisX = sessionXCount(session);
  if (thisX > 0 && (prevBestX === null || thisX > prevBestX)) {
    badges.push({
      id: "pb-x",
      emoji: "✨",
      label: "Record de X",
      detail: `${thisX} X en une séance (${session.discipline})`,
    });
  }

  const arrows = session.ends.flatMap((e) => e.arrows);
  if (arrows.length > 0 && arrows.every((a) => a.value === "X")) {
    badges.push({
      id: "perfect",
      emoji: "🌟",
      label: "Séance parfaite",
      detail: "Un X à chaque flèche !",
    });
  }

  if (sessionHasNoMiss(session)) {
    const noMissBefore = before.filter((s) => isSessionComplete(s) && sessionHasNoMiss(s));
    const prevBestNoMiss = bestOf(noMissBefore, session.discipline, sessionArrowCount);
    if (prevBestNoMiss === null || sessionArrowCount(session) > prevBestNoMiss) {
      badges.push({
        id: "no-miss",
        emoji: "🛡️",
        label: "Zéro manqué",
        detail: `${sessionArrowCount(session)} flèches sans un seul manqué (${session.discipline})`,
      });
    }
  }

  const completedCount = before.filter(isSessionComplete).length + 1;
  if (SESSION_MILESTONES.includes(completedCount)) {
    badges.push({
      id: `sessions-${completedCount}`,
      emoji: "📅",
      label: "Assiduité",
      detail: `${completedCount}e séance complète`,
    });
  }

  const arrowsBefore = before.reduce((sum, s) => sum + sessionArrowCount(s), 0);
  const arrowsTotal = arrowsBefore + sessionArrowCount(session);
  const crossedMilestone = ARROW_MILESTONES.find((m) => arrowsBefore < m && arrowsTotal >= m);
  if (crossedMilestone) {
    badges.push({
      id: `arrows-${crossedMilestone}`,
      emoji: "🏹",
      label: "Cap franchi",
      detail: `${crossedMilestone.toLocaleString("fr-FR")} flèches tirées au total`,
    });
  }

  return badges;
}

/** Tous les badges débloqués, toutes séances confondues, triés du plus récent au plus ancien. */
export function allBadges(sessions: Session[]): Array<Badge & { date: string; discipline: Session["discipline"] }> {
  return [...sessions]
    .filter((s) => s.badges && s.badges.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap((s) => (s.badges ?? []).map((b) => ({ ...b, date: s.date, discipline: s.discipline })));
}
