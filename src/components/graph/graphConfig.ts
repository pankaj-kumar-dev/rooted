import type { DisplayOutcome, GraphPoint } from "../../domain/types";

/** Mirrors the CSS design tokens; three.js cannot read CSS variables. */
export const OUTCOME_COLORS: Record<DisplayOutcome, { top: string; side: string; front: string }> = {
  good: { top: "#b9dda0", side: "#4f9a52", front: "#76bd68" },
  slip: { top: "#ef9a86", side: "#743b32", front: "#df7864" },
  missed: { top: "#aab3a6", side: "#566055", front: "#8f998b" },
  unrecorded: { top: "#7d867a", side: "#3f473f", front: "#5f695d" },
};

export interface GraphConfig {
  /** Block width along the time (X) axis. */
  blockWidth: number;
  /** Block height = exactly one rating level. Uniform for every day. */
  blockHeight: number;
  blockDepth: number;
  /** Gap between neighbouring days along X. */
  gap: number;
  /** Camera yaw/pitch in degrees (3D). */
  cameraYaw: number;
  cameraPitch: number;
  /** Viewport padding multiplier for fit-to-bounds. */
  fitPadding: number;
  /** Stagger between block entry animations, in seconds. */
  entryStagger: number;
  background: string;
  gridColor: string;
  lightIntensity: number;
}

export const DEFAULT_GRAPH_CONFIG: GraphConfig = {
  blockWidth: 1,
  blockHeight: 0.62,
  blockDepth: 1.5,
  gap: 0.08,
  cameraYaw: -32,
  cameraPitch: 22,
  fitPadding: 1.06,
  entryStagger: 0.025,
  background: "#07100b",
  gridColor: "#2a4a33",
  lightIntensity: 2.2,
};

export interface BlockLayout {
  index: number;
  point: GraphPoint;
  /** Center position in world units. X = time, Y = cumulative rating. */
  x: number;
  y: number;
  z: number;
}

export interface GraphLayout {
  blocks: BlockLayout[];
  minRating: number;
  maxRating: number;
  /** World-space axis-aligned bounds. */
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
  floorY: number;
}

/** Pure mapping: each date advances along X; the cumulative rating sets elevation. */
export function layoutBlocks(points: readonly GraphPoint[], cfg: GraphConfig): GraphLayout {
  const step = cfg.blockWidth + cfg.gap;
  const ratings = points.map((p) => p.rating);
  const minRating = ratings.length ? Math.min(0, ...ratings) : 0;
  const maxRating = ratings.length ? Math.max(0, ...ratings) : 0;

  const blocks = points.map((point, index) => ({
    index,
    point,
    x: index * step,
    y: point.rating * cfg.blockHeight,
    z: 0,
  }));

  const halfW = cfg.blockWidth / 2;
  const halfH = cfg.blockHeight / 2;
  const halfD = cfg.blockDepth / 2;
  const lastX = Math.max(0, (points.length - 1) * step);
  const floorY = minRating * cfg.blockHeight - halfH - 0.15;

  return {
    blocks,
    minRating,
    maxRating,
    floorY,
    bounds: {
      minX: -halfW,
      maxX: lastX + halfW,
      minY: floorY,
      maxY: maxRating * cfg.blockHeight + halfH,
      minZ: -halfD,
      maxZ: halfD,
    },
  };
}

export function blockAriaLabel(point: GraphPoint, habitName: string): string {
  return `${habitName}, ${point.date}: ${point.outcome === "unrecorded" ? "no check-in" : point.outcome}. Rating ${point.previousRating} to ${point.rating}.`;
}
