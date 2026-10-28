import type { DisplayOutcome } from "../../domain/types";

/** Shape + color glyph so outcome never depends on color alone. */
export function OutcomeGlyph({ outcome, large = false }: { outcome: DisplayOutcome; large?: boolean }) {
  const size = large ? 28 : 14;
  return (
    <svg
      className={`glyph glyph-${outcome}`}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      {outcome === "good" && <path d="M7 2 12 10H2z" />}
      {outcome === "slip" && <path d="M7 12 2 4h10z" />}
      {(outcome === "missed" || outcome === "unrecorded") && <rect x="2" y="5.5" width="10" height="3" rx="1" />}
    </svg>
  );
}
