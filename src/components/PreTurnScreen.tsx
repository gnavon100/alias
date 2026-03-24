import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAudio } from '../hooks/useAudio';
import { haptic } from '../utils/haptics';
import Board from './Board';

export default function PreTurnScreen() {
  const teams = useGameStore((s) => s.teams);
  const boardSize = useGameStore((s) => s.boardSize);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const startTurn = useGameStore((s) => s.startTurn);
  const shuffleTeamOrder = useGameStore((s) => s.shuffleTeamOrder);
  const { play } = useAudio();

  const currentTeam = teams[currentTeamIndex];

  // Is this the very start of a game? (all teams at position 0 and index 0)
  const isGameStart = currentTeamIndex === 0 && teams.every((t) => t.position === 0);

  // Shuffle animation state
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleDisplay, setShuffleDisplay] = useState<string[]>([]);
  const [shuffleDone, setShuffleDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleShuffle = () => {
    if (isShuffling) return;
    setIsShuffling(true);
    setShuffleDone(false);
    haptic('medium');

    let count = 0;
    const totalShuffles = 15;
    const speedUp = [80, 80, 80, 100, 100, 120, 120, 150, 150, 180, 200, 250, 300, 350, 400];

    const doShuffle = () => {
      // Create a random permutation of team names for visual display
      const names = teams.map((t) => t.name);
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
      setShuffleDisplay(names);
      play('tick');
      haptic('light');
      count++;

      if (count >= totalShuffles) {
        // Final shuffle — apply the actual team reorder
        shuffleTeamOrder();
        setIsShuffling(false);
        setShuffleDone(true);
        play('correct');
        haptic('heavy');
        return;
      }

      // Schedule next shuffle with increasing delay
      const delay = speedUp[Math.min(count, speedUp.length - 1)];
      intervalRef.current = setTimeout(doShuffle, delay);
    };

    doShuffle();
  };

  // Update display after shuffle finishes
  useEffect(() => {
    if (shuffleDone) {
      setShuffleDisplay(teams.map((t) => t.name));
    }
  }, [shuffleDone, teams]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Board */}
      <div className="pt-3 pb-2">
        <Board teams={teams} boardSize={boardSize} />
      </div>

      {/* Team announcement + start button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full"
      >
        {/* Scoreboard */}
        <div className="w-full space-y-2">
          <AnimatePresence mode="popLayout">
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className={`flex items-center justify-between px-4 py-2 rounded-xl ${
                  i === currentTeamIndex ? 'bg-slate-700' : 'bg-slate-800/50'
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
                  {team.position}/{boardSize}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Random Team Order button (only at game start) */}
        {isGameStart && !shuffleDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Shuffle animation display */}
            {isShuffling && shuffleDisplay.length > 0 && (
              <motion.div
                className="bg-slate-800 rounded-2xl p-4 mb-3 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <p className="text-center text-yellow-400 text-sm font-bold mb-2">
                  🎲 מערבב...
                </p>
                {shuffleDisplay.map((name, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-1.5"
                    initial={{ x: Math.random() * 100 - 50 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <span className="text-yellow-400 font-bold text-sm w-5">{i + 1}.</span>
                    <span className="text-slate-200 font-medium">{name}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShuffle}
              disabled={isShuffling}
              className="btn-secondary w-full text-lg disabled:opacity-50"
            >
              🎲 סדר אקראי
            </motion.button>
          </motion.div>
        )}

        {/* Shuffle result display */}
        {shuffleDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-full bg-slate-800 rounded-2xl p-4 space-y-2"
          >
            <p className="text-center text-green-400 text-sm font-bold mb-2">
              ✅ סדר המשחק נקבע!
            </p>
            {teams.map((team, i) => (
              <div
                key={team.id}
                className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-1.5"
              >
                <span className="text-green-400 font-bold text-sm w-5">{i + 1}.</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: team.color.hex }}
                />
                <span className="text-slate-200 font-medium">{team.name}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Team up next */}
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-lg">התור של</p>
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: currentTeam.color.hex }}
            />
            <h2 className="text-4xl font-black text-slate-100">
              {currentTeam.name}
            </h2>
          </div>
        </div>

        {/* Start button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startTurn}
          disabled={isShuffling}
          className="btn-primary w-full text-2xl disabled:opacity-40 disabled:pointer-events-none"
          style={{
            backgroundColor: isShuffling ? undefined : currentTeam.color.hex,
          }}
        >
          ▶ התחל תור
        </motion.button>
      </motion.div>
    </div>
  );
}
