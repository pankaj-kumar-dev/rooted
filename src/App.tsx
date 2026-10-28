import { useCallback, useMemo, useState } from "react";
import { Nav } from "./components/Nav";
import { PrototypeModal } from "./components/WaitlistModal";
import type { PhoneRow } from "./components/PhoneMockup";
import { AuthModal } from "./components/AuthModal";
import { OverallGrowth } from "./sections/OverallGrowth";
import { CheckIn } from "./sections/CheckIn";
import { Closing, Faq, Footer, HabitPicker, Hero, HowItWorks, Journey, Progress, Why } from "./sections/Sections";
import { DEMO_CHECK_INS, DEMO_END_DATE, DEMO_HABITS, DEMO_START_DATE, type DemoHabit } from "./data/demo";
import { buildTimeline, toggleHabit } from "./domain/score";
import { todayLocal } from "./domain/dates";
import { useAuth } from "./auth/AuthContext";
import { useUserData } from "./hooks/useUserData";
import { buildUserTimelines, toDemoHabit } from "./data/userHabits";
import type { GraphPoint } from "./domain/types";

const DEFAULT_SELECTED = DEMO_HABITS.slice(0, 5).map((h) => h.id);

export default function App() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [custom, setCustom] = useState<DemoHabit[]>([]);
  const [modal, setModal] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const { configured, user, signInWithEmail, signOut } = useAuth();
  const signedIn = user !== null;
  const data = useUserData(user?.id ?? null);
  const today = useMemo(() => todayLocal(), []);

  // Each habit's staircase is computed from its own check-ins only.
  const demoPointsById = useMemo(() => {
    const out: Record<string, GraphPoint[]> = {};
    for (const h of DEMO_HABITS) {
      out[h.id] = buildTimeline(h.id, DEMO_CHECK_INS[h.id] ?? [], DEMO_START_DATE, DEMO_END_DATE);
    }
    return out;
  }, []);

  const allHabits = useMemo(() => [...DEMO_HABITS, ...custom], [custom]);
  const demoActive = useMemo(
    () => selected.map((id) => allHabits.find((h) => h.id === id)).filter((h): h is DemoHabit => Boolean(h)),
    [selected, allHabits],
  );

  // Signed in: the user's own saved habits and check-ins. Signed out: demo data.
  const userActive = useMemo(() => data.activeHabits.map(toDemoHabit), [data.activeHabits]);
  const userPointsById = useMemo(
    () => buildUserTimelines(userActive.map((h) => h.id), data.checkIns, today),
    [userActive, data.checkIns, today],
  );
  const activeHabits = signedIn ? userActive : demoActive;
  const pointsById = signedIn ? userPointsById : demoPointsById;
  const rows: PhoneRow[] = activeHabits.map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    points: pointsById[h.id] ?? [],
  }));
  const journeyHabits = activeHabits.filter((h) => (pointsById[h.id]?.length ?? 0) > 0);

  const { togglePreset, toggleHabitById, addCustom } = data;
  const onToggle = useCallback(
    (id: string) => {
      if (!signedIn) return setSelected((s) => toggleHabit(s, id));
      const preset = DEMO_HABITS.find((h) => h.id === id);
      void (preset ? togglePreset(preset) : toggleHabitById(id));
    },
    [signedIn, togglePreset, toggleHabitById],
  );
  const onAddCustom = useCallback(({ name, goodDay, slipDay }: { name: string; goodDay: string; slipDay: string }) => {
    if (signedIn) {
      void addCustom({ name, goodDay, slipDay });
      return;
    }
    const id = `custom-${Date.now()}`;
    setCustom((c) => [
      ...c,
      {
        id,
        name,
        icon: "spark",
        description: "Your own goal — you define success.",
        goodDay: goodDay || "Your definition",
        slipDay: slipDay || "Your definition",
        pattern: "",
        category: "Custom",
        createdAt: new Date().toISOString(),
        active: true,
      },
    ]);
    setSelected((s) => toggleHabit(s, id));
  }, [signedIn, addCustom]);

  const pickerSelected = signedIn ? data.activeHabits.map((h) => h.presetKey ?? h.id) : selected;
  const pickerCustom = useMemo(
    () => (signedIn ? data.habits.filter((h) => h.presetKey === null).map(toDemoHabit) : custom),
    [signedIn, data.habits, custom],
  );

  const onStart = () => {
    if (signedIn) document.getElementById("checkin")?.scrollIntoView();
    else if (configured) setAuthOpen(true);
    else setModal(true);
  };

  const goDemo = () => {
    setModal(false);
    document.getElementById("demo")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav
        onStart={onStart}
        authEnabled={configured}
        email={user?.email ?? null}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={() => void signOut()}
      />
      <main id="main">
        <Hero rows={rows} onStart={onStart} authEnabled={configured} />
        <Why />
        {signedIn && (
          <>
            {data.loading && <p className="container" role="status">Loading your habits…</p>}
            <CheckIn
              habits={userActive}
              checkIns={data.checkIns}
              onSet={(habitId, date, outcome) => void data.setOutcome(habitId, date, outcome)}
              error={data.error}
              onDismissError={data.dismissError}
            />
          </>
        )}
        <Journey habits={journeyHabits} pointsById={pointsById} illustrative={!signedIn} />
        <OverallGrowth habits={journeyHabits} pointsById={pointsById} illustrative={!signedIn} />
        <HabitPicker
          options={DEMO_HABITS}
          selected={pickerSelected}
          onToggle={onToggle}
          custom={pickerCustom}
          onAddCustom={onAddCustom}
          persisted={signedIn}
          error={signedIn ? data.error : null}
        />
        <HowItWorks />
        <Progress />
        <Faq />
        <Closing onStart={onStart} />
      </main>
      <Footer />
      <AuthModal open={authOpen && !signedIn} onClose={() => setAuthOpen(false)} onSubmit={signInWithEmail} />
      <PrototypeModal open={modal} onClose={() => setModal(false)} onExplore={goDemo} />
    </>
  );
}
