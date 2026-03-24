import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useTimer } from '../hooks/useTimer';
import { useAudio } from '../hooks/useAudio';
import { haptic } from '../utils/haptics';
import { wordCard, scorePop } from '../utils/motion';
import TimerDisplay from './TimerDisplay';
import OptionsMenu from './OptionsMenu';

export default function TurnPanel() {
  const currentWord = useGameStore((s) => s.turn.currentWord);
  const turnScore = useGameStore((s) => s.turn.turnScore);
  const wordsCorrect = useGameStore((s) => s.turn.wordsCorrect);
  const wordsSkipped = useGameStore((s) => s.turn.wordsSkipped);
  const turnDuration = useGameStore((s) => s.turnDuration);
  const activePowerUp = useGameStore((s) => s.turn.activePowerUp);
  const pointMultiplier = useGameStore((s) => s.turn.pointMultiplier);
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const correctGuess = useGameStore((s) => s.correctGuess);
  const skipWord = useGameStore((s) => s.skipWord);
  const endTimer = useGameStore((s) => s.endTimer);

  const currentTeam = teams[currentTeamIndex];
  const { play } = useAudio();

  // Speed Demon: halve the turn duration
  const effectiveDuration = activePowerUp === 'speed_demon'
    ? Math.max(15, Math.floor(turnDuration / 2))
    : turnDuration;

  const handleExpire = useCallback(() => {
    endTimer();
    play('timeUp');
    haptic('heavy');
  }, [endTimer, play]);

  const { remaining, total, phase, progress, start, pause } = useTimer({
    duration: effectiveDuration,
    onExpire: handleExpire,
  });

  // Auto-start timer when component mounts
  useEffect(() => {
    start();
  }, [start]);

  // Tick sound in urgent phase
  useEffect(() => {
    if (phase === 'urgent' && remaining > 0) {
      play('tick');
    }
  }, [remaining, phase, play]);

  const handleCorrect = () => {
    correctGuess();
    play('correct');
    haptic('light');
  };

  const handleSkip = () => {
    skipWord();
    play('skip');
    haptic('medium');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* Options menu */}
      <OptionsMenu onPause={pause} onResume={start} />
      {/* ── Header: team name + timer ── */}
      <div className="space-y-3">
        {/* Team indicator */}
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: currentTeam.color.hex }}
          />
          <h2 className="text-2xl font-bold text-slate-100">
            {currentTeam.name}
          </h2>
        </motion.div>

        {/* Timer */}
        <TimerDisplay
          remaining={remaining}
          total={total}
          phase={phase}
          progress={progress}
        />

        {/* Power-up indicator */}
        {activePowerUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 bg-purple-500/20 rounded-xl px-3 py-1.5"
          >
            {activePowerUp === 'speed_demon' && (
              <span className="text-yellow-300 text-sm font-bold">⚡ כפול נקודות! | חצי זמן!</span>
            )}
            {activePowerUp === 'bonus_or_minus' && (
              <span className="text-purple-300 text-sm font-bold">🎲 8+ מילים = בונוס +3 | פחות = -3</span>
            )}
            {activePowerUp === 'gift_or_curse' && (
              <span className="text-pink-300 text-sm font-bold">🎁 בסוף — מתנה או קללה!</span>
            )}
            {activePowerUp === 'steal_the_lead' && (
              <span className="text-cyan-300 text-sm font-bold">🔀 בסוף — אפשר להחליף מיקום!</span>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Word card (animated flip) ── */}
      <div className="flex-1 flex items-center justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord?.word ?? 'empty'}
            {...wordCard}
            className="bg-slate-800 rounded-3xl p-8 w-full text-center shadow-2xl border border-slate-700"
          >
            <p className="text-4xl sm:text-5xl font-black text-white leading-tight">
              {currentWord?.word ?? '...'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Score strip (animated) ── */}
      <motion.div
        {...scorePop}
        key={turnScore}
        className="flex justify-center gap-6 text-sm text-slate-400 mb-4"
      >
        <span>✅ {wordsCorrect}</span>
        <span className="font-bold text-lg text-slate-200">
          ניקוד: {turnScore >= 0 ? `+${turnScore}` : turnScore}
          {pointMultiplier > 1 && <span className="text-yellow-400 text-sm"> (×{pointMultiplier})</span>}
        </span>
        <span>❌ {wordsSkipped}</span>
      </motion.div>

      {/* ── Action buttons ── */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSkip}
          className="btn-skip flex-1"
        >
          ❌ דלג
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleCorrect}
          className="btn-correct flex-1"
        >
          ✅ נכון
        </motion.button>
      </div>
    </div>
  );
}
