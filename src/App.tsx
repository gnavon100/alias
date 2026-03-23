import { useGameStore } from './store/gameStore';
import { GamePhase } from './types';
import SetupScreen from './components/SetupScreen';
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
      {gamePhase === GamePhase.SETUP && <SetupScreen />}

      {gamePhase === GamePhase.TURN && (
        <div className="flex-1 flex flex-col">
          {/* Board — collapsible on small screens */}
          <div className="pt-3 pb-1">
            <Board teams={teams} boardSize={boardSize} />
          </div>

          {/* Turn panel takes remaining space */}
          <TurnPanel />
        </div>
      )}

      {gamePhase === GamePhase.TIME_UP && (
        <div className="flex-1 flex flex-col">
          <div className="pt-3 pb-1">
            <Board teams={teams} boardSize={boardSize} />
          </div>
          <TimeUpModal />
        </div>
      )}

      {gamePhase === GamePhase.END_OF_TURN && <EndOfTurnModal />}

      {gamePhase === GamePhase.GAME_OVER && <GameOverModal />}
    </main>
  );
}

export default App;
