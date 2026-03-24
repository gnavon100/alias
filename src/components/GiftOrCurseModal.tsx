import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { haptic } from '../utils/haptics';
import { modalOverlay, modalContent } from '../utils/motion';

export default function GiftOrCurseModal() {
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const applyGiftOrCurse = useGameStore((s) => s.applyGiftOrCurse);

  const currentTeam = teams[currentTeamIndex];
  const otherTeams = teams.filter((_, i) => i !== currentTeamIndex);

  const handleChoice = (teamId: string, delta: number) => {
    applyGiftOrCurse(teamId, delta);
    haptic('heavy');
  };

  return (
    <motion.div
      {...modalOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div
        {...modalContent}
        className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl border-2 border-purple-400/60"
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-6xl block">🎁</span>
          <h2 className="text-3xl font-black text-purple-300">מתנה או קללה</h2>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentTeam.color.hex }}
            />
            <span className="text-slate-300 font-medium">{currentTeam.name}</span>
          </div>
          <p className="text-slate-400 text-sm">
            בחרו קבוצה — תנו לה מתנה של +3 צעדים או קללה של -3!
          </p>
        </div>

        {/* Team selection */}
        <div className="space-y-3">
          {otherTeams.map((team) => (
            <div key={team.id} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color.hex }}
                />
                <span className="text-slate-200 font-semibold">{team.name}</span>
                <span className="text-slate-500 text-sm">
                  (משבצת {team.position})
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(team.id, 3)}
                  className="flex-1 py-3 rounded-xl font-bold text-lg bg-green-500/20 text-green-400
                             border-2 border-green-500/40 hover:bg-green-500/30 transition-colors"
                >
                  🎁 +3
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(team.id, -3)}
                  className="flex-1 py-3 rounded-xl font-bold text-lg bg-red-500/20 text-red-400
                             border-2 border-red-500/40 hover:bg-red-500/30 transition-colors"
                >
                  💀 -3
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
