import { useGameStore } from './store/gameStore';
import { GamePhase } from './types';
import SetupScreen from './components/SetupScreen';
import PreTurnScreen from './components/PreTurnScreen';
import TurnPanel from './components/TurnPanel';
import Board from './components/Board';
import TimeUpModal from './components/TimeUpModal';
import EndOfTurnModal from './components/EndOfTurnModal';
import GameOverModal from './components/GameOverModal';
import PowerUpRevealModal from './components/PowerUpRevealModal';
import BothTeamsPanel from './components/BothTeamsPanel';
import GiftOrCurseModal from './components/GiftOrCurseModal';
import StealTheLeadModal from './components/StealTheLeadModal';
import BonusOrMinusModal from './components/BonusOrMinusModal';

function App() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const teams = useGameStore((s) => s.teams);
  const boardSize = useGameStore((s) => s.boardSize);

  return (
    <main className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-heebo">
      {gamePhase === GamePhase.SETUP && <SetupScreen />}

      {gamePhase === GamePhase.PRE_TURN && <PreTurnScreen />}

      {gamePhase === GamePhase.POWER_UP_REVEAL && <PowerUpRevealModal />}

      {gamePhase === GamePhase.TURN && (
        <div className="flex-1 flex flex-col">
          <div className="pt-3 pb-1">
            <Board teams={teams} boardSize={boardSize} />
          </div>
          <TurnPanel />
        </div>
      )}

      {gamePhase === GamePhase.BOTH_TEAMS_TURN && (
        <div className="flex-1 flex flex-col">
          <div className="pt-3 pb-1">
            <Board teams={teams} boardSize={boardSize} />
          </div>
          <BothTeamsPanel />
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

      {gamePhase === GamePhase.BONUS_OR_MINUS && <BonusOrMinusModal />}

      {gamePhase === GamePhase.GIFT_OR_CURSE && <GiftOrCurseModal />}

      {gamePhase === GamePhase.STEAL_THE_LEAD && <StealTheLeadModal />}

      {gamePhase === GamePhase.GAME_OVER && <GameOverModal />}
    </main>
  );
}

export default App;
