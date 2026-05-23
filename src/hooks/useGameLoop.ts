import { useEffect, useRef, useState } from 'react';
import { GameEngineState } from '../types/game';
import { updateEngine, fireProjectile } from '../game/engine';
import { renderGame } from '../game/renderer';
import { calculateAIAim, DIFFICULTY_CONFIG, getAIThinkDelay } from '../game/ai';

export const useGameLoop = (
canvasRef: React.RefObject<HTMLCanvasElement>,
initialState: GameEngineState,
onGameOver: (winnerId: string) => void) =>
{
  const [gameState, setGameState] = useState<GameEngineState>(initialState);
  const stateRef = useRef<GameEngineState>(initialState);
  const requestRef = useRef<number>();
  const aiTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    stateRef.current = initialState;
    setGameState({ ...initialState });
  }, [initialState]);

  const loop = () => {
    if (!canvasRef.current) return;

    const state = stateRef.current;

    // Update physics and logic
    updateEngine(state);

    // Render
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      renderGame(ctx, state, canvasRef.current.width, canvasRef.current.height);
    }

    // Check for AI turn — thinking delay scales with difficulty so each
    // level "feels" right (slow & deliberate on Easy, sharp on Hard+).
    if (
    state.phase === 'aiming' &&
    state.players[state.currentTurnIndex].isAI &&
    !aiTimerRef.current)
    {
      const difficulty = state.difficulty || 'intermediate';
      const delay = getAIThinkDelay(state);
      (state as any).aiReactionMs = Math.round(delay);
      (state as any).aiReactionStart = performance.now();
      (state as any).aiInputReading =
        DIFFICULTY_CONFIG[difficulty].showInputReading;
      aiTimerRef.current = setTimeout(() => {
        const aim = calculateAIAim(state);
        if (aim) {
          fireProjectile(state, aim.power, aim.angle);
        }
        ;(state as any).aiReactionStart = null;
        aiTimerRef.current = undefined;
      }, delay);
    }

    // Check game over
    if (state.winnerId) {
      onGameOver(state.winnerId);
      return; // Stop loop
    }

    // Force React re-render for UI updates (throttled or just copy state)
    // To avoid excessive re-renders, we only update React state if phase changes or HP changes significantly
    // For simplicity in this demo, we'll update it every frame, but in a real app we'd optimize this.
    setGameState({ ...state });

    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (state.phase !== 'aiming' || state.players[state.currentTurnIndex].isAI)
    return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    state.aimDragStart = { x, y };
    state.aimDragCurrent = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.aimDragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    state.aimDragCurrent = { x, y };
  };

  const handlePointerUp = () => {
    const state = stateRef.current;
    if (!state.aimDragStart || !state.aimDragCurrent) return;

    const dx = state.aimDragStart.x - state.aimDragCurrent.x;
    const dy = state.aimDragStart.y - state.aimDragCurrent.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      // Minimum drag distance
      const power = Math.min(dist * 0.15, 35); // GAME_CONSTANTS.DRAG_SCALE and MAX_POWER
      const angle = Math.atan2(dy, dx);
      fireProjectile(state, power, angle);
    } else {
      state.aimDragStart = null;
      state.aimDragCurrent = null;
    }
  };

  const activatePowerUp = (powerUpId: string) => {
    const state = stateRef.current;
    const player = state.players[state.currentTurnIndex];
    if (state.phase !== 'aiming' || player.isAI) return;

    // Find cost
    import('../game/data').then(({ POWER_UPS }) => {
      const pu = POWER_UPS[powerUpId];
      if (pu && player.powerPoints >= pu.cost) {
        player.powerPoints -= pu.cost;
        player.activePowerUp = powerUpId;
        setGameState({ ...state });
      }
    });
  };

  return {
    gameState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    activatePowerUp
  };
};