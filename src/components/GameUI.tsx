import React, { useEffect, useState } from 'react';
import { GameEngineState } from '../types/game';
import { CHARACTERS, POWER_UPS } from '../game/data';
import { GAME_CONSTANTS } from '../game/constants';
import { Settings, Zap, Wind } from 'lucide-react';
import { loadAvatar, subscribeAvatars } from '../utils/avatars';
import { useOrientation } from '../hooks/useOrientation';
const AIDebugOverlay: React.FC<{
  state: GameEngineState;
  hidden?: boolean;
}> = ({ state, hidden }) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 50);
    return () => clearInterval(id);
  }, []);
  const p2 = state.players[1];
  const aiTurn =
  state.players[state.currentTurnIndex]?.isAI && state.phase === 'aiming';
  if (hidden || !p2.isAI || !state.difficulty) return null;
  const reactionMs = (state as any).aiReactionMs as number | undefined;
  const startedAt = (state as any).aiReactionStart as number | null | undefined;
  const elapsed = startedAt ? performance.now() - startedAt : 0;
  const remaining =
  reactionMs && startedAt ? Math.max(0, reactionMs - elapsed) : 0;
  const reading = !!(state as any).aiInputReading;
  return (
    <div className="pointer-events-none absolute top-2 right-2 bg-black/70 text-white font-mono text-[10px] sm:text-xs px-3 py-2 rounded-lg border border-white/10 backdrop-blur-sm leading-tight">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">AI:</span>
        <span
          className={
          state.difficulty === 'easy' ?
          'text-green-400' :
          state.difficulty === 'intermediate' ?
          'text-blue-300' :
          state.difficulty === 'hard' ?
          'text-orange-400' :
          'text-pink-400'
          }>
          
          {state.difficulty.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">React:</span>
        <span
          className={
          aiTurn && remaining > 0 ? 'text-yellow-300' : 'text-gray-500'
          }>
          
          {aiTurn && remaining > 0 ?
          `${Math.ceil(remaining)}ms` :
          reactionMs ?
          `~${reactionMs}ms` :
          '—'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Reading:</span>
        <span className={reading ? 'text-red-400' : 'text-gray-500'}>
          {reading ? 'YES (2f delay)' : 'no'}
        </span>
      </div>
    </div>);

};
const HudAvatar: React.FC<{
  char: any;
}> = ({ char }) => {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (char.avatarUrl) loadAvatar(char.avatarUrl);
    const unsub = subscribeAvatars(() => forceUpdate((n) => n + 1));
    return () => {
      unsub();
    };
  }, [char.avatarUrl]);
  if (char.avatarUrl) {
    const entry = loadAvatar(char.avatarUrl);
    const src = entry.dataUrl || char.avatarUrl;
    return (
      <div
        className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg flex items-center justify-center hud-avatar"
        style={{
          background: `radial-gradient(circle, ${char.color}33 0%, #1f2937 80%)`
        }}>
        
        <img
          src={src}
          alt={char.name}
          className="w-full h-full object-contain"
          draggable={false} />
        
      </div>);

  }
  return (
    <div
      className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-bold text-lg shadow-lg hud-avatar"
      style={{
        backgroundColor: char.color
      }}>
      
      {char.name.charAt(0)}
    </div>);

};
const WindIndicator: React.FC<{
  state: GameEngineState;
}> = ({ state }) => {
  if (state.phase !== 'aiming') return null;

  const wind = state.wind;
  const absWind = Math.abs(wind);
  const maxWind = GAME_CONSTANTS.WIND_MAX;
  const barWidth = Math.min(100, (absWind / maxWind) * 100);
  const direction =
  absWind < 0.15 ? '—' : wind < 0 ? '←' : '→';
  const label =
  absWind < 0.15 ?
  'Calm' :
  `${Math.abs(wind).toFixed(1)} ${wind < 0 ? '←' : '→'}`;

  return (
    <div
      key={state.turnCount}
      className="mt-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-cyan-500/30 flex flex-col items-center gap-1 min-w-[120px] hud-wind">
      
      <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
        <Wind size={12} />
        Wind
      </div>
      <div className="flex items-center gap-2 w-full">
        <span className="text-white font-bold text-xs w-4 text-center">{direction}</span>
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden flex">
          {wind < 0 &&
          <div
            className="ml-auto h-full bg-gradient-to-l from-cyan-400 to-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${barWidth}%` }} />
          }
          {wind >= 0 &&
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${barWidth}%` }} />
          }
        </div>
        <span className="text-cyan-200 font-mono text-[10px] w-12 text-right">{label}</span>
      </div>
    </div>);

};
interface GameUIProps {
  state: GameEngineState;
  onActivatePowerUp: (id: string) => void;
  onPause: () => void;
}
export const GameUI: React.FC<GameUIProps> = ({
  state,
  onActivatePowerUp,
  onPause
}) => {
  const { isMobile } = useOrientation();
  const p1 = state.players[0];
  const p2 = state.players[1];
  const currentPlayer = state.players[state.currentTurnIndex];
  const isP1Turn = state.currentTurnIndex === 0;
  const renderHealthBar = (player: any, isRight: boolean) => {
    const charDef = CHARACTERS[player.characterId];
    const hpPercent = Math.max(0, player.hp / player.maxHp * 100);
    const isLow = hpPercent < 30;
    return (
      <div
        className={`flex flex-col hud-health-col ${isRight ? 'items-end' : 'items-start'} w-[28%] sm:w-1/3 max-w-[140px] sm:max-w-[300px]`}>
        
        <div
          className={`flex items-center gap-2 mb-1 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
          
          <HudAvatar char={charDef} />
          <div className="text-white font-black text-shadow-sm uppercase tracking-wider hud-player-name">
            {charDef.name}
          </div>
        </div>

        <div className="w-full h-6 hud-health-bar bg-gray-900 rounded-full border-2 border-gray-700 overflow-hidden relative shadow-inner">
          <div
            className={`h-full transition-all duration-300 ease-out ${isLow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
            style={{
              width: `${hpPercent}%`,
              float: isRight ? 'right' : 'left'
            }} />
          
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow-sm">
            {Math.ceil(player.hp)} / {player.maxHp}
          </div>
        </div>

        <div
          className={`flex gap-1 mt-2 ${isRight ? 'justify-end' : 'justify-start'}`}>
          
          {Array.from({
            length: GAME_CONSTANTS.MAX_POWER_POINTS
          }).map((_, i) =>
          <div
            key={i}
            className={`w-4 h-4 rounded-full border border-white/50 transition-all ${i < player.powerPoints ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-gray-800'}`} />

          )}
        </div>
      </div>);

  };
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 game-hud-compact">
      <AIDebugOverlay state={state} hidden={isMobile} />
      {/* Top HUD */}
      <div className="flex justify-between items-start w-full">
        {renderHealthBar(p1, false)}

        <div className="flex flex-col items-center shrink-0">
          <button
            onClick={onPause}
            className="pointer-events-auto bg-gray-800/80 hover:bg-gray-700 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white backdrop-blur-sm transition-transform hover:scale-110">
            
            <Settings size={20} />
          </button>

          <div className="mt-4 hud-turn-badge bg-black/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm border border-white/20 flex flex-col items-center">
            <span className="text-white font-bold text-xs sm:text-sm text-center">
              {state.phase === 'aiming' ?
              <span className={isP1Turn ? 'text-blue-400' : 'text-red-400'}>
                  <span className="hud-turn-full">
                  {isP1Turn ?
                'PLAYER 1 TURN' :
                p2.isAI ?
                'AI TURN' :
                'PLAYER 2 TURN'}
                  </span>
                  <span className="hud-turn-short">
                  {isP1Turn ? 'P1 TURN' : p2.isAI ? 'AI TURN' : 'P2 TURN'}
                  </span>
                </span> :

              <span className="text-yellow-400">FIRING...</span>
              }
            </span>
            {p2.isAI && state.difficulty &&
            <span
              className={`text-[10px] uppercase font-black tracking-wider mt-0.5 ${state.difficulty === 'easy' ? 'text-green-400' : state.difficulty === 'intermediate' ? 'text-blue-300' : state.difficulty === 'hard' ? 'text-orange-400' : 'text-pink-400'}`}>
              
                AI · {state.difficulty}
              </span>
            }
          </div>
          <WindIndicator state={state} />
        </div>

        {renderHealthBar(p2, true)}
      </div>

      {/* Bottom UI - Powerups */}
      <div className="flex justify-center items-end pb-4 hud-bottom-bar">
        {state.phase === 'aiming' && !currentPlayer.isAI &&
        <div className="pointer-events-auto hud-powerups flex gap-2 sm:gap-4 bg-black/40 p-2 sm:p-4 rounded-2xl backdrop-blur-md border border-white/10 max-w-full overflow-x-auto">
            {CHARACTERS[currentPlayer.characterId].powerUpIds.map((puId) => {
            const pu = POWER_UPS[puId];
            const canAfford = currentPlayer.powerPoints >= pu.cost;
            const isActive = currentPlayer.activePowerUp === puId;
            return (
              <button
                key={puId}
                onClick={() => onActivatePowerUp(puId)}
                disabled={!canAfford || currentPlayer.activePowerUp !== null}
                aria-label={`${pu.name}: ${pu.description} (${pu.cost} power)`}
                className={`hud-powerup-btn relative group flex flex-col items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-2 transition-all flex-shrink-0
                    ${isActive ? 'border-yellow-400 bg-yellow-400/20 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : canAfford && !currentPlayer.activePowerUp ? 'border-blue-400 bg-blue-900/50 hover:bg-blue-800/80 hover:scale-105 cursor-pointer' : 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'}
                  `}>
                
                  <Zap
                  className={
                  isActive ?
                  'text-yellow-400' :
                  canAfford ?
                  'text-blue-400' :
                  'text-gray-500'
                  }
                  size={28} />
                
                  <span className="hud-powerup-label text-[10px] text-white font-bold mt-1 text-center leading-tight px-1">
                    {pu.name}
                  </span>

                  <div className="hud-powerup-cost absolute -top-3 -right-3 w-6 h-6 rounded-full bg-yellow-500 text-black font-black flex items-center justify-center text-xs border-2 border-black">
                    {pu.cost}
                  </div>

                  {/* Tooltip */}
                  <div className="hud-tooltip-desktop absolute bottom-full mb-2 hidden group-hover:block w-32 bg-black/90 text-white text-xs p-2 rounded border border-white/20 z-10 pointer-events-none">
                    {pu.description}
                  </div>
                </button>);

          })}
          </div>
        }
      </div>

      {/* Aim Instruction */}
      {state.phase === 'aiming' &&
      !currentPlayer.isAI &&
      !state.aimDragStart &&
      <div className="hud-aim-hint absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50 font-black text-2xl tracking-widest animate-pulse pointer-events-none">
            DRAG BACK TO AIM
          </div>
      }
    </div>);

};