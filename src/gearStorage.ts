import type { BowProfile, SetupCommit } from "./gearTypes";

const KEY = "coach-operator-gear";

interface GearData {
  bows: BowProfile[];
  commits: SetupCommit[];
}

function load(): GearData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { bows: [], commits: [] };
    const parsed = JSON.parse(raw);
    return {
      bows: Array.isArray(parsed.bows) ? parsed.bows : [],
      commits: Array.isArray(parsed.commits) ? parsed.commits : [],
    };
  } catch {
    return { bows: [], commits: [] };
  }
}

function save(data: GearData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadBows(): BowProfile[] {
  return load().bows;
}

export function loadCommits(): SetupCommit[] {
  return load().commits;
}

export function upsertBow(bow: BowProfile): GearData {
  const data = load();
  const idx = data.bows.findIndex((b) => b.id === bow.id);
  if (idx >= 0) {
    data.bows[idx] = bow;
  } else {
    data.bows.unshift(bow);
  }
  save(data);
  return data;
}

export function deleteBow(id: string): GearData {
  const data = load();
  data.bows = data.bows.filter((b) => b.id !== id);
  data.commits = data.commits.filter((c) => c.bowId !== id);
  save(data);
  return data;
}

/** Ajoute un commit en tête d'historique (le plus récent en premier, comme `git log`). */
export function addCommit(commit: SetupCommit): GearData {
  const data = load();
  data.commits.unshift(commit);
  save(data);
  return data;
}

export function deleteCommit(id: string): GearData {
  const data = load();
  data.commits = data.commits.filter((c) => c.id !== id);
  save(data);
  return data;
}
