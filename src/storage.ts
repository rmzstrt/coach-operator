import type { Arrow, ArrowValue, Session } from "./types";

const KEY = "coach-operator-sessions";

/**
 * Ancien format (avant l'ajout du mode "Cible") : les flèches étaient stockées comme de
 * simples ArrowValue plutôt que des objets { value, x?, y? }. On normalise à la lecture
 * pour rester compatible avec des données déjà enregistrées sur l'appareil.
 */
function normalizeArrow(a: ArrowValue | Arrow): Arrow {
  return typeof a === "object" && a !== null && "value" in a ? a : { value: a };
}

function normalizeSession(raw: Session): Session {
  return {
    ...raw,
    ends: raw.ends.map((e) => ({ arrows: e.arrows.map(normalizeArrow) })),
  };
}

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeSession) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function upsertSession(session: Session): Session[] {
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  saveSessions(sessions);
  return sessions;
}

export function deleteSession(id: string): Session[] {
  const sessions = loadSessions().filter((s) => s.id !== id);
  saveSessions(sessions);
  return sessions;
}
