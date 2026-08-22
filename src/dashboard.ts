import type { Session } from "./types";
import { sessionTotal, sessionAverage, sessionArrowCount } from "./scoring";

export interface WeeklyStats {
  week: string; // "2026-W34" (ISO week format)
  startDate: string; // yyyy-mm-dd
  arrowCount: number;
  totalScore: number;
  avgScore: number;
  sessionsCount: number;
}

export interface MonthlyStats {
  month: string; // "2026-08"
  arrowCount: number;
  totalScore: number;
  avgScore: number;
  sessionsCount: number;
}

export interface TrainingQuality {
  avgScoreAllTime: number;
  bestWeeklyAvg: number;
  currentWeekAvg: number;
  trend: "improving" | "stable" | "declining";
}

/** ISO week number for a date string (yyyy-mm-dd). */
function getISOWeek(dateStr: string): { week: string; startDate: string } {
  const d = new Date(dateStr + "T00:00:00Z");
  const dayNum = d.getUTCDay() || 7; // 1-7, Monday-Sunday
  d.setUTCDate(d.getUTCDate() - dayNum + 1); // Set to Monday of this week
  const startDate = d.toISOString().split("T")[0];

  const year = d.getUTCFullYear();
  const week = Math.ceil(
    ((d.getUTCDate() - 1) / 7 + 1)
  );
  const paddedWeek = String(week).padStart(2, "0");
  return { week: `${year}-W${paddedWeek}`, startDate };
}

/** Aggregate sessions by week. Only counts scored ends (not free-shooting). */
export function aggregateByWeek(sessions: Session[]): WeeklyStats[] {
  const byWeek = new Map<string, { sessions: Session[]; startDate: string }>();

  for (const session of sessions) {
    const { week, startDate } = getISOWeek(session.date);
    if (!byWeek.has(week)) {
      byWeek.set(week, { sessions: [], startDate });
    }
    byWeek.get(week)!.sessions.push(session);
  }

  return Array.from(byWeek.entries())
    .map(([week, { sessions, startDate }]) => {
      // Count only arrows from scored ends (not free-shooting)
      const arrowCount = sessions.reduce(
        (sum, s) => sum + sessionArrowCount(s),
        0
      );
      const totalScore = sessions.reduce((sum, s) => sum + sessionTotal(s), 0);
      return {
        week,
        startDate,
        arrowCount,
        totalScore,
        avgScore: arrowCount > 0 ? totalScore / arrowCount : 0,
        sessionsCount: sessions.length,
      };
    })
    .sort((a, b) => a.week.localeCompare(b.week));
}

/** Aggregate sessions by month. Only counts scored ends (not free-shooting). */
export function aggregateByMonth(sessions: Session[]): MonthlyStats[] {
  const byMonth = new Map<string, Session[]>();

  for (const session of sessions) {
    const month = session.date.substring(0, 7); // "2026-08"
    if (!byMonth.has(month)) {
      byMonth.set(month, []);
    }
    byMonth.get(month)!.push(session);
  }

  return Array.from(byMonth.entries())
    .map(([month, sessions]) => {
      // Count only arrows from scored ends (not free-shooting)
      const arrowCount = sessions.reduce(
        (sum, s) => sum + sessionArrowCount(s),
        0
      );
      const totalScore = sessions.reduce((sum, s) => sum + sessionTotal(s), 0);
      return {
        month,
        arrowCount,
        totalScore,
        avgScore: arrowCount > 0 ? totalScore / arrowCount : 0,
        sessionsCount: sessions.length,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Training quality metrics. */
export function getTrainingQuality(sessions: Session[]): TrainingQuality {
  if (sessions.length === 0) {
    return {
      avgScoreAllTime: 0,
      bestWeeklyAvg: 0,
      currentWeekAvg: 0,
      trend: "stable",
    };
  }

  const allScores = sessions.map((s) => sessionAverage(s));
  const avgScoreAllTime = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  const weekly = aggregateByWeek(sessions);
  const bestWeeklyAvg = weekly.length > 0 ? Math.max(...weekly.map((w) => w.avgScore)) : 0;
  const currentWeekAvg = weekly.length > 0 ? weekly[weekly.length - 1].avgScore : 0;

  // Trend : compare last 3 weeks vs 3 weeks before
  let trend: "improving" | "stable" | "declining" = "stable";
  if (weekly.length >= 6) {
    const oldAvg = weekly.slice(-6, -3).reduce((s, w) => s + w.avgScore, 0) / 3;
    const newAvg = weekly.slice(-3).reduce((s, w) => s + w.avgScore, 0) / 3;
    if (newAvg > oldAvg * 1.02) trend = "improving";
    else if (newAvg < oldAvg * 0.98) trend = "declining";
  }

  return { avgScoreAllTime, bestWeeklyAvg, currentWeekAvg, trend };
}
