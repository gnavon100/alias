import { useGameStore } from '../store/gameStore';

export default function EndOfTurnModal() {
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turn = useGameStore((s) => s.turn);
  const commitTurn = useGameStore((s) => s.commitTurn);

  const currentTeam = teams[currentTeamIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl border border-slate-700">
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-100">סיכום תור</h2>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentTeam.color.hex }}
            />
            <span className="text-lg font-semibold text-slate-300">
              {currentTeam.name}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-slate-400">✅ מילים נכונות</span>
            <span className="text-green-400 font-bold">{turn.wordsCorrect}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-slate-400">❌ דילוגים</span>
            <span className="text-red-400 font-bold">{turn.wordsSkipped}</span>
          </div>
          <hr className="border-slate-700" />
          <div className="flex justify-between text-xl">
            <span className="text-slate-200 font-semibold">סה״כ</span>
            <span
              className={`font-black text-2xl ${
                turn.turnScore >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {turn.turnScore >= 0 ? `+${turn.turnScore}` : turn.turnScore}
            </span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 text-center">
            לוח תוצאות
          </h3>
          {teams.map((team, i) => (
            <div
              key={team.id}
              className={`flex items-center justify-between px-4 py-2 rounded-xl ${
                i === currentTeamIndex
                  ? 'bg-slate-700'
                  : 'bg-slate-800/50'
              }`}
              style={
                i === currentTeamIndex
                  ? { outline: `2px solid ${currentTeam.color.hex}`, outlineOffset: '-2px' }
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: team.color.hex }}
                />
                <span className="text-slate-200 font-medium">{team.name}</span>
              </div>
              <span className="text-slate-400 font-semibold">
                משבצת {team.position}
              </span>
            </div>
          ))}
        </div>

        {/* Continue button */}
        <button onClick={commitTurn} className="btn-primary w-full">
          ▶ המשך
        </button>
      </div>
    </div>
  );
}
