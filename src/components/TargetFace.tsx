import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Arrow, TargetType } from "../types";
import { minScoreFor, scoreFromNormalizedPosition } from "../scoring";
import { arrowPosition, ringElements } from "../targetRings";

interface TargetFaceProps {
  /** Seules les flèches avec une position (x, y) sont affichées. */
  marks: Arrow[];
  /** Appelé une seule fois, au relâchement, avec la position finale ajustée via la loupe. */
  onTap?: (nx: number, ny: number) => void;
  size?: number;
  targetType?: TargetType;
  compoundIndoorRule?: boolean;
}

const VIEW = 200;
const CENTER = VIEW / 2;
const R = 92;
const MAG_SIZE = 148; // taille de la loupe à l'écran, en px
const MAG_MARGIN = 10; // marge entre la loupe et le bord du blason, en px

function markElements(marks: Arrow[]) {
  return marks
    .filter((m): m is Arrow & { x: number; y: number } => m.x !== undefined && m.y !== undefined)
    .map((m, i) => {
      const { cx, cy } = arrowPosition(m.x, m.y, CENTER, R);
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={4.5}
          fill={m.value === "M" ? "#c0392b" : "#1e3a5f"}
          stroke="#fdfdfd"
          strokeWidth={1.5}
        />
      );
    });
}

export function TargetFace({
  marks,
  onTap,
  size = 260,
  targetType = "full",
  compoundIndoorRule = false,
}: TargetFaceProps) {
  const minScore = minScoreFor(targetType);
  const ringCount = 10 - minScore + 1;
  const xBoundaryRadius = R / ringCount / 2;
  const wrapRef = useRef<HTMLDivElement>(null);

  // Position du doigt/curseur pendant le glissé, en coordonnées SVG (0-200) et écran (px,
  // relatives au conteneur) pour respectivement recadrer la loupe et la positionner.
  const [drag, setDrag] = useState<{ svgX: number; svgY: number; screenX: number; screenY: number } | null>(
    null,
  );

  function pointFromEvent(e: ReactPointerEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const screenX = e.clientX - (wrapRef.current?.getBoundingClientRect().left ?? rect.left);
    const screenY = e.clientY - (wrapRef.current?.getBoundingClientRect().top ?? rect.top);
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW;
    const svgY = ((e.clientY - rect.top) / rect.height) * VIEW;
    return { svgX, svgY, screenX, screenY };
  }

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (!onTap) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointeur non "actif" (ex: événement synthétique) : le glissé reste fonctionnel,
      // seule la capture hors des limites du SVG ne sera pas garantie.
    }
    setDrag(pointFromEvent(e));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!onTap || !drag) return;
    setDrag(pointFromEvent(e));
  }

  function handlePointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    if (!onTap || !drag) return;
    const final = pointFromEvent(e);
    onTap((final.svgX - CENTER) / R, (final.svgY - CENTER) / R);
    setDrag(null);
  }

  function handlePointerCancel() {
    setDrag(null);
  }

  const previewValue = drag
    ? scoreFromNormalizedPosition(
        (drag.svgX - CENTER) / R,
        (drag.svgY - CENTER) / R,
        targetType,
        compoundIndoorRule,
      )
    : null;

  // Fenêtre de recadrage de la loupe (en unités du viewBox), centrée sur le point tenu.
  const cropSize = (R / ringCount) * 2.4;
  const cropX = drag ? Math.min(Math.max(drag.svgX, cropSize / 2), VIEW - cropSize / 2) - cropSize / 2 : 0;
  const cropY = drag ? Math.min(Math.max(drag.svgY, cropSize / 2), VIEW - cropSize / 2) - cropSize / 2 : 0;

  // Toujours ancrée en haut du blason (jamais en bas) pour rester prévisible ; elle
  // suit seulement le doigt horizontalement, en restant dans les limites du blason.
  const magTop = MAG_MARGIN;
  let magLeft = MAG_MARGIN;
  if (drag) {
    magLeft = Math.max(MAG_MARGIN, Math.min(size - MAG_SIZE - MAG_MARGIN, drag.screenX - MAG_SIZE / 2));
  }

  return (
    <div ref={wrapRef} className="target-face-wrap" style={{ width: size, height: size }}>
      <svg
        className={`target-face ${onTap ? "target-face--interactive" : ""}`}
        width={size}
        height={size}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        role={onTap ? "button" : "img"}
        aria-label={targetType === "vegas" ? "Spot Vegas" : "Blason"}
      >
        {ringElements(ringCount, minScore, CENTER, R)}
        {/* Anneau X : moitié de la largeur de la zone 10, imprimé sur les deux types de blason */}
        <circle cx={CENTER} cy={CENTER} r={xBoundaryRadius} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={0.6} />
        <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={1.5} />
        {markElements(marks)}
        {drag && (
          <circle cx={drag.svgX} cy={drag.svgY} r={5} fill="none" stroke="#fff" strokeWidth={1.4} opacity={0.85} />
        )}
      </svg>

      {drag && (
        <div className="target-magnifier" style={{ left: magLeft, top: magTop, width: MAG_SIZE, height: MAG_SIZE }}>
          <svg
            width={MAG_SIZE}
            height={MAG_SIZE}
            viewBox={`${cropX} ${cropY} ${cropSize} ${cropSize}`}
            className="target-magnifier__svg"
          >
            {ringElements(ringCount, minScore, CENTER, R)}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={xBoundaryRadius}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={0.5}
            />
            {markElements(marks)}
            {/* Réticule au centre de la loupe = position exacte qui sera enregistrée */}
            <line
              x1={drag.svgX - cropSize * 0.12}
              y1={drag.svgY}
              x2={drag.svgX + cropSize * 0.12}
              y2={drag.svgY}
              stroke="#fff"
              strokeWidth={0.9}
            />
            <line
              x1={drag.svgX}
              y1={drag.svgY - cropSize * 0.12}
              x2={drag.svgX}
              y2={drag.svgY + cropSize * 0.12}
              stroke="#fff"
              strokeWidth={0.9}
            />
            <circle cx={drag.svgX} cy={drag.svgY} r={cropSize * 0.03} fill="#fff" />
          </svg>
          <div className="target-magnifier__value">{previewValue}</div>
        </div>
      )}
    </div>
  );
}
