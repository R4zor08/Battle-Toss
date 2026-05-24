import { useEffect, useRef, useState } from 'react';
import { GameEngineState } from '../types/game';
import { updateEngine, fireProjectile, activatePowerUpForPlayer } from '../game/engine';
import { renderGame } from '../game/renderer';
import { calculateAIAim, DIFFICULTY_CONFIG, getAIThinkDelay } from '../game/ai';
import { initAudio, playSfx, stopMenuMusic } from '../audio/soundManager';

export const useGameLoop = (
canvasRef: React.RefObject<HTMLCanvasElement>,
initialState: GameEngineState,
onGameOver: (winnerId: string) => void,
frozen: boolean = false) =>
{
  const [gameState, setGameState] = useState<GameEngineState>(initialState);
  const stateRef = useRef<GameEngineState>(initialState);
  const requestRef = useRef<number>();
  const aiTimerRef = useRef<NodeJS.Timeout>();
  const gameOverSoundPlayed = useRef(false);
  const frozenRef = useRef(frozen);
  const activePointerId = useRef<number | null>(null);

  useEffect(() => {
    frozenRef.current = frozen;
    if (frozen && aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = undefined;
    }
  }, [frozen]);

  useEffect(() => {
    stateRef.current = initialState;
    setGameState({ ...initialState });
    gameOverSoundPlayed.current = false;
    stopMenuMusic();
  }, [initialState]);

  const loop = () => {
    if (!canvasRef.current) return;

    const state = stateRef.current;
    const isFrozen = frozenRef.current;

    if (!isFrozen) {
      updateEngine(state);
    }

    // Render
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      renderGame(ctx, state, canvasRef.current.width, canvasRef.current.height);
    }

    // Check for AI turn — thinking delay scales with difficulty so each
    // level "feels" right (slow & deliberate on Easy, sharp on Hard+).
    if (
    !isFrozen &&
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
      if (!gameOverSoundPlayed.current) {
        gameOverSoundPlayed.current = true;
        const p2IsAI = state.players[1]?.isAI;
        if (state.winnerId !== 'draw') {
          if (p2IsAI) {
            playSfx(state.winnerId === 'p1' ? 'win' : 'lose');
          } else {
            playSfx('win');
          }
        }
      }
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

  const mapPointerToCanvas = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return null;

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const releasePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      activePointerId.current = null;
    }
  };

  const cancelAimDrag = () => {
    const state = stateRef.current;
    state.aimDragStart = null;
    state.aimDragCurrent = null;
  };

  const handleLostPointerCapture = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (frozenRef.current) return;
    if (activePointerId.current === e.pointerId) {
      activePointerId.current = null;
      cancelAimDrag();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (frozenRef.current) return;
    initAudio();
    const state = stateRef.current;
    if (state.phase !== 'aiming' || state.players[state.currentTurnIndex].isAI)
    return;

    const point = mapPointerToCanvas(e.clientX, e.clientY);
    if (!point) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;

    state.aimDragStart = point;
    state.aimDragCurrent = point;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (frozenRef.current) return;
    const state = stateRef.current;
    if (!state.aimDragStart) return;
    if (
      activePointerId.current !== null &&
      e.pointerId !== activePointerId.current
    )
    return;

    const point = mapPointerToCanvas(e.clientX, e.clientY);
    if (!point) return;

    state.aimDragCurrent = point;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (frozenRef.current) return;
    const state = stateRef.current;
    if (
      activePointerId.current !== null &&
      e.pointerId !== activePointerId.current
    )
    return;

    releasePointer(e);

    if (!state.aimDragStart || !state.aimDragCurrent) return;

    const dx = state.aimDragStart.x - state.aimDragCurrent.x;
    const dy = state.aimDragStart.y - state.aimDragCurrent.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      const power = Math.min(dist * 0.15, 35);
      const angle = Math.atan2(dy, dx);
      fireProjectile(state, power, angle);
    } else {
      state.aimDragStart = null;
      state.aimDragCurrent = null;
    }
  };

  const activatePowerUp = (powerUpId: string) => {
    if (frozenRef.current) return;
    const state = stateRef.current;
    const player = state.players[state.currentTurnIndex];
    if (state.phase !== 'aiming' || player.isAI) return;

    if (activatePowerUpForPlayer(state, player, powerUpId)) {
      setGameState({ ...state });
    }
  };

  return {
    gameState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleLostPointerCapture,
    activatePowerUp
  };
};