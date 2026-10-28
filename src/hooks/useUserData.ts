import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { supabaseRepo, type HabitRepo } from "../data/repo";
import type { DemoHabit } from "../data/demo";
import type { UserHabit } from "../data/userHabits";
import type { CheckInOutcome, DailyCheckIn } from "../domain/types";
import { MAX_ACTIVE_HABITS } from "../domain/score";

interface Loaded {
  userId: string;
  habits: UserHabit[];
  checkIns: DailyCheckIn[];
}

export interface CustomInput {
  name: string;
  goodDay: string;
  slipDay: string;
}

const upsertCheckIn = (list: DailyCheckIn[], next: DailyCheckIn) => [
  ...list.filter((c) => !(c.habitId === next.habitId && c.date === next.date)),
  next,
];
const removeCheckIn = (list: DailyCheckIn[], habitId: string, date: string) =>
  list.filter((c) => !(c.habitId === habitId && c.date === date));

/** A signed-in user's habits and check-ins, backed by the database. Inert when `userId` is null. */
export function useUserData(userId: string | null, repoOverride?: HabitRepo) {
  const repo = useMemo<HabitRepo | null>(
    () => repoOverride ?? (supabase ? supabaseRepo(supabase) : null),
    [repoOverride],
  );
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !repo) return;
    let alive = true;
    Promise.all([repo.listHabits(), repo.listCheckIns()])
      .then(([habits, checkIns]) => {
        if (alive) setLoaded({ userId, habits, checkIns });
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Could not load your data.");
      });
    return () => {
      alive = false;
    };
  }, [userId, repo]);

  // Data from a previous account is never shown to a different one.
  const current = loaded && loaded.userId === userId ? loaded : null;
  const habits = useMemo(() => current?.habits ?? [], [current]);
  const checkIns = useMemo(() => current?.checkIns ?? [], [current]);
  const activeHabits = useMemo(() => habits.filter((h) => h.active), [habits]);
  const loading = Boolean(userId && repo && !current && !error);

  const patch = useCallback(
    (fn: (l: Loaded) => Loaded) => setLoaded((l) => (l && l.userId === userId ? fn(l) : l)),
    [userId],
  );

  const run = useCallback(async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }, []);

  const saveHabitState = useCallback(
    (saved: UserHabit) =>
      patch((l) => ({
        ...l,
        habits: l.habits.some((h) => h.id === saved.id)
          ? l.habits.map((h) => (h.id === saved.id ? saved : h))
          : [...l.habits, saved],
      })),
    [patch],
  );

  const setActive = useCallback(
    (habit: UserHabit, active: boolean) =>
      run(async () => {
        if (!repo) return;
        if (active && activeHabits.length >= MAX_ACTIVE_HABITS) {
          throw new Error("You can track up to five habits. Pause one to add another.");
        }
        saveHabitState(await repo.setHabitActive(habit.id, active));
      }),
    [repo, run, activeHabits.length, saveHabitState],
  );

  /** Toggle a preset card: reactivate its saved habit, pause it, or create it the first time. */
  const togglePreset = useCallback(
    (preset: DemoHabit) => {
      const existing = habits.find((h) => h.presetKey === preset.id);
      if (existing) return setActive(existing, !existing.active);
      return run(async () => {
        if (!repo) return;
        if (activeHabits.length >= MAX_ACTIVE_HABITS) {
          throw new Error("You can track up to five habits. Pause one to add another.");
        }
        saveHabitState(
          await repo.createHabit({
            presetKey: preset.id,
            name: preset.name,
            category: preset.category ?? null,
            icon: preset.icon,
            description: preset.description ?? null,
            goodDay: preset.goodDay,
            slipDay: preset.slipDay,
          }),
        );
      });
    },
    [habits, activeHabits.length, repo, run, setActive, saveHabitState],
  );

  const toggleHabitById = useCallback(
    (id: string) => {
      const habit = habits.find((h) => h.id === id);
      return habit ? setActive(habit, !habit.active) : Promise.resolve();
    },
    [habits, setActive],
  );

  const addCustom = useCallback(
    ({ name, goodDay, slipDay }: CustomInput) =>
      run(async () => {
        if (!repo) return;
        if (activeHabits.length >= MAX_ACTIVE_HABITS) {
          throw new Error("You can track up to five habits. Pause one to add another.");
        }
        saveHabitState(
          await repo.createHabit({
            presetKey: null,
            name,
            category: "Custom",
            icon: "spark",
            description: null,
            goodDay,
            slipDay,
          }),
        );
      }),
    [repo, run, activeHabits.length, saveHabitState],
  );

  /** Record, change, or (with `null`) clear one day's outcome. Optimistic, rolled back on failure. */
  const setOutcome = useCallback(
    async (habitId: string, date: string, outcome: CheckInOutcome | null) => {
      if (!repo) return;
      const previous = checkIns.find((c) => c.habitId === habitId && c.date === date);
      patch((l) => ({
        ...l,
        checkIns: outcome ? upsertCheckIn(l.checkIns, { habitId, date, outcome }) : removeCheckIn(l.checkIns, habitId, date),
      }));
      setError(null);
      try {
        if (outcome) await repo.setCheckIn(habitId, date, outcome);
        else await repo.clearCheckIn(habitId, date);
      } catch (e) {
        patch((l) => ({
          ...l,
          checkIns: previous ? upsertCheckIn(l.checkIns, previous) : removeCheckIn(l.checkIns, habitId, date),
        }));
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    },
    [repo, checkIns, patch],
  );

  return {
    habits,
    activeHabits,
    checkIns,
    loading,
    error,
    dismissError: () => setError(null),
    togglePreset,
    toggleHabitById,
    addCustom,
    setOutcome,
  };
}
