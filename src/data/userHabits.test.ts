import { describe, expect, it } from "vitest";
import { shiftDate, todayLocal } from "../domain/dates";
import { buildCombinedPoints } from "../domain/score";
import { buildUserTimelines, newHabitToRow, rowToCheckIn, rowToHabit, toDemoHabit } from "./userHabits";

describe("dates", () => {
  it("formats local today and shifts across month boundaries", () => {
    expect(todayLocal(new Date(2025, 2, 5))).toBe("2025-03-05");
    expect(shiftDate("2025-03-01", -1)).toBe("2025-02-28");
    expect(shiftDate("2025-12-31", 1)).toBe("2026-01-01");
  });
});

describe("row mappers", () => {
  const row = {
    id: "h1",
    preset_key: "phone",
    name: "Less phone time",
    category: "Demo",
    icon: "phone",
    description: null,
    good_day: "Under 2h",
    slip_day: "Over 4h",
    active: true,
    created_at: "2025-03-01T08:00:00Z",
  };

  it("maps a habit row and falls back to a safe icon", () => {
    expect(rowToHabit(row)).toMatchObject({ id: "h1", presetKey: "phone", goodDay: "Under 2h", icon: "phone" });
    expect(rowToHabit({ ...row, icon: "unknown" }).icon).toBe("spark");
  });

  it("round-trips a new habit to insert columns without user_id", () => {
    const insert = newHabitToRow({
      presetKey: null, name: "Cook", category: "Custom", icon: "spark", description: null, goodDay: "a", slipDay: "b",
    });
    expect(insert).toMatchObject({ name: "Cook", good_day: "a", slip_day: "b" });
    expect(insert).not.toHaveProperty("user_id");
  });

  it("adapts a user habit for shared components with fallback definitions", () => {
    const h = toDemoHabit(rowToHabit({ ...row, good_day: "", slip_day: "" }));
    expect(h.goodDay).toBe("Your definition");
    expect(h.pattern).toBe("");
  });

  it("rejects unknown outcomes from the database", () => {
    expect(rowToCheckIn({ habit_id: "h1", date: "2025-03-01", outcome: "good", note: null })).toEqual({
      habitId: "h1", date: "2025-03-01", outcome: "good",
    });
    expect(rowToCheckIn({ habit_id: "h1", date: "2025-03-01", outcome: "bogus", note: null })).toBeNull();
  });
});

describe("buildUserTimelines", () => {
  const today = "2025-03-30";
  const ci = (habitId: string, date: string, outcome: "good" | "slip" | "missed") => ({ habitId, date, outcome });

  it("gives every habit the same aligned range and treats no check-in as unchanged", () => {
    const t = buildUserTimelines(["a", "b"], [ci("a", "2025-03-30", "good")], today);
    expect(t.a).toHaveLength(30);
    expect(t.b).toHaveLength(30);
    expect(t.a![29]!.rating).toBe(1);
    expect(t.b!.every((p) => p.rating === 0 && p.outcome === "unrecorded")).toBe(true);
  });

  it("extends the range back to an older check-in and keeps habits independent", () => {
    const t = buildUserTimelines(["a", "b"], [ci("a", "2025-02-10", "slip"), ci("b", "2025-03-29", "good")], today);
    expect(t.a![0]!.date).toBe("2025-02-10");
    expect(t.b![0]!.date).toBe("2025-02-10");
    expect(t.a![t.a!.length - 1]!.rating).toBe(-1);
    expect(t.b![t.b!.length - 1]!.rating).toBe(1);
  });

  it("ignores check-ins for other habits and future dates, and feeds the combined view", () => {
    const t = buildUserTimelines(
      ["a"],
      [ci("a", "2025-03-29", "good"), ci("zzz", "2025-03-29", "good"), ci("a", "2025-04-02", "good")],
      today,
    );
    expect(t.a![t.a!.length - 1]!.rating).toBe(1);
    expect(buildCombinedPoints([t.a!]).at(-1)!.rating).toBe(1);
  });
});
