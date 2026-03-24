import type { Team } from '../types';
import { useGameStore } from '../store/gameStore';

interface BoardProps {
  teams: Team[];
  boardSize: number;
}

export default function Board({ teams, boardSize }: BoardProps) {
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const powerUpTiles = useGameStore((s) => s.powerUpTiles);

  // boardSize+1 tiles: indices 0..boardSize-1 are play tiles (labeled 1..boardSize),
  // index boardSize is the finish tile (🏁)
  const tiles = Array.from({ length: boardSize + 1 }, (_, i) => i);

  // Build a map: position → list of teams at that position
  const positionMap = new Map<number, Team[]>();
  for (const team of teams) {
    const pos = Math.min(team.position, boardSize); // clamp to finish tile
    if (!positionMap.has(pos)) positionMap.set(pos, []);
    positionMap.get(pos)!.push(team);
  }

  // Build a set of power-up positions for quick lookup
  const powerUpPositions = new Set(powerUpTiles.map((t) => t.position));

  return (
    <div className="w-full px-2">
      <div className="flex flex-wrap gap-1 justify-center">
        {tiles.map((tileIndex) => {
          const teamsHere = positionMap.get(tileIndex) || [];
          const isFinish = tileIndex === boardSize;
          const isStart = tileIndex === 0;
          const isPowerUp = powerUpPositions.has(tileIndex) && !isFinish && !isStart;

          return (
            <div
              key={tileIndex}
              className={`
                relative w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center
                text-[10px] font-semibold transition-colors
                ${isFinish ? 'bg-yellow-400/40 ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900' : ''}
                ${isStart && !isFinish ? 'bg-green-500/30 ring-1 ring-green-500' : ''}
                ${isPowerUp ? 'bg-purple-500/25 ring-1 ring-purple-400/60' : ''}
                ${!isFinish && !isStart && !isPowerUp ? 'bg-board-tile' : ''}
              `}
            >
              {/* Tile label */}
              {isFinish ? (
                <span className="text-[13px]">🏁</span>
              ) : isPowerUp ? (
                <span className="text-[11px]">⭐</span>
              ) : (
                <span className="text-slate-500">{tileIndex + 1}</span>
              )}

              {/* Team tokens */}
              {teamsHere.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center gap-px">
                  {teamsHere.map((team) => (
                    <div
                      key={team.id}
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-white/30
                        ${team.id === teams[currentTeamIndex]?.id ? 'ring-2 ring-white scale-110' : ''}
                      `}
                      style={{ backgroundColor: team.color.hex }}
                      title={team.name}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
