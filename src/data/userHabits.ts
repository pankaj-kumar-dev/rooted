import type { DailyCheckIn, GraphPoint } from "../domain/types";
import { shiftDate } from "../domain/dates";
import { buildTimeline } from "../domain/score";
import type { DemoHabit, HabitIconName } from "./demo";

/** A habit owned by a signed-in user. `presetKey` links it to a preset card, if it came from one. */
export interface UserHabit {
  id: string;
  presetKey: string | null;
  name: string;
  category: string | null;
  icon: HabitIconName;
  description: string | null;
  goodDay: string;
  slipDay: string;
  active: boolean;
  createdAt: string;
}

export interface NewHabit {
  presetKey: string | null;
  name: string;
  category: string | null;
  icon: HabitIconName;
  description: string | null;
  goodDay: string;
  slipDay: string;
}

export interface HabitRow {
  id: string;
  preset_key: string | null;
  name: string;
  category: string | null;
  icon: string;
  description: string | null;
  good_day: string;
  slip_day: string;
  active: boolean;
  created_at: string;
}

export interface CheckInRow {
  habit_id: string;
  date: string;
  outcome: string;
  note: string | null;
}

const ICONS: readonly HabitIconName[] = ["phone", "glass", "smoke", "wave", "run", "moon", "leaf", "book", "spark"];
const isIcon = (v: string): v is HabitIconName => (ICONS as readonly string[]).includes(v);

export function rowToHabit(r: HabitRow): UserHabit {
  return {
    id: r.id,
    presetKey: r.preset_key,
    name: r.name,
    category: r.category,
    icon: isIcon(r.icon) ? r.icon : "spark",
    description: r.description,
    goodDay: r.good_day,
    slipDay: r.slip_day,
    active: r.active,
    createdAt: r.created_at,
  };
}

export function newHabitToRow(h: NewHabit) {
  return {
    preset_key: h.presetKey,
    name: h.name,
    category: h.category,
    icon: h.icon,
    description: h.description,
    good_day: h.goodDay,
    slip_day: h.slipDay,
  };
}

export function rowToCheckIn(r: CheckInRow): DailyCheckIn | null {
  if (r.outcome !== "good" && r.outcome !== "slip" && r.outcome !== "missed") return null;
  return { habitId: r.habit_id, date: r.date, outcome: r.outcome, ...(r.note ? { note: r.note } : {}) };
}

/** Adapter so existing components (graph, picker, journey) can render a user's habit. */
export function toDemoHabit(h: UserHabit): DemoHabit {
  return {
    id: h.id,
    name: h.name,
    icon: h.icon,
    category: h.category ?? "Custom",
    description: h.description ?? "Your own goal — you define success.",
    goodDay: h.goodDay || "Your definition",
    slipDay: h.slipDay || "Your definition",
    pattern: "",
    createdAt: h.createdAt,
    active: h.active,
  };
}

/**
 * One continuous timeline per habit over a shared date range, so habits stay aligned
 * for the combined view. Range: at least `minDays` back from `today`, or earlier if a check-in is older.
 * Each habit's points use only its own check-ins.
 */
export function buildUserTimelines(
  habitIds: readonly string[],
  checkIns: readonly DailyCheckIn[],
  today: string,
  minDays = 30,
): Record<string, GraphPoint[]> {
  const ids = new Set(habitIds);
  const mine = checkIns.filter((c) => ids.has(c.habitId) && c.date <= today);
  let start = shiftDate(today, -(minDays - 1));
  for (const c of mine) if (c.date < start) start = c.date;

  const out: Record<string, GraphPoint[]> = {};
  for (const id of habitIds) {
    out[id] = buildTimeline(id, mine.filter((c) => c.habitId === id), start, today);
  }
  return out;
}
