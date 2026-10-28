# ROOTED --- Data and Graph Rules

## 1. Types

``` ts
export type CheckInOutcome = "good" | "slip" | "missed";

export interface Habit {
  id: string;
  name: string;
  category?: string;
  description?: string;
  createdAt: string; // ISO date/time
  active: boolean;
}

export interface DailyCheckIn {
  habitId: string;
  date: string; // Local calendar date: YYYY-MM-DD
  outcome: CheckInOutcome;
  note?: string;
}

export interface GraphPoint {
  habitId: string;
  date: string;
  outcome: CheckInOutcome;
  delta: -1 | 0 | 1;
  rating: number;
}
```

Do not collect or require notes. If notes are implemented, keep them
optional and local to the prototype.

## 2. Score calculation

For each habit, order dates chronologically. Start from a configurable
baseline, default `0`.

``` ts
export function outcomeDelta(outcome: CheckInOutcome): -1 | 0 | 1 {
  if (outcome === "good") return 1;
  if (outcome === "slip") return -1;
  return 0;
}

export function buildGraphPoints(
  habitId: string,
  checkIns: DailyCheckIn[],
  baseline = 0
): GraphPoint[] {
  const sorted = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));
  let rating = baseline;

  return sorted.map((checkIn) => {
    const delta = outcomeDelta(checkIn.outcome);
    rating += delta;
    return {
      habitId,
      date: checkIn.date,
      outcome: checkIn.outcome,
      delta,
      rating,
    };
  });
}
```

## 3. Missing check-ins

A missing record and an explicit `missed` outcome should both create a
flat position if the timeline displays every calendar day. Do not
silently convert missing records into `slip`.

If displaying a continuous calendar timeline, create an
`unknown`/unrecorded display state internally for dates without
check-ins. Its delta is zero and its block color is neutral. If you
extend the domain type, keep the distinction between "user explicitly
checked in as missed" and "no check-in exists."

Suggested rendering type:

``` ts
export type DisplayOutcome = "good" | "slip" | "missed" | "unrecorded";
```

Both `missed` and `unrecorded` have delta `0`, but the tooltip copy
differs: - `missed`: "Missed check-in --- score unchanged." -
`unrecorded`: "No check-in recorded --- score unchanged."

## 4. Geometry semantics

-   X position is chronological index/date.
-   Vertical world position is the cumulative rating.
-   Every day advances to the next X position.
-   A block is a consistent-sized cube/prism; it is not a bar whose
    height encodes the daily outcome.
-   The staircase elevation is the score after applying that day's
    delta.
-   The block's outcome color describes the transition that produced the
    new position.
-   For a 2D fallback, use isometric CSS/SVG blocks or a line/step
    visualization that preserves the same data semantics.
-   A tooltip should include date, outcome, score before, and score
    after.
-   Keep graph rendering independent from score calculation. Unit-test
    the score logic separately.

## 5. Demo data

Create demo fixtures with a mixed sequence of good, slip, missed, and
unrecorded days. Use stable dates so screenshots and tests are
deterministic. Label the data as illustrative. Never imply the demo
numbers are real user activity.

## 6. Unit tests to include

-   All-good sequence increases by one per day.
-   Slip decreases by one and does not erase history.
-   Missed check-in preserves the score.
-   Unrecorded dates preserve score.
-   Outcomes are calculated independently per habit.
-   Input arrays are not mutated.
-   Dates are sorted chronologically before scoring.
-   Empty input returns an empty point list.
