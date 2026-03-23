---
name: hebrew-alias-frontend
description: 'Frontend component specification for the Hebrew Alias board game. Covers all React components, props/state interfaces, RTL layout rules, Tailwind theme, Framer Motion animations, and responsive behavior.'
---

# Hebrew Alias — Frontend Component Specification

## 1. Global Config

- `index.html`: `<html lang="he" dir="rtl">`, Heebo font, `bg-slate-900`
- Tailwind: team colors, board colors, timer colors, urgency keyframes
- CSS: `btn-action` (64px height), `btn-correct`, `btn-skip`, `btn-primary`, `btn-secondary`
- Mobile: no tap highlight, no overscroll, no user-select

## 2. Shared Components

### Button — `variant: 'correct'|'skip'|'primary'|'secondary'`, disabled state, aria-label
### Modal — Framer Motion spring animation, backdrop, focus trap, `role="dialog"`

## 3. Setup Screen
- Team count selector (2–6), TeamInput rows with color circles
- Duration slider (30–120s, step 5), Board size slider (30–100, step 5)
- Start button calls `initGame()`

## 4. Board
- Serpentine grid: 5 tiles/row (mobile), 8 (tablet), 10 (desktop)
- Tile: `bg-board-tile`, active highlight, token dots
- Token: Framer Motion `layoutId` spring animation, current team pulse

## 5. Timer
- Hourglass SVG with synced sand levels
- Phases: normal (green), warning (yellow), urgent (red + pulse)
- `mm:ss` display, fixed top position

## 6. Turn Panel
- Word: `text-5xl`/`text-6xl`, `font-black`, AnimatePresence fade
- Score counter: green (+), red (−), scale pop animation
- Correct/Skip buttons: full width, 64px, `active:scale-95`

## 7. Modals
- **TimeUpModal**: bonus guess, team selection buttons, "nobody guessed"
- **EndOfTurnModal**: score summary (correct/skipped/net), movement display
- **GameOverModal**: trophy bounce, confetti, new game / restart buttons

## 8. Responsive
- Mobile: stacked layout (timer → board → word → buttons)
- Desktop: side-by-side (board left, turn panel right)

## 9. Accessibility
- `aria-label` on buttons, focus rings, `prefers-reduced-motion`, semantic HTML, `aria-live` regions
