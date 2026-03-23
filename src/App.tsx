import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { GamePhase } from './types';
import SetupScreen from './components/SetupScreen';
import PreTurnScreen from './components/PreTurnScreen';
import TurnPanel from './components/TurnPanel';
import Board from './components/Board';
import TimeUpModal from './components/TimeUpModal';
import EndOfTurnModal from './components/EndOfTurnModal';
import GameOverModal from './components/GameOverModal';

function App() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const teams = useGameStore((s) => s.teams);
  const boardSize = useGameStore((s) => s.boardSize);

  return (
    <main className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-heebo">
      <AnimatePresence>
        {gamePhase === GamePhase.SETUP && <SetupScreen key="setup" />}

        {gamePhase === GamePhase.PRE_TURN && <PreTurnScreen key="preturn" />}

        {gamePhase === GamePhase.TURN && (
          <div key="turn" className="flex-1 flex flex-col">
            <div className="pt-3 pb-1">
              <Board teams={teams} boardSize={boardSize} />
            </div>
            <TurnPanel />
          </div>
        )}

        {gamePhase === GamePhase.TIME_UP && (
          <div key="timeup" className="flex-1 flex flex-col">
            <div className="pt-3 pb-1">
              <Board teams={teams} boardSize={boardSize} />
            </div>
            <TimeUpModal />
          </div>
        )}

        {gamePhase === GamePhase.END_OF_TURN && <EndOfTurnModal key="eot" />}

        {gamePhase === GamePhase.GAME_OVER && <GameOverModal key="gameover" />}
      </AnimatePresence>
    </main>
  );
}

export default App;
