import { useState } from "react";
import { OutcomeGlyph } from "../components/graph/OutcomeGlyph";
import { HabitIcon } from "../components/HabitIcon";
import type { DemoHabit } from "../data/demo";
import { todayLocal } from "../domain/dates";
import type { CheckInOutcome, DailyCheckIn } from "../domain/types";

const CHOICES: ReadonlyArray<{ outcome: CheckInOutcome; label: string; hint: string }> = [
  { outcome: "good", label: "Good day", hint: "+1" },
  { outcome: "slip", label: "Slip-up", hint: "−1" },
  { outcome: "missed", label: "Missed", hint: "no change" },
];

interface CheckInProps {
  habits: DemoHabit[];
  checkIns: readonly DailyCheckIn[];
  onSet: (habitId: string, date: string, outcome: CheckInOutcome | null) => void;
  error: string | null;
  onDismissError: () => void;
}

export function CheckIn({ habits, checkIns, onSet, error, onDismissError }: CheckInProps) {
  const today = todayLocal();
  const [date, setDate] = useState(today);
  const outcomeFor = (habitId: string) => checkIns.find((c) => c.habitId === habitId && c.date === date)?.outcome;

  return (
    <section className="section container" id="checkin" aria-labelledby="checkin-title">
      <div className="section-head">
        <p className="eyebrow">Daily check-in</p>
        <h2 id="checkin-title">How did the day go?</h2>
        <p className="lede">
          Answer for each habit in your own terms. Skipping a day or choosing Missed leaves that habit level
          &mdash; it isn&rsquo;t a failure.
        </p>
      </div>

      <div className="checkin-date">
        <label htmlFor="checkin-date">Day</label>
        <input
          id="checkin-date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />
        {date !== today && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDate(today)}>
            Back to today
          </button>
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}{" "}
          <button type="button" className="link-btn" onClick={onDismissError}>
            Dismiss
          </button>
        </p>
      )}

      {habits.length === 0 ? (
        <p className="lede">Choose up to five habits below, then check in here.</p>
      ) : (
        <ul className="checkin-list">
          {habits.map((h) => {
            const current = outcomeFor(h.id);
            return (
              <li key={h.id} className="card checkin-row">
                <div className="checkin-habit">
                  <HabitIcon name={h.icon} size={18} />
                  <div>
                    <p className="checkin-name">{h.name}</p>
                    <p className="checkin-def">
                      Good: {h.goodDay}. Slip: {h.slipDay}.
                    </p>
                  </div>
                </div>
                <div className="checkin-choices" role="group" aria-label={`${h.name} on ${date}`}>
                  {CHOICES.map((c) => (
                    <button
                      key={c.outcome}
                      type="button"
                      className={`btn btn-ghost btn-sm choice outcome-${c.outcome}`}
                      aria-pressed={current === c.outcome}
                      onClick={() => onSet(h.id, date, current === c.outcome ? null : c.outcome)}
                    >
                      <OutcomeGlyph outcome={c.outcome} /> {c.label} <span className="choice-hint">{c.hint}</span>
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="fine">Pressing a selected option again clears that day. Your earlier history is never removed.</p>
    </section>
  );
}
