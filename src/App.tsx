import { useEffect, useState, useRef } from 'react';
import { ScreenState, GameEngineState } from './types/game';
import { createInitialGameState } from './game/engine';
import { useGameLoop } from './hooks/useGameLoop';
import {
  initAudio,
  startMenuMusic,
  stopMenuMusic
} from './audio/soundManager';
import {
  MainMenu,
  CharacterSelect,
  GameOver,
  LoadingScreen,
  MapGallery,
  CharacterGallery } from
'./components/Screens';
import { GameUI } from './components/GameUI';
import { MatchCountdown } from './components/MatchCountdown';
import { GAME_CONSTANTS } from './game/constants';
export function App() {
  const [screen, setScreen] = useState<ScreenState>('loading');
  const [gameMode, setGameMode] = useState<'ai' | 'local'>('ai');
  const [config, setConfig] = useState({
    p1Char: 'ninja',
    p2Char: 'viking',
    mapId: 'forest',
    difficulty: 'intermediate' as
    'easy' |
    'intermediate' |
    'hard' |
    'impossible'
  });
  const [gameState, setGameState] = useState<GameEngineState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setScreen('menu'), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (screen === 'menu') {
      initAudio();
      startMenuMusic();
    } else {
      stopMenuMusic();
    }
    return () => {
      if (screen !== 'menu') stopMenuMusic();
    };
  }, [screen]);
  const handleStartGame = (mode: 'ai' | 'local') => {
    setGameMode(mode);
    setScreen('characterSelect');
  };
  const handleCharacterSelect = (
  p1Char: string,
  p2Char: string,
  mapId: string,
  difficulty:
  'easy' |
  'intermediate' |
  'hard' |
  'impossible' = 'intermediate') =>
  {
    setConfig({
      p1Char,
      p2Char,
      mapId,
      difficulty
    });
    const initialState = createInitialGameState(
      p1Char,
      p2Char,
      gameMode === 'ai',
      mapId
    );
    (initialState as any).difficulty = difficulty;
    setGameState(initialState);
    setGameKey((k) => k + 1);
    setScreen('countdown');
  };
  const handleGameOver = (_winnerId: string) => {
    setScreen('gameOver');
  };
  const handleRematch = () => {
    const initialState = createInitialGameState(
      config.p1Char,
      config.p2Char,
      gameMode === 'ai',
      config.mapId
    );
    (initialState as any).difficulty = config.difficulty;
    setGameState(initialState);
    setGameKey((k) => k + 1);
    setScreen('countdown');
    setIsPaused(false);
  };
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden font-sans select-none touch-none">
      <div
        className="relative bg-gray-900 shadow-2xl overflow-hidden"
        style={{
          maxWidth: '1200px',
          maxHeight: '100dvh',
          width: 'min(100vw, calc(100dvh * 16 / 9))',
          height: 'min(100dvh, calc(100vw * 9 / 16))',
          aspectRatio: '16 / 9'
        }}>
        
        {screen === 'loading' && <LoadingScreen />}

        {screen === 'menu' &&
        <MainMenu onStartGame={handleStartGame} onNavigate={setScreen} />
        }
        {screen === 'mapGallery' &&
        <MapGallery onBack={() => setScreen('menu')} />
        }
        {screen === 'characterGallery' &&
        <CharacterGallery onBack={() => setScreen('menu')} />
        }

        {screen === 'characterSelect' &&
        <CharacterSelect
          mode={gameMode}
          onSelect={handleCharacterSelect}
          onBack={() => setScreen('menu')} />

        }

        {(screen === 'countdown' || screen === 'playing' || screen === 'gameOver') && gameState &&
        <GameContainer
          key={gameKey}
          canvasRef={canvasRef}
          initialState={gameState}
          frozen={screen === 'countdown'}
          showUI={screen === 'playing'}
          onGameOver={handleGameOver}
          onPauseToggle={() => setIsPaused(!isPaused)} />

        }

        {screen === 'countdown' && gameState &&
        <MatchCountdown
          p1Char={config.p1Char}
          p2Char={config.p2Char}
          mapId={config.mapId}
          mode={gameMode}
          difficulty={config.difficulty}
          onComplete={() => setScreen('playing')} />

        }

        {screen === 'gameOver' && gameState?.winnerId &&
        <GameOver
          winnerId={gameState.winnerId}
          onRematch={handleRematch}
          onMenu={() => setScreen('menu')} />

        }

        {isPaused && screen === 'playing' &&
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 p-8 rounded-2xl border-2 border-gray-700 flex flex-col gap-4 min-w-[300px]">
              <h2 className="text-3xl font-black text-white text-center mb-4">
                PAUSED
              </h2>
              <button
              onClick={() => setIsPaused(false)}
              className="bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600">
              
                RESUME
              </button>
              <button
              onClick={handleRematch}
              className="bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400">
              
                REMATCH
              </button>
              <button
              onClick={() => {
                setIsPaused(false);
                setScreen('characterSelect');
              }}
              className="bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-500">
              
                CHANGE CHARACTER
              </button>
              <button
              onClick={() => {
                setIsPaused(false);
                setScreen('menu');
              }}
              className="bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600">
              
                QUIT TO MENU
              </button>
            </div>
          </div>
        }
      </div>
    </div>);

}
// Separate component for the active game to manage its own loop hooks cleanly
function GameContainer({
  canvasRef,
  initialState,
  onGameOver,
  onPauseToggle,
  frozen = false,
  showUI = true
}: any) {
  const {
    gameState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    activatePowerUp
  } = useGameLoop(canvasRef, initialState, onGameOver, frozen);
  return (
    <>
      <canvas
        ref={canvasRef}
        width={GAME_CONSTANTS.CANVAS_WIDTH}
        height={GAME_CONSTANTS.CANVAS_HEIGHT}
        className="w-full h-full block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} />
      
      {showUI &&
      <GameUI
        state={gameState}
        onActivatePowerUp={activatePowerUp}
        onPause={onPauseToggle} />
      }
      
    </>);

}