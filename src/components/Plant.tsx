/** Decorative botanical line illustration. Supports, never competes with, the graph. */
export function Plant({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 360" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 352C118 280 124 210 112 150C104 108 120 70 150 30" strokeWidth="1.6" />
        {[
          "M118 300C84 292 58 270 44 236C80 238 108 262 118 300z",
          "M122 262C158 258 186 238 200 206C164 204 134 226 122 262z",
          "M116 214C84 204 62 182 54 150C86 154 110 176 116 214z",
          "M122 178C154 172 176 152 184 122C152 124 130 146 122 178z",
          "M126 120C106 106 98 82 102 54C124 66 134 90 126 120z",
          "M146 62C160 52 176 34 178 12C158 18 146 38 146 62z",
        ].map((d, i) => (
          <g key={i}>
            <path d={d} strokeWidth="1.2" fill="currentColor" fillOpacity="0.08" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function LeafMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M6 26c0-10 7-17 20-18 0 12-7 18-16 18" fill="var(--green)" />
      <path d="M8 26c5-7 9-11 14-14" stroke="var(--bg)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
