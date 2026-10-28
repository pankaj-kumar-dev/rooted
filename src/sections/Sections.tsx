import { useState } from "react";
import type { ReactNode } from "react";
import StaircaseGraph from "../components/graph/StaircaseGraph";
import StaircaseSvg from "../components/graph/StaircaseSvg";
import { DEFAULT_GRAPH_CONFIG } from "../components/graph/graphConfig";
import { OutcomeGlyph } from "../components/graph/OutcomeGlyph";
import { PhoneMockup, type PhoneRow } from "../components/PhoneMockup";
import { HabitIcon } from "../components/HabitIcon";
import { Plant } from "../components/Plant";
import { MAX_ACTIVE_HABITS, buildGraphPoints } from "../domain/score";
import { patternToCheckIns, type DemoHabit } from "../data/demo";
import type { GraphPoint } from "../domain/types";

export function Hero({ rows, onStart, authEnabled }: { rows: PhoneRow[]; onStart: () => void; authEnabled: boolean }) {
  return (
    <section className="hero container" id="top" aria-labelledby="hero-title">
      <Plant className="plant plant-hero" />
      <div className="hero-copy">
        <p className="eyebrow">Habit change, observed without shame</p>
        <h1 id="hero-title">
          Break the pattern.
          <br />
          <em>Grow beyond it.</em>
        </h1>
        <p className="lede">
          Choose what you want to change. Track up to five habits. Watch your progress rise, dip, and steady
          out &mdash; one day at a time.
        </p>
        <div className="cta-row">
          <button type="button" className="btn btn-primary" onClick={onStart}>
            Start your journey
          </button>
          <a className="btn btn-ghost" href="#how">
            See how it works
          </a>
        </div>
        <p className="fine">
          {authEnabled
            ? "Web preview · sign in with an email link to save your own check-ins. No download."
            : "Prototype preview · no download, account, or data collection."}
        </p>
      </div>
      <div className="hero-visual">
        <PhoneMockup rows={rows} />
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="section container narrow" id="why" aria-labelledby="why-title">
      <p className="eyebrow">Why ROOTED</p>
      <h2 id="why-title">One setback is a step, not the whole staircase.</h2>
      <p className="lede">
        Most trackers punish you with a reset to zero. ROOTED keeps your history. A slip moves you down one
        level, a missed check-in leaves you level, and everything you built stays visible.
      </p>
      <ul className="pill-row" aria-label="Principles">
        <li>You choose the goal</li>
        <li>You define a good day</li>
        <li>History is never erased</li>
        <li>Missed &ne; failed</li>
      </ul>
      <blockquote className="pullquote">
        <p>
          Life is not binary. Every day we are reflecting on our thoughts and tending our growth &mdash; always
          becoming the person we desire to be.
        </p>
      </blockquote>
    </section>
  );
}

interface JourneyProps {
  habits: DemoHabit[];
  pointsById: Record<string, GraphPoint[]>;
  /** True while showing demo data. */
  illustrative: boolean;
}

export function Journey({ habits, pointsById, illustrative }: JourneyProps) {
  const [activeId, setActiveId] = useState(habits[0]?.id ?? "");
  const habit = habits.find((h) => h.id === activeId) ?? habits[0];
  const points = habit ? pointsById[habit.id] : undefined;

  return (
    <section className="section container" id="demo" aria-labelledby="journey-title">
      <div className="section-head">
        <p className="eyebrow">The signature graph</p>
        <h2 id="journey-title">Your journey, in 3D.</h2>
        <p className="lede">
          Every day becomes a block. The graph rises when you do well, falls when you slip, and stays level
          when you miss a check-in.
        </p>
      </div>
      {habit && points ? (
        <>
          <div className="tabs" role="group" aria-label="Choose a habit to view">
            {habits.map((h) => (
              <button
                key={h.id}
                type="button"
                className="tab"
                aria-pressed={h.id === habit.id}
                onClick={() => setActiveId(h.id)}
              >
                <HabitIcon name={h.icon} size={16} /> {h.name}
              </button>
            ))}
          </div>
          <StaircaseGraph key={habit.id} points={points} habitName={habit.name} illustrative={illustrative} headingId="journey-title" stageHeight="clamp(300px, 52vw, 520px)" />
          <p className="def">
            <b>Good day ({illustrative ? "sample definition" : "your definition"}):</b> {habit.goodDay}. <b>Slip:</b> {habit.slipDay}. You write your
            own.
          </p>
        </>
      ) : (
        <p className="lede">Select at least one habit below to see its staircase.</p>
      )}
    </section>
  );
}

interface PickerProps {
  options: DemoHabit[];
  selected: string[];
  onToggle: (id: string) => void;
  custom: DemoHabit[];
  onAddCustom: (goal: { name: string; goodDay: string; slipDay: string }) => void;
  /** True when choices are saved to the user's account. */
  persisted: boolean;
  /** Message shown when saving a choice failed. */
  error?: string | null;
}

export function HabitPicker({ options, selected, onToggle, custom, onAddCustom, persisted, error }: PickerProps) {
  const [draft, setDraft] = useState("");
  const [goodDay, setGoodDay] = useState("");
  const [slipDay, setSlipDay] = useState("");
  const full = selected.length >= MAX_ACTIVE_HABITS;
  const all = [...options, ...custom];

  return (
    <section className="section container" id="features" aria-labelledby="picker-title">
      <div className="section-head">
        <p className="eyebrow">Features</p>
        <h2 id="picker-title">Your five habits. Your rules.</h2>
        <p className="lede">
          Track anywhere from one to five habits &mdash; five is a cap, not a target. Each has its own
          staircase and its own definition of success. These are examples, not advice.
        </p>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="counter" role="status" aria-live="polite">
        <b>{selected.length}</b> of {MAX_ACTIVE_HABITS} active
        {full && " — limit reached. Deselect one to swap."}
      </p>
      <ul className="habit-grid">
        {all.map((h) => {
          const on = selected.includes(h.id);
          const blocked = !on && full;
          return (
            <li key={h.id}>
              <button
                type="button"
                className="habit-card"
                aria-pressed={on}
                aria-disabled={blocked}
                onClick={() => onToggle(h.id)}
              >
                <span className="habit-ico"><HabitIcon name={h.icon} /></span>
                <span className="habit-name">{h.name}</span>
                <span className="habit-desc">{h.description}</span>
                <span className="habit-state">{on ? "✓ Tracking" : blocked ? "Limit reached" : "Add"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <form
        className="custom"
        onSubmit={(e) => {
          e.preventDefault();
          const name = draft.trim();
          if (!name) return;
          onAddCustom({ name, goodDay: goodDay.trim(), slipDay: slipDay.trim() });
          setDraft("");
          setGoodDay("");
          setSlipDay("");
        }}
      >
        <label htmlFor="custom-goal">Or define your own goal</label>
        <div className="custom-row">
          <input
            id="custom-goal"
            value={draft}
            maxLength={40}
            placeholder="e.g. Cook at home"
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-ghost" disabled={!draft.trim()}>
            Add custom goal
          </button>
        </div>
        <div className="custom-defs">
          <div>
            <label htmlFor="custom-good">A good day means (optional)</label>
            <input id="custom-good" value={goodDay} maxLength={120} placeholder="e.g. Home-cooked dinner" onChange={(e) => setGoodDay(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="custom-slip">A slip means (optional)</label>
            <input id="custom-slip" value={slipDay} maxLength={120} placeholder="e.g. Ordered takeaway" onChange={(e) => setSlipDay(e.target.value)} autoComplete="off" />
          </div>
        </div>
        <p className="fine">
          {persisted ? "Saved to your account." : "Stays in this page only. Nothing is saved or sent. Sign in to keep your goals."}
        </p>
      </form>
    </section>
  );
}

const STEPS = [
  { n: "01", t: "Choose what matters to you", d: "Pick up to five habits and decide, in your own words, what a good day and a slip mean." },
  { n: "02", t: "Check in honestly once a day", d: "Good day, slip, or skip it. Skipping never counts against you." },
  { n: "03", t: "See your staircase evolve", d: "Each day adds a block. Climbs, dips, and plateaus all stay on the record." },
];

export function HowItWorks() {
  return (
    <section className="section container" id="how" aria-labelledby="how-title">
      <div className="section-head">
        <p className="eyebrow">How it works</p>
        <h2 id="how-title">Three quiet steps.</h2>
      </div>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.n} className="card">
            <span className="step-n">{s.n}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const SLIP_EXAMPLE = buildGraphPoints("example", patternToCheckIns("example", "gggggsgg"));
const MISS_EXAMPLE = buildGraphPoints("example", patternToCheckIns("example", "gggmmggg"));
const GOOD_EXAMPLE = buildGraphPoints("example", patternToCheckIns("example", "gggggggg"));
const EXPLAIN_CONFIG = { ...DEFAULT_GRAPH_CONFIG, blockDepth: 1.2 };

const TRANSITIONS: Array<{ outcome: "good" | "slip" | "missed"; title: string; text: string; pts: GraphPoint[] }> = [
  { outcome: "good", title: "Good day: +1", text: "The next block lands one level higher.", pts: GOOD_EXAMPLE },
  { outcome: "slip", title: "Slip-up: −1", text: "One level down. Everything before it stays exactly where it was.", pts: SLIP_EXAMPLE },
  { outcome: "missed", title: "Missed check-in: 0", text: "Level, not failed. No outcome is assumed.", pts: MISS_EXAMPLE },
];

export function Progress() {
  return (
    <section className="section container" id="progress" aria-labelledby="progress-title">
      <div className="section-head">
        <p className="eyebrow">Progress details</p>
        <h2 id="progress-title">Rise, dip, hold &mdash; history stays.</h2>
        <p className="lede">Three transitions are all there is. Small illustrative sequences:</p>
      </div>
      <ul className="transitions">
        {TRANSITIONS.map((t) => (
          <li key={t.outcome} className="card">
            <div className="mini-stage">
              <StaircaseSvg points={t.pts} config={EXPLAIN_CONFIG} compact />
            </div>
            <h3>
              <OutcomeGlyph outcome={t.outcome} /> {t.title}
            </h3>
            <p>{t.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FAQS = [
  { q: "Can I track more than one habit?", a: "Yes, up to five active habits. Each has its own independent staircase, so a slip in one never changes another." },
  { q: "What happens if I slip?", a: "The graph moves down by one level, but your previous history remains visible." },
  { q: "What if I miss a check-in?", a: "The graph stays level. No outcome is assumed, and a missed day is not counted as a slip." },
  { q: "Can I choose my own goal?", a: "Yes. You choose the habit and you define what a good day and a slip mean for you." },
  { q: "Is this a medical treatment app?", a: "No. ROOTED is a personal habit-tracking and reflection tool. It doesn’t diagnose or treat anything and isn’t a replacement for professional support." },
  { q: "Can I download it today?", a: "Not yet. ROOTED is a web prototype; there is no native app and no notifications. Where sign-in is available, it uses an emailed link, and your habits and check-ins are saved to your account." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section container narrow" id="faq" aria-labelledby="faq-title">
      <div className="section-head">
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-title">Questions, answered plainly.</h2>
      </div>
      <div className="faq">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="faq-item">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  id={`faq-btn-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {f.q}
                  <span className="faq-plus" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
              </h3>
              <div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} hidden={!isOpen}>
                <p>{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Closing({ onStart }: { onStart: () => void }) {
  return (
    <section className="closing container" aria-labelledby="closing-title">
      <Plant className="plant plant-closing" />
      <h2 id="closing-title">Small choices. A bigger you.</h2>
      <p className="lede">
        It&rsquo;s not about being perfect. It&rsquo;s about showing up, learning, and growing &mdash; one block
        at a time.
      </p>
      <button type="button" className="btn btn-primary" onClick={onStart}>
        Start your journey
      </button>
    </section>
  );
}

export function Footer(): ReactNode {
  return (
    <footer className="footer container">
      <p className="wordmark-sm">ROOTED</p>
      <p className="fine">
        A personal habit-tracking and reflection tool &mdash; not medical treatment, and not a replacement for
        professional support. Demo graphs use illustrative data.
      </p>
    </footer>
  );
}
