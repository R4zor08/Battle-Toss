import React, { useEffect, useState } from 'react';
import { Difficulty } from '../types/game';
import { loadAvatar, subscribeAvatars } from '../utils/avatars';
const CharacterAvatar: React.FC<{
  char: any;
  size?: number;
  className?: string;
}> = ({ char, size = 96, className = '' }) => {
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
        className={`rounded-full border-4 border-white shadow-inner overflow-hidden flex items-center justify-center ${className}`}
        style={{
          width: size,
          height: size,
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
      className={`rounded-full border-4 border-white shadow-inner flex items-center justify-center font-black ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: char.color,
        fontSize: size * 0.35
      }}>
      
      {char.name.charAt(0)}
    </div>);

};
import {
  initAudio,
  playSfx,
  startMenuMusic,
  getAudioSettings,
  setSfxMuted,
  setMusicMuted
} from '../audio/soundManager';
import { CHARACTERS, MAPS } from '../game/data';
import { ScreenState } from '../types/game';
import { MenuBackground, MenuLogo } from './MenuLogo';
import {
  Play,
  Users,
  Trophy,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';
interface MenuProps {
  onStartGame: (mode: 'ai' | 'local') => void;
  onNavigate?: (screen: ScreenState) => void;
}
export const MainMenu: React.FC<MenuProps> = ({ onStartGame, onNavigate }) => {
  const [audio, setAudio] = useState(getAudioSettings);

  const handleMenuAction = (action: () => void) => {
    initAudio();
    playSfx('ui');
    startMenuMusic();
    action();
  };

  const toggleSfx = () => {
    setSfxMuted(!audio.sfxMuted);
    setAudio(getAudioSettings());
  };

  const toggleMusic = () => {
    setMusicMuted(!audio.musicMuted);
    setAudio(getAudioSettings());
  };

  return (
    <div className="menu-shell menu-mobile-scroll menu-landscape-fit absolute inset-0 flex flex-col items-center justify-start overflow-y-auto min-h-0">
      <MenuBackground />

      <div className="menu-audio-controls absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={toggleSfx}
          className={`menu-audio-btn ${audio.sfxMuted ? 'menu-audio-btn-muted' : ''}`}
          aria-label="Toggle sound effects">
          {audio.sfxMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          onClick={toggleMusic}
          className={`menu-audio-btn ${audio.musicMuted ? 'menu-audio-btn-muted' : ''}`}
          aria-label="Toggle music">
          <Music size={20} />
        </button>
      </div>

      <div className="menu-landscape-stack z-10 px-4 pb-2">
        <MenuLogo />

        <div className="menu-actions flex flex-col items-center gap-2 sm:gap-4 w-full max-w-sm">
        <button
          onClick={() => handleMenuAction(() => onStartGame('ai'))}
          className="menu-btn-primary menu-btn-primary-green">
          <Play fill="currentColor" size={22} />
          Play vs AI
        </button>

        <button
          onClick={() => handleMenuAction(() => onStartGame('local'))}
          className="menu-btn-primary menu-btn-primary-blue">
          <Users size={22} />
          Local 2 Player
        </button>

        {onNavigate && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-1">
            <button
              onClick={() => handleMenuAction(() => onNavigate('characterGallery' as ScreenState))}
              className="menu-btn-secondary">
              Characters
            </button>
            <button
              onClick={() => handleMenuAction(() => onNavigate('mapGallery' as ScreenState))}
              className="menu-btn-secondary">
              Maps
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );

};
export { MapGallery, CharacterGallery } from './GalleryScreens';
const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  color: string;
  desc: string;
}[] = [
{
  id: 'easy',
  label: 'EASY',
  color: 'from-green-400 to-emerald-600',
  desc: 'Slow reactions, wide misses, rare power-ups'
},
{
  id: 'intermediate',
  label: 'INTERMEDIATE',
  color: 'from-blue-400 to-indigo-600',
  desc: 'Solid aim, basic power-up play'
},
{
  id: 'hard',
  label: 'HARD',
  color: 'from-orange-400 to-red-500',
  desc: 'Fast & accurate, counters shields and low HP'
},
{
  id: 'impossible',
  label: 'IMPOSSIBLE',
  color: 'from-pink-500 to-purple-700',
  desc: 'Near-perfect shots, optimal power-ups'
}];

interface CharacterSelectProps {
  mode: 'ai' | 'local';
  onSelect: (
  p1Char: string,
  p2Char: string,
  mapId: string,
  difficulty?: Difficulty)
  => void;
  onBack: () => void;
}
export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  mode,
  onSelect,
  onBack
}) => {
  const [p1Char, setP1Char] = useState<string>('ninja');
  const [p2Char, setP2Char] = useState<string>('viking');
  const [mapId, setMapId] = useState<string>('forest');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const finalStep: 3 | 4 = mode === 'ai' ? 4 : 3;
  const handleNext = () => {
    if (step < finalStep) setStep(step + 1 as 1 | 2 | 3 | 4);else
    onSelect(p1Char, p2Char, mapId, difficulty);
  };
  const characters = Object.values(CHARACTERS);
  const maps = Object.values(MAPS);
  return (
    <div className="char-select-shell absolute inset-0 flex flex-col items-center bg-gray-900 text-white p-3 sm:p-6 min-h-0 overflow-y-auto">
      <div className="char-select-header w-full flex justify-between items-center mb-2 sm:mb-8 shrink-0">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white flex items-center gap-2 font-bold">
          
          <RotateCcw size={20} /> BACK
        </button>
        <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 uppercase truncate max-w-[50%] text-center">
          {step === 1 ?
          'Player 1 Select' :
          step === 2 ?
          mode === 'ai' ?
          'AI Select' :
          'Player 2 Select' :
          step === 3 ?
          'Select Map' :
          'Select Difficulty'}
        </h2>
        <div className="w-20"></div>
      </div>

      <div className="char-select-content flex-1 flex items-start justify-center w-full max-w-4xl min-h-0">
        {step < 3 ?
        <div className="char-select-grid char-select-grid--chars grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {characters.map((char) => {
            const isSelected =
            step === 1 ? p1Char === char.id : p2Char === char.id;
            return (
              <button
                key={char.id}
                onClick={() =>
                step === 1 ? setP1Char(char.id) : setP2Char(char.id)
                }
                className={`char-select-card flex flex-col items-center p-4 rounded-2xl border-4 transition-all ${isSelected ? 'border-yellow-400 bg-gray-800 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'}`}>
                
                  <CharacterAvatar char={char} size={96} className="char-select-avatar" />
                  <span className="char-select-name font-bold text-lg text-center mt-3">
                    {char.name}
                  </span>
                  <span className="char-select-weapon text-sm text-gray-400 mt-1 capitalize">
                    {char.weaponId}
                  </span>
                </button>);

          })}
          </div> :
        step === 3 ?
        <div className="char-select-grid char-select-grid--maps grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {maps.map((map) => {
            const isSelected = mapId === map.id;
            return (
              <button
                key={map.id}
                onClick={() => setMapId(map.id)}
                className={`char-select-map-card flex flex-col items-center p-2 rounded-2xl border-4 transition-all overflow-hidden ${isSelected ? 'border-yellow-400 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-gray-700 hover:border-gray-500'}`}>
                
                  <div
                  className="char-select-map-thumb w-full h-24 rounded-xl mb-2 bg-cover bg-center"
                  style={
                  map.backgroundImageUrl ?
                  {
                    backgroundImage: `url(${map.backgroundImageUrl})`
                  } :
                  {
                    background: `linear-gradient(to bottom, ${map.skyColors[0]}, ${map.groundColor})`
                  }
                  } />
                
                  <span className="char-select-map-name font-bold text-base pb-1 text-center">
                    {map.name}
                  </span>
                </button>);

          })}
          </div> :

        <div className="char-select-grid char-select-grid--difficulty grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {DIFFICULTIES.map((d) => {
            const isSelected = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`char-select-difficulty flex flex-col items-start p-4 sm:p-6 rounded-2xl border-4 transition-all bg-gradient-to-br ${d.color} ${isSelected ? 'border-yellow-400 scale-105 shadow-[0_0_25px_rgba(250,204,21,0.6)]' : 'border-gray-700 hover:border-gray-400 opacity-80 hover:opacity-100'}`}>
                
                  <span className="char-select-difficulty-label font-black text-2xl text-white tracking-wider drop-shadow">
                    {d.label}
                  </span>
                  <span className="char-select-difficulty-desc text-sm text-white/90 mt-1 text-left">
                    {d.desc}
                  </span>
                </button>);

          })}
          </div>
        }
      </div>

      <div className="char-select-footer shrink-0 w-full flex justify-center">
      <button
        onClick={handleNext}
        className="char-select-battle-btn mt-2 sm:mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 px-12 rounded-full font-black text-2xl uppercase tracking-wider shadow-[0_8px_0_rgb(194,65,12)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(194,65,12)] active:translate-y-2 active:shadow-none transition-all">
        
        {step === finalStep ? 'BATTLE!' : 'NEXT'}
      </button>
      </div>
    </div>);

};
interface GameOverProps {
  winnerId: string;
  onRematch: () => void;
  onMenu: () => void;
}
export const GameOver: React.FC<GameOverProps> = ({
  winnerId,
  onRematch,
  onMenu
}) => {
  const isDraw = winnerId === 'draw';
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
      <div className="modal-compact bg-gray-900 border-4 border-gray-700 p-4 sm:p-8 rounded-3xl flex flex-col items-center max-w-md min-w-0 w-full mx-4 shadow-2xl transform animate-bounce-in">
        <Trophy size={64} className="game-over-trophy text-yellow-400 mb-4" />

        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-2 uppercase text-center">
          {isDraw ?
          'DRAW!' :
          `${winnerId === 'p1' ? 'PLAYER 1' : 'PLAYER 2'} WINS!`}
        </h2>

        <p className="text-gray-400 mb-8 text-center font-bold">
          Epic battle! What's next?
        </p>

        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={onRematch}
            className="game-over-btn flex items-center justify-center gap-2 bg-blue-500 text-white py-4 px-6 rounded-xl font-bold text-xl uppercase shadow-[0_6px_0_rgb(29,78,216)] hover:translate-y-1 hover:shadow-[0_3px_0_rgb(29,78,216)] active:translate-y-2 active:shadow-none transition-all">
            
            <RotateCcw /> Rematch
          </button>

          <button
            onClick={onMenu}
            className="game-over-btn flex items-center justify-center gap-2 bg-gray-700 text-white py-4 px-6 rounded-xl font-bold text-xl uppercase shadow-[0_6px_0_rgb(55,65,81)] hover:translate-y-1 hover:shadow-[0_3px_0_rgb(55,65,81)] active:translate-y-2 active:shadow-none transition-all">
            
            <Home /> Main Menu
          </button>
        </div>
      </div>
    </div>);

};
export const LoadingScreen: React.FC = () =>
<div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
    <div className="w-16 h-16 border-8 border-gray-700 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
    <h2 className="text-2xl font-black tracking-widest animate-pulse">
      LOADING...
    </h2>
  </div>;