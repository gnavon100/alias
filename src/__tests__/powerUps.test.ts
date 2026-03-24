import { describe, it, expect } from 'vitest';
import { generatePowerUpTiles, getPowerUpAtPosition } from '../utils/powerUps';
import type { PowerUpTile, PowerUpType } from '../types';

const VALID_TYPES: PowerUpType[] = [
  'both_teams',
  'bonus_or_minus',
  'speed_demon',
  'gift_or_curse',
  'steal_the_lead',
];

describe('generatePowerUpTiles', () => {
  it('generates power-up tiles for a standard board (30)', () => {
    const tiles = generatePowerUpTiles(30);
    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) {
      expect(tile.position).toBeGreaterThan(0);
      expect(tile.position).toBeLessThan(29); // not on finish
      expect(VALID_TYPES).toContain(tile.type);
    }
  });

  it('never places a tile at position 0 (start)', () => {
    for (let i = 0; i < 50; i++) {
      const tiles = generatePowerUpTiles(30);
      expect(tiles.every((t) => t.position > 0)).toBe(true);
    }
  });

  it('never places a tile on the finish tile (boardSize - 1)', () => {
    for (let i = 0; i < 50; i++) {
      const tiles = generatePowerUpTiles(30);
      expect(tiles.every((t) => t.position < 29)).toBe(true);
    }
  });

  it('places tiles with gaps of 8-12 between them', () => {
    for (let run = 0; run < 50; run++) {
      const tiles = generatePowerUpTiles(100);
      // First tile should be at gap 8-12 from start (position 0)
      if (tiles.length > 0) {
        expect(tiles[0].position).toBeGreaterThanOrEqual(8);
        expect(tiles[0].position).toBeLessThanOrEqual(12);
      }
      // Subsequent gaps
      for (let i = 1; i < tiles.length; i++) {
        const gap = tiles[i].position - tiles[i - 1].position;
        expect(gap).toBeGreaterThanOrEqual(8);
        expect(gap).toBeLessThanOrEqual(12);
      }
    }
  });

  it('generates more tiles for larger boards', () => {
    // Run multiple times to handle randomness
    let small = 0;
    let large = 0;
    for (let i = 0; i < 20; i++) {
      small += generatePowerUpTiles(30).length;
      large += generatePowerUpTiles(100).length;
    }
    expect(large / 20).toBeGreaterThan(small / 20);
  });

  it('generates 0 tiles for very small boards (< 9)', () => {
    const tiles = generatePowerUpTiles(5);
    expect(tiles.length).toBe(0);
  });

  it('assigns only valid power-up types', () => {
    for (let i = 0; i < 30; i++) {
      const tiles = generatePowerUpTiles(60);
      for (const tile of tiles) {
        expect(VALID_TYPES).toContain(tile.type);
      }
    }
  });

  it('tiles have unique positions (no duplicates)', () => {
    for (let i = 0; i < 30; i++) {
      const tiles = generatePowerUpTiles(50);
      const positions = tiles.map((t) => t.position);
      expect(new Set(positions).size).toBe(positions.length);
    }
  });
});

describe('getPowerUpAtPosition', () => {
  const sampleTiles: PowerUpTile[] = [
    { position: 10, type: 'speed_demon' },
    { position: 20, type: 'gift_or_curse' },
    { position: 30, type: 'both_teams' },
  ];

  it('returns the power-up tile at the matching position', () => {
    expect(getPowerUpAtPosition(10, sampleTiles)).toEqual({
      position: 10,
      type: 'speed_demon',
    });
    expect(getPowerUpAtPosition(20, sampleTiles)).toEqual({
      position: 20,
      type: 'gift_or_curse',
    });
  });

  it('returns undefined when no tile exists at position', () => {
    expect(getPowerUpAtPosition(5, sampleTiles)).toBeUndefined();
    expect(getPowerUpAtPosition(15, sampleTiles)).toBeUndefined();
    expect(getPowerUpAtPosition(0, sampleTiles)).toBeUndefined();
  });

  it('returns undefined for empty tiles array', () => {
    expect(getPowerUpAtPosition(10, [])).toBeUndefined();
  });
});
