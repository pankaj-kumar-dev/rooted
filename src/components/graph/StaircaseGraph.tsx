import { Component, Suspense, lazy, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type { GraphPoint } from "../../domain/types";
import { OUTCOME_LABEL, describeOutcome, summarizePoints } from "../../domain/score";
import { DEFAULT_GRAPH_CONFIG, blockAriaLabel, type GraphConfig } from "./graphConfig";
import StaircaseSvg from "./StaircaseSvg";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { hasWebGL } from "../../hooks/hasWebGL";
import { OutcomeGlyph } from "./OutcomeGlyph";

const Staircase3D = lazy(() => import("./Staircase3D"));

export interface StaircaseGraphProps {
  /** Chronological graph points, already scored. */
  points: readonly GraphPoint[];
  habitName: string;
  /** Mark mock data as illustrative. */
  illustrative?: boolean;
  config?: Partial<GraphConfig>;
  /** Force the 2D renderer (used by tests/fallback toggle default). */
  prefer2D?: boolean;
  /** Height of the stage; CSS length. */
  stageHeight?: string;
  headingId?: string;
  /** Override day wording, e.g. for an aggregate of several habits. */
  describePoint?: (point: GraphPoint, index: number) => PointText;
  /** Replaces the default single-habit legend. */
  legend?: ReactNode;
  /** Replaces the default caption sentence. */
  captionNote?: string;
}

export interface PointText {
  head: string;
  body: string;
  aria: string;
}

class Boundary extends Component<{ fallback: ReactNode; onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function GraphLegend() {
  return (
    <ul className="legend" aria-label="Legend">
      <li><OutcomeGlyph outcome="good" /> <span>Good day <b>+1</b> · step up</span></li>
      <li><OutcomeGlyph outcome="slip" /> <span>Slip-up <b>−1</b> · step down</span></li>
      <li><OutcomeGlyph outcome="missed" /> <span>Missed check-in <b>0</b> · stays level</span></li>
    </ul>
  );
}

export default function StaircaseGraph({
  points,
  habitName,
  illustrative = false,
  config,
  prefer2D = false,
  stageHeight,
  headingId,
  describePoint,
  legend,
  captionNote,
}: StaircaseGraphProps) {
  const cfg = useMemo(() => ({ ...DEFAULT_GRAPH_CONFIG, ...config }), [config]);
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(() => hasWebGL());
  const [crashed, setCrashed] = useState(false);
  const [view, setView] = useState<"3d" | "2d">(prefer2D ? "2d" : "3d");
  const [picked, setSelected] = useState<number | null>(null);
  // Default to the latest day; clamp if the data shrinks.
  const selected = points.length ? Math.min(picked ?? points.length - 1, points.length - 1) : null;
  const stripRef = useRef<HTMLDivElement>(null);

  const use3D = view === "3d" && webgl && !crashed;
  const summary = useMemo(() => summarizePoints(points), [points]);
  const active = selected !== null ? points[selected] : undefined;
  const activeText = active && selected !== null ? describePoint?.(active, selected) : undefined;

  const onStripKey = useCallback(
    (e: React.KeyboardEvent) => {
      const keys: Record<string, number> = {
        ArrowRight: 1, ArrowLeft: -1, ArrowUp: 1, ArrowDown: -1,
      };
      let next: number | null = null;
      if (e.key in keys) next = (selected ?? 0) + keys[e.key]!;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = points.length - 1;
      if (next === null) return;
      e.preventDefault();
      next = Math.max(0, Math.min(points.length - 1, next));
      setSelected(next);
      stripRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
    },
    [selected, points.length],
  );

  const svgScene = (
    <StaircaseSvg points={points} config={cfg} selectedIndex={selected} onSelect={setSelected} className="stage-svg" />
  );

  return (
    <figure className="graph" aria-labelledby={headingId}>
      <div className="graph-bar">
        <div className="graph-title">
          <span className="eyebrow">{habitName}</span>
          {illustrative && <span className="chip chip-demo">Illustrative demo data</span>}
        </div>
        {webgl && !crashed && (
          <div className="seg" role="group" aria-label="Graph view">
            <button type="button" aria-pressed={view === "3d"} onClick={() => setView("3d")}>3D</button>
            <button type="button" aria-pressed={view === "2d"} onClick={() => setView("2d")}>2D</button>
          </div>
        )}
      </div>

      <div className="stage" style={stageHeight ? { height: stageHeight } : undefined}>
        <div className="stage-scroll" tabIndex={0} role="group" aria-label="Staircase graph; scroll sideways on small screens">
        <div className="stage-inner">
        {use3D ? (
          <Boundary fallback={svgScene} onError={() => setCrashed(true)}>
            <Suspense fallback={svgScene}>
              <Staircase3D
                points={points}
                config={cfg}
                selectedIndex={selected}
                onSelect={setSelected}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </Boundary>
        ) : (
          svgScene
        )}
        </div>
        </div>
        <span className="axis axis-y">Rating ↑</span>
        <span className="axis axis-x">Time →</span>
      </div>

      <p className="sr-only">{summary}</p>

      <div className="detail" aria-live="polite">
        {active ? (
          <>
            <OutcomeGlyph outcome={active.outcome} large />
            <div>
              <p className="detail-head">
                <time dateTime={active.date}>{formatDate(active.date)}</time> · {activeText?.head ?? OUTCOME_LABEL[active.outcome]}
              </p>
              {activeText ? (
                <p className="detail-body">
                  Rating {active.previousRating} → <b>{active.rating}</b>. {activeText.body}
                </p>
              ) : (
                <p className="detail-body">
                  Rating {active.previousRating} → <b>{active.rating}</b>
                  {active.delta !== 0 && <> ({active.delta > 0 ? "+1" : "−1"})</>}. {describeOutcome(active.outcome)}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="detail-body">Select a block or day to see details.</p>
        )}
      </div>

      <div
        className="strip"
        ref={stripRef}
        role="group"
        aria-label={`${habitName} days. Use arrow keys to move between days.`}
        onKeyDown={onStripKey}
      >
        {points.map((p, i) => (
          <button
            key={p.date}
            type="button"
            className={`strip-day outcome-${p.outcome}`}
            aria-pressed={selected === i}
            aria-label={describePoint ? describePoint(p, i).aria : blockAriaLabel(p, habitName)}
            tabIndex={selected === i || (selected === null && i === 0) ? 0 : -1}
            onClick={() => setSelected(i)}
          >
            <OutcomeGlyph outcome={p.outcome} />
            <span>{Number(p.date.slice(8))}</span>
          </button>
        ))}
      </div>

      <figcaption className="graph-cap">
        {legend ?? <GraphLegend />}
        <p className="cap-note">
          {illustrative ? "Sample data for illustration. " : ""}
          {captionNote ?? "Each day is one block moving along the time axis; its height is your running rating after that day."}
        </p>
      </figcaption>
    </figure>
  );
}

function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
