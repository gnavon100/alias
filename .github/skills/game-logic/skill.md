---
name: hebrew-alias-game-logic
description: 'Game logic specification for the Hebrew Alias board game. Covers Zustand store, state transitions, useTimer hook, scoring, board advancement, and win condition.'
---

# Hebrew Alias — Game Logic Specification

## 1. Phases
`SETUP → TURN → TIME_UP → END_OF_TURN → GAME_OVER`

## 2. Store Shape
```typescript
interface GameState {
  gamePhase: GamePhase;
  boardSize: number;          // 30–100
  turnDuration: number;       // 30–120s
  teams: Team[];
  currentTeamIndex: number;
  turn: TurnState;
  shuffledWords: Word[];
  currentWordIndex: number;
  bonusWord: Word | null;
  savedConfig: GameConfig | null;
}
```

## 3. Actions
| Action | From → To | Effect |
|--------|-----------|--------|
| `initGame(config)` | SETUP → TURN | Create teams, shuffle words, draw first word |
| `correctGuess()` | TURN → TURN | +1 score, next word |
| `skipWord()` | TURN → TURN | −1 score, next word |
| `endTimer()` | TURN → TIME_UP | Freeze, store bonus word |
| `awardBonusPoint(teamId)` | TIME_UP → END_OF_TURN | +1 to team |
| `dismissBonus()` | TIME_UP → END_OF_TURN | No bonus |
| `commitTurn()` | END_OF_TURN → TURN/GAME_OVER | Apply movement, check win, rotate |
| `newGame()` | GAME_OVER → SETUP | Reset all |
| `restartGame()` | GAME_OVER → TURN | Same config, reset positions |

## 4. Scoring
- Correct: +1, Skip: −1
- `calculateNewPosition(pos, score, boardSize) → Math.max(0, Math.min(pos + score, boardSize))`
- `checkWin(pos, boardSize) → pos >= boardSize`

## 5. useTimer Hook
- Input: `{ duration, onExpire, autoStart? }`
- Output: `{ remaining, total, isRunning, phase, progress, start, pause, reset }`
- Phases: normal (>33%), warning (17–33%), urgent (≤17%)

## 6. Constants
- `TEAM_COLORS`: 6 colors (red, blue, green, yellow, purple, orange) with Hebrew names
- `GAME_DEFAULTS`: boardSize=30, turnDuration=60, teams 2–6, board 30–100, duration 30–120
- `TIMER_THRESHOLDS`: warning=0.33, urgent=0.17

## 7. Board Utilities
- `generateBoardLayout(boardSize, tilesPerRow) → [{ tileNumber, row, col }]`
- `getTilesPerRow(screenWidth) → 5 (mobile) | 8 (tablet) | 10 (desktop)`
