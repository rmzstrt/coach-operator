import type { SetupCommit } from "./gearTypes";

export interface FieldDiff {
  key: string;
  label: string;
  unit?: string;
  before: string | null; // null = le champ n'existait pas dans le commit de base
  after: string | null; // null = le champ a été supprimé depuis
  changed: boolean;
}

/** Diff façon Git entre deux commits : `base` peut être null (tout est "ajouté"). */
export function diffCommits(base: SetupCommit | null, target: SetupCommit): FieldDiff[] {
  const beforeMap = new Map((base?.fields ?? []).map((f) => [f.key, f]));
  const afterMap = new Map(target.fields.map((f) => [f.key, f]));
  const keys = new Set([...beforeMap.keys(), ...afterMap.keys()]);

  const result: FieldDiff[] = [];
  for (const key of keys) {
    const beforeField = beforeMap.get(key);
    const afterField = afterMap.get(key);
    const before = beforeField?.value ?? null;
    const after = afterField?.value ?? null;
    result.push({
      key,
      label: afterField?.label ?? beforeField?.label ?? key,
      unit: afterField?.unit ?? beforeField?.unit,
      before,
      after,
      changed: before !== after,
    });
  }

  // Ordre stable : d'abord les champs présents dans `target` (dans leur ordre), puis les
  // champs supprimés qui n'existent plus que dans `base`.
  const orderIndex = new Map(target.fields.map((f, i) => [f.key, i]));
  result.sort((a, b) => (orderIndex.get(a.key) ?? 999) - (orderIndex.get(b.key) ?? 999));
  return result;
}

export function changedFieldCount(base: SetupCommit | null, target: SetupCommit): number {
  return diffCommits(base, target).filter((f) => f.changed).length;
}

/** Le commit chronologiquement précédent (le suivant dans un historique trié du plus récent au plus ancien). */
export function previousCommit(
  history: SetupCommit[],
  commit: SetupCommit,
): SetupCommit | null {
  const idx = history.findIndex((c) => c.id === commit.id);
  if (idx < 0 || idx === history.length - 1) return null;
  return history[idx + 1];
}
