# ArcScore

PWA (Progressive Web App) de suivi de scores de tir à l'arc — usage personnel, mono-archer,
pensée pour un arc à poulie (compound).

## Stack

- [Vite](https://vite.dev/) + React + TypeScript
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) pour le manifest et le service worker (installable, fonctionne hors-ligne)
- Stockage en local (`localStorage`) — aucune donnée envoyée à un serveur

## Développement

```bash
npm install
npm run dev
```

## Build de production (avec service worker actif)

```bash
npm run build
npm run preview
```

Le service worker (`dist/sw.js`) n'est actif qu'en build de production, pas en `npm run dev`
(voir `devOptions.enabled: false` dans `vite.config.ts`).

## Fonctionnalités actuelles

- Créer une séance (discipline, distance, blason, flèches/volée, nombre de volées) avec des
  valeurs par défaut selon la discipline (Indoor 18m, Indoor 25m, Outdoor, 3D, Campagne)
- **Type d'arc** (poulie/compound ou classique/recurve) et **type de blason** (Indoor
  18m/25m) : blason complet (1 à 10) ou **spot Vegas** (5 zones, 6 à 10) — par défaut :
  poulie + spot Vegas, le cas d'usage principal de l'appli
- **Règle salle poulie** appliquée automatiquement : pour un arc à poulie en indoor, seul
  le X (centre) compte 10 points, le reste du jaune (l'ancien anneau "10") ne vaut que 9 —
  contrairement au classique où tout le jaune vaut 10 (le X ne sert qu'au départage). Les
  boutons "Chiffres" et le calcul depuis le mode "Cible" s'adaptent en conséquence (pas de
  bouton "10" isolé pour un poulie en salle, uniquement "X")
- Saisir les scores flèche par flèche, deux modes au choix :
  - **Chiffres** : clavier numérique adapté au type de blason et à la règle en vigueur
  - **Cible** : on maintient l'endroit où la flèche a atteint le blason — une **loupe**
    zoomée apparaît et suit le doigt/curseur (avec repli automatique en dessous si pas de
    place au-dessus), affiche le score en direct, et on relâche pour valider la position
    finale ajustée
- **Groupement** : visualisation de la dispersion des flèches positionnées en mode Cible,
  sur un blason virtuel — utile pour repérer un problème de tenue/visée
- Historique des volées, total et moyenne par flèche en direct
- **Badges & records automatiques** : record de moyenne, de volée, de X, séance parfaite,
  zéro manqué, jalons d'assiduité (nombre de séances) et de volume (nombre de flèches
  tirées au total) — détectés à la fin de chaque séance complète et figés sur la séance
- **Palmarès** : écran récapitulatif de tous les badges débloqués, avec stats globales
- Tendance de progression (mini-graphique) sur les 10 dernières séances complètes
- **Matériel (🔧)** : version control du setup façon Git — chaque arc a un historique de
  "commits" (réglages : livre, point d'encochage, poids stabilisateur, position clicker,
  + champs libres). On peut comparer deux commits (diff avant/après) et "revenir" à un
  ancien setup — ça crée un nouveau commit qui copie l'ancien, sans jamais réécrire
  l'historique (comme `git revert`)
- **Groupement (🎯)** : replay comparatif — superpose la dispersion des flèches (mode
  Cible) de deux séances sur un même blason, en heatmap colorée par séance (+ centroïde de
  chaque groupe), avec la taille du groupement en cm et le delta (resserré/élargi). Utile
  pour voir concrètement l'effet d'un changement de réglage sur la précision
- **Boucle setup ↔ performance** : une séance peut être liée à un arc (module Matériel).
  Dans l'historique de l'arc, chaque commit affiche automatiquement — sans aucune
  sélection manuelle — l'effet mesuré du changement : groupement moyen et score moyen des
  séances tirées avant vs après ce réglage, avec le delta en évidence
- **Tuning (🩺)** : assistants de tuning guidés — paper tuning, bareshaft tuning,
  walk-back tuning (diagnostic à partir d'une observation simple : direction/amplitude de
  la déchirure ou de l'écart) et une checklist synchro cames/cam lean. Fonctionne de façon
  autonome (pas besoin d'arc enregistré) ; si un arc existe, le diagnostic peut en plus
  être gardé comme commit — les réglages concernés (point d'encochage, centershot, synchro
  cames, cam lean) sont mis en avant dans le formulaire
- **Chrono (⏱️)** : minuteur de tir en deux phases — préparation puis volée — avec bips
  sonores et vibration aux transitions et à 30s/10s restantes. Préréglages (3 flèches/2min,
  6 flèches/4min, rythme 30s) ou durées libres, mémorisées d'une visite à l'autre.
  Accessible aussi directement depuis l'écran de saisie des scores (icône ⏱️) : un tap
  lance le chrono avec les derniers réglages, et une fois terminé "Noter mes scores"
  ramène directement à la saisie
- **Dashboard (📊)** : visualisation de l'entraînement — agrégation par semaine et par mois
  avec graphiques de volume (flèches, séances) et qualité (score moyen). Affiche la
  tendance générale (improving/stable/declining), meilleure semaine, semaine actuelle,
  résumé global (total flèches, séances, score total). Togglable depuis la page d'accueil
- **Défis/Objectifs (🎯)** : intégré au dashboard — crée tes propres objectifs (180 flèches/
  semaine, 8.0 pts moyenne/séance, etc.). Progression affichée en barre. Marque comme
  "✓ Atteint !" quand le seuil est franchi. Gamification pour motiver l'entraînement régulier

## Icônes

Générées depuis `public/icon.svg` via `scripts/gen-icons.mjs` (nécessite `sharp`, installé à
la volée avec `npm install --no-save sharp` puis désinstallé — à refaire si l'icône change).

## Pistes pour la suite

Idées d'options "originales" encore à explorer : note vocale par volée, défi du jour, tag
météo/contexte corrélé aux performances, image récap façon Strava à partager, calendrier de
régularité façon "contributions GitHub".

Idées "premium" (inspirées d'apps payantes du domaine) encore non construites : analyse de
dispersion horizontale vs verticale séparée (au-delà du simple écart max), traçabilité par
flèche individuelle ("flèche coupable"), digitalisation de cible papier par photo, minuteur
de cadence de tir, carnet d'entretien prédictif (usure corde/pointes), prédiction
Monte-Carlo du score, export PDF feuille de match officielle World Archery.
