import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { haptic } from '../utils/haptics';
import { useAudio } from '../hooks/useAudio';
import { wordCard } from '../utils/motion';

export default function BothTeamsPanel() {
  const currentWord = useGameStore((s) => s.turn.currentWord);
  const teams = useGameStore((s) => s.teams);
  const bothTeamsWordsRemaining = useGameStore((s) => s.bothTeamsWordsRemaining);
  const bothTeamsScores = useGameStore((s) => s.bothTeamsScores);
  const bothTeamsCorrect = useGameStore((s) => s.bothTeamsCorrect);
  const bothTeamsSkip = useGameStore((s) => s.bothTeamsSkip);
  const { play } = useAudio();

  const handleCorrect = (teamId: string) => {
    bothTeamsCorrect(teamId);
    play('correct');
    haptic('light');
  };

  const handleSkip = () => {
    bothTeamsSkip();
    play('skip');
    haptic('medium');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="text-3xl">⚔️</span>
          <h2 className="text-2xl font-black text-yellow-400">קרב קבוצות!</h2>
          <span className="text-3xl">⚔️</span>
        </motion.div>

        {/* Words remaining */}
        <div className="bg-slate-800 rounded-xl px-4 py-2 inline-block">
          <span className="text-slate-400 text-sm">מילים שנותרו: </span>
          <span className="text-white font-bold text-lg">{bothTeamsWordsRemaining}</span>
        </div>

        {/* Current scores */}
        <div className="flex justify-center gap-4 flex-wrap">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-1"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: team.color.hex }}
              />
              <span className="text-slate-300 text-sm font-medium">{team.name}</span>
              <span className="text-white font-bold">{bothTeamsScores[team.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Word card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord?.word ?? 'empty'}
            {...wordCard}
            className="bg-slate-800 rounded-3xl p-8 w-full text-center shadow-2xl border-2 border-yellow-400/30"
          >
            <p className="text-4xl sm:text-5xl font-black text-white leading-tight">
              {currentWord?.word ?? '...'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Team guess buttons */}
      <div className="space-y-3">
        <p className="text-center text-slate-400 text-sm font-medium">מי ניחש?</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {teams.map((team) => (
            <motion.button
              key={team.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleCorrect(team.id)}
              className="flex-1 min-w-[120px] py-3 rounded-xl font-bold text-lg text-white
                         transition-colors hover:opacity-90"
              style={{ backgroundColor: team.color.hex }}
            >
              ✅ {team.name}
            </motion.button>
          ))}
        </div>

        {/* Skip button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSkip}
          className="btn-skip w-full"
        >
          ❌ אף אחד — דלג
        </motion.button>
      </div>
    </div>
  );
}
