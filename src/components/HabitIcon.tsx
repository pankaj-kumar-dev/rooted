import type { HabitIconName } from "../data/demo";

const PATHS: Record<HabitIconName, string> = {
  phone: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 15.5h.01",
  glass: "M7 4h10l-1 6a4 4 0 0 1-8 0zM12 14v6m-3 0h6",
  smoke: "M3 15h13v3H3zM19 15v3M21 12c0-2-2-2-2-4M17 9c0-2-2-2-2-4",
  wave: "M3 9c3-3 5 3 9 0s6 3 9 0M3 15c3-3 5 3 9 0s6 3 9 0",
  run: "M13 4.5a1.5 1.5 0 1 1 0 .01M9 21l3-6-3-3 2-4 4 2 3 1M12 15l4 2v4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  leaf: "M5 19c0-9 5-14 15-15 0 10-5 15-13 15M5 19c3-5 6-8 10-10",
  book: "M5 5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2zM5 19V5M9 7h6",
  spark: "M12 3v5m0 8v5M3 12h5m8 0h5M6 6l3 3m6 6 3 3m0-12-3 3m-6 6-3 3",
};

export function HabitIcon({ name, size = 20 }: { name: HabitIconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
