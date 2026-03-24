import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { GamePhase } from '../types';
import type { GameConfig } from '../types';

// Helper to get current state
const getState = () => useGameStore.getState();

// Standard 2-team config
const twoTeamConfig: GameConfig = {
  teamNames: ['Alpha', 'Beta'],
  boardSize: 30,
  turnDuration: 60,
};

const threeTeamConfig: GameConfig = {
  teamNames: ['Alpha', 'Beta', 'Gamma'],
  boardSize: 30,
  turnDuration: 60,
};

// Reset store before each test
beforeEach(() => {
  useGameStore.getState().exitToMenu();
});

// ─────────────────────────────────────────────
// BASIC GAME FLOW
// ─────────────────────────────────────────────

describe('Game initialization', () => {
  it('initializes with correct phase and teams', () => {
    getState().initGame(twoTeamConfig);
    const s = getState();
    expect(s.gamePhase).toBe(GamePhase.PRE_TURN);
    expect(s.teams).toHaveLength(2);
    expect(s.teams[0].name).toBe('Alpha');
    expect(s.teams[1].name).toBe('Beta');
    expect(s.boardSize).toBe(30);
    expect(s.turnDuration).toBe(60);
    expect(s.currentTeamIndex).toBe(0);
  });

  it('generates power-up tiles', () => {
    getState().initGame(twoTeamConfig);
    const s = getState();
    expect(s.powerUpTiles.length).toBeGreaterThan(0);
    // All tiles should be in valid range
    for (const tile of s.powerUpTiles) {
      expect(tile.position).toBeGreaterThan(0);
      expect(tile.position).toBeLessThan(s.boardSize - 1);
    }
  });

  it('initializes both-teams state', () => {
    getState().initGame(twoTeamConfig);
    const s = getState();
    expect(s.bothTeamsWordsRemaining).toBe(0);
    expect(s.bothTeamsScores).toEqual({});
  });

  it('saves config for restart', () => {
    getState().initGame(twoTeamConfig);
    expect(getState().savedConfig).toEqual(twoTeamConfig);
  });

  it('all teams start at position 0', () => {
    getState().initGame(twoTeamConfig);
    for (const team of getState().teams) {
      expect(team.position).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────
// START TURN — no power-up
// ─────────────────────────────────────────────

describe('startTurn (no power-up)', () => {
  beforeEach(() => {
    getState().initGame(twoTeamConfig);
    // Remove all power-up tiles to test vanilla behavior
    useGameStore.setState({ powerUpTiles: [] });
  });

  it('transitions from PRE_TURN to TURN', () => {
    getState().startTurn();
    expect(getState().gamePhase).toBe(GamePhase.TURN);
  });

  it('sets a current word', () => {
    getState().startTurn();
    expect(getState().turn.currentWord).not.toBeNull();
    expect(getState().turn.currentWord!.word).toBeTruthy();
  });

  it('resets turn state', () => {
    getState().startTurn();
    const t = getState().turn;
    expect(t.turnScore).toBe(0);
    expect(t.wordsCorrect).toBe(0);
    expect(t.wordsSkipped).toBe(0);
    expect(t.wordHistory).toEqual([]);
    expect(t.activePowerUp).toBeNull();
    expect(t.pointMultiplier).toBe(1);
  });

  it('does nothing if not in PRE_TURN phase', () => {
    useGameStore.setState({ gamePhase: GamePhase.SETUP });
    getState().startTurn();
    expect(getState().gamePhase).toBe(GamePhase.SETUP);
  });
});

// ─────────────────────────────────────────────
// START TURN — with power-up
// ─────────────────────────────────────────────

describe('startTurn (with power-up)', () => {
  beforeEach(() => {
    getState().initGame(twoTeamConfig);
  });

  it('transitions to POWER_UP_REVEAL when team is on power-up tile', () => {
    // Place team-0 on a power-up tile
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'speed_demon' }],
    });
    getState().startTurn();
    expect(getState().gamePhase).toBe(GamePhase.POWER_UP_REVEAL);
    expect(getState().turn.activePowerUp).toBe('speed_demon');
  });

  it('sets pointMultiplier to 2 for speed_demon', () => {
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'speed_demon' }],
    });
    getState().startTurn();
    expect(getState().turn.pointMultiplier).toBe(2);
  });

  it('sets pointMultiplier to 1 for non-speed_demon power-ups', () => {
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'gift_or_curse' }],
    });
    getState().startTurn();
    expect(getState().turn.pointMultiplier).toBe(1);
  });

  it('sets activePowerUp for each type', () => {
    const types = ['both_teams', 'bonus_or_minus', 'speed_demon', 'gift_or_curse', 'steal_the_lead'] as const;
    for (const type of types) {
      getState().exitToMenu();
      getState().initGame(twoTeamConfig);
      useGameStore.setState({
        powerUpTiles: [{ position: 0, type }],
      });
      getState().startTurn();
      expect(getState().turn.activePowerUp).toBe(type);
    }
  });
});

// ─────────────────────────────────────────────
// ACKNOWLEDGE POWER-UP
// ─────────────────────────────────────────────

describe('acknowledgePowerUp', () => {
  it('transitions to TURN for non-both_teams power-ups', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'speed_demon' }],
    });
    getState().startTurn();
    expect(getState().gamePhase).toBe(GamePhase.POWER_UP_REVEAL);

    getState().acknowledgePowerUp();
    expect(getState().gamePhase).toBe(GamePhase.TURN);
  });

  it('transitions to BOTH_TEAMS_TURN for both_teams', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'both_teams' }],
    });
    getState().startTurn();
    getState().acknowledgePowerUp();

    const s = getState();
    expect(s.gamePhase).toBe(GamePhase.BOTH_TEAMS_TURN);
    expect(s.bothTeamsWordsRemaining).toBe(5);
    expect(Object.keys(s.bothTeamsScores)).toHaveLength(2);
  });

  it('initializes scores to 0 for all teams', () => {
    getState().initGame(threeTeamConfig);
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'both_teams' }],
    });
    getState().startTurn();
    getState().acknowledgePowerUp();

    const scores = getState().bothTeamsScores;
    expect(scores['team-0']).toBe(0);
    expect(scores['team-1']).toBe(0);
    expect(scores['team-2']).toBe(0);
  });

  it('does nothing if not in POWER_UP_REVEAL phase', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });
    getState().startTurn();
    expect(getState().gamePhase).toBe(GamePhase.TURN);
    getState().acknowledgePowerUp(); // should be a no-op
    expect(getState().gamePhase).toBe(GamePhase.TURN);
  });
});

// ─────────────────────────────────────────────
// CORRECT GUESS — with point multiplier
// ─────────────────────────────────────────────

describe('correctGuess with multiplier', () => {
  it('adds 1 point normally (multiplier=1)', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });
    getState().startTurn();

    getState().correctGuess();
    expect(getState().turn.turnScore).toBe(1);
    expect(getState().turn.wordsCorrect).toBe(1);
  });

  it('adds 2 points with speed_demon (multiplier=2)', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'speed_demon' }],
    });
    getState().startTurn();
    getState().acknowledgePowerUp();

    getState().correctGuess();
    expect(getState().turn.turnScore).toBe(2);
    expect(getState().turn.wordsCorrect).toBe(1);

    getState().correctGuess();
    expect(getState().turn.turnScore).toBe(4);
    expect(getState().turn.wordsCorrect).toBe(2);
  });

  it('tracks word history correctly', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });
    getState().startTurn();

    const firstWord = getState().turn.currentWord!.word;
    getState().correctGuess();

    expect(getState().turn.wordHistory).toHaveLength(1);
    expect(getState().turn.wordHistory[0]).toEqual({
      word: firstWord,
      wasCorrect: true,
    });
  });
});

// ─────────────────────────────────────────────
// SKIP WORD
// ─────────────────────────────────────────────

describe('skipWord', () => {
  it('deducts 1 point on skip', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });
    getState().startTurn();

    getState().skipWord();
    expect(getState().turn.turnScore).toBe(-1);
    expect(getState().turn.wordsSkipped).toBe(1);
  });

  it('tracks skipped words in history', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });
    getState().startTurn();

    const word = getState().turn.currentWord!.word;
    getState().skipWord();

    expect(getState().turn.wordHistory[0]).toEqual({
      word,
      wasCorrect: false,
    });
  });
});

// ─────────────────────────────────────────────
// BOTH TEAMS COMPETITION
// ─────────────────────────────────────────────

describe('Both Teams Competition', () => {
  beforeEach(() => {
    getState().initGame(threeTeamConfig);
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'both_teams' }],
    });
    getState().startTurn();
    getState().acknowledgePowerUp();
  });

  it('starts with 5 words remaining', () => {
    expect(getState().bothTeamsWordsRemaining).toBe(5);
  });

  it('decrements remaining words on correct guess', () => {
    getState().bothTeamsCorrect('team-0');
    expect(getState().bothTeamsWordsRemaining).toBe(4);
  });

  it('awards point to the guessing team', () => {
    getState().bothTeamsCorrect('team-1');
    expect(getState().bothTeamsScores['team-1']).toBe(1);
    expect(getState().bothTeamsScores['team-0']).toBe(0);
  });

  it('decrements remaining words on skip', () => {
    getState().bothTeamsSkip();
    expect(getState().bothTeamsWordsRemaining).toBe(4);
  });

  it('draws next word on correct guess', () => {
    const word1 = getState().turn.currentWord!.word;
    getState().bothTeamsCorrect('team-0');
    if (getState().bothTeamsWordsRemaining > 0) {
      const word2 = getState().turn.currentWord!.word;
      // Very unlikely to be the same word
      expect(getState().turn.currentWord).not.toBeNull();
    }
  });

  it('ends after 5 words and applies scores to positions', () => {
    // Team-0 guesses 3, team-1 guesses 1, 1 skipped
    getState().bothTeamsCorrect('team-0');
    getState().bothTeamsCorrect('team-0');
    getState().bothTeamsCorrect('team-1');
    getState().bothTeamsSkip();
    getState().bothTeamsCorrect('team-0'); // 5th word — round over

    const s = getState();
    expect(s.gamePhase).toBe(GamePhase.PRE_TURN);
    expect(s.teams.find((t) => t.id === 'team-0')!.position).toBe(3);
    expect(s.teams.find((t) => t.id === 'team-1')!.position).toBe(1);
    expect(s.teams.find((t) => t.id === 'team-2')!.position).toBe(0);
  });

  it('advances to next team after round ends', () => {
    for (let i = 0; i < 5; i++) getState().bothTeamsSkip();
    expect(getState().currentTeamIndex).toBe(1);
  });

  it('triggers game over if a team wins during both-teams', () => {
    // Set team-0 near the finish
    const teams = getState().teams.map((t) =>
      t.id === 'team-0' ? { ...t, position: 29 } : t,
    );
    useGameStore.setState({ teams });

    // Team-0 guesses and crosses finish
    for (let i = 0; i < 5; i++) getState().bothTeamsCorrect('team-0');

    expect(getState().gamePhase).toBe(GamePhase.GAME_OVER);
    expect(getState().teams.find((t) => t.id === 'team-0')!.position).toBe(30);
  });

  it('does nothing if called from wrong phase', () => {
    useGameStore.setState({ gamePhase: GamePhase.TURN });
    getState().bothTeamsCorrect('team-0');
    // Phase should not change
    expect(getState().gamePhase).toBe(GamePhase.TURN);
  });
});

// ─────────────────────────────────────────────
// COMMIT TURN — with power-ups
// ─────────────────────────────────────────────

describe('commitTurn with bonus_or_minus', () => {
  beforeEach(() => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });
    getState().startTurn();
  });

  it('goes to BONUS_OR_MINUS phase when active and gives +3 for 8+ words', () => {
    // Manually set turn state as if speed round with bonus_or_minus
    useGameStore.setState({
      gamePhase: GamePhase.END_OF_TURN,
      turn: {
        ...getState().turn,
        activePowerUp: 'bonus_or_minus',
        turnScore: 10,
        wordsCorrect: 10,
        wordsSkipped: 0,
        pointMultiplier: 1,
      },
    });

    getState().commitTurn();
    const s = getState();
    expect(s.gamePhase).toBe(GamePhase.BONUS_OR_MINUS);
    // Team should be at position 10 (turn score) + 3 (bonus) = 13
    expect(s.teams[0].position).toBe(13);
  });

  it('gives -3 for fewer than 8 words correct', () => {
    useGameStore.setState({
      gamePhase: GamePhase.END_OF_TURN,
      turn: {
        ...getState().turn,
        activePowerUp: 'bonus_or_minus',
        turnScore: 5,
        wordsCorrect: 5,
        wordsSkipped: 0,
        pointMultiplier: 1,
      },
    });

    getState().commitTurn();
    const s = getState();
    expect(s.gamePhase).toBe(GamePhase.BONUS_OR_MINUS);
    // Team should be at position 5 (turn score) - 3 (penalty) = 2
    expect(s.teams[0].position).toBe(2);
  });

  it('clamps bonus_or_minus result to 0', () => {
    useGameStore.setState({
      gamePhase: GamePhase.END_OF_TURN,
      turn: {
        ...getState().turn,
        activePowerUp: 'bonus_or_minus',
        turnScore: 1,
        wordsCorrect: 1,
        wordsSkipped: 0,
        pointMultiplier: 1,
      },
    });

    getState().commitTurn();
    // Position = 1 - 3 = -2, clamped to 0
    expect(getState().teams[0].position).toBe(0);
  });
});

describe('commitTurn with gift_or_curse', () => {
  it('transitions to GIFT_OR_CURSE phase', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      gamePhase: GamePhase.END_OF_TURN,
      turn: {
        ...getState().turn,
        activePowerUp: 'gift_or_curse',
        turnScore: 5,
        wordsCorrect: 5,
        wordsSkipped: 0,
        pointMultiplier: 1,
        currentWord: null,
        wordHistory: [],
      },
    });

    getState().commitTurn();
    expect(getState().gamePhase).toBe(GamePhase.GIFT_OR_CURSE);
    // Turn score should have been applied
    expect(getState().teams[0].position).toBe(5);
  });
});

describe('commitTurn with steal_the_lead', () => {
  it('transitions to STEAL_THE_LEAD phase', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      gamePhase: GamePhase.END_OF_TURN,
      turn: {
        ...getState().turn,
        activePowerUp: 'steal_the_lead',
        turnScore: 3,
        wordsCorrect: 3,
        wordsSkipped: 0,
        pointMultiplier: 1,
        currentWord: null,
        wordHistory: [],
      },
    });

    getState().commitTurn();
    expect(getState().gamePhase).toBe(GamePhase.STEAL_THE_LEAD);
    expect(getState().teams[0].position).toBe(3);
  });
});

describe('commitTurn normal (no power-up)', () => {
  it('applies score and advances to next team', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      gamePhase: GamePhase.END_OF_TURN,
      turn: {
        ...getState().turn,
        activePowerUp: null,
        turnScore: 5,
        wordsCorrect: 5,
        wordsSkipped: 0,
        pointMultiplier: 1,
        currentWord: null,
        wordHistory: [],
      },
    });

    getState().commitTurn();
    const s = getState();
    expect(s.gamePhase).toBe(GamePhase.PRE_TURN);
    expect(s.teams[0].position).toBe(5);
    expect(s.currentTeamIndex).toBe(1);
  });

  it('triggers GAME_OVER on win', () => {
    getState().initGame(twoTeamConfig);
    // Place team at position 25, turnScore 5 → 30 = win
    const teams = getState().teams.map((t, i) =>
      i === 0 ? { ...t, position: 25 } : t,
    );
    useGameStore.setState({
      teams,
      gamePhase: GamePhase.END_OF_TURN,
      turn: {
        ...getState().turn,
        activePowerUp: null,
        turnScore: 5,
        wordsCorrect: 5,
        wordsSkipped: 0,
        pointMultiplier: 1,
        currentWord: null,
        wordHistory: [],
      },
    });

    getState().commitTurn();
    expect(getState().gamePhase).toBe(GamePhase.GAME_OVER);
    expect(getState().teams[0].position).toBe(30);
  });
});

// ─────────────────────────────────────────────
// GIFT OR CURSE
// ─────────────────────────────────────────────

describe('applyGiftOrCurse', () => {
  beforeEach(() => {
    getState().initGame(twoTeamConfig);
    // Set up gift_or_curse phase
    const teams = getState().teams.map((t, i) =>
      i === 0 ? { ...t, position: 10 } : { ...t, position: 5 },
    );
    useGameStore.setState({
      teams,
      gamePhase: GamePhase.GIFT_OR_CURSE,
    });
  });

  it('gives +3 to chosen team', () => {
    getState().applyGiftOrCurse('team-1', 3);
    expect(getState().teams.find((t) => t.id === 'team-1')!.position).toBe(8);
    expect(getState().gamePhase).toBe(GamePhase.PRE_TURN);
  });

  it('gives -3 to chosen team', () => {
    getState().applyGiftOrCurse('team-1', -3);
    expect(getState().teams.find((t) => t.id === 'team-1')!.position).toBe(2);
    expect(getState().gamePhase).toBe(GamePhase.PRE_TURN);
  });

  it('clamps to 0 when giving -3 to team at position 1', () => {
    const teams = getState().teams.map((t) =>
      t.id === 'team-1' ? { ...t, position: 1 } : t,
    );
    useGameStore.setState({ teams });
    getState().applyGiftOrCurse('team-1', -3);
    expect(getState().teams.find((t) => t.id === 'team-1')!.position).toBe(0);
  });

  it('triggers GAME_OVER if gift pushes team to win', () => {
    const teams = getState().teams.map((t) =>
      t.id === 'team-1' ? { ...t, position: 28 } : t,
    );
    useGameStore.setState({ teams });
    getState().applyGiftOrCurse('team-1', 3);
    expect(getState().gamePhase).toBe(GamePhase.GAME_OVER);
  });

  it('advances to next team after applying', () => {
    getState().applyGiftOrCurse('team-1', 3);
    expect(getState().currentTeamIndex).toBe(1);
  });

  it('does nothing if not in GIFT_OR_CURSE phase', () => {
    useGameStore.setState({ gamePhase: GamePhase.TURN });
    getState().applyGiftOrCurse('team-1', 3);
    expect(getState().gamePhase).toBe(GamePhase.TURN);
  });
});

// ─────────────────────────────────────────────
// STEAL THE LEAD
// ─────────────────────────────────────────────

describe('applyStealTheLead', () => {
  beforeEach(() => {
    getState().initGame(twoTeamConfig);
    const teams = getState().teams.map((t, i) =>
      i === 0 ? { ...t, position: 5 } : { ...t, position: 20 },
    );
    useGameStore.setState({
      teams,
      gamePhase: GamePhase.STEAL_THE_LEAD,
    });
  });

  it('swaps positions when choosing to swap', () => {
    getState().applyStealTheLead('team-1');
    const s = getState();
    expect(s.teams.find((t) => t.id === 'team-0')!.position).toBe(20);
    expect(s.teams.find((t) => t.id === 'team-1')!.position).toBe(5);
    expect(s.gamePhase).toBe(GamePhase.PRE_TURN);
  });

  it('keeps positions when declining (null)', () => {
    getState().applyStealTheLead(null);
    const s = getState();
    expect(s.teams.find((t) => t.id === 'team-0')!.position).toBe(5);
    expect(s.teams.find((t) => t.id === 'team-1')!.position).toBe(20);
    expect(s.gamePhase).toBe(GamePhase.PRE_TURN);
  });

  it('advances to next team', () => {
    getState().applyStealTheLead('team-1');
    expect(getState().currentTeamIndex).toBe(1);
  });

  it('triggers GAME_OVER if swap puts team at finish', () => {
    const teams = getState().teams.map((t) =>
      t.id === 'team-1' ? { ...t, position: 30 } : t,
    );
    useGameStore.setState({ teams });
    getState().applyStealTheLead('team-1');
    expect(getState().gamePhase).toBe(GamePhase.GAME_OVER);
  });

  it('does nothing if not in STEAL_THE_LEAD phase', () => {
    useGameStore.setState({ gamePhase: GamePhase.TURN });
    getState().applyStealTheLead('team-1');
    expect(getState().gamePhase).toBe(GamePhase.TURN);
  });
});

// ─────────────────────────────────────────────
// SHUFFLE TEAM ORDER
// ─────────────────────────────────────────────

describe('shuffleTeamOrder', () => {
  it('preserves all teams (no team lost or duplicated)', () => {
    getState().initGame(threeTeamConfig);
    const originalIds = getState().teams.map((t) => t.id).sort();
    getState().shuffleTeamOrder();
    const shuffledIds = getState().teams.map((t) => t.id).sort();
    expect(shuffledIds).toEqual(originalIds);
  });

  it('resets currentTeamIndex to 0', () => {
    getState().initGame(threeTeamConfig);
    useGameStore.setState({ currentTeamIndex: 2 });
    getState().shuffleTeamOrder();
    expect(getState().currentTeamIndex).toBe(0);
  });

  it('stays in PRE_TURN phase', () => {
    getState().initGame(threeTeamConfig);
    getState().shuffleTeamOrder();
    expect(getState().gamePhase).toBe(GamePhase.PRE_TURN);
  });

  it('does nothing if not in PRE_TURN phase', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ gamePhase: GamePhase.TURN });
    const teamsBefore = getState().teams.map((t) => t.id);
    getState().shuffleTeamOrder();
    expect(getState().teams.map((t) => t.id)).toEqual(teamsBefore);
  });

  it('actually shuffles (probabilistic — at least 1 out of 20 runs differs)', () => {
    getState().initGame(threeTeamConfig);
    const original = getState().teams.map((t) => t.id).join(',');
    let changed = false;
    for (let i = 0; i < 20; i++) {
      getState().initGame(threeTeamConfig);
      getState().shuffleTeamOrder();
      const shuffled = getState().teams.map((t) => t.id).join(',');
      if (shuffled !== original) {
        changed = true;
        break;
      }
    }
    expect(changed).toBe(true);
  });
});

// ─────────────────────────────────────────────
// FULL GAME FLOW with power-up
// ─────────────────────────────────────────────

describe('Full turn flow with speed_demon', () => {
  it('completes a full turn with double points', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'speed_demon' }],
    });

    // Start turn → power-up reveal
    getState().startTurn();
    expect(getState().gamePhase).toBe(GamePhase.POWER_UP_REVEAL);
    expect(getState().turn.activePowerUp).toBe('speed_demon');
    expect(getState().turn.pointMultiplier).toBe(2);

    // Acknowledge → TURN
    getState().acknowledgePowerUp();
    expect(getState().gamePhase).toBe(GamePhase.TURN);

    // Correct guesses with ×2
    getState().correctGuess();
    getState().correctGuess();
    getState().correctGuess();
    expect(getState().turn.turnScore).toBe(6); // 3 × 2
    expect(getState().turn.wordsCorrect).toBe(3);

    // Skip
    getState().skipWord();
    expect(getState().turn.turnScore).toBe(5); // 6 - 1

    // Time up
    getState().endTimer();
    expect(getState().gamePhase).toBe(GamePhase.TIME_UP);

    // Dismiss bonus
    getState().dismissBonus();
    expect(getState().gamePhase).toBe(GamePhase.END_OF_TURN);

    // Commit — no post-turn effect for speed_demon
    getState().commitTurn();
    expect(getState().gamePhase).toBe(GamePhase.PRE_TURN);
    expect(getState().teams[0].position).toBe(5);
    expect(getState().currentTeamIndex).toBe(1);
  });
});

describe('Full turn flow with gift_or_curse', () => {
  it('completes a full turn with gift_or_curse post-turn effect', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({
      powerUpTiles: [{ position: 0, type: 'gift_or_curse' }],
    });

    getState().startTurn();
    getState().acknowledgePowerUp();
    expect(getState().gamePhase).toBe(GamePhase.TURN);

    getState().correctGuess();
    getState().correctGuess();

    getState().endTimer();
    getState().dismissBonus();
    expect(getState().gamePhase).toBe(GamePhase.END_OF_TURN);

    getState().commitTurn();
    expect(getState().gamePhase).toBe(GamePhase.GIFT_OR_CURSE);
    expect(getState().teams[0].position).toBe(2);

    // Gift +3 to team-1
    getState().applyGiftOrCurse('team-1', 3);
    expect(getState().gamePhase).toBe(GamePhase.PRE_TURN);
    expect(getState().teams.find((t) => t.id === 'team-1')!.position).toBe(3);
  });
});

describe('Mid-turn win with speed_demon', () => {
  it('triggers GAME_OVER mid-turn with doubled points', () => {
    getState().initGame(twoTeamConfig);
    const teams = getState().teams.map((t, i) =>
      i === 0 ? { ...t, position: 26 } : t,
    );
    useGameStore.setState({
      teams,
      powerUpTiles: [{ position: 26, type: 'speed_demon' }],
    });

    getState().startTurn();
    getState().acknowledgePowerUp();

    // Each correct = 2 points, need 4 to reach 30
    getState().correctGuess(); // +2 = 28
    getState().correctGuess(); // +2 = 30 → WIN!

    expect(getState().gamePhase).toBe(GamePhase.GAME_OVER);
    expect(getState().teams[0].position).toBe(30);
  });
});

// ─────────────────────────────────────────────
// TEAM ROTATION WRAPS AROUND
// ─────────────────────────────────────────────

describe('Team rotation', () => {
  it('wraps around from last team to first', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });

    // Team 0 turn
    getState().startTurn();
    getState().endTimer();
    getState().dismissBonus();
    getState().commitTurn();
    expect(getState().currentTeamIndex).toBe(1);

    // Team 1 turn
    getState().startTurn();
    getState().endTimer();
    getState().dismissBonus();
    getState().commitTurn();
    expect(getState().currentTeamIndex).toBe(0);
  });
});

// ─────────────────────────────────────────────
// EXIT, RESTART, NEW GAME
// ─────────────────────────────────────────────

describe('Game management', () => {
  it('exitToMenu resets to SETUP', () => {
    getState().initGame(twoTeamConfig);
    getState().exitToMenu();
    expect(getState().gamePhase).toBe(GamePhase.SETUP);
    expect(getState().teams).toHaveLength(0);
  });

  it('newGame resets to SETUP', () => {
    getState().initGame(twoTeamConfig);
    getState().newGame();
    expect(getState().gamePhase).toBe(GamePhase.SETUP);
  });

  it('restartGame re-initializes with same config', () => {
    getState().initGame(twoTeamConfig);
    useGameStore.setState({ powerUpTiles: [] });
    getState().startTurn();
    getState().correctGuess();

    getState().restartGame();
    const s = getState();
    expect(s.gamePhase).toBe(GamePhase.PRE_TURN);
    expect(s.teams).toHaveLength(2);
    expect(s.teams[0].position).toBe(0);
    expect(s.turn.turnScore).toBe(0);
  });
});
