const STORAGE_KEY = 'battle-toss-audio';

export type SfxName =
  | 'throw'
  | 'hit'
  | 'crit'
  | 'shield'
  | 'explosion'
  | 'powerUp'
  | 'heal'
  | 'technique'
  | 'ui'
  | 'win'
  | 'lose'
  | 'turn'
  | 'countdown'
  | 'fight';

interface AudioSettings {
  sfxMuted: boolean;
  musicMuted: boolean;
}

let ctx: AudioContext | null = null;
let musicStop: (() => void) | null = null;

const loadSettings = (): AudioSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AudioSettings;
  } catch {
    /* ignore */
  }
  return { sfxMuted: false, musicMuted: false };
};

let settings = loadSettings();

const persistSettings = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const initAudio = (): void => {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
};

export const getAudioSettings = (): AudioSettings => ({ ...settings });

export const setSfxMuted = (muted: boolean): void => {
  settings.sfxMuted = muted;
  persistSettings();
};

export const setMusicMuted = (muted: boolean): void => {
  settings.musicMuted = muted;
  persistSettings();
  if (muted) {
    stopMenuMusic();
  } else if (ctx) {
    startMenuMusic();
  }
};

const getCtx = (): AudioContext | null => {
  if (settings.sfxMuted && settings.musicMuted) return ctx;
  initAudio();
  return ctx;
};

const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  attack = 0.01,
  release = 0.08
) => {
  const audio = getCtx();
  if (!audio || settings.sfxMuted) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audio.currentTime);
  gain.gain.setValueAtTime(0, audio.currentTime);
  gain.gain.linearRampToValueAtTime(volume, audio.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audio.currentTime + attack + release + duration
  );
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime);
  osc.stop(audio.currentTime + attack + release + duration + 0.05);
};

const playNoise = (duration: number, volume = 0.08, freq = 800) => {
  const audio = getCtx();
  if (!audio || settings.sfxMuted) return;

  const bufferSize = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  source.start();
};

export const playSfx = (name: SfxName): void => {
  if (settings.sfxMuted) return;
  initAudio();

  switch (name) {
    case 'throw':
      playNoise(0.12, 0.06, 1200);
      playTone(280, 0.06, 'sawtooth', 0.04, 0.01, 0.1);
      break;
    case 'hit':
      playTone(120, 0.08, 'square', 0.12, 0.005, 0.06);
      playNoise(0.05, 0.05, 400);
      break;
    case 'crit':
      playTone(880, 0.05, 'square', 0.1, 0.005, 0.04);
      playTone(660, 0.08, 'sawtooth', 0.08, 0.01, 0.06);
      break;
    case 'shield':
      playTone(520, 0.1, 'sine', 0.1, 0.01, 0.12);
      playTone(780, 0.06, 'triangle', 0.06, 0.02, 0.08);
      break;
    case 'explosion':
      playNoise(0.25, 0.14, 200);
      playTone(60, 0.2, 'sawtooth', 0.1, 0.01, 0.15);
      break;
    case 'powerUp':
      playTone(440, 0.06, 'sine', 0.08, 0.01, 0.05);
      playTone(660, 0.08, 'sine', 0.08, 0.02, 0.06);
      playTone(880, 0.1, 'sine', 0.06, 0.03, 0.08);
      break;
    case 'heal':
      playTone(523, 0.08, 'sine', 0.07, 0.01, 0.08);
      playTone(659, 0.1, 'sine', 0.06, 0.03, 0.1);
      break;
    case 'technique':
      playTone(220, 0.12, 'sawtooth', 0.08, 0.02, 0.1);
      playTone(330, 0.15, 'square', 0.06, 0.04, 0.12);
      playNoise(0.15, 0.05, 600);
      break;
    case 'ui':
      playTone(600, 0.04, 'triangle', 0.06, 0.005, 0.04);
      break;
    case 'win':
      playTone(523, 0.1, 'sine', 0.1, 0.01, 0.08);
      playTone(659, 0.1, 'sine', 0.1, 0.12, 0.08);
      playTone(784, 0.15, 'sine', 0.12, 0.24, 0.12);
      break;
    case 'lose':
      playTone(392, 0.12, 'sine', 0.1, 0.01, 0.1);
      playTone(330, 0.15, 'sine', 0.1, 0.14, 0.14);
      playTone(262, 0.2, 'sine', 0.08, 0.3, 0.18);
      break;
    case 'turn':
      playNoise(0.08, 0.025, 900);
      break;
    case 'countdown':
      playTone(440 + Math.random() * 80, 0.06, 'sine', 0.09, 0.005, 0.05);
      break;
    case 'fight':
      playNoise(0.18, 0.12, 400);
      playTone(150, 0.1, 'square', 0.12, 0.005, 0.08);
      playTone(330, 0.08, 'sawtooth', 0.08, 0.05, 0.06);
      break;
    default:
      break;
  }
};

export const startMenuMusic = (): void => {
  if (settings.musicMuted || musicStop) return;
  initAudio();
  const audio = ctx;
  if (!audio) return;

  const osc1 = audio.createOscillator();
  const osc2 = audio.createOscillator();
  const gain = audio.createGain();
  const lfo = audio.createOscillator();
  const lfoGain = audio.createGain();

  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.value = 110;
  osc2.frequency.value = 164.81;
  gain.gain.value = 0.025;
  lfo.frequency.value = 0.15;
  lfoGain.gain.value = 0.012;

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audio.destination);

  osc1.start();
  osc2.start();
  lfo.start();

  musicStop = () => {
    const t = audio.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);
    setTimeout(() => {
      try {
        osc1.stop();
        osc2.stop();
        lfo.stop();
      } catch {
        /* already stopped */
      }
    }, 350);
  };
};

export const stopMenuMusic = (): void => {
  if (musicStop) {
    musicStop();
    musicStop = null;
  }
};
