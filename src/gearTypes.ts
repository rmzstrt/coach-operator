/**
 * Version control du setup matériel, façon Git : chaque réglage (livre, point
 * d'encochage, poids stabilisateur, position clicker, ...) est figé dans un "commit"
 * horodaté. On peut comparer deux commits (diff) et "revenir" à un ancien setup —
 * ce qui crée un nouveau commit copiant l'ancien, sans jamais réécrire l'historique.
 */

export interface SetupField {
  key: string;
  label: string;
  value: string;
  unit?: string;
}

export interface BowProfile {
  id: string;
  name: string; // ex: "Reckoning 39"
  createdAt: string; // ISO datetime
}

export interface SetupCommit {
  id: string;
  bowId: string;
  timestamp: string; // ISO datetime
  message: string;
  fields: SetupField[];
}

/**
 * Champs proposés par défaut pour un premier commit — librement éditables/supprimables.
 * Les clés `nockPoint` et `centershot` sont aussi celles que les assistants de tuning
 * guidés (paper/bareshaft/walk-back) mettent en avant dans leurs suggestions de commit —
 * voir `tuning.ts`.
 */
export const DEFAULT_SETUP_FIELDS: Omit<SetupField, "value">[] = [
  { key: "poundage", label: "Livre", unit: "lbs" },
  { key: "nockPoint", label: "Point d'encochage", unit: "mm" },
  { key: "centershot", label: "Centershot", unit: "mm" },
  { key: "camSync", label: "Synchro cames" },
  { key: "camLean", label: "Cam lean" },
  { key: "stabilizerWeight", label: "Poids stabilisateur", unit: "g" },
  { key: "clicker", label: "Position clicker", unit: "mm" },
];
