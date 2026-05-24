export interface Vector2D {
  x: number;
  y: number;
}

export type ScreenState =
'loading' |
'menu' |
'characterSelect' |
'countdown' |
'mapSelect' |
'playing' |
'gameOver' |
'mapGallery' |
'characterGallery';

export type Difficulty = 'easy' | 'intermediate' | 'hard' | 'impossible';

export interface Player {
  id: string;
  characterId: string;
  hp: number;
  maxHp: number;
  powerPoints: number;
  isAI: boolean;
  position: Vector2D;
  facing: 1 | -1; // 1 for right, -1 for left
  activePowerUp: string | null;
  statusEffects: StatusEffect[];
  hitFrames?: number; // legacy frame counter (kept for compat)
  // IDLE / HIT state machine — damaged sprite shows while state === 'hit'
  characterState?: 'idle' | 'hit';
  hitstunTimer?: number; // seconds remaining in HIT state
}

export interface StatusEffect {
  type: 'poison' | 'fire' | 'shield' | 'emp';
  duration: number; // turns remaining
  value?: number;
}

export interface CharacterDef {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  weaponId: string;
  powerUpIds: string[];
  avatarUrl?: string;
  damagedAvatarUrl?: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  baseDamage: [number, number]; // min, max
  speedMultiplier: number;
  gravityScale: number;
  spinSpeed: number;
  shape: 'shuriken' | 'axe' | 'fireball' | 'arrow';
  color: string;
  trailColor: string;
}

export interface PowerUpDef {
  id: string;
  name: string;
  cost: number;
  description: string;
  characterId: string;
}

export interface MapDef {
  id: string;
  name: string;
  groundColor: string;
  skyColors: [string, string];
  theme: 'forest' | 'desert' | 'cyber';
  backgroundImageUrl?: string;
}

export interface Projectile {
  id: string;
  ownerId: string;
  weaponId: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  active: boolean;
  trail: Vector2D[];
  modifiers: {
    damageMultiplier?: number;
    piercing?: boolean;
    explosive?: boolean;
    poison?: boolean;
    chain?: boolean;
    noGravity?: boolean;
  };
}

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  id: string;
  text: string;
  position: Vector2D;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameEngineState {
  players: Player[];
  currentTurnIndex: number;
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  mapId: string;
  wind: number;
  camera: {
    offset: Vector2D;
    shake: number;
    zoom: number;
    targetZoom: number;
    targetOffset: Vector2D;
  };
  hitStopFrames: number;
  phase: 'aiming' | 'firing' | 'resolving' | 'turnTransition';
  aimDragStart: Vector2D | null;
  aimDragCurrent: Vector2D | null;
  winnerId: string | null;
  turnCount: number;
  aimTurnRemainingMs: number | null;
  difficulty?: Difficulty;
}