import { useGameStore } from '../store/gameStore';
import { checkWin } from '../utils/scoring';

export default function GameOverModal() {
  const teams = useGameStore((s) => s.teams);
  const boardSize = useGameStore((s) => s.boardSize);
  const newGame = useGameStore((s) => s.newGame);
  const restartGame = useGameStore((s) => s.restartGame);

  // Find the winners (could be multiple if tie)
  const winners = teams.filter((t) => checkWin(t.position, boardSize));
  const sortedTeams = [...teams].sort((a, b) => b.position - a.position);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl border border-slate-700">
        {/* Winner announcement */}
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black">🏆</h2>
          {winners.length === 1 ? (
            <>
              <h3 className="text-3xl font-black text-yellow-400">
                {winners[0].name} ניצחו!
              </h3>
              <div
                className="w-12 h-12 rounded-full mx-auto"
                style={{ backgroundColor: winners[0].color.hex }}
              />
            </>
          ) : (
            <h3 className="text-3xl font-black text-yellow-400">
              תיקו!
            </h3>
          )}
        </div>

        {/* Final standings */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-500 text-center">
            דירוג סופי
          </h4>
          {sortedTeams.map((team, rank) => (
            <div
              key={team.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-bold text-lg w-6 text-center">
                  {rank + 1}
                </span>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color.hex }}
                />
                <span className="text-slate-200 font-semibold">
                  {team.name}
                </span>
              </div>
              <span className="text-slate-400 font-bold">
                {team.position}/{boardSize}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button onClick={restartGame} className="btn-primary w-full">
            🔄 שחק שוב
          </button>
          <button onClick={newGame} className="btn-secondary w-full">
            ⚙️ הגדרות חדשות
          </button>
        </div>
      </div>
    </div>
  );
}
