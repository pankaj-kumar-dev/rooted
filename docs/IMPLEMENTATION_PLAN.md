# ROOTED --- Implementation Plan

## Phase 0: Repository reconnaissance

-   Inspect files, package scripts, dependencies, and styling
    conventions.
-   Do not overwrite an existing project architecture without reason.
-   Identify the package manager and run the existing app if possible.
-   Summarize the current state in a few lines, then proceed.

## Phase 1: Foundation

-   Ensure React + TypeScript setup (scaffold with Vite only if needed).
-   Set up lint/typecheck/test scripts if appropriate to the repository.
-   Add CSS variables from `DESIGN_SYSTEM.md`.
-   Build shared layout primitives and semantic page sections.
-   Add a small set of dependencies only. Preferred graph stack:
    `three`, `@react-three/fiber`, and optionally `@react-three/drei` if
    supported by the current React version.
-   If WebGL is unavailable, provide a readable CSS/SVG fallback. Do not
    block the whole page on a 3D canvas.

## Phase 2: Domain logic

-   Implement typed habit/check-in models.
-   Implement pure functions for outcome deltas and cumulative graph
    points.
-   Add unit tests for all cases in `DATA_MODEL.md`.
-   Add deterministic mock fixtures for five habits and a detailed
    mixed-outcome history.

## Phase 3: Graph component

-   Build `StaircaseGraph` with a data-driven API.
-   Map dates to X positions and cumulative rating to vertical position.
-   Use uniform blocks; do not encode the outcome as block height.
-   Color transitions by outcome and show a subtle floor/grid.
-   Add camera controls only if they do not make the graph difficult to
    read. Prefer a fixed attractive camera.
-   Add hover/focus/tap details with date, outcome, delta, and resulting
    rating.
-   Add a text legend and accessible graph summary.
-   Add a reduced-motion path and 2D fallback.
-   Test desktop and mobile behavior.

## Phase 4: Landing page

Implement sections in this order: 1. Responsive navigation. 2. Hero
headline/copy/CTA. 3. Phone mockup with five or fewer habit rows and
miniature staircases. 4. Full-width "Your journey, in 3D" graph section.
5. Habit-selection cards and "up to five" explanation. 6. How-it-works
steps. 7. Large example graph with three outcome explanations. 8. FAQ.
9. Closing CTA and footer.

The first viewport must communicate the product immediately. Use the
graph as the signature visual; plant imagery is secondary.

## Phase 5: Interactions

-   Navigation scrolls to anchors.
-   Main CTA moves to the interactive demo or opens a real prototype
    modal.
-   Habit selection allows up to five active choices if implemented.
-   Graph blocks expose detail via pointer and keyboard/touch
    interaction.
-   FAQ controls work.
-   All buttons and links have a meaningful behavior. No dead controls.
-   If a CTA suggests app download but no store link exists, use a
    clearly labeled waitlist/demo action instead.

## Phase 6: Quality and polish

-   Test widths: 320, 375, 768, 1024, 1440.
-   Check reduced motion, keyboard navigation, focus, contrast, labels,
    and graph summary.
-   Run typecheck, lint, unit tests, and production build.
-   Fix console errors and responsive overflow.
-   Remove placeholder links, unused dependencies, and dead buttons.
-   Ensure the page looks good with and without WebGL.
-   Report actual commands/results and any incomplete items.

## Acceptance checklist

-   [ ] Brand and hero copy match the spec.
-   [ ] Up-to-five-habits rule is clear.
-   [ ] Graph is a chronological staircase, not a bar chart.
-   [ ] Good raises cumulative rating by one.
-   [ ] Slip lowers cumulative rating by one.
-   [ ] Missed/unrecorded keeps rating flat.
-   [ ] Histories remain independent per habit.
-   [ ] Prior progress is never erased.
-   [ ] Graph is inspectable and has a legend.
-   [ ] Mobile layout is usable and no horizontal overflow occurs.
-   [ ] Motion respects reduced-motion preference.
-   [ ] CTAs/navigation/FAQ work.
-   [ ] Tests and production build are run and results are reported.
