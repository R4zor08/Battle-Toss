import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, Sparkles, Swords } from 'lucide-react';
import { initAudio, playSfx } from '../audio/soundManager';
import { CHARACTERS, MAPS, WEAPONS, POWER_UPS } from '../game/data';
import { CharacterDef, MapDef } from '../types/game';
import { loadAvatar, subscribeAvatars } from '../utils/avatars';

const CharacterAvatar: React.FC<{ char: CharacterDef; size?: number; className?: string }> = ({
  char,
  size = 96,
  className = '',
}) => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (char.avatarUrl) loadAvatar(char.avatarUrl);
    const unsub = subscribeAvatars(() => forceUpdate((n) => n + 1));
    return () => unsub();
  }, [char.avatarUrl]);

  if (char.avatarUrl) {
    const entry = loadAvatar(char.avatarUrl);
    const src = entry.dataUrl || char.avatarUrl;
    return (
      <div
        className={`rounded-full border-[3px] border-white/90 shadow-inner overflow-hidden flex items-center justify-center ${className}`}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${char.color}33 0%, #1f2937 80%)`,
        }}>
        <img src={src} alt={char.name} className="w-full h-full object-contain" draggable={false} />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full border-[3px] border-white/90 shadow-inner flex items-center justify-center font-black ${className}`}
      style={{ width: size, height: size, backgroundColor: char.color, fontSize: size * 0.35 }}>
      {char.name.charAt(0)}
    </div>
  );
};

const formatWeaponName = (weaponId: string) =>
  WEAPONS[weaponId]?.name ??
  weaponId.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

const MAP_THEME = {
  forest: { label: 'Nature', chip: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
  desert: { label: 'Volcanic', chip: 'bg-orange-500/20 text-orange-200 border-orange-400/30' },
  cyber: { label: 'Neon', chip: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30' },
} as const;

const GalleryBackButton: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <button
    onClick={() => {
      initAudio();
      playSfx('ui');
      onBack();
    }}
    className="group flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-bold text-sm uppercase tracking-wider">
    <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
    Back
  </button>
);

export const MapGallery: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const maps = Object.values(MAPS);
  const [selectedId, setSelectedId] = useState(maps[0]?.id ?? 'forest');
  const selected = MAPS[selectedId];

  const handleSelect = (map: MapDef) => {
    initAudio();
    playSfx('ui');
    setSelectedId(map.id);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0e17] text-white overflow-hidden gallery-shell">
      <div className="gallery-ambient gallery-ambient-cyan" aria-hidden />
      <div className="gallery-ambient gallery-ambient-blue" aria-hidden />

      <div className="gallery-inner relative z-10 flex flex-col h-full p-4 sm:p-6">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center mb-4 sm:mb-6 gallery-compact-header">
          <GalleryBackButton onBack={onBack} />
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 uppercase tracking-wider gallery-title-glow">
              Maps
            </h2>
            <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.25em] mt-1">
              {maps.length} Battle Arenas
            </p>
          </div>
          <div className="w-[72px]" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-6xl mx-auto pb-4">
          <div className="gallery-content grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {maps.map((map, i) => {
              const isSelected = selectedId === map.id;
              const theme = MAP_THEME[map.theme];
              return (
                <button
                  key={map.id}
                  onClick={() => handleSelect(map)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`gallery-card group text-left animate-gallery-card-in ${
                    isSelected ? 'gallery-card-selected gallery-card-map-selected' : ''
                  }`}>
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-2.5">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={
                        map.backgroundImageUrl
                          ? { backgroundImage: `url(${map.backgroundImageUrl})` }
                          : {
                              background: `linear-gradient(to bottom, ${map.skyColors[0]}, ${map.groundColor})`,
                            }
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${theme.chip}`}>
                      {theme.label}
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 ring-2 ring-cyan-400/70 ring-inset rounded-xl" />
                    )}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-white/90 group-hover:text-white transition-colors">
                    {map.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="relative z-10 w-full max-w-6xl mx-auto mt-auto pt-3 sm:pt-4 animate-gallery-preview-in">
            <div className="gallery-preview-panel gallery-preview-map">
              <div
                className="gallery-preview-thumb hidden sm:block w-36 h-24 rounded-xl bg-cover bg-center shrink-0 ring-1 ring-white/10 shadow-lg"
                style={
                  selected.backgroundImageUrl
                    ? { backgroundImage: `url(${selected.backgroundImageUrl})` }
                    : {
                        background: `linear-gradient(to bottom, ${selected.skyColors[0]}, ${selected.groundColor})`,
                      }
                }
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-cyan-400 shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/70">
                    Arena Preview
                  </p>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-white truncate">{selected.name}</h3>
                <p className="text-xs text-white/45 mt-1">
                  {MAP_THEME[selected.theme].label} environment · Wind affects every match
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-white/35 uppercase tracking-wider">Sky</span>
                  <div
                    className="w-8 h-8 rounded-lg ring-1 ring-white/20 shadow-inner"
                    style={{ background: selected.skyColors[0] }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-white/35 uppercase tracking-wider">Ground</span>
                  <div
                    className="w-8 h-8 rounded-lg ring-1 ring-white/20 shadow-inner"
                    style={{ background: selected.groundColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CharacterGallery: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const characters = Object.values(CHARACTERS);
  const [selectedId, setSelectedId] = useState(characters[0]?.id ?? 'ninja');
  const selected = CHARACTERS[selectedId];
  const weapon = selected ? WEAPONS[selected.weaponId] : null;
  const powerUps = selected?.powerUpIds.map((id) => POWER_UPS[id]).filter(Boolean) ?? [];

  const handleSelect = (char: CharacterDef) => {
    initAudio();
    playSfx('ui');
    setSelectedId(char.id);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0e17] text-white overflow-hidden gallery-shell">
      <div className="gallery-ambient gallery-ambient-pink" aria-hidden />
      <div className="gallery-ambient gallery-ambient-purple" aria-hidden />

      <div className="gallery-inner relative z-10 flex flex-col h-full p-4 sm:p-6">
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-4 sm:mb-6 gallery-compact-header">
          <GalleryBackButton onBack={onBack} />
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-400 to-purple-500 uppercase tracking-wider gallery-title-glow">
              Characters
            </h2>
            <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.25em] mt-1">
              {characters.length} Fighters
            </p>
          </div>
          <div className="w-[72px]" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-5xl mx-auto pb-4">
          <div className="gallery-content grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {characters.map((char, i) => {
              const isSelected = selectedId === char.id;
              const weaponName = formatWeaponName(char.weaponId);
              return (
                <button
                  key={char.id}
                  onClick={() => handleSelect(char)}
                  style={{ animationDelay: `${i * 45}ms`, ['--char-color' as string]: char.color }}
                  className={`gallery-card gallery-card-character group text-left animate-gallery-card-in ${
                    isSelected ? 'gallery-card-selected gallery-card-char-selected' : ''
                  }`}>
                  <div className="relative flex flex-col items-center w-full">
                    <div
                      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
                      style={{ background: `${char.color}33` }}
                      aria-hidden
                    />
                    <div
                      className="relative mb-2.5 rounded-full"
                      style={
                        isSelected
                          ? { boxShadow: `0 0 0 2px ${char.color}, 0 0 20px ${char.color}55` }
                          : undefined
                      }>
                      <CharacterAvatar char={char} size={80} />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-white/90 text-center leading-tight group-hover:text-white transition-colors">
                      {char.name}
                    </span>
                    <span className="text-[10px] sm:text-xs text-white/40 mt-1 font-semibold uppercase tracking-wider">
                      {weaponName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selected && weapon && (
          <div className="relative z-10 w-full max-w-5xl mx-auto mt-auto pt-3 sm:pt-4 animate-gallery-preview-in">
            <div
              className="gallery-preview-panel gallery-preview-character"
              style={{ ['--char-color' as string]: selected.color }}>
              <CharacterAvatar char={selected} size={72} className="gallery-preview-avatar" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Swords size={14} className="text-fuchsia-400 shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400/70">
                    Fighter Profile
                  </p>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-white truncate">{selected.name}</h3>
                <p className="text-xs text-white/45 mt-0.5">
                  {weapon.name} · {weapon.baseDamage[0]}–{weapon.baseDamage[1]} dmg
                </p>
              </div>
              <div className="hidden sm:flex flex-col gap-1.5 shrink-0 min-w-[140px]">
                {powerUps.map((pu) => (
                  <div
                    key={pu.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <Sparkles size={12} className="text-amber-300/80 shrink-0" />
                    <span className="truncate text-white/75 font-semibold">{pu.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:hidden mt-2 flex flex-wrap gap-2">
              {powerUps.map((pu) => (
                <span
                  key={pu.id}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                  {pu.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
