import { useGameStore } from '../store/gameStore';

export default function TimeUpModal() {
  const bonusWord = useGameStore((s) => s.bonusWord);
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const awardBonusPoint = useGameStore((s) => s.awardBonusPoint);
  const dismissBonus = useGameStore((s) => s.dismissBonus);

  const currentTeam = teams[currentTeamIndex];
  // Other teams that can guess the bonus word
  const otherTeams = teams.filter((_, i) => i !== currentTeamIndex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl border border-slate-700">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-yellow-400">⏰ נגמר הזמן!</h2>
          <p className="text-slate-400">מי ניחש את המילה האחרונה?</p>
        </div>

        {/* Bonus word reveal */}
        <div className="bg-slate-900 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-white">
            {bonusWord?.word ?? '—'}
          </p>
        </div>

        {/* Award to current team */}
        <button
          onClick={() => awardBonusPoint(currentTeam.id)}
          className="w-full py-3 rounded-xl font-bold text-lg transition-colors"
          style={{
            backgroundColor: currentTeam.color.hex,
            color: 'white',
          }}
        >
          ✅ {currentTeam.name} ניחשו
        </button>

        {/* Award to other teams */}
        {otherTeams.map((team) => (
          <button
            key={team.id}
            onClick={() => awardBonusPoint(team.id)}
            className="w-full py-3 rounded-xl font-bold text-lg transition-colors
                       border-2 hover:opacity-80"
            style={{
              borderColor: team.color.hex,
              color: team.color.hex,
            }}
          >
            ✅ {team.name} ניחשו
          </button>
        ))}

        {/* Nobody guessed */}
        <button
          onClick={dismissBonus}
          className="btn-secondary w-full"
        >
          ❌ אף אחד לא ניחש
        </button>
      </div>
    </div>
  );
}
