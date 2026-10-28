import { HabitIcon } from "./HabitIcon";
import StaircaseSvg from "./graph/StaircaseSvg";
import { DEFAULT_GRAPH_CONFIG } from "./graph/graphConfig";
import { currentRating } from "../domain/score";
import type { HabitIconName } from "../data/demo";
import type { GraphPoint } from "../domain/types";
import { MAX_ACTIVE_HABITS } from "../domain/score";

export interface PhoneRow {
  id: string;
  name: string;
  icon: HabitIconName;
  points: GraphPoint[];
}

const MINI_CONFIG = { ...DEFAULT_GRAPH_CONFIG, blockDepth: 0.9, gap: 0.12 };
const MINI_DAYS = 14;

export function PhoneMockup({ rows }: { rows: PhoneRow[] }) {
  return (
    <div className="phone" role="group" aria-label="ROOTED app preview, sample data">
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-screen">
        <div className="phone-head">
          <div>
            <p className="phone-kicker">Today</p>
            <p className="phone-title">Your habits</p>
          </div>
          <span className="phone-count">
            {rows.length} of {MAX_ACTIVE_HABITS}
          </span>
        </div>
        <ul className="phone-list">
          {rows.length === 0 && <li className="phone-empty">Pick up to five habits below to see them here.</li>}
          {rows.map((r) => {
            const rating = currentRating(r.points);
            const last = r.points[r.points.length - 1];
            const trend = !last
              ? "No check-ins yet"
              : last.delta > 0
                ? "Up 1 today"
                : last.delta < 0
                  ? "Down 1 today"
                  : "Level today";
            return (
              <li key={r.id} className="phone-row">
                <span className="phone-ico"><HabitIcon name={r.icon} size={18} /></span>
                <div className="phone-meta">
                  <span className="phone-name">{r.name}</span>
                  <span className="phone-trend">{trend}</span>
                </div>
                <div className="phone-mini">
                  {r.points.length > 0 && (
                    <StaircaseSvg points={r.points.slice(-MINI_DAYS)} config={MINI_CONFIG} compact />
                  )}
                </div>
                <span className="phone-rating" aria-label={`Rating ${rating}`}>{rating}</span>
              </li>
            );
          })}
        </ul>
        <p className="phone-foot">Sample data · each habit has its own staircase</p>
      </div>
    </div>
  );
}
