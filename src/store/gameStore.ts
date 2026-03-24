import { create } from 'zustand';
import type { GameState, GameActions, GameConfig, TurnState, Team } from '../types';
import { GamePhase } from '../types';
import { TEAM_COLORS } from '../constants';
import { validateDataset, fisherYatesShuffle, drawNextWord } from '../utils/wordSelection';
import { calculateNewPosition, checkWin } from '../utils/scoring';
import { generatePowerUpTiles, getPowerUpAtPosition } from '../utils/powerUps';
import wordData from '../data/words.json';

// ── Initial values ──

const INITIAL_TURN: TurnState = {
  currentWord: null,
  turnScore: 0,
  wordsCorrect: 0,
  wordsSkipped: 0,
  wordHistory: [],
  activePowerUp: null,
  pointMultiplier: 1,
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
  powerUpTiles: [],
  bothTeamsWordsRemaining: 0,
  bothTeamsScores: {},
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

    const teams: Team[] = config.teamNames.map((name, i) => {
      // Sanitize and limit team name length
      const sanitized = (name || '').trim().slice(0, 50);
      return {
        id: `team-${i}`,
        name: sanitized || `קבוצה ${i + 1}`,
        color: TEAM_COLORS[i],
        position: 0,
      };
    });

    const powerUpTiles = generatePowerUpTiles(config.boardSize);

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
      powerUpTiles,
      bothTeamsWordsRemaining: 0,
      bothTeamsScores: {},
    });
  },

  // ────────────────────────────────────────────
  // PRE_TURN → POWER_UP_REVEAL or TURN
  // ────────────────────────────────────────────
  startTurn: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.PRE_TURN) return;

    const currentTeam = state.teams[state.currentTeamIndex];
    const powerUp = getPowerUpAtPosition(currentTeam.position, state.powerUpTiles);

    const { word, newShuffled, newIndex } = drawNextWord(
      state.shuffledWords,
      state.currentWordIndex,
    );

    const activePowerUp = powerUp?.type ?? null;
    const pointMultiplier = activePowerUp === 'speed_demon' ? 2 : 1;

    if (activePowerUp) {
      // Show the power-up reveal screen first
      set({
        gamePhase: GamePhase.POWER_UP_REVEAL,
        turn: {
          currentWord: word,
          turnScore: 0,
          wordsCorrect: 0,
          wordsSkipped: 0,
          wordHistory: [],
          activePowerUp,
          pointMultiplier,
        },
        shuffledWords: newShuffled,
        currentWordIndex: newIndex,
      });
    } else {
      set({
        gamePhase: GamePhase.TURN,
        turn: {
          currentWord: word,
          turnScore: 0,
          wordsCorrect: 0,
          wordsSkipped: 0,
          wordHistory: [],
          activePowerUp: null,
          pointMultiplier: 1,
        },
        shuffledWords: newShuffled,
        currentWordIndex: newIndex,
      });
    }
  },

  // ────────────────────────────────────────────
  // POWER_UP_REVEAL → TURN or BOTH_TEAMS_TURN
  // ────────────────────────────────────────────
  acknowledgePowerUp: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.POWER_UP_REVEAL) return;

    if (state.turn.activePowerUp === 'both_teams') {
      // Initialize both-teams competition: 5 words, no timer
      const scores: Record<string, number> = {};
      for (const team of state.teams) {
        scores[team.id] = 0;
      }
      set({
        gamePhase: GamePhase.BOTH_TEAMS_TURN,
        bothTeamsWordsRemaining: 5,
        bothTeamsScores: scores,
      });
    } else {
      set({ gamePhase: GamePhase.TURN });
    }
  },

  // ────────────────────────────────────────────
  // TURN → TURN or GAME_OVER (correct guess)
  // ────────────────────────────────────────────
  correctGuess: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.TURN) return;

    const multiplier = state.turn.pointMultiplier;
    const newTurnScore = state.turn.turnScore + multiplier;
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
  // END_OF_TURN → TURN, GIFT_OR_CURSE, STEAL_THE_LEAD, BONUS_OR_MINUS, or GAME_OVER
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

    // Check for post-turn power-up effects
    const activePowerUp = state.turn.activePowerUp;

    if (activePowerUp === 'bonus_or_minus') {
      // Apply bonus/minus: 8+ words = +3, below = -3
      const bonus = state.turn.wordsCorrect >= 8 ? 3 : -3;
      const bonusPosition = calculateNewPosition(
        newPosition,
        bonus,
        state.boardSize,
      );
      const teamsAfterBonus = updatedTeams.map((team, i) =>
        i === state.currentTeamIndex
          ? { ...team, position: bonusPosition }
          : team,
      );

      const winAfterBonus = teamsAfterBonus.some((t) =>
        checkWin(t.position, state.boardSize),
      );
      if (winAfterBonus) {
        set({ gamePhase: GamePhase.GAME_OVER, teams: teamsAfterBonus });
        return;
      }

      set({
        gamePhase: GamePhase.BONUS_OR_MINUS,
        teams: teamsAfterBonus,
      });
      return;
    }

    if (activePowerUp === 'gift_or_curse') {
      set({
        gamePhase: GamePhase.GIFT_OR_CURSE,
        teams: updatedTeams,
      });
      return;
    }

    if (activePowerUp === 'steal_the_lead') {
      set({
        gamePhase: GamePhase.STEAL_THE_LEAD,
        teams: updatedTeams,
      });
      return;
    }

    // Normal turn end — rotate to next team
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

  // ────────────────────────────────────────────
  // BOTH_TEAMS_TURN — correct guess by a team
  // ────────────────────────────────────────────
  bothTeamsCorrect: (teamId: string) => {
    const state = get();
    if (state.gamePhase !== GamePhase.BOTH_TEAMS_TURN) return;

    const newHistory = state.turn.currentWord
      ? [...state.turn.wordHistory, { word: state.turn.currentWord.word, wasCorrect: true }]
      : state.turn.wordHistory;

    const newScores = { ...state.bothTeamsScores };
    newScores[teamId] = (newScores[teamId] || 0) + 1;

    const remaining = state.bothTeamsWordsRemaining - 1;

    if (remaining <= 0) {
      // Round over — apply scores directly to positions
      const updatedTeams = state.teams.map((team) => {
        const bonus = newScores[team.id] || 0;
        if (bonus > 0) {
          return {
            ...team,
            position: calculateNewPosition(team.position, bonus, state.boardSize),
          };
        }
        return team;
      });

      const anyWinner = updatedTeams.some((t) => checkWin(t.position, state.boardSize));

      if (anyWinner) {
        set({
          gamePhase: GamePhase.GAME_OVER,
          teams: updatedTeams,
          turn: { ...state.turn, wordHistory: newHistory },
          bothTeamsScores: newScores,
          bothTeamsWordsRemaining: 0,
        });
        return;
      }

      // Advance to next team
      const nextTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
      set({
        gamePhase: GamePhase.PRE_TURN,
        teams: updatedTeams,
        currentTeamIndex: nextTeamIndex,
        turn: { ...INITIAL_TURN },
        bonusWord: null,
        bothTeamsScores: newScores,
        bothTeamsWordsRemaining: 0,
      });
      return;
    }

    // Draw next word
    const { word, newShuffled, newIndex } = drawNextWord(
      state.shuffledWords,
      state.currentWordIndex,
    );

    set({
      turn: {
        ...state.turn,
        currentWord: word,
        wordHistory: newHistory,
      },
      shuffledWords: newShuffled,
      currentWordIndex: newIndex,
      bothTeamsWordsRemaining: remaining,
      bothTeamsScores: newScores,
    });
  },

  // ────────────────────────────────────────────
  // BOTH_TEAMS_TURN — skip (nobody guessed)
  // ────────────────────────────────────────────
  bothTeamsSkip: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.BOTH_TEAMS_TURN) return;

    const newHistory = state.turn.currentWord
      ? [...state.turn.wordHistory, { word: state.turn.currentWord.word, wasCorrect: false }]
      : state.turn.wordHistory;

    const remaining = state.bothTeamsWordsRemaining - 1;

    if (remaining <= 0) {
      // Round over — apply scores directly to positions
      const newScores = state.bothTeamsScores;
      const updatedTeams = state.teams.map((team) => {
        const bonus = newScores[team.id] || 0;
        if (bonus > 0) {
          return {
            ...team,
            position: calculateNewPosition(team.position, bonus, state.boardSize),
          };
        }
        return team;
      });

      const anyWinner = updatedTeams.some((t) => checkWin(t.position, state.boardSize));

      if (anyWinner) {
        set({
          gamePhase: GamePhase.GAME_OVER,
          teams: updatedTeams,
          turn: { ...state.turn, wordHistory: newHistory },
          bothTeamsWordsRemaining: 0,
        });
        return;
      }

      const nextTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
      set({
        gamePhase: GamePhase.PRE_TURN,
        teams: updatedTeams,
        currentTeamIndex: nextTeamIndex,
        turn: { ...INITIAL_TURN },
        bonusWord: null,
        bothTeamsWordsRemaining: 0,
      });
      return;
    }

    // Draw next word
    const { word, newShuffled, newIndex } = drawNextWord(
      state.shuffledWords,
      state.currentWordIndex,
    );

    set({
      turn: {
        ...state.turn,
        currentWord: word,
        wordHistory: newHistory,
      },
      shuffledWords: newShuffled,
      currentWordIndex: newIndex,
      bothTeamsWordsRemaining: remaining,
    });
  },

  // ────────────────────────────────────────────
  // GIFT_OR_CURSE → PRE_TURN or GAME_OVER
  // ────────────────────────────────────────────
  applyGiftOrCurse: (teamId: string, delta: number) => {
    const state = get();
    if (state.gamePhase !== GamePhase.GIFT_OR_CURSE) return;

    const updatedTeams = state.teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          position: calculateNewPosition(team.position, delta, state.boardSize),
        };
      }
      return team;
    });

    const anyWinner = updatedTeams.some((t) => checkWin(t.position, state.boardSize));

    if (anyWinner) {
      set({ gamePhase: GamePhase.GAME_OVER, teams: updatedTeams });
      return;
    }

    const nextTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
    set({
      gamePhase: GamePhase.PRE_TURN,
      teams: updatedTeams,
      currentTeamIndex: nextTeamIndex,
      turn: { ...INITIAL_TURN },
      bonusWord: null,
    });
  },

  // ────────────────────────────────────────────
  // STEAL_THE_LEAD → PRE_TURN or GAME_OVER
  // ────────────────────────────────────────────
  applyStealTheLead: (targetTeamId: string | null) => {
    const state = get();
    if (state.gamePhase !== GamePhase.STEAL_THE_LEAD) return;

    let updatedTeams = [...state.teams];

    if (targetTeamId) {
      const currentTeam = updatedTeams[state.currentTeamIndex];
      const targetTeam = updatedTeams.find((t) => t.id === targetTeamId);
      if (targetTeam) {
        const tempPosition = currentTeam.position;
        updatedTeams = updatedTeams.map((team) => {
          if (team.id === currentTeam.id) return { ...team, position: targetTeam.position };
          if (team.id === targetTeamId) return { ...team, position: tempPosition };
          return team;
        });
      }
    }

    const anyWinner = updatedTeams.some((t) => checkWin(t.position, state.boardSize));

    if (anyWinner) {
      set({ gamePhase: GamePhase.GAME_OVER, teams: updatedTeams });
      return;
    }

    const nextTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
    set({
      gamePhase: GamePhase.PRE_TURN,
      teams: updatedTeams,
      currentTeamIndex: nextTeamIndex,
      turn: { ...INITIAL_TURN },
      bonusWord: null,
    });
  },

  // ────────────────────────────────────────────
  // SETUP — shuffle team order randomly
  // ────────────────────────────────────────────
  shuffleTeamOrder: () => {
    const state = get();
    if (state.gamePhase !== GamePhase.PRE_TURN) return;

    // Fisher-Yates shuffle of teams array
    const shuffled = [...state.teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    set({ teams: shuffled, currentTeamIndex: 0 });
  },
}));
