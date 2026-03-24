// ── Game Phases ──

export enum GamePhase {
  SETUP = 'SETUP',
  PRE_TURN = 'PRE_TURN',
  TURN = 'TURN',
  TIME_UP = 'TIME_UP',
  END_OF_TURN = 'END_OF_TURN',
  GAME_OVER = 'GAME_OVER',
}

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
}
