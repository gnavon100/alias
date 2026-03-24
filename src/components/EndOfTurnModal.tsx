import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { POWER_UP_INFO } from '../types';
import { haptic } from '../utils/haptics';
import { modalOverlay, modalContent, staggerContainer, staggerItem } from '../utils/motion';
import { flagWord, isWordFlagged } from '../utils/wordFlags';

export default function EndOfTurnModal() {
  const [flaggedWords, setFlaggedWords] = useState<Set<string>>(new Set());
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turn = useGameStore((s) => s.turn);
  const commitTurn = useGameStore((s) => s.commitTurn);

  const currentTeam = teams[currentTeamIndex];

  const handleContinue = () => {
    commitTurn();
    haptic('light');
  };

  const handleFlagWord = (word: string) => {
    flagWord(word);
    setFlaggedWords(prev => new Set([...prev, word]));
    haptic('medium');
  };

  const isWordCurrentlyFlagged = (word: string): boolean => {
    return flaggedWords.has(word) || isWordFlagged(word);
  };

  return (
    <motion.div
      {...modalOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <motion.div
        {...modalContent}
        className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl border border-slate-700"
      >
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-100">סיכום תור</h2>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentTeam.color.hex }}
            />
            <span className="text-lg font-semibold text-slate-300">
              {currentTeam.name}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-slate-400">✅ מילים נכונות</span>
            <span className="text-green-400 font-bold">{turn.wordsCorrect}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-slate-400">❌ דילוגים</span>
            <span className="text-red-400 font-bold">{turn.wordsSkipped}</span>
          </div>
          <hr className="border-slate-700" />
          <div className="flex justify-between text-xl">
            <span className="text-slate-200 font-semibold">סה״כ</span>
            <span
              className={`font-black text-2xl ${
                turn.turnScore >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {turn.turnScore >= 0 ? `+${turn.turnScore}` : turn.turnScore}
            </span>
          </div>

          {/* Power-up post-turn notice */}
          {turn.activePowerUp && POWER_UP_INFO[turn.activePowerUp] && (
            <div className="bg-purple-500/15 rounded-xl p-3 text-center border border-purple-400/30">
              <span className="text-purple-300 text-sm font-semibold">
                {POWER_UP_INFO[turn.activePowerUp].emoji}{' '}
                {turn.activePowerUp === 'bonus_or_minus' && (
                  turn.wordsCorrect >= 8
                    ? 'בונוס +3 צעדים בדרך! 🚀'
                    : 'מינוס -3 צעדים בדרך... 📉'
                )}
                {turn.activePowerUp === 'gift_or_curse' && 'אחרי — בוחרים מתנה או קללה!'}
                {turn.activePowerUp === 'steal_the_lead' && 'אחרי — אפשר להחליף מיקום!'}
                {turn.activePowerUp === 'speed_demon' && `מהירות שטנית! ×2 נקודות`}
              </span>
            </div>
          )}
        </div>

        {/* Word History */}
        {turn.wordHistory.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 text-center">
              מילים בתור
            </h3>
            <div className="bg-slate-900 rounded-2xl p-3 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {turn.wordHistory.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center justify-between flex-1 bg-slate-800 rounded-lg px-3 py-2">
                      <span className="text-slate-200 font-medium">{item.word}</span>
                      <span className={`font-semibold ${item.wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {item.wasCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleFlagWord(item.word)}
                      disabled={isWordCurrentlyFlagged(item.word)}
                      className={`text-lg leading-none transition-all flex-shrink-0 ${
                        isWordCurrentlyFlagged(item.word) 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:scale-110 active:scale-95'
                      }`}
                      title="הצע למחוק מילה"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scoreboard */}
        <motion.div className="space-y-2" {...staggerContainer}>
          <h3 className="text-sm font-semibold text-slate-500 text-center">
            לוח תוצאות
          </h3>
          {teams.map((team, i) => (
            <motion.div
              {...staggerItem}
              key={team.id}
              className={`flex items-center justify-between px-4 py-2 rounded-xl ${
                i === currentTeamIndex
                  ? 'bg-slate-700'
                  : 'bg-slate-800/50'
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
                משבצת {team.position}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Continue button */}
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
