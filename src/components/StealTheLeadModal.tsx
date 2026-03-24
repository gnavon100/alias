import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { haptic } from '../utils/haptics';
import { modalOverlay, modalContent } from '../utils/motion';

export default function StealTheLeadModal() {
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const applyStealTheLead = useGameStore((s) => s.applyStealTheLead);

  const currentTeam = teams[currentTeamIndex];
  const otherTeams = teams.filter((_, i) => i !== currentTeamIndex);

  // Pick a random target team (determined once)
  const randomTarget = useMemo(() => {
    return otherTeams[Math.floor(Math.random() * otherTeams.length)];
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    haptic('medium');
  };

  const handleSwap = () => {
    applyStealTheLead(randomTarget.id);
    haptic('heavy');
  };

  const handleDecline = () => {
    applyStealTheLead(null);
    haptic('light');
  };

  return (
    <motion.div
      {...modalOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div
        {...modalContent}
        className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl border-2 border-cyan-400/60"
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-6xl block">🔀</span>
          <h2 className="text-3xl font-black text-cyan-300">גניבת מובילות</h2>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentTeam.color.hex }}
            />
            <span className="text-slate-300 font-medium">{currentTeam.name}</span>
            <span className="text-slate-500 text-sm">(משבצת {currentTeam.position})</span>
          </div>
        </div>

        {!revealed ? (
          <>
            <p className="text-slate-300 text-center text-lg">
              רוצים להחליף מיקום עם קבוצה אקראית?
            </p>
            <p className="text-slate-500 text-center text-sm">
              לא תדעו עם מי עד שתגלו! 🎲
            </p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDecline}
                className="flex-1 py-3 rounded-xl font-bold text-lg bg-slate-700 text-slate-300
                           hover:bg-slate-600 transition-colors"
              >
                ❌ ויתור
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReveal}
                className="flex-1 py-3 rounded-xl font-bold text-lg bg-cyan-500 text-white
                           hover:bg-cyan-400 transition-colors"
              >
                🎲 גלה!
              </motion.button>
            </div>
          </>
        ) : (
          <>
            {/* Reveal animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="bg-slate-900 rounded-2xl p-5 text-center space-y-3"
            >
              <p className="text-slate-400 text-sm">ההחלפה היא עם...</p>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: randomTarget.color.hex }}
                />
                <span className="text-2xl font-black text-white">
                  {randomTarget.name}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                משבצת {randomTarget.position}
              </p>
            </motion.div>

            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <p className="text-slate-400 text-sm">
                <span style={{ color: currentTeam.color.hex }} className="font-bold">
                  {currentTeam.name}
                </span>
                {' '}(משבצת {currentTeam.position}) ↔{' '}
                <span style={{ color: randomTarget.color.hex }} className="font-bold">
                  {randomTarget.name}
                </span>
                {' '}(משבצת {randomTarget.position})
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDecline}
                className="flex-1 py-3 rounded-xl font-bold text-lg bg-slate-700 text-slate-300
                           hover:bg-slate-600 transition-colors"
              >
                ❌ ויתור
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSwap}
                className="flex-1 py-3 rounded-xl font-bold text-lg bg-cyan-500 text-white
                           hover:bg-cyan-400 transition-colors"
              >
                🔀 החלף!
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
