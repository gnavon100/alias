import { useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from './TimerDisplay';

export default function TurnPanel() {
  const currentWord = useGameStore((s) => s.turn.currentWord);
  const turnScore = useGameStore((s) => s.turn.turnScore);
  const wordsCorrect = useGameStore((s) => s.turn.wordsCorrect);
  const wordsSkipped = useGameStore((s) => s.turn.wordsSkipped);
  const turnDuration = useGameStore((s) => s.turnDuration);
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const correctGuess = useGameStore((s) => s.correctGuess);
  const skipWord = useGameStore((s) => s.skipWord);
  const endTimer = useGameStore((s) => s.endTimer);

  const currentTeam = teams[currentTeamIndex];

  const handleExpire = useCallback(() => {
    endTimer();
  }, [endTimer]);

  const { remaining, total, phase, progress, start } = useTimer({
    duration: turnDuration,
    onExpire: handleExpire,
  });

  // Auto-start timer when component mounts
  useEffect(() => {
    start();
  }, [start]);

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full">
      {/* ── Header: team name + timer ── */}
      <div className="space-y-3">
        {/* Team indicator */}
        <div className="flex items-center justify-center gap-3">
          <div
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: currentTeam.color.hex }}
          />
          <h2 className="text-2xl font-bold text-slate-100">
            {currentTeam.name}
          </h2>
        </div>

        {/* Timer */}
        <TimerDisplay
          remaining={remaining}
          total={total}
          phase={phase}
          progress={progress}
        />
      </div>

      {/* ── Word card ── */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="bg-slate-800 rounded-3xl p-8 w-full text-center shadow-2xl border border-slate-700">
          <p className="text-4xl sm:text-5xl font-black text-white leading-tight">
            {currentWord?.word ?? '...'}
          </p>
        </div>
      </div>

      {/* ── Score strip ── */}
      <div className="flex justify-center gap-6 text-sm text-slate-400 mb-4">
        <span>
          ✅ {wordsCorrect}
        </span>
        <span className="font-bold text-lg text-slate-200">
          ניקוד: {turnScore >= 0 ? `+${turnScore}` : turnScore}
        </span>
        <span>
          ❌ {wordsSkipped}
        </span>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex gap-3">
        <button onClick={skipWord} className="btn-skip flex-1">
          ❌ דלג
        </button>
        <button onClick={correctGuess} className="btn-correct flex-1">
          ✅ נכון
        </button>
      </div>
    </div>
  );
}
