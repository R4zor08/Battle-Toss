import React, { useEffect, useState } from 'react';
import { Difficulty } from '../types/game';
import { CHARACTERS, MAPS } from '../game/data';
import { loadAvatar, subscribeAvatars } from '../utils/avatars';
import { initAudio, playSfx } from '../audio/soundManager';

const STEPS = ['3', '2', '1', 'FIGHT!'] as const;
const STEP_DURATIONS = [900, 900, 900, 700];

const ACCENT = {
  blue: {
    ring: 'from-sky-400 via-cyan-300 to-sky-600',
    text: 'text-sky-200',
    role: 'text-sky-300/60',
    glow: 'rgba(56,189,248,0.45)',
    wash: 'bg-gradient-to-r from-sky-500/12 via-sky-400/5 to-transparent',
    enter: 'animate-countdown-enter-left',
  },
  red: {
    ring: 'from-rose-400 via-orange-300 to-rose-600',
    text: 'text-rose-200',
    role: 'text-rose-300/60',
    glow: 'rgba(251,113,133,0.45)',
    wash: 'bg-gradient-to-l from-rose-500/12 via-rose-400/5 to-transparent',
    enter: 'animate-countdown-enter-right',
  },
} as const;

const CountdownAvatar: React.FC<{ charId: string }> = ({ charId }) => {
  const char = CHARACTERS[charId];
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (char?.avatarUrl) loadAvatar(char.avatarUrl);
    const unsub = subscribeAvatars(() => forceUpdate((n) => n + 1));
    return () => unsub();
  }, [char?.avatarUrl]);

  if (!char) return null;

  if (char.avatarUrl) {
    const entry = loadAvatar(char.avatarUrl);
    const src = entry.dataUrl || char.avatarUrl;
    return (
      <img
        src={src}
        alt={char.name}
        className="w-[76%] h-[76%] object-contain animate-countdown-avatar-float drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        draggable={false}
      />
    );
  }

  return (
    <span className="font-black text-white text-3xl">{char.name.charAt(0)}</span>
  );
};

interface FighterCardProps {
  charId: string;
  role: string;
  accent: 'blue' | 'red';
}

const FighterCard: React.FC<FighterCardProps> = ({ charId, role, accent }) => {
  const char = CHARACTERS[charId];
  if (!char) return null;

  const theme = ACCENT[accent];

  return (
    <div className={`flex flex-col items-center gap-3 w-[130px] sm:w-[150px] countdown-fighter-card ${theme.enter}`}>
      <div className="relative">
        <div
          className={`absolute -inset-1 rounded-full bg-gradient-to-br ${theme.ring} opacity-80 animate-countdown-ring-spin blur-[1px]`}
          aria-hidden
        />
        <div
          className="countdown-fighter-ring relative w-[5.5rem] h-[5.5rem] sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          style={{ boxShadow: `0 0 28px ${theme.glow}, 0 8px 32px rgba(0,0,0,0.45)` }}>
          <div
            className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-black/55 backdrop-blur-sm"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${char.color}33 0%, rgba(0,0,0,0.65) 72%)`,
            }}>
            <CountdownAvatar charId={charId} />
          </div>
        </div>
      </div>
      <div className="text-center leading-tight space-y-1">
        <p
          className={`${theme.text} font-black text-xs sm:text-sm uppercase tracking-[0.12em] countdown-name-glow`}
          style={{ textShadow: `0 0 20px ${theme.glow}` }}>
          {char.name}
        </p>
        <p className={`${theme.role} text-[10px] font-bold uppercase tracking-[0.22em]`}>{role}</p>
      </div>
    </div>
  );
};

interface MatchCountdownProps {
  p1Char: string;
  p2Char: string;
  mapId: string;
  mode: 'ai' | 'local';
  difficulty?: Difficulty;
  onComplete: () => void;
}

export const MatchCountdown: React.FC<MatchCountdownProps> = ({
  p1Char,
  p2Char,
  mapId,
  mode,
  difficulty,
  onComplete,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [flash, setFlash] = useState(false);

  const map = MAPS[mapId];
  const label = STEPS[stepIndex];
  const isFight = label === 'FIGHT!';

  useEffect(() => {
    if (stepIndex >= STEPS.length) return;
    initAudio();
    playSfx(isFight ? 'fight' : 'countdown');
    if (isFight) {
      setFlash(true);
      const flashTimer = setTimeout(() => setFlash(false), 350);
      return () => clearTimeout(flashTimer);
    }
  }, [stepIndex, isFight]);

  useEffect(() => {
    if (stepIndex >= STEPS.length) {
      onComplete();
      return;
    }

    const duration = STEP_DURATIONS[stepIndex] ?? 900;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), duration);
    return () => clearTimeout(timer);
  }, [stepIndex, onComplete]);

  if (!CHARACTERS[p1Char] || !CHARACTERS[p2Char] || !map || stepIndex >= STEPS.length) {
    return null;
  }

  const metaParts = [map.name.toUpperCase()];
  if (mode === 'ai' && difficulty) {
    metaParts.push(`AI · ${difficulty.toUpperCase()}`);
  } else if (mode === 'local') {
    metaParts.push('LOCAL · 2P');
  }

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-between py-6 sm:py-8 overflow-hidden countdown-vignette animate-countdown-overlay-in countdown-compact">
      <div className="countdown-letterbox countdown-letterbox-top" aria-hidden />
      <div className="countdown-letterbox countdown-letterbox-bottom" aria-hidden />

      <div className={`absolute inset-y-0 left-0 w-1/3 ${ACCENT.blue.wash}`} aria-hidden />
      <div className={`absolute inset-y-0 right-0 w-1/3 ${ACCENT.red.wash}`} aria-hidden />

      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" />
      <div className="countdown-spotlight" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/55" />

      {flash && (
        <>
          <div className="absolute inset-0 bg-amber-200/20 animate-countdown-screen-flash" />
          <div className="countdown-fight-sweep" aria-hidden />
        </>
      )}

      <div className="relative z-10 mt-3 sm:mt-4 animate-countdown-meta-in">
        <p className="countdown-meta-pill">{metaParts.join('  ·  ')}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 flex-1 justify-center w-full px-6 countdown-main-row">
        <div className="flex items-center justify-center gap-5 sm:gap-8 w-full max-w-xl countdown-main-row countdown-fighters-row">
          <FighterCard charId={p1Char} role="Player 1" accent="blue" />

          <div className="relative flex flex-col items-center self-center shrink-0 w-14 h-24 animate-countdown-vs-in">
            <div className="countdown-clash-line countdown-clash-line-a" aria-hidden />
            <div className="countdown-clash-line countdown-clash-line-b" aria-hidden />
            <div className="relative flex flex-col items-center gap-1 py-2 z-10">
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <span className="countdown-vs-text animate-vs-pulse">VS</span>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
            </div>
          </div>

          <FighterCard
            charId={p2Char}
            role={mode === 'ai' ? 'AI Opponent' : 'Player 2'}
            accent="red"
          />
        </div>

        <div className="relative flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center min-h-[6rem] sm:min-h-[7.5rem] countdown-digit-wrap">
            {!isFight && (
              <>
                <div
                  key={`ring-a-${stepIndex}`}
                  className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-amber-400/20 animate-countdown-ring"
                />
                <div
                  key={`ring-b-${stepIndex}`}
                  className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-white/10 animate-countdown-ring-delayed"
                />
              </>
            )}
            {isFight && (
              <div
                key="fight-burst"
                className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full countdown-fight-burst animate-countdown-fight-burst"
                aria-hidden
              />
            )}
            <span
              key={`${stepIndex}-${label}`}
              className={`relative font-black uppercase select-none countdown-digit ${
                isFight
                  ? 'text-4xl sm:text-6xl tracking-[0.18em] countdown-fight-text animate-fight-flash'
                  : 'text-7xl sm:text-[7.5rem] leading-none countdown-number-text animate-countdown-pop'
              }`}>
              {label}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5" aria-hidden>
            {STEPS.map((step, i) => {
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <div key={step} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      active
                        ? 'w-10 sm:w-12 bg-gradient-to-r from-amber-300 to-orange-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                        : done
                          ? 'w-6 bg-white/35'
                          : 'w-6 bg-white/12'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest ${
                      active ? 'text-amber-200/90' : done ? 'text-white/35' : 'text-white/20'
                    }`}>
                    {step === 'FIGHT!' ? 'Go' : step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 h-3 sm:h-4" aria-hidden />
    </div>
  );
};
