# Start Here --- Claude Code Execution Prompt

Read `CLAUDE.md` and every file under `docs/` before coding.

Now implement ROOTED in this repository. Inspect the existing project
first and preserve its conventions. If it is empty, scaffold React +
TypeScript + Vite. Do not stop after giving me a plan: execute the
implementation.

Prioritize: 1. A premium responsive landing page with the exact brand
line "Break the pattern. Grow beyond it." 2. A clear mobile app preview
that shows up to five independent habits. 3. The signature data-driven
3D staircase: chronological blocks along X, cumulative elevation by
score, green for good (+1), muted red for slip (-1), neutral for
missed/unrecorded (0). 4. Working CTAs, anchor navigation, graph block
details, and accessible/reduced-motion behavior. 5. Pure, tested score
calculation logic separate from graph rendering. 6. A robust 2D fallback
if WebGL or the 3D dependency fails.

Use the product and design specs as the source of truth. Keep the graph
a staircase, not a bar chart. Do not punish missed check-ins, erase
prior progress, invent app-store links, or imply the app provides
medical treatment.

Work in coherent steps, run the available quality checks, fix issues,
and finish with a concise report of what was built, files changed,
commands run, and remaining gaps. Do not claim tests or builds passed
unless you actually ran them.
