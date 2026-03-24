import type { Team } from '../types';
import { useGameStore } from '../store/gameStore';

interface BoardProps {
  teams: Team[];
  boardSize: number;
}

export default function Board({ teams, boardSize }: BoardProps) {
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const powerUpTiles = useGameStore((s) => s.powerUpTiles);

  // Simple linear board — tiles rendered as small squares in a flex-wrap grid
  const tiles = Array.from({ length: boardSize }, (_, i) => i);

  // Build a map: position → list of teams at that position
  const positionMap = new Map<number, Team[]>();
  for (const team of teams) {
    const pos = Math.min(team.position, boardSize - 1);
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
          const isFinish = tileIndex === boardSize - 1;
          const isStart = tileIndex === 0;
          const isPowerUp = powerUpPositions.has(tileIndex);

          return (
            <div
              key={tileIndex}
              className={`
                relative w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center
                text-[10px] font-semibold transition-colors
                ${isFinish ? 'bg-yellow-500/30 ring-1 ring-yellow-400' : ''}
                ${isStart ? 'bg-green-500/30 ring-1 ring-green-500' : ''}
                ${isPowerUp && !isFinish && !isStart ? 'bg-purple-500/25 ring-1 ring-purple-400/60' : ''}
                ${!isFinish && !isStart && !isPowerUp ? 'bg-board-tile' : ''}
              `}
            >
              {/* Tile content */}
              {isPowerUp && !isFinish && !isStart ? (
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
