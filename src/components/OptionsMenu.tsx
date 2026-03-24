import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { modalOverlay, modalContent } from '../utils/motion';
import { isGlobalMuted, setGlobalMute } from '../hooks/useAudio';

interface OptionsMenuProps {
  onPause: () => void;
  onResume: () => void;
}

export default function OptionsMenu({ onPause, onResume }: OptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(isGlobalMuted());
  const exitToMenu = useGameStore((s) => s.exitToMenu);

  const handleOpen = () => {
    onPause();
    setIsOpen(true);
  };

  const handleResume = () => {
    setIsOpen(false);
    onResume();
  };

  const handleExit = () => {
    exitToMenu();
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setGlobalMute(newMuted);
  };

  return (
    <>
      {/* Gear button — fixed top-left (RTL so visually top-right) */}
      <button
        onClick={handleOpen}
        className="fixed top-3 left-3 z-40 w-10 h-10 rounded-full
                   bg-slate-800/80 backdrop-blur flex items-center justify-center
                   text-slate-400 hover:text-slate-200 transition-colors
                   border border-slate-700"
        aria-label="תפריט אפשרויות"
      >
        ⚙️
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...modalOverlay}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div
              {...modalContent}
              className="bg-slate-800 rounded-3xl p-6 max-w-xs w-full space-y-4 shadow-2xl border border-slate-700"
            >
              <h2 className="text-2xl font-black text-center text-slate-100">
                ⏸️ המשחק מושהה
              </h2>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleMute}
                className="btn-secondary w-full"
              >
                {isMuted ? '🔇 הפעל צלילים' : '🔊 השתק צלילים'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleResume}
                className="btn-primary w-full"
              >
                ▶ המשך משחק
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExit}
                className="btn-secondary w-full text-red-400"
              >
                🚪 יציאה לתפריט
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
