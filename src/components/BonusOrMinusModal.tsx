import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { haptic } from '../utils/haptics';
import { modalOverlay, modalContent } from '../utils/motion';

export default function BonusOrMinusModal() {
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turn = useGameStore((s) => s.turn);

  const currentTeam = teams[currentTeamIndex];
  const gotBonus = turn.wordsCorrect >= 8;

  // After commitTurn already applied the bonus, just show result and advance
  const nextTeamIndex = (currentTeamIndex + 1) % teams.length;

  const handleContinue = () => {
    // Advance to next turn — set state directly since bonus was already applied in commitTurn
    useGameStore.setState({
      gamePhase: 'PRE_TURN' as any,
      currentTeamIndex: nextTeamIndex,
      turn: {
        currentWord: null,
        turnScore: 0,
        wordsCorrect: 0,
        wordsSkipped: 0,
        wordHistory: [],
        activePowerUp: null,
        pointMultiplier: 1,
      },
      bonusWord: null,
    });
    haptic('light');
  };

  return (
    <motion.div
      {...modalOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div
        {...modalContent}
        className={`bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl border-2 ${
          gotBonus ? 'border-green-400/60' : 'border-red-400/60'
        }`}
      >
        {/* Result */}
        <div className="text-center space-y-3">
          <motion.span
            className="text-7xl block"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 150 }}
          >
            {gotBonus ? '🎉' : '😱'}
          </motion.span>
          <h2 className={`text-3xl font-black ${gotBonus ? 'text-green-400' : 'text-red-400'}`}>
            {gotBonus ? 'בונוס!' : 'מינוס!'}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentTeam.color.hex }}
            />
            <span className="text-slate-300 font-medium">{currentTeam.name}</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-slate-900 rounded-2xl p-4 text-center space-y-2">
          <p className="text-slate-300 text-lg">
            ענו נכון על{' '}
            <span className="font-bold text-white">{turn.wordsCorrect}</span>{' '}
            מילים
          </p>
          <p className={`text-xl font-bold ${gotBonus ? 'text-green-400' : 'text-red-400'}`}>
            {gotBonus
              ? `8 ומעלה = +3 צעדי בונוס! 🚀`
              : `פחות מ-8 = -3 צעדים! 📉`}
          </p>
        </div>

        {/* Continue */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="btn-primary w-full"
        >
          ▶ המשך
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
