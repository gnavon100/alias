import { describe, it, expect } from 'vitest';
import { calculateNewPosition, checkWin, findWinner } from '../utils/scoring';
import type { Team } from '../types';

describe('calculateNewPosition', () => {
  it('adds positive turn score to position', () => {
    expect(calculateNewPosition(5, 3, 30)).toBe(8);
  });

  it('subtracts negative turn score from position', () => {
    expect(calculateNewPosition(5, -3, 30)).toBe(2);
  });

  it('clamps to 0 when going negative', () => {
    expect(calculateNewPosition(2, -5, 30)).toBe(0);
  });

  it('clamps to boardSize when exceeding', () => {
    expect(calculateNewPosition(28, 5, 30)).toBe(30);
  });

  it('returns exactly boardSize when reaching it', () => {
    expect(calculateNewPosition(25, 5, 30)).toBe(30);
  });

  it('handles zero turn score', () => {
    expect(calculateNewPosition(10, 0, 30)).toBe(10);
  });
});

describe('checkWin', () => {
  it('returns true when position equals boardSize', () => {
    expect(checkWin(30, 30)).toBe(true);
  });

  it('returns true when position exceeds boardSize', () => {
    expect(checkWin(35, 30)).toBe(true);
  });

  it('returns false when position is below boardSize', () => {
    expect(checkWin(29, 30)).toBe(false);
  });

  it('returns false at position 0', () => {
    expect(checkWin(0, 30)).toBe(false);
  });
});

describe('findWinner', () => {
  const makeTeam = (id: string, position: number): Team => ({
    id,
    name: id,
    color: { name: 'red', bg: 'bg-red', text: 'text-red', hex: '#f00' },
    position,
  });

  it('returns the winning team', () => {
    const teams = [makeTeam('a', 10), makeTeam('b', 30)];
    expect(findWinner(teams, 30)?.id).toBe('b');
  });

  it('returns null when no team has won', () => {
    const teams = [makeTeam('a', 10), makeTeam('b', 20)];
    expect(findWinner(teams, 30)).toBeNull();
  });

  it('returns the first winning team if multiple winners', () => {
    const teams = [makeTeam('a', 30), makeTeam('b', 30)];
    expect(findWinner(teams, 30)?.id).toBe('a');
  });
});
