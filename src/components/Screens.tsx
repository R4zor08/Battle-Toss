import React, { useEffect, useState } from 'react';
import { Difficulty } from '../types/game';
import { loadAvatar, subscribeAvatars } from '../utils/avatars';
const CharacterAvatar: React.FC<{
  char: any;
  size?: number;
}> = ({ char, size = 96 }) => {
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
        className="rounded-full border-4 border-white shadow-inner overflow-hidden flex items-center justify-center"
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
      className="rounded-full border-4 border-white shadow-inner flex items-center justify-center font-black"
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
import {
  Play,
  Users,
  Trophy,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Music
} from
'lucide-react';
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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={toggleSfx}
          className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20"
          aria-label="Toggle sound effects">
          {audio.sfxMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button
          onClick={toggleMusic}
          className={`p-2 rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/20 ${audio.musicMuted ? 'opacity-50 line-through' : ''}`}
          aria-label="Toggle music">
          <Music size={20} />
        </button>
      </div>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
          style={{
            animationDelay: '1s'
          }}>
        </div>
      </div>

      <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-2 filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
        BATTLE TOSS
      </h1>
      <h2 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-widest filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
        MASTERS
      </h2>

      <div className="flex flex-col gap-6 w-full max-w-md px-4 z-10">
        <button
          onClick={() => handleMenuAction(() => onStartGame('ai'))}
          className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-green-400 to-emerald-600 text-white py-4 px-8 rounded-full font-black text-2xl uppercase tracking-wider shadow-[0_10px_0_rgb(4,120,87)] hover:translate-y-1 hover:shadow-[0_5px_0_rgb(4,120,87)] active:translate-y-2 active:shadow-none transition-all">
          
          <Play fill="currentColor" />
          Play vs AI
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>

        <button
          onClick={() => handleMenuAction(() => onStartGame('local'))}
          className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-blue-400 to-indigo-600 text-white py-4 px-8 rounded-full font-black text-2xl uppercase tracking-wider shadow-[0_10px_0_rgb(55,48,163)] hover:translate-y-1 hover:shadow-[0_5px_0_rgb(55,48,163)] active:translate-y-2 active:shadow-none transition-all">
          
          <Users />
          Local 2 Player
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>

        {onNavigate &&
        <div className="grid grid-cols-2 gap-4 mt-2">
            <button
            onClick={() => handleMenuAction(() => onNavigate('characterGallery' as ScreenState))}
            className="bg-gray-800 text-white py-3 rounded-xl font-bold uppercase shadow-[0_4px_0_rgb(31,41,55)] hover:translate-y-1 hover:shadow-[0_2px_0_rgb(31,41,55)] active:translate-y-2 active:shadow-none transition-all">
            
              Characters
            </button>
            <button
            onClick={() => handleMenuAction(() => onNavigate('mapGallery' as ScreenState))}
            className="bg-gray-800 text-white py-3 rounded-xl font-bold uppercase shadow-[0_4px_0_rgb(31,41,55)] hover:translate-y-1 hover:shadow-[0_2px_0_rgb(31,41,55)] active:translate-y-2 active:shadow-none transition-all">
            
              Maps
            </button>
          </div>
        }
      </div>
    </div>);

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
    <div className="absolute inset-0 flex flex-col items-center bg-gray-900 text-white p-6">
      <div className="w-full flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white flex items-center gap-2 font-bold">
          
          <RotateCcw size={20} /> BACK
        </button>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 uppercase">
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

      <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
        {step < 3 ?
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {characters.map((char) => {
            const isSelected =
            step === 1 ? p1Char === char.id : p2Char === char.id;
            return (
              <button
                key={char.id}
                onClick={() =>
                step === 1 ? setP1Char(char.id) : setP2Char(char.id)
                }
                className={`flex flex-col items-center p-4 rounded-2xl border-4 transition-all ${isSelected ? 'border-yellow-400 bg-gray-800 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'}`}>
                
                  <CharacterAvatar char={char} size={96} />
                  <span className="font-bold text-lg text-center mt-3">
                    {char.name}
                  </span>
                  <span className="text-sm text-gray-400 mt-1 capitalize">
                    {char.weaponId}
                  </span>
                </button>);

          })}
          </div> :
        step === 3 ?
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {maps.map((map) => {
            const isSelected = mapId === map.id;
            return (
              <button
                key={map.id}
                onClick={() => setMapId(map.id)}
                className={`flex flex-col items-center p-2 rounded-2xl border-4 transition-all overflow-hidden ${isSelected ? 'border-yellow-400 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-gray-700 hover:border-gray-500'}`}>
                
                  <div
                  className="w-full h-24 rounded-xl mb-2 bg-cover bg-center"
                  style={
                  map.backgroundImageUrl ?
                  {
                    backgroundImage: `url(${map.backgroundImageUrl})`
                  } :
                  {
                    background: `linear-gradient(to bottom, ${map.skyColors[0]}, ${map.groundColor})`
                  }
                  } />
                
                  <span className="font-bold text-base pb-1 text-center">
                    {map.name}
                  </span>
                </button>);

          })}
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {DIFFICULTIES.map((d) => {
            const isSelected = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`flex flex-col items-start p-6 rounded-2xl border-4 transition-all bg-gradient-to-br ${d.color} ${isSelected ? 'border-yellow-400 scale-105 shadow-[0_0_25px_rgba(250,204,21,0.6)]' : 'border-gray-700 hover:border-gray-400 opacity-80 hover:opacity-100'}`}>
                
                  <span className="font-black text-2xl text-white tracking-wider drop-shadow">
                    {d.label}
                  </span>
                  <span className="text-sm text-white/90 mt-1 text-left">
                    {d.desc}
                  </span>
                </button>);

          })}
          </div>
        }
      </div>

      <button
        onClick={handleNext}
        className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 px-12 rounded-full font-black text-2xl uppercase tracking-wider shadow-[0_8px_0_rgb(194,65,12)] hover:translate-y-1 hover:shadow-[0_4px_0_rgb(194,65,12)] active:translate-y-2 active:shadow-none transition-all">
        
        {step === finalStep ? 'BATTLE!' : 'NEXT'}
      </button>
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
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="bg-gray-900 border-4 border-gray-700 p-8 rounded-3xl flex flex-col items-center max-w-md w-full mx-4 shadow-2xl transform animate-bounce-in">
        <Trophy size={64} className="text-yellow-400 mb-4" />

        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-2 uppercase text-center">
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
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-4 px-6 rounded-xl font-bold text-xl uppercase shadow-[0_6px_0_rgb(29,78,216)] hover:translate-y-1 hover:shadow-[0_3px_0_rgb(29,78,216)] active:translate-y-2 active:shadow-none transition-all">
            
            <RotateCcw /> Rematch
          </button>

          <button
            onClick={onMenu}
            className="flex items-center justify-center gap-2 bg-gray-700 text-white py-4 px-6 rounded-xl font-bold text-xl uppercase shadow-[0_6px_0_rgb(55,65,81)] hover:translate-y-1 hover:shadow-[0_3px_0_rgb(55,65,81)] active:translate-y-2 active:shadow-none transition-all">
            
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