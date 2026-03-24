// ── Game Phases ──

export enum GamePhase {
  SETUP = 'SETUP',
  PRE_TURN = 'PRE_TURN',
  POWER_UP_REVEAL = 'POWER_UP_REVEAL',
  TURN = 'TURN',
  BOTH_TEAMS_TURN = 'BOTH_TEAMS_TURN',
  TIME_UP = 'TIME_UP',
  END_OF_TURN = 'END_OF_TURN',
  GIFT_OR_CURSE = 'GIFT_OR_CURSE',
  STEAL_THE_LEAD = 'STEAL_THE_LEAD',
  BONUS_OR_MINUS = 'BONUS_OR_MINUS',
  GAME_OVER = 'GAME_OVER',
}

// ── Power-Up Tiles ──

export type PowerUpType =
  | 'both_teams'      // Both teams compete, no timer, 5 words
  | 'bonus_or_minus'  // 8+ words = +3, below = -3
  | 'speed_demon'     // Half time, double points
  | 'gift_or_curse'   // Give +3 or -3 to any team
  | 'steal_the_lead'; // Swap positions with random team

export interface PowerUpTile {
  position: number;     // Board tile index (0-based)
  type: PowerUpType;
}

export const POWER_UP_INFO: Record<PowerUpType, { emoji: string; name: string; description: string }> = {
  both_teams:     { emoji: '⚔️',  name: 'קרב קבוצות',     description: '5 מילים ללא מגבלת זמן — שתי הקבוצות מנחשות!' },
  bonus_or_minus: { emoji: '🎲',  name: 'בונוס או מינוס',  description: 'ענו על 8+ מילים = +3 צעדים. פחות? -3 צעדים!' },
  speed_demon:    { emoji: '⚡',   name: 'מהירות שטנית',    description: 'חצי זמן, אבל כל מילה שווה כפול!' },
  gift_or_curse:  { emoji: '🎁',  name: 'מתנה או קללה',   description: 'בסוף התור — בחרו קבוצה לתת לה +3 או -3 צעדים!' },
  steal_the_lead: { emoji: '🔀',  name: 'גניבת מובילות',   description: 'בסוף התור — אפשר להחליף מיקום עם קבוצה אחרת!' },
};

// ── Timer ──

export type TimerPhase = 'normal' | 'warning' | 'urgent';

// ── Words ──

export interface Word {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WordDataset {
  words: Array<{ word: string; difficulty?: string }>;
}

// ── Teams ──

export interface TeamColor {
  name: string;
  bg: string;
  text: string;
  hex: string;
}

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  position: number;
}

// ── Turn ──

export interface WordHistory {
  word: string;
  wasCorrect: boolean;
}

export interface TurnState {
  currentWord: Word | null;
  turnScore: number;
  wordsCorrect: number;
  wordsSkipped: number;
  wordHistory: WordHistory[];
  activePowerUp: PowerUpType | null;
  pointMultiplier: number;
}

// ── Game Configuration ──

export interface GameConfig {
  teamNames: string[];
  boardSize: number;
  turnDuration: number;
}

// ── Store ──

export interface GameState {
  gamePhase: GamePhase;
  boardSize: number;
  turnDuration: number;
  teams: Team[];
  currentTeamIndex: number;
  turn: TurnState;
  shuffledWords: Word[];
  currentWordIndex: number;
  bonusWord: Word | null;
  savedConfig: GameConfig | null;
  powerUpTiles: PowerUpTile[];
  bothTeamsWordsRemaining: number;
  bothTeamsScores: Record<string, number>;
}

export interface GameActions {
  initGame: (config: GameConfig) => void;
  startTurn: () => void;
  correctGuess: () => void;
  skipWord: () => void;
  endTimer: () => void;
  awardBonusPoint: (teamId: string) => void;
  dismissBonus: () => void;
  commitTurn: () => void;
  newGame: () => void;
  restartGame: () => void;
  exitToMenu: () => void;
  acknowledgePowerUp: () => void;
  bothTeamsCorrect: (teamId: string) => void;
  bothTeamsSkip: () => void;
  applyGiftOrCurse: (teamId: string, delta: number) => void;
  applyStealTheLead: (targetTeamId: string | null) => void;
  shuffleTeamOrder: () => void;
}
