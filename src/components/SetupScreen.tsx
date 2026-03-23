import { useState } from 'react';
import { GAME_DEFAULTS, TEAM_COLORS } from '../constants';
import { useGameStore } from '../store/gameStore';

export default function SetupScreen() {
  const initGame = useGameStore((s) => s.initGame);

  const [teamCount, setTeamCount] = useState<number>(GAME_DEFAULTS.minTeams);
  const [teamNames, setTeamNames] = useState<string[]>(
    Array.from({ length: GAME_DEFAULTS.maxTeams }, (_, i) => `קבוצה ${i + 1}`),
  );
  const [boardSize, setBoardSize] = useState<number>(GAME_DEFAULTS.boardSize);
  const [turnDuration, setTurnDuration] = useState<number>(GAME_DEFAULTS.turnDuration);

  const handleNameChange = (index: number, value: string) => {
    setTeamNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleStart = () => {
    const names = teamNames.slice(0, teamCount);
    initGame({ teamNames: names, boardSize, turnDuration });
  };

  const canStart = teamCount >= GAME_DEFAULTS.minTeams;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8 max-w-md mx-auto w-full">
      {/* ── Logo ── */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black tracking-tight">🎯 אליאס</h1>
        <p className="text-slate-400 text-lg">משחק מילים קבוצתי</p>
      </div>

      {/* ── Team count ── */}
      <section className="w-full space-y-3">
        <label className="block text-lg font-semibold text-slate-200">
          מספר קבוצות
        </label>
        <div className="flex gap-2 justify-center">
          {Array.from(
            { length: GAME_DEFAULTS.maxTeams - GAME_DEFAULTS.minTeams + 1 },
            (_, i) => i + GAME_DEFAULTS.minTeams,
          ).map((n) => (
            <button
              key={n}
              onClick={() => setTeamCount(n)}
              className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                teamCount === n
                  ? 'bg-blue-500 text-white scale-110'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* ── Team names ── */}
      <section className="w-full space-y-3">
        <label className="block text-lg font-semibold text-slate-200">
          שמות קבוצות
        </label>
        <div className="space-y-2">
          {Array.from({ length: teamCount }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: TEAM_COLORS[i].hex }}
              />
              <input
                type="text"
                value={teamNames[i]}
                onChange={(e) => handleNameChange(i, e.target.value)}
                maxLength={20}
                className="flex-1 bg-slate-700 text-slate-100 px-4 py-3 rounded-xl
                           border border-slate-600 focus:border-blue-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500/30
                           text-right placeholder:text-slate-500"
                placeholder={`קבוצה ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Board size ── */}
      <section className="w-full space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-lg font-semibold text-slate-200">
            גודל לוח
          </label>
          <span className="text-blue-400 font-bold text-lg">{boardSize}</span>
        </div>
        <input
          type="range"
          min={GAME_DEFAULTS.minBoardSize}
          max={GAME_DEFAULTS.maxBoardSize}
          step={GAME_DEFAULTS.boardSizeStep}
          value={boardSize}
          onChange={(e) => setBoardSize(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-sm text-slate-500">
          <span>{GAME_DEFAULTS.minBoardSize}</span>
          <span>{GAME_DEFAULTS.maxBoardSize}</span>
        </div>
      </section>

      {/* ── Turn duration ── */}
      <section className="w-full space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-lg font-semibold text-slate-200">
            זמן תור (שניות)
          </label>
          <span className="text-blue-400 font-bold text-lg">{turnDuration}</span>
        </div>
        <input
          type="range"
          min={GAME_DEFAULTS.minTurnDuration}
          max={GAME_DEFAULTS.maxTurnDuration}
          step={GAME_DEFAULTS.turnDurationStep}
          value={turnDuration}
          onChange={(e) => setTurnDuration(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-sm text-slate-500">
          <span>{GAME_DEFAULTS.minTurnDuration}ש׳</span>
          <span>{GAME_DEFAULTS.maxTurnDuration}ש׳</span>
        </div>
      </section>

      {/* ── Start button ── */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        className="btn-primary w-full text-2xl disabled:opacity-40 disabled:pointer-events-none"
      >
        🚀 התחל משחק
      </button>
    </div>
  );
}
