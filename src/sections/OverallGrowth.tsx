import { useMemo } from "react";
import StaircaseGraph, { type PointText } from "../components/graph/StaircaseGraph";
import { OutcomeGlyph } from "../components/graph/OutcomeGlyph";
import { HabitIcon } from "../components/HabitIcon";
import { buildCombinedPoints, formatSigned, summarizeGrowth } from "../domain/score";
import type { CombinedPoint, GraphPoint } from "../domain/types";
import type { DemoHabit } from "../data/demo";

/** Combined totals reach several levels per day, so blocks are shorter than the single-habit default. */
const COMBINED_GRAPH_CONFIG = { blockHeight: 0.28 };

interface OverallGrowthProps {
  habits: DemoHabit[];
  pointsById: Record<string, GraphPoint[]>;
  /** True while showing demo data. */
  illustrative: boolean;
}

function describeCombined(p: CombinedPoint, nameById: Record<string, string>): PointText {
  const parts = [
    p.good ? `${p.good} good` : "",
    p.slip ? `${p.slip} slip-up${p.slip > 1 ? "s" : ""}` : "",
    p.flat ? `${p.flat} unchanged` : "",
  ].filter(Boolean);
  const breakdown = Object.entries(p.perHabit)
    .filter(([, d]) => d !== 0)
    .map(([id, d]) => `${nameById[id] ?? id} ${formatSigned(d)}`)
    .join(", ");
  const net = formatSigned(p.delta);
  return {
    head: `Net ${net}`,
    body: `${parts.join(", ")}${breakdown ? ` (${breakdown})` : ""}. Each habit's own graph is unchanged.`,
    aria: `${p.date}: net ${net} across habits. Total ${p.previousRating} to ${p.rating}.`,
  };
}

function CombinedLegend() {
  return (
    <ul className="legend" aria-label="Legend">
      <li><OutcomeGlyph outcome="good" /> <span>Net gain day <b>+N</b> · step up by N</span></li>
      <li><OutcomeGlyph outcome="slip" /> <span>Net dip day <b>−N</b> · step down by N</span></li>
      <li><OutcomeGlyph outcome="missed" /> <span>Even day <b>0</b> · stays level</span></li>
    </ul>
  );
}

export function OverallGrowth({ habits, pointsById, illustrative }: OverallGrowthProps) {
  const series = useMemo(() => habits.map((h) => pointsById[h.id] ?? []).filter((p) => p.length > 0), [habits, pointsById]);
  const combined = useMemo(() => buildCombinedPoints(series), [series]);
  const growth = useMemo(() => summarizeGrowth(combined, series), [combined, series]);
  const nameById = useMemo(() => Object.fromEntries(habits.map((h) => [h.id, h.name])), [habits]);

  return (
    <section className="section container" id="growth" aria-labelledby="growth-title">
      <div className="section-head">
        <p className="eyebrow">All together</p>
        <h2 id="growth-title">Your overall growth.</h2>
        <p className="lede">
          Add up every habit you chose. Each day&rsquo;s net is the sum of its changes: gain +1 on four goals and
          slip −1 on one, and that day moves you up by 3.
        </p>
      </div>

      {combined.length === 0 ? (
        <p className="lede">Select at least one habit below to see your combined growth.</p>
      ) : (
        <>
          <dl className="growth-stats">
            <div className="card">
              <dt>Total growth</dt>
              <dd className="growth-big">{formatSigned(growth.totalNet)}</dd>
              <dd className="growth-sub">across {growth.habitCount} habit{growth.habitCount > 1 ? "s" : ""}</dd>
            </div>
            <div className="card">
              <dt>Days up</dt>
              <dd className="growth-big">{growth.daysUp}</dd>
            </div>
            <div className="card">
              <dt>Days down</dt>
              <dd className="growth-big">{growth.daysDown}</dd>
            </div>
            <div className="card">
              <dt>Days level</dt>
              <dd className="growth-big">{growth.daysLevel}</dd>
            </div>
          </dl>

          <StaircaseGraph
            key={habits.map((h) => h.id).join("|")}
            points={combined}
            habitName="Overall growth"
            illustrative={illustrative}
            headingId="growth-title"
            stageHeight="clamp(300px, 52vw, 520px)"
            config={COMBINED_GRAPH_CONFIG}
            describePoint={(p, i) => describeCombined(combined[i] ?? (p as CombinedPoint), nameById)}
            legend={<CombinedLegend />}
            captionNote="Each day is one block; its height is your combined running total after that day's net."
          />

          <h3 className="growth-sub-head">What each habit added</h3>
          <ul className="contrib">
            {habits.map((h, i) => {
              const g = growth.perHabit[i];
              if (!g) return null;
              return (
                <li key={h.id} className="card contrib-row">
                  <HabitIcon name={h.icon} size={18} />
                  <span className="contrib-name">{h.name}</span>
                  <span className="contrib-detail">{g.good} good · {g.slip} slip-ups</span>
                  <b className="contrib-net">{formatSigned(g.net)}</b>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
