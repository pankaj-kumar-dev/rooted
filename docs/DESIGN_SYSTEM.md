# ROOTED --- Design System

## 1. Visual principle

A premium, dark botanical world with a precise data visualization. The
plant communicates growth; the staircase communicates honest progress.
The graph always wins visual priority over decorative foliage.

## 2. Color tokens

Use CSS custom properties and keep all colors centralized.

``` css
:root {
  color-scheme: dark;
  --bg: #07100b;
  --bg-elevated: #0d1710;
  --surface: #101d14;
  --surface-raised: #16241a;
  --border: rgba(190, 218, 177, 0.16);
  --text: #f0f2e9;
  --text-muted: #a9b5a5;
  --green: #b9dda0;
  --green-strong: #76bd68;
  --green-deep: #285b35;
  --slip: #df7864;
  --slip-deep: #743b32;
  --neutral: #8f998b;
  --focus: #e2f5c8;
}
```

Usage: - Green is the positive progression state and main CTA. - Red is
reserved for slip outcomes, never used as an alarming page-wide
warning. - Neutral stone is used for missed/unrecorded check-ins. - Use
off-white rather than pure white for body text. - Keep borders subtle;
use glow sparingly.

## 3. Typography

-   Headlines: editorial serif or high-quality display face, with a
    sans-serif for interface text.
-   UI/body: readable sans-serif.
-   Use a fluid type scale with `clamp()` for hero headings.
-   Avoid long paragraphs in the hero.
-   Ensure small text remains readable on mobile.

Suggested pairing: a restrained serif display face with Inter, Geist, or
system sans-serif. If remote fonts are unavailable, use robust local
fallbacks.

## 4. Layout and spacing

-   Main content max-width: approximately 1200--1320px.
-   Desktop hero: two-column layout, copy left and phone/product visual
    right.
-   Staircase section: broad full-width stage with enough vertical space
    to read the 3D elevation.
-   Habit cards: 5-column grid on wide screens, 2-column on tablet,
    horizontal scroll or compact list on small screens.
-   Use generous vertical section spacing; avoid cramming all
    information into one viewport.
-   Mobile: stack hero copy before visual, simplify graph perspective,
    preserve the meaning of all states.
-   Avoid horizontal page overflow at 320px width.

## 5. Components

### Navigation

-   Wordmark + small leaf mark.
-   Desktop anchor links.
-   Compact mobile navigation that is keyboard accessible.
-   CTA has a clear hover/focus/pressed state.

### Primary button

-   Sage fill, dark text, pill or softly rounded rectangle.
-   Clear focus ring and visible active state.
-   Avoid fake disabled states.

### Habit card

-   Surface background, thin border, small icon, name, short
    description.
-   Selected state must be visually clear and accessible.
-   Do not rely on color alone to convey selection or outcome.

### Phone mockup

-   Use HTML/CSS components where possible so UI text remains crisp and
    responsive.
-   Avoid baking essential text into a raster image.
-   Device frame should not dominate the content or make text illegible.

### Staircase graph

-   Reusable component with a typed data API.
-   Each date is a block in chronological X position.
-   Cumulative score determines vertical elevation.
-   Green for `good`, red for `slip`, stone for `missed`.
-   Include subtle grid/axis and a compact legend.
-   Pointer hover, keyboard focus, and tap should expose
    date/outcome/score.
-   Add subtle entry animation only if it respects reduced-motion
    settings.
-   Keep lighting and shadows restrained enough that block levels remain
    easy to distinguish.

### Plant visual

-   Botanical and tactile, not cartoonish.
-   Use a reliable local asset or CSS/SVG illustration if no appropriate
    asset is already present.
-   Do not make the plant the only representation of progress.

## 6. Motion

-   Short transitions for buttons, cards, and section reveals.
-   Staircase may animate into place on first view.
-   No infinite motion that distracts from reading.
-   Respect `prefers-reduced-motion: reduce`.
-   Do not animate the graph in a way that changes the apparent score or
    suggests live data where there is none.

## 7. Responsive behavior

-   Test 320px, 375px, 768px, 1024px, and 1440px widths.
-   Keep the graph legible: on small screens, use a simplified
    perspective or a horizontally scrollable graph container with an
    accessible summary.
-   No clipped CTA, overlapping nav, unreadable tiny labels, or
    accidental body-level horizontal scroll.

## 8. Accessibility

-   Semantic heading hierarchy.
-   Visible keyboard focus.
-   Meaningful alt text for informative imagery; decorative imagery gets
    empty alt text.
-   Contrast target WCAG AA for body/UI text where practical.
-   Graph needs a text summary and legend in addition to color.
-   Provide accessible descriptions for interactive blocks.
-   Avoid motion as the only way to communicate state.
