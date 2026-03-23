# Hebrew Alias — Master Architecture Blueprint

> **Version:** 1.0 | **Date:** 2026-03-23 | **Status:** Implementation-Ready

---

## 1. Product Summary

Hebrew Alias is a mobile-first, RTL web-based party game where teams take turns explaining and guessing Hebrew words under time pressure. Teams advance along a configurable board (30–100 tiles). First team to reach the final tile wins.

**Key constraints:**
- Pure client-side SPA — no backend server, no database, no authentication
- All game state lives in browser memory (Zustand store)
- Word dataset ships as a static JSON bundle
- Deployable to any static hosting (GitHub Pages, Vercel, Netlify)

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Language** | TypeScript | 5.x | Type safety, IDE support |
| **Framework** | React | 18.x | Component model, hooks, ecosystem |
| **Bundler** | Vite | 5.x | Fast HMR, simple config |
| **State** | Zustand | 4.x | Minimal boilerplate, no providers |
| **Styling** | Tailwind CSS | 3.x | Utility-first, RTL via `dir` attribute |
| **Animation** | Framer Motion | 11.x | Declarative animations, layout |
| **Audio** | Howler.js | 2.x | Cross-browser audio, preloading |

---

## 3. Folder Structure

```
alias/
├── public/sounds/               # Audio files
├── src/
│   ├── components/
│   │   ├── Setup/               # Game config form
│   │   ├── Board/               # Board path, tiles, tokens
│   │   ├── Timer/               # Hourglass + countdown
│   │   ├── TurnPanel/           # Word display + action buttons
│   │   ├── Modals/              # TimeUp, EndOfTurn, GameOver
│   │   └── shared/              # Button, Modal wrapper
│   ├── data/words.json          # Hebrew word dataset
│   ├── hooks/                   # useTimer, useAudio
│   ├── store/gameStore.ts       # Zustand store
│   ├── types/index.ts           # TypeScript interfaces
│   ├── utils/                   # wordSelection, scoring, board
│   ├── constants.ts             # Colors, defaults, limits
│   ├── App.tsx                  # Phase-based routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind directives
├── index.html                   # RTL shell
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 4. State Machine

```
SETUP ──initGame()──▶ TURN ──endTimer()──▶ TIME_UP ──award/dismiss──▶ END_OF_TURN
  ▲                    │ ▲                                                │
  │                    │ │ correctGuess()/skipWord()                       │
  │                    │ └─────────────────────────┘                       │
  │                                                                       │
  │                    commitTurn()──▶ checkWin? ──yes──▶ GAME_OVER       │
  │                                     │                    │             │
  │                                     no───────────────────┘             │
  └──────────────newGame()──────────────────────────────────────────────────┘
```

### Game Phases
```typescript
enum GamePhase { SETUP, TURN, TIME_UP, END_OF_TURN, GAME_OVER }
```

---

## 5. Core Data Model

```typescript
interface Word { word: string; difficulty: 'easy' | 'medium' | 'hard'; }
interface TeamColor { name: string; bg: string; text: string; hex: string; }
interface Team { id: string; name: string; color: TeamColor; position: number; }
interface TurnState { currentWord: Word | null; turnScore: number; wordsCorrect: number; wordsSkipped: number; }
interface GameConfig { teamNames: string[]; boardSize: number; turnDuration: number; }
```

---

## 6. Scoring & Movement

- Correct guess: **+1** | Skip: **−1**
- Net turn score = movement on board
- Position clamped to `[0, boardSize]`
- Win condition: `position >= boardSize`

---

## 7. Word Selection

- Fisher-Yates shuffle on game init
- Pointer-based draw (no repeats until pool exhausted)
- Re-shuffle and reset pointer when exhausted

---

## 8. RTL & Theming

- `<html dir="rtl" lang="he">`
- Font: Heebo (Google Fonts)
- 6 team colors: red, blue, green, yellow, purple, orange
- Touch targets: minimum 48×48px, action buttons 64px height

---

## 9. Deployment

Static SPA → GitHub Pages via GitHub Actions (`npm run build` → `/dist`)
