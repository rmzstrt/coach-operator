import type { Session } from "./types";
import { sessionAverage, sessionArrowCount, scoredEnds } from "./scoring";

export type ObjectiveType = "arrows_per_week" | "avg_score_per_volley" | "avg_score_per_session" | "total_arrows";

export interface Objective {
  id: string;
  type: ObjectiveType;
  label: string;
  targetValue: number;
  unit: string;
  createdAt: string; // ISO date
  enabled: boolean;
}

export interface ObjectiveProgress {
  objective: Objective;
  currentValue: number;
  progress: number; // 0-100
  achieved: boolean;
}

const DEFAULT_OBJECTIVES: Objective[] = [
  {
    id: "arrows-180-week",
    type: "arrows_per_week",
    label: "180 flèches par semaine",
    targetValue: 180,
    unit: "flèches",
    createdAt: new Date().toISOString(),
    enabled: true,
  },
  {
    id: "avg-score-8",
    type: "avg_score_per_session",
    label: "Moyenne 8.0 par séance",
    targetValue: 8.0,
    unit: "pts/flèche",
    createdAt: new Date().toISOString(),
    enabled: true,
  },
];

const OBJECTIVES_KEY = "coach-operator-objectives";

export function loadObjectives(): Objective[] {
  try {
    const raw = localStorage.getItem(OBJECTIVES_KEY);
    if (!raw) return DEFAULT_OBJECTIVES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_OBJECTIVES;
  } catch {
    return DEFAULT_OBJECTIVES;
  }
}

export function saveObjectives(objectives: Objective[]): void {
  localStorage.setItem(OBJECTIVES_KEY, JSON.stringify(objectives));
}

export function addObjective(objective: Objective): void {
  const objectives = loadObjectives();
  objectives.push(objective);
  saveObjectives(objectives);
}

export function updateObjective(id: string, updates: Partial<Objective>): void {
  const objectives = loadObjectives();
  const idx = objectives.findIndex((o) => o.id === id);
  if (idx !== -1) {
    objectives[idx] = { ...objectives[idx], ...updates };
    saveObjectives(objectives);
  }
}

export function deleteObjective(id: string): void {
  const objectives = loadObjectives();
  saveObjectives(objectives.filter((o) => o.id !== id));
}

/** Current week ISO week string (YYYY-Www). */
function getCurrentWeek(): string {
  const d = new Date();
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() - dayNum + 1);
  const year = d.getFullYear();
  const week = Math.ceil(((d.getDate() - 1) / 7 + 1));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Calculate progress for all enabled objectives. */
export function getObjectiveProgress(sessions: Session[]): ObjectiveProgress[] {
  const objectives = loadObjectives().filter((o) => o.enabled);
  // A session is complete if all scored (non-free) ends are filled
  const completed = sessions.filter((s) => scoredEnds(s).length === s.numberOfEnds);

  return objectives.map((objective) => {
    let currentValue = 0;

    if (objective.type === "arrows_per_week") {
      // Count arrows in current week (only scored ends)
      const currentWeek = getCurrentWeek();
      currentValue = completed
        .filter((s) => {
          const sWeek = s.date.substring(0, 4) + "-W" + String(Math.ceil(((new Date(s.date + "T00:00:00Z").getDate() - 1) / 7 + 1))).padStart(2, "0");
          return sWeek === currentWeek;
        })
        .reduce((sum, s) => sum + sessionArrowCount(s), 0);
    } else if (objective.type === "avg_score_per_volley") {
      // Average score across all arrows (only from scored ends)
      const allArrows = completed.flatMap((s) => scoredEnds(s).flatMap((e) => e.arrows));
      if (allArrows.length > 0) {
        const totalScore = allArrows.reduce((sum, a) => {
          if (typeof a.value === "number") return sum + a.value;
          if (a.value === "X") return sum + 10;
          return sum; // "M" = 0
        }, 0);
        currentValue = totalScore / allArrows.length;
      }
    } else if (objective.type === "avg_score_per_session") {
      // Average score per completed session (only scored ends count)
      if (completed.length > 0) {
        const avgScores = completed.map((s) => sessionAverage(s));
        currentValue = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;
      }
    } else if (objective.type === "total_arrows") {
      // Total arrows across all sessions (only scored ends)
      currentValue = completed.reduce((sum, s) => sum + sessionArrowCount(s), 0);
    }

    const progress = Math.min(100, (currentValue / objective.targetValue) * 100);

    return {
      objective,
      currentValue,
      progress,
      achieved: currentValue >= objective.targetValue,
    };
  });
}
