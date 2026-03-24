import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { POWER_UP_INFO } from '../types';
import { haptic } from '../utils/haptics';
import { useAudio } from '../hooks/useAudio';
import { useEffect } from 'react';

export default function PowerUpRevealModal() {
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const activePowerUp = useGameStore((s) => s.turn.activePowerUp);
  const acknowledgePowerUp = useGameStore((s) => s.acknowledgePowerUp);
  const { play } = useAudio();

  const currentTeam = teams[currentTeamIndex];
  const info = activePowerUp ? POWER_UP_INFO[activePowerUp] : null;

  useEffect(() => {
    haptic('heavy');
    play('correct');
  }, [play]);

  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
        className="bg-slate-800 rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl border-2 border-yellow-400/60"
      >
        {/* Power-up icon with bounce */}
        <motion.div
          className="text-center"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.5 }}
        >
          <motion.span
            className="text-8xl block"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {info.emoji}
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-yellow-400 text-sm font-bold tracking-wider">
            ⭐ משבצת מיוחדת! ⭐
          </p>
          <h2 className="text-3xl font-black text-white">
            {info.name}
          </h2>
        </motion.div>

        {/* Description */}
        <motion.div
          className="bg-slate-900/80 rounded-2xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-slate-200 text-lg leading-relaxed">
            {info.description}
          </p>
        </motion.div>

        {/* Team indicator */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: currentTeam.color.hex }}
          />
          <span className="text-slate-300 font-semibold">
            {currentTeam.name}
          </span>
        </motion.div>

        {/* Start button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            acknowledgePowerUp();
            haptic('light');
          }}
          className="btn-primary w-full text-2xl"
          style={{ backgroundColor: currentTeam.color.hex }}
        >
          🚀 יאללה!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
