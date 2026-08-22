import type { Arrow } from "../types";
import { arrowPosition, ringElements } from "../targetRings";
import { centroid } from "../groupingStats";

interface GroupSet {
  arrows: Array<Arrow & { x: number; y: number }>;
  color: string;
}

interface GroupingOverlayProps {
  a: GroupSet;
  b: GroupSet;
  size?: number;
}

const VIEW = 200;
const CENTER = VIEW / 2;
const R = 92;
// Fond neutre "blason complet" (1 à 10) : la comparaison porte sur la dispersion des
// flèches, pas sur le score, donc on ignore le type de blason réel de chaque séance.
const RING_COUNT = 10;
const MIN_SCORE = 1;

function heatLayer(group: GroupSet, gradientId: string) {
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {group.arrows.map((m, i) => {
        const { cx, cy } = arrowPosition(m.x, m.y, CENTER, R);
        return <circle key={i} cx={cx} cy={cy} r={16} fill={`url(#${gradientId})`} />;
      })}
    </g>
  );
}

function dotLayer(group: GroupSet) {
  return group.arrows.map((m, i) => {
    const { cx, cy } = arrowPosition(m.x, m.y, CENTER, R);
    return <circle key={i} cx={cx} cy={cy} r={3} fill={group.color} stroke="#0f2138" strokeWidth={1} />;
  });
}

function centroidMark(group: GroupSet) {
  if (group.arrows.length === 0) return null;
  const c = centroid(group.arrows);
  const { cx, cy } = arrowPosition(c.x, c.y, CENTER, R);
  return (
    <g stroke={group.color} strokeWidth={1.4}>
      <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} />
      <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} />
      <circle cx={cx} cy={cy} r={7} fill="none" />
    </g>
  );
}

export function GroupingOverlay({ a, b, size = 260 }: GroupingOverlayProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="target-face"
      role="img"
      aria-label="Comparaison de groupement"
    >
      <defs>
        <radialGradient id="grouping-grad-a">
          <stop offset="0%" stopColor={a.color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={a.color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="grouping-grad-b">
          <stop offset="0%" stopColor={b.color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={b.color} stopOpacity={0} />
        </radialGradient>
      </defs>

      {ringElements(RING_COUNT, MIN_SCORE, CENTER, R)}
      <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={1.5} />

      {heatLayer(a, "grouping-grad-a")}
      {heatLayer(b, "grouping-grad-b")}
      {dotLayer(a)}
      {dotLayer(b)}
      {centroidMark(a)}
      {centroidMark(b)}
    </svg>
  );
}
