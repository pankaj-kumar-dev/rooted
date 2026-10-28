import { useMemo } from "react";
import type { GraphPoint } from "../../domain/types";
import { OUTCOME_COLORS, layoutBlocks, type GraphConfig } from "./graphConfig";

interface StaircaseSvgProps {
  points: readonly GraphPoint[];
  config: GraphConfig;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  /** Compact = decorative mini staircase, no interaction, no floor. */
  compact?: boolean;
  className?: string;
}

/** Oblique projection factors. Depth (z) recedes up and to the right. */
const DEPTH_SHIFT_X = 0.5;
const DEPTH_SHIFT_Y = 0.32;
const UNIT = 40;
const PAD = 0.6;

type P = [number, number];
const pts = (...p: P[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/**
 * 2D isometric-style fallback. Same data semantics as the 3D scene:
 * X = time, elevation = cumulative rating, uniform blocks.
 */
export default function StaircaseSvg({
  points,
  config,
  selectedIndex = null,
  onSelect,
  compact = false,
  className,
}: StaircaseSvgProps) {
  const layout = useMemo(() => layoutBlocks(points, config), [points, config]);
  const { blocks, bounds, floorY } = layout;

  const proj = (x: number, y: number, z: number): P => [
    (x + z * DEPTH_SHIFT_X) * UNIT,
    (-y - z * DEPTH_SHIFT_Y) * UNIT,
  ];

  const hw = config.blockWidth / 2;
  const hh = config.blockHeight / 2;
  const hd = config.blockDepth / 2;

  // viewBox from projected bounds
  const corners: P[] = [];
  for (const x of [bounds.minX, bounds.maxX])
    for (const y of [bounds.minY, bounds.maxY + 0.4])
      for (const z of [bounds.minZ, bounds.maxZ]) corners.push(proj(x, y, z));
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const pad = PAD * UNIT;
  const vbX = Math.min(...xs) - pad;
  const vbY = Math.min(...ys) - pad;
  const vbW = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const vbH = Math.max(...ys) - Math.min(...ys) + pad * 2;

  // Nearest block (smallest x) must paint last.
  const ordered = [...blocks].reverse();

  return (
    <svg
      className={className}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {!compact && (
        <g className="stair-floor">
          <polygon
            points={pts(
              proj(bounds.minX, floorY, bounds.minZ),
              proj(bounds.maxX, floorY, bounds.minZ),
              proj(bounds.maxX, floorY, bounds.maxZ),
              proj(bounds.minX, floorY, bounds.maxZ),
            )}
            fill="#0d1710"
            stroke={config.gridColor}
            strokeWidth={1}
          />
          {blocks.map((b) => (
            <line
              key={b.index}
              x1={proj(b.x - hw, floorY, bounds.minZ)[0]}
              y1={proj(b.x - hw, floorY, bounds.minZ)[1]}
              x2={proj(b.x - hw, floorY, bounds.maxZ)[0]}
              y2={proj(b.x - hw, floorY, bounds.maxZ)[1]}
              stroke={config.gridColor}
              strokeWidth={0.6}
              opacity={0.6}
            />
          ))}
        </g>
      )}
      {ordered.map((b) => {
        const c = OUTCOME_COLORS[b.point.outcome];
        const selected = selectedIndex === b.index;
        const x0 = b.x - hw, x1 = b.x + hw;
        const y0 = b.y - hh, y1 = b.y + hh;
        const z0 = -hd, z1 = hd;
        return (
          <g
            key={b.point.date}
            className={onSelect ? "stair-block is-interactive" : "stair-block"}
            onClick={onSelect ? () => onSelect(b.index) : undefined}
          >
            {/* left (x-) face */}
            <polygon points={pts(proj(x0, y1, z0), proj(x0, y1, z1), proj(x0, y0, z1), proj(x0, y0, z0))} fill={c.side} />
            {/* front (z-) face */}
            <polygon points={pts(proj(x0, y1, z0), proj(x1, y1, z0), proj(x1, y0, z0), proj(x0, y0, z0))} fill={c.front} />
            {/* top face */}
            <polygon
              points={pts(proj(x0, y1, z0), proj(x1, y1, z0), proj(x1, y1, z1), proj(x0, y1, z1))}
              fill={c.top}
            />
            <polygon
              points={pts(proj(x0, y1, z0), proj(x1, y1, z0), proj(x1, y0, z0), proj(x0, y0, z0))}
              fill="none"
              stroke={selected ? "#e2f5c8" : "#07100b"}
              strokeOpacity={selected ? 1 : 0.45}
              strokeWidth={selected ? 2.4 : 0.8}
            />
            {selected && (
              <polygon
                points={pts(proj(x0, y1, z0), proj(x1, y1, z0), proj(x1, y1, z1), proj(x0, y1, z1))}
                fill="none"
                stroke="#e2f5c8"
                strokeWidth={2.4}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
