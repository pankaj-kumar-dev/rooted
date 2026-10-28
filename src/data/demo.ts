/**
 * DEMO DATA — illustrative only. Not real user activity.
 * Patterns: g = good, s = slip, m = missed check-in, . = no record.
 */
import type { DailyCheckIn, Habit } from "../domain/types";

export type HabitIconName = "phone" | "glass" | "smoke" | "wave" | "run" | "moon" | "leaf" | "book" | "spark";

export const DEMO_START_DATE = "2025-03-01";
export const DEMO_DAYS = 30;

export const DEMO_LABEL = "Illustrative demo data";

export interface DemoHabit extends Habit {
  icon: HabitIconName;
  /** User-defined meaning of a good day (each person writes their own). */
  goodDay: string;
  slipDay: string;
  pattern: string;
}

const base = { category: "Demo", createdAt: "2025-03-01T08:00:00Z", active: true } as const;

export const DEMO_HABITS: DemoHabit[] = [
  {
    ...base,
    id: "phone",
    name: "Less phone time",
    icon: "phone",
    description: "Screen time under my own limit.",
    goodDay: "Under 2h of screen time",
    slipDay: "Over my limit",
    pattern: "ggsgmggsgg.sggmgggsgsmggggsggg",
  },
  {
    ...base,
    id: "alcohol",
    name: "Alcohol goal",
    icon: "glass",
    description: "Stay within the goal I set.",
    goodDay: "Stayed within my goal",
    slipDay: "Went past my goal",
    pattern: "gggsgmgggsggsmgggggsgmssggggmg",
  },
  {
    ...base,
    id: "cigarettes",
    name: "No cigarettes",
    icon: "smoke",
    description: "A smoke-free day, on my terms.",
    goodDay: "Smoke-free day",
    slipDay: "Had a cigarette",
    pattern: "gmgsgsgsgmgssgggmgsgggsggggmgg",
  },
  {
    ...base,
    id: "anger",
    name: "Anger management",
    icon: "wave",
    description: "Pause before reacting.",
    goodDay: "Paused and responded calmly",
    slipDay: "Reacted in a way I regret",
    pattern: "g.gmgsgg..ggsmgsgggsggsgggmgsg",
  },
  {
    ...base,
    id: "exercise",
    name: "Daily exercise",
    icon: "run",
    description: "Move for at least 20 minutes.",
    goodDay: "20+ minutes of movement",
    slipDay: "Skipped on purpose",
    pattern: "gsgmgggsmmgsggsmggsgsggmgggsgg",
  },
  {
    ...base,
    id: "sleep",
    name: "Sleep by 11pm",
    icon: "moon",
    description: "Lights out on my schedule.",
    goodDay: "In bed by 11pm",
    slipDay: "Stayed up late",
    pattern: "gggmgsgggsgsmgggsggggsgmgggsgg",
  },
  {
    ...base,
    id: "sugar",
    name: "Less sugar",
    icon: "leaf",
    description: "Fewer sweet snacks, my definition.",
    goodDay: "Stayed within my own limit",
    slipDay: "Went past my limit",
    pattern: "gsgsggmggsgsggsgsmgggsgsgggmgg",
  },
  {
    ...base,
    id: "reading",
    name: "Read 15 minutes",
    icon: "book",
    description: "A small daily page habit.",
    goodDay: "Read for 15+ minutes",
    slipDay: "Chose not to read",
    pattern: "ggmgsgsmgggsgmgsgggsggmgggsgsg",
  },
];

const OUTCOME_BY_CHAR = { g: "good", s: "slip", m: "missed" } as const;

function dateAt(offset: number): string {
  const [y, m, d] = DEMO_START_DATE.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + offset)).toISOString().slice(0, 10);
}

/** Pattern → check-ins. '.' produces no record (shows as "no check-in"). */
export function patternToCheckIns(habitId: string, pattern: string): DailyCheckIn[] {
  const out: DailyCheckIn[] = [];
  [...pattern].forEach((ch, i) => {
    if (ch === "g" || ch === "s" || ch === "m") {
      out.push({ habitId, date: dateAt(i), outcome: OUTCOME_BY_CHAR[ch] });
    }
  });
  return out;
}

export const DEMO_CHECK_INS: Record<string, DailyCheckIn[]> = Object.fromEntries(
  DEMO_HABITS.map((h) => [h.id, patternToCheckIns(h.id, h.pattern)]),
);

export const DEMO_END_DATE = dateAt(DEMO_DAYS - 1);

/** Detailed hero/showcase sequence with every transition type. */
export const SHOWCASE_HABIT_ID = "anger";
