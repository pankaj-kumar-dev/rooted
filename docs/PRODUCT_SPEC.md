# ROOTED --- Product Specification

## 1. Product summary

ROOTED is a habit-change companion that turns a user's chosen
commitments into a visible, evolving 3D staircase. It is inspired by
contribution graphs and competitive rating histories, but it is personal
rather than competitive.

**Brand line:** Break the pattern. Grow beyond it. **Supporting
message:** Choose what you want to change. Show up one day at a time.
Your history is part of your growth.

The initial deliverable is a responsive marketing landing page with an
interactive product preview. It should feel close to a premium mobile
app launch page, not an admin dashboard.

## 2. Target user and job

A person wants to change one or more habits and needs a simple way to
notice patterns over time.

Primary job: \> Help me track the commitments I choose and see my
progress honestly, without treating one setback as total failure.

Potential user-defined goals include less phone time, reducing or
avoiding alcohol, cigarettes or cannabis, managing anger, exercise,
sleep, or a custom habit. Do not assume every user is dealing with a
clinical addiction.

## 3. Core product rules

-   Maximum of five active habits per user in the initial product.
-   Users may track one through five habits; five is a cap, not a
    requirement.
-   Each habit has a name, optional icon/category, user-defined success
    criteria, and its own independent daily check-ins.
-   A check-in is `good`, `slip`, or `missed/unrecorded`.
-   `good`: score delta +1.
-   `slip`: score delta -1.
-   `missed`: score delta 0.
-   The score is cumulative and drives staircase elevation.
-   A missed day must never be automatically classified as a slip or a
    good day.
-   A slip does not delete prior progress.
-   The graph should preserve chronology and show dips, plateaus, and
    climbs.
-   The graph is a visual reflection tool, not a medical score or
    scientific measure of recovery.

## 4. Landing page information architecture

### A. Navigation

-   Wordmark: ROOTED
-   Links: Why, Features, How it works, FAQ (anchors to page sections)
-   Primary CTA: Get the App / Start your journey
-   Since the app may not be released, CTA should go to a functional
    waitlist/demo modal or a clearly marked prototype section. Never use
    a fake app-store URL.

### B. Hero

Headline: **Break the pattern.** **Grow beyond it.**

Supporting copy: "Choose what you want to change. Track up to five
habits. Watch your progress rise, dip, and steady out --- one day at a
time."

Primary CTA: "Start your journey" Secondary CTA: "See how it works"

Hero visual: - Mobile phone mockup with ROOTED dashboard. - Five example
habit rows maximum. - Each row has a small miniature staircase and a
current rating/position. - Botanical plant imagery is supporting
atmosphere. - Use demo values and mark them as sample data where needed.

### C. Staircase explanation

Headline: "Your journey, in 3D." Copy: "Every day becomes a block. The
graph rises when you do well, falls when you slip, and stays level when
you miss a check-in."

The graph is the key product differentiator and should be one of the
largest visual elements on the page.

Legend: - Green / upward step: Good day (+1) - Muted red / downward
step: Slip-up (-1) - Stone / flat step: Missed check-in (0)

The graph should show a chronological sequence of blocks. The block's
vertical location follows cumulative score, not the height of a daily
bar. It should be obvious that this is a staircase/terrain.

### D. Habit selection

Headline: "Your five habits. Your rules." Explain that users can select
up to five goals and define what success means for each one. Example
cards: - Less phone time - Alcohol goal (use neutral, user-defined
wording) - No cigarettes - Anger management - Daily exercise Include a
custom goal affordance. Do not imply these examples are medical advice.

### E. How it works

Three steps: 1. Choose what matters to you. 2. Check in honestly once a
day. 3. See your staircase evolve over time.

### F. Progress details

Show a larger sample staircase for one habit, with a few good days,
slips, and missed check-ins. Add compact cards explaining the three
transitions. Explain that history stays visible.

### G. Closing CTA

Headline: "Small choices. A bigger you." Copy: "It's not about being
perfect. It's about showing up, learning, and growing --- one block at a
time." CTA: "Start your journey"

### H. FAQ (optional but recommended)

-   Can I track more than one habit? Yes, up to five active habits.
-   What happens if I slip? The graph moves down by one level, but your
    previous history remains.
-   What if I miss a check-in? The graph stays level; no outcome is
    assumed.
-   Can I choose my own goal? Yes.
-   Is this a medical treatment app? No. It is a personal habit-tracking
    and reflection tool.

## 5. Functional prototype requirements

-   Navigation links scroll to the correct section.
-   CTA buttons have a real behavior: scroll to the demo/goal selection,
    open a small modal, or link to a real configured destination. No
    dead buttons.
-   Habit cards can be selected in the prototype; enforce the five-habit
    maximum if implementing selection.
-   Graph blocks are inspectable by pointer and keyboard/tap where
    feasible.
-   A block detail shows date, habit, outcome, and resulting score.
-   Include a reset/demo-data control only if it is useful and clearly
    labeled.
-   Use accessible button semantics and labels.
-   Avoid requiring a backend. Local state is sufficient for the demo.

## 6. Content and tone

Tone: direct, encouraging, non-judgmental, grounded. Prefer: "slip,"
"check-in," "commitment," "progress," "your choice." Avoid: "failure,"
"weak," "relapse punishment," "cure," "guaranteed recovery," or shaming
language. Do not promise that using ROOTED will treat addiction or
mental health conditions.

## 7. Success criteria

A first-time visitor should understand within five seconds: 1. This is a
habit-change app. 2. They choose the goal. 3. They can track up to five
habits. 4. The 3D staircase rises, falls, or stays level based on
check-ins. 5. A setback does not erase prior progress.
