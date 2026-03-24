import { create } from 'zustand';
import type { GameState, GameActions, GameConfig, TurnState, Team } from '../types';
import { GamePhase } from '../types';
import { TEAM_COLORS } from '../constants';
import { validateDataset, fisherYatesShuffle, drawNextWord } from '../utils/wordSelection';
import { calculateNewPosition, checkWin } from '../utils/scoring';
import wordData from '../data/words.json';

// ── Initial values ──

const INITIAL_TURN: TurnState = {
  currentWord: null,
  turnScore: 0,
  wordsCorrect: 0,
  wordsSkipped: 0,
  wordHistory: [],
};

const INITIAL_STATE: GameState = {
  gamePhase: GamePhase.SETUP,
  boardSize: 30,
  turnDuration: 60,
  teams: [],
  currentTeamIndex: 0,
  turn: { ...INITIAL_TURN },
  shuffledWords: [],
  currentWordIndex: 0,
  bonusWord: null,
  savedConfig: null,
};

// ── Store ──

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...INITIAL_STATE,

  // ────────────────────────────────────────────
  // SETUP → TURN
  // ────────────────────────────────────────────
  initGame: (config: GameConfig) => {
    const validatedWords = validateDataset(wordData);
    const shuffled = fisherYatesShuffle(validatedWords);

    const teams: Team[] = config.teamNames.map((name, i) => ({
      id: `team-${i}`,
      name: name.trim() || `קבוצה ${i + 1}`,
      color: TEAM_COLORS[i],
      position: 0,
    }));

    set({
      gamePhase: GamePhase.PRE_TURN,
      boardSize: config.boardSize,
      turnDuration: config.turnDuration,
      teams,
      currentTeamIndex: 0,
      turn: { ...INITIAL_TURN },
      shuffledWords: shuffled,
      currentWordIndex: 0,
      bonusWord: null,
      savedConfig: config,
    });
  },

  // ────────────────────────────────────────────
  // PRE_TURN → TURN
  // ────────────────────────────────────────────
  startTurn: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.PRE_TURN) return;

    const { word, newShuffled, newIndex } = drawNextWord(
      state.shuffledWords,
      state.currentWordIndex,
    );

    set({
      gamePhase: GamePhase.TURN,
      turn: {
        currentWord: word,
        turnScore: 0,
        wordsCorrect: 0,
        wordsSkipped: 0,
        wordHistory: [],
      },
      shuffledWords: newShuffled,
      currentWordIndex: newIndex,
    });
  },

  // ────────────────────────────────────────────
  // TURN → TURN or GAME_OVER (correct guess)
  // ────────────────────────────────────────────
  correctGuess: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.TURN) return;

    const newTurnScore = state.turn.turnScore + 1;
    const newWordsCorrect = state.turn.wordsCorrect + 1;

    // Add current word to history as correct
    const newHistory = state.turn.currentWord
      ? [...state.turn.wordHistory, { word: state.turn.currentWord.word, wasCorrect: true }]
      : state.turn.wordHistory;

    // Check mid-turn win: would the team reach the end?
    const currentTeam = state.teams[state.currentTeamIndex];
    const projectedPosition = calculateNewPosition(
      currentTeam.position,
      newTurnScore,
      state.boardSize,
    );

    if (checkWin(projectedPosition, state.boardSize)) {
      // Apply score immediately and end the game
      const updatedTeams = state.teams.map((team, i) =>
        i === state.currentTeamIndex
          ? { ...team, position: projectedPosition }
          : team,
      );
      set({
        gamePhase: GamePhase.GAME_OVER,
        teams: updatedTeams,
        turn: {
          ...state.turn,
          turnScore: newTurnScore,
          wordsCorrect: newWordsCorrect,
          wordHistory: newHistory,
        },
      });
      return;
    }

    const { word, newShuffled, newIndex } = drawNextWord(
      state.shuffledWords,
      state.currentWordIndex,
    );

    set({
      turn: {
        ...state.turn,
        currentWord: word,
        turnScore: newTurnScore,
        wordsCorrect: newWordsCorrect,
        wordHistory: newHistory,
      },
      shuffledWords: newShuffled,
      currentWordIndex: newIndex,
    });
  },

  // ────────────────────────────────────────────
  // TURN → TURN (skip word)
  // ────────────────────────────────────────────
  skipWord: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.TURN) return;

    // Add current word to history as skipped
    const newHistory = state.turn.currentWord
      ? [...state.turn.wordHistory, { word: state.turn.currentWord.word, wasCorrect: false }]
      : state.turn.wordHistory;

    const { word, newShuffled, newIndex } = drawNextWord(
      state.shuffledWords,
      state.currentWordIndex,
    );

    set({
      turn: {
        ...state.turn,
        currentWord: word,
        turnScore: state.turn.turnScore - 1,
        wordsSkipped: state.turn.wordsSkipped + 1,
        wordHistory: newHistory,
      },
      shuffledWords: newShuffled,
      currentWordIndex: newIndex,
    });
  },

  // ────────────────────────────────────────────
  // TURN → TIME_UP
  // ────────────────────────────────────────────
  endTimer: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.TURN) return;

    set({
      gamePhase: GamePhase.TIME_UP,
      bonusWord: state.turn.currentWord,
    });
  },

  // ────────────────────────────────────────────
  // TIME_UP → END_OF_TURN (bonus point awarded)
  // ────────────────────────────────────────────
  awardBonusPoint: (teamId: string) => {
    const state = get();
    if (state.gamePhase !== GamePhase.TIME_UP) return;

    const isCurrentTeam = state.teams[state.currentTeamIndex].id === teamId;

    // If another team guessed, add +1 directly to their position
    const updatedTeams = state.teams.map((team) => {
      if (team.id === teamId && !isCurrentTeam) {
        return {
          ...team,
          position: Math.min(team.position + 1, state.boardSize),
        };
      }
      return team;
    });

    // If current team guessed, add to turn score instead
    const newTurnScore = isCurrentTeam
      ? state.turn.turnScore + 1
      : state.turn.turnScore;

    set({
      gamePhase: GamePhase.END_OF_TURN,
      teams: updatedTeams,
      turn: { ...state.turn, turnScore: newTurnScore },
    });
  },

  // ────────────────────────────────────────────
  // TIME_UP → END_OF_TURN (no bonus)
  // ────────────────────────────────────────────
  dismissBonus: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.TIME_UP) return;

    set({ gamePhase: GamePhase.END_OF_TURN });
  },

  // ────────────────────────────────────────────
  // END_OF_TURN → TURN or GAME_OVER
  // ────────────────────────────────────────────
  commitTurn: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.END_OF_TURN) return;

    // Apply turn score to current team's position
    const currentTeam = state.teams[state.currentTeamIndex];
    const newPosition = calculateNewPosition(
      currentTeam.position,
      state.turn.turnScore,
      state.boardSize,
    );

    const updatedTeams = state.teams.map((team, i) =>
      i === state.currentTeamIndex
        ? { ...team, position: newPosition }
        : team,
    );

    // Check if any team has won (including via bonus point)
    const anyWinner = updatedTeams.some((t) =>
      checkWin(t.position, state.boardSize),
    );

    if (anyWinner) {
      set({
        gamePhase: GamePhase.GAME_OVER,
        teams: updatedTeams,
      });
      return;
    }

    // Rotate to next team — go to PRE_TURN so they see the board first
    const nextTeamIndex =
      (state.currentTeamIndex + 1) % state.teams.length;

    set({
      gamePhase: GamePhase.PRE_TURN,
      teams: updatedTeams,
      currentTeamIndex: nextTeamIndex,
      turn: { ...INITIAL_TURN },
      bonusWord: null,
    });
  },

  // ────────────────────────────────────────────
  // GAME_OVER → SETUP
  // ────────────────────────────────────────────
  newGame: () => {
    set({ ...INITIAL_STATE });
  },

  // ────────────────────────────────────────────
  // GAME_OVER → TURN (same config)
  // ────────────────────────────────────────────
  restartGame: () => {
    const state = get();
    if (!state.savedConfig) {
      set({ ...INITIAL_STATE });
      return;
    }
    get().initGame(state.savedConfig);
  },

  // ────────────────────────────────────────────
  // ANY → SETUP (exit to menu)
  // ────────────────────────────────────────────
  exitToMenu: () => {
    set({ ...INITIAL_STATE });
  },
}));
