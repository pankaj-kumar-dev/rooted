import type { SupabaseClient } from "@supabase/supabase-js";
import type { CheckInOutcome, DailyCheckIn } from "../domain/types";
import {
  newHabitToRow,
  rowToCheckIn,
  rowToHabit,
  type CheckInRow,
  type HabitRow,
  type NewHabit,
  type UserHabit,
} from "./userHabits";

/** Storage boundary for a signed-in user's data. Tests can supply an in-memory fake. */
export interface HabitRepo {
  listHabits(): Promise<UserHabit[]>;
  createHabit(input: NewHabit): Promise<UserHabit>;
  /** Archive (false) or reactivate (true). Habits and their history are never deleted. */
  setHabitActive(id: string, active: boolean): Promise<UserHabit>;
  listCheckIns(): Promise<DailyCheckIn[]>;
  setCheckIn(habitId: string, date: string, outcome: CheckInOutcome): Promise<void>;
  clearCheckIn(habitId: string, date: string): Promise<void>;
}

// Errors are deliberately generic: habit names and notes never go into messages or logs.
function fail(what: string): never {
  throw new Error(`Could not ${what}.`);
}

export function supabaseRepo(client: SupabaseClient): HabitRepo {
  return {
    async listHabits() {
      const { data, error } = await client.from("habits").select("*").order("created_at");
      if (error) fail("load habits");
      return (data as HabitRow[]).map(rowToHabit);
    },
    async createHabit(input) {
      const { data, error } = await client.from("habits").insert(newHabitToRow(input)).select().single();
      if (error) fail("add habit");
      return rowToHabit(data as HabitRow);
    },
    async setHabitActive(id, active) {
      const { data, error } = await client.from("habits").update({ active }).eq("id", id).select().single();
      if (error) fail("update habit");
      return rowToHabit(data as HabitRow);
    },
    async listCheckIns() {
      const { data, error } = await client.from("check_ins").select("habit_id,date,outcome,note");
      if (error) fail("load check-ins");
      return (data as CheckInRow[]).map(rowToCheckIn).filter((c): c is DailyCheckIn => c !== null);
    },
    async setCheckIn(habitId, date, outcome) {
      const { error } = await client
        .from("check_ins")
        .upsert(
          { habit_id: habitId, date, outcome, updated_at: new Date().toISOString() },
          { onConflict: "habit_id,date" },
        );
      if (error) fail("save check-in");
    },
    async clearCheckIn(habitId, date) {
      const { error } = await client.from("check_ins").delete().eq("habit_id", habitId).eq("date", date);
      if (error) fail("clear check-in");
    },
  };
}
