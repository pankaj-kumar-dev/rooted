# ROOTED --- Claude Code Project Instructions

## Mission

Build ROOTED, a polished, responsive landing page and interactive
product prototype for a habit-change app. The product helps users track
up to five personal commitments with a Codeforces-rating-inspired 3D
staircase: each day advances the staircase up, down, or keeps it level.

Brand line: **Break the pattern. Grow beyond it.** Product philosophy:
**The user chooses what to change. ROOTED helps them observe their
journey without shame.**

## How to work

1.  Inspect the existing repository before changing anything. Identify
    framework, package manager, conventions, and existing components.
2.  If the repository is empty, scaffold a modern React + TypeScript app
    using Vite. Use the package manager indicated by existing lockfiles;
    otherwise use npm.
3.  Read `docs/PRODUCT_SPEC.md`, `docs/DESIGN_SYSTEM.md`,
    `docs/DATA_MODEL.md`, and `docs/IMPLEMENTATION_PLAN.md` before
    implementing.
4.  Make a short implementation plan, then execute it. Do not stop after
    proposing a plan.
5.  Build in small, verifiable steps. Run lint, typecheck, tests, and
    production build when scripts exist. Fix issues introduced by your
    work.
6.  Do not ask for approval for routine implementation choices. Make
    reasonable decisions and document important trade-offs.
7.  Do not claim a command passed unless you ran it and observed
    success.
8.  If a dependency cannot be installed or a command cannot run, explain
    the exact blocker and continue with the best viable alternative.

## Product truths --- do not violate

-   A user can track **up to five active habits**. Do not imply they
    must track exactly five.
-   Every habit has an independent history and independent score. A slip
    in one habit must not change another habit's graph.
-   Each date has one of three check-in outcomes:
    -   `good`: rating increases by one level.
    -   `slip`: rating decreases by one level.
    -   `missed`: rating remains unchanged; this is not a failure and
        must not be inferred as one.
-   The graph is a **cumulative staircase over time**, not a bar chart.
    Each day contributes one block along the time axis. The block's
    vertical level is determined by the cumulative rating after that
    day's outcome.
-   Preserve history. Never erase prior progress because of a slip or
    missed check-in.
-   No manipulative shame language, punitive streak resets, or claims
    that the app treats addiction or replaces professional support.
-   Users define what a "good day" and "slip" mean for their own habit.
-   The current experience is a landing page plus a convincing
    interactive front-end prototype. Do not pretend real native app
    downloads, accounts, sync, notifications, or backend persistence
    exist unless implemented.

## Visual direction

-   Dark forest / near-black canvas, sage and moss green highlights,
    restrained warm red for slip blocks, muted stone for missed
    check-ins.
-   Premium botanical atmosphere; subtle plant imagery supports the
    graph but never competes with it.
-   Strong editorial typography, spacious composition, polished cards,
    fine borders, controlled glow, subtle depth.
-   Avoid generic SaaS gradients, excessive blur, emoji-heavy UI, loud
    neon, or stock dashboard sameness.
-   Mobile-first and responsive. On small screens, simplify the 3D scene
    and avoid tiny labels or horizontal overflow.
-   Respect `prefers-reduced-motion`. The core graph must remain
    understandable without animation.
-   Maintain accessible contrast, visible focus states, semantic HTML,
    and keyboard-accessible controls.

## Graph implementation

-   Prefer React Three Fiber + Three.js if compatible with the repo. If
    dependency installation is unavailable or the implementation becomes
    fragile, use a clear CSS/SVG isometric fallback without sacrificing
    the staircase semantics.
-   Create a reusable `StaircaseGraph` component. It must accept a
    habit's daily outcomes/history as data, not hard-code graph geometry
    into page markup.
-   Each date is a block along the X/time axis. Its elevation is
    cumulative: `rating[t] = rating[t-1] + delta(outcome[t])`.
-   Use `good => +1`, `slip => -1`, `missed/unknown => 0`.
-   Use color as a secondary signal; shape/position and text must also
    communicate meaning.
-   Provide date and outcome details on hover, focus, and click where
    practical. On touch devices, tapping a block should reveal details.
-   Provide a legend. Label the graph as illustrative when using mock
    data.
-   Keep the camera, lighting, block dimensions, spacing, and colors
    configurable via component props or constants.
-   Do not generate one tall bar per day. The visual should be a stepped
    terrain / staircase: each date advances along X and its block
    occupies the cumulative Y/elevation level.

## Engineering standards

-   TypeScript strictness should remain enabled where the project
    supports it.
-   Separate data/model logic from rendering and UI.
-   Use small, named components and clear types.
-   Avoid giant single-file components, duplicated graph logic,
    arbitrary magic numbers, and unnecessary dependencies.
-   Use realistic mock data in a dedicated fixture file. Mark it as demo
    data.
-   Use CSS variables/design tokens for colors, spacing, radii, shadows,
    and typography.
-   Do not add analytics, tracking, or external APIs. Authentication and
    persistence are implemented via Supabase magic-link sign-in (see
    `docs/AUTH_SETUP.md`); keep that the only backend, and keep demo mode
    working when env vars are absent.
-   Do not store sensitive habit notes in URLs or logs.
-   Avoid unsupported statements about recovery, medical efficacy, or
    guaranteed outcomes.

## Definition of done

-   Landing page communicates the product within five seconds.
-   Hero includes the brand line and a clear CTA.
-   A prominent staircase explains rising, falling, and staying level.
-   The "up to five habits" rule is clear.
-   Habit cards / demo dashboard show independent progress.
-   Responsive layouts work on mobile, tablet, and desktop.
-   Interactions work, including nav/CTA behavior and graph detail
    reveal.
-   No console errors, broken imports, or obvious accessibility issues.
-   Typecheck/lint/build/tests are run when available, and results are
    reported accurately.

## Final response format

When implementation is complete, report: 1. What was built. 2. Key
files/components. 3. Commands run and their actual results. 4. Any
remaining gaps or assumptions. Do not merely describe code that was not
implemented.
