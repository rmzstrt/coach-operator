/**
 * Assistants de tuning guidés (paper tuning, bareshaft, walk-back) : à partir d'une
 * observation simple (direction de la déchirure/de l'écart), on propose un diagnostic et
 * une piste d'ajustement, en s'appuyant sur les règles générales les plus répandues dans
 * les guides de tuning à la poulie.
 *
 * Important : ce sont des repères, pas une prescription exacte pour un arc donné — chaque
 * diagnostic le rappelle. L'objectif est de proposer un point de départ pour un petit
 * ajustement, à re-tester avant d'aller plus loin, pas de remplacer un pro shop pour les
 * réglages qui nécessitent un poids-presse (synchro cames, cam lean).
 */

export type Handedness = "droitier" | "gaucher";
export type Amplitude = "léger" | "modéré" | "important";
export type VerticalTear = "aucun" | "haut" | "bas";
export type HorizontalTear = "aucun" | "gauche" | "droite";

export interface TuningDiagnosis {
  /** Suggéré comme message du prochain commit. */
  message: string;
  /** Résumé court affiché en haut du résultat. */
  summary: string;
  /** Recommandations en langage clair. */
  recommendations: string[];
  /** Clés de champs matériel (voir DEFAULT_SETUP_FIELDS) à mettre en avant dans le prochain commit. */
  highlightKeys: string[];
}

const DISCLAIMER =
  "Repère de tuning courant, pas une prescription exacte : fais un petit ajustement à la fois et re-teste avant d'aller plus loin.";

/** Pour un gaucher, toute correction gauche/droite s'inverse par rapport à la convention droitier. */
function mirror(dir: HorizontalTear, handedness: Handedness): HorizontalTear {
  if (dir === "aucun" || handedness === "droitier") return dir;
  return dir === "gauche" ? "droite" : "gauche";
}

function opposite(dir: HorizontalTear): HorizontalTear {
  if (dir === "aucun") return "aucun";
  return dir === "gauche" ? "droite" : "gauche";
}

/**
 * Paper tuning : on tire à travers une feuille de papier tendue à ~2 m devant la cible et
 * on observe la forme du trou. Correction horizontale contre-intuitive sur un arc à
 * poulie : la flèche suit la trajectoire de la corde, pas le sens du rest — le rest se
 * corrige donc dans le sens OPPOSÉ à la déchirure. Source : Lancaster Archery Supply,
 * "Paper Tuning 101" (lancasterarchery.com/blogs/guides-and-information/paper-tuning-101) —
 * ex. nock-left tear : "Move the rest right to solve the problem", explicitement présenté
 * comme contre-intuitif par rapport au réflexe "même sens que la déchirure".
 */
export function diagnosePaperTuning(input: {
  vertical: VerticalTear;
  horizontal: HorizontalTear;
  handedness: Handedness;
  amplitude: Amplitude;
}): TuningDiagnosis {
  const { vertical, horizontal, handedness, amplitude } = input;

  if (vertical === "aucun" && horizontal === "aucun") {
    return {
      message: "Paper tuning : trou propre",
      summary: "Trou propre 🎯",
      recommendations: ["Rien à corriger pour l'instant — c'est le résultat recherché."],
      highlightKeys: [],
    };
  }

  const recommendations: string[] = [];
  const highlightKeys: string[] = [];

  if (vertical === "haut") {
    recommendations.push(
      "Point d'encochage : redescends-le légèrement (le nock part trop haut sur le papier).",
    );
    highlightKeys.push("nockPoint");
  } else if (vertical === "bas") {
    recommendations.push(
      "Point d'encochage : remonte-le légèrement (le nock part trop bas sur le papier).",
    );
    highlightKeys.push("nockPoint");
  }

  if (horizontal !== "aucun") {
    const dir = mirror(opposite(horizontal), handedness);
    recommendations.push(
      `Centershot (position du rest) : décale-le légèrement vers la ${dir} — contre-intuitif mais bien documenté : sur un arc à poulie, la flèche suit la trajectoire de la corde, pas le sens du rest, donc le rest se corrige dans le sens OPPOSÉ à la déchirure (nock vers la ${horizontal}).`,
    );
    highlightKeys.push("centershot");
  }

  recommendations.push(DISCLAIMER);

  const parts = [
    vertical !== "aucun" ? `nock ${vertical}` : null,
    horizontal !== "aucun" ? `nock ${horizontal}` : null,
  ].filter((x): x is string => x !== null);

  return {
    message: `Paper tuning (${amplitude}) : ${parts.join(" + ")}`,
    summary: `Déchirure : ${parts.join(" + ")}`,
    recommendations,
    highlightKeys,
  };
}

/**
 * Bareshaft tuning : on compare le point d'impact d'une flèche sans empennage à celui du
 * groupe de flèches empennées. Contrairement au paper tuning, la correction du rest se
 * fait dans le MÊME sens que l'écart observé, pas opposé. Source : diagramme Lancaster
 * "Bareshaft Compound Tuning" — ex. bare shaft hits left → move rest to the left. L'écart
 * horizontal évoque avant tout une réaction de spine (raide/molle) — le rest est la piste
 * la plus simple à essayer en premier, avant de changer de pointe/flèche.
 */
export function diagnoseBareshaft(input: {
  vertical: VerticalTear; // écart du bare shaft par rapport au groupe empenné
  horizontal: HorizontalTear;
  handedness: Handedness;
  amplitude: Amplitude;
}): TuningDiagnosis {
  const { vertical, horizontal, handedness, amplitude } = input;

  if (vertical === "aucun" && horizontal === "aucun") {
    return {
      message: "Bareshaft tuning : impacts groupés",
      summary: "Bare shaft dans le groupe 🎯",
      recommendations: ["Le bare shaft touche avec le groupe empenné — rien à corriger pour l'instant."],
      highlightKeys: [],
    };
  }

  const recommendations: string[] = [];
  const highlightKeys: string[] = [];

  if (vertical === "haut") {
    recommendations.push(
      "Point d'encochage : baisse-le légèrement (le bare shaft touche au-dessus du groupe empenné).",
    );
    highlightKeys.push("nockPoint");
  } else if (vertical === "bas") {
    recommendations.push(
      "Point d'encochage : remonte-le légèrement (le bare shaft touche en dessous du groupe empenné).",
    );
    highlightKeys.push("nockPoint");
  }

  if (horizontal !== "aucun") {
    const spineNote = horizontal === "gauche" ? "trop raide (stiff)" : "trop molle (weak)";
    const restDir = mirror(horizontal, handedness);
    recommendations.push(
      `Le bare shaft touche à ${horizontal} du groupe empenné : ça évoque une réaction dynamique ${spineNote}. ` +
        `Piste la plus simple à tester d'abord : décale légèrement le rest vers la ${restDir} (même sens que l'écart, contrairement au paper tuning). ` +
        "Si ça ne suffit pas après 2-3 essais, le sujet est plus probablement le spine ou le poids de pointe de la flèche — vois avec un pro shop avant d'en changer.",
    );
    highlightKeys.push("centershot");
  }

  recommendations.push(DISCLAIMER);

  const parts = [
    vertical !== "aucun" ? `bare shaft ${vertical}` : null,
    horizontal !== "aucun" ? `bare shaft ${horizontal}` : null,
  ].filter((x): x is string => x !== null);

  return {
    message: `Bareshaft tuning (${amplitude}) : ${parts.join(" + ")}`,
    summary: `Écart : ${parts.join(" + ")}`,
    recommendations,
    highlightKeys,
  };
}

/**
 * Walk-back tuning : on tire sur une ligne verticale (fil à plomb) à des distances
 * croissantes. Si les impacts dérivent latéralement en reculant, le centershot n'est pas
 * aligné — même phénomène physique que la déchirure horizontale en paper tuning (la
 * flèche suit la corde, pas le rest), donc même correction OPPOSÉE à la dérive observée.
 */
export function diagnoseWalkback(input: {
  drift: HorizontalTear;
  handedness: Handedness;
  amplitude: Amplitude;
}): TuningDiagnosis {
  const { drift, handedness, amplitude } = input;

  if (drift === "aucun") {
    return {
      message: "Walk-back tuning : aligné",
      summary: "Impacts alignés sur la ligne 🎯",
      recommendations: ["Les impacts restent sur la ligne à toutes les distances — le centershot est aligné."],
      highlightKeys: [],
    };
  }

  const dir = mirror(opposite(drift), handedness);
  return {
    message: `Walk-back tuning (${amplitude}) : dérive vers la ${drift}`,
    summary: `Dérive vers la ${drift} en reculant`,
    recommendations: [
      `Centershot (position du rest) : décale-le légèrement vers la ${dir} — même logique contre-intuitive que le paper tuning (voir plus haut) : le rest se corrige dans le sens opposé à la dérive observée.`,
      DISCLAIMER,
    ],
    highlightKeys: ["centershot"],
  };
}
