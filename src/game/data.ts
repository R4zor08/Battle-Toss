import { CharacterDef, WeaponDef, PowerUpDef, MapDef } from '../types/game';

export const CHARACTERS: Record<string, CharacterDef> = {
  ninja: {
    id: 'ninja',
    name: 'Cyber Ninja',
    color: '#00ffcc',
    secondaryColor: '#1a1a2e',
    weaponId: 'shuriken',
    powerUpIds: ['ninja_split', 'ninja_straight', 'ninja_poison'],
    avatarUrl: "/Cyberninja-removebg-preview.png",

    damagedAvatarUrl: "/CyberninjaDamaged.png"

  },
  viking: {
    id: 'viking',
    name: 'Viking Warrior',
    color: '#ff5500',
    secondaryColor: '#4a2511',
    weaponId: 'axe',
    powerUpIds: ['viking_berserk', 'viking_pierce', 'viking_quake'],
    avatarUrl: "/Viking_Warrior-removebg-preview.png",

    damagedAvatarUrl: "/Gemini_Generated_Image_xz4ghfxz4ghfxz4g-removebg-preview.png"

  },
  mage: {
    id: 'mage',
    name: 'Fire Mage',
    color: '#ff0055',
    secondaryColor: '#ffd700',
    weaponId: 'fireball',
    powerUpIds: ['mage_meteor', 'mage_firestorm', 'mage_shield'],
    avatarUrl: "/FireMage-removebg-preview.png",

    damagedAvatarUrl: "/FiremageDamaged.png"

  },
  punk: {
    id: 'punk',
    name: 'Punk Hunter',
    color: '#ff00ff',
    secondaryColor: '#00ffff',
    weaponId: 'arrow',
    powerUpIds: ['punk_triple', 'punk_emp', 'punk_chain'],
    avatarUrl: "/Punk_Hunter-removebg-preview.png",

    damagedAvatarUrl: "/PunkhunterDamaged.png"

  },
  samurai: {
    id: 'samurai',
    name: 'Samurai Robot',
    color: '#c0c0c0',
    secondaryColor: '#ff0000',
    weaponId: 'disc',
    powerUpIds: ['samurai_railgun', 'samurai_overdrive', 'samurai_shield'],
    avatarUrl: "/samurai_robot-removebg-preview.png",

    damagedAvatarUrl: "/Samurairobotedamaged.png"

  },
  space: {
    id: 'space',
    name: 'Space Soldier',
    color: '#ffffff',
    secondaryColor: '#00ffff',
    weaponId: 'laser',
    powerUpIds: ['space_orbital', 'space_phase', 'space_heal'],
    avatarUrl: "/SpaceSoldier-removebg-preview.png",

    damagedAvatarUrl: "/SpaceSoldierDamaged.png"

  },
  tribal: {
    id: 'tribal',
    name: 'Tribal Spear Fighter',
    color: '#d2b48c',
    secondaryColor: '#8b4513',
    weaponId: 'spear',
    powerUpIds: ['tribal_homing', 'tribal_thorns', 'tribal_warcry'],
    avatarUrl: "/TribalFighter-removebg-preview.png",

    damagedAvatarUrl: "/tribalfighterdamaged.png"

  },
  archer: {
    id: 'archer',
    name: 'Arcane Archer',
    color: '#228b22',
    secondaryColor: '#8a2be2',
    weaponId: 'magicArrow',
    powerUpIds: ['archer_multi', 'archer_seek', 'archer_frost'],
    avatarUrl: "/ArcaneArcher-removebg-preview.png",

    damagedAvatarUrl: "/ArcaneArcherDamaged.png"

  }
};

export const WEAPONS: Record<string, WeaponDef> = {
  shuriken: {
    id: 'shuriken',
    name: 'Shuriken',
    baseDamage: [12, 18],
    speedMultiplier: 1.2,
    gravityScale: 0.8,
    spinSpeed: 0.4,
    shape: 'shuriken',
    color: '#cccccc',
    trailColor: 'rgba(0, 255, 204, 0.5)'
  },
  axe: {
    id: 'axe',
    name: 'Heavy Axe',
    baseDamage: [20, 28],
    speedMultiplier: 0.9,
    gravityScale: 1.2,
    spinSpeed: 0.15,
    shape: 'axe',
    color: '#888888',
    trailColor: 'rgba(255, 85, 0, 0.5)'
  },
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    baseDamage: [15, 22],
    speedMultiplier: 1.0,
    gravityScale: 1.0,
    spinSpeed: 0,
    shape: 'fireball',
    color: '#ff3300',
    trailColor: 'rgba(255, 51, 0, 0.6)'
  },
  arrow: {
    id: 'arrow',
    name: 'Plasma Arrow',
    baseDamage: [14, 20],
    speedMultiplier: 1.5,
    gravityScale: 0.6,
    spinSpeed: 0,
    shape: 'arrow',
    color: '#ff00ff',
    trailColor: 'rgba(255, 0, 255, 0.5)'
  },
  disc: {
    id: 'disc',
    name: 'Plasma Disc',
    baseDamage: [16, 22],
    speedMultiplier: 1.1,
    gravityScale: 0.9,
    spinSpeed: 0.6,
    shape: 'disc',
    color: '#00ffff',
    trailColor: 'rgba(0, 255, 255, 0.5)'
  },
  laser: {
    id: 'laser',
    name: 'Laser Bolt',
    baseDamage: [14, 20],
    speedMultiplier: 1.6,
    gravityScale: 0.3,
    spinSpeed: 0,
    shape: 'laser',
    color: '#ffff00',
    trailColor: 'rgba(255, 255, 0, 0.5)'
  },
  spear: {
    id: 'spear',
    name: 'Tribal Spear',
    baseDamage: [18, 24],
    speedMultiplier: 1.0,
    gravityScale: 0.9,
    spinSpeed: 0.1,
    shape: 'spear',
    color: '#8b4513',
    trailColor: 'rgba(139, 69, 19, 0.5)'
  },
  magicArrow: {
    id: 'magicArrow',
    name: 'Magic Arrow',
    baseDamage: [12, 18],
    speedMultiplier: 1.4,
    gravityScale: 0.7,
    spinSpeed: 0,
    shape: 'magicArrow',
    color: '#8a2be2',
    trailColor: 'rgba(138, 43, 226, 0.5)'
  }
};

export const POWER_UPS: Record<string, PowerUpDef> = {
  ninja_split: {
    id: 'ninja_split',
    characterId: 'ninja',
    name: 'Shadow Strike',
    cost: 1,
    description: 'Splits into 3 shurikens (8-12 dmg)'
  },
  ninja_straight: {
    id: 'ninja_straight',
    characterId: 'ninja',
    name: 'Swiftness',
    cost: 1,
    description: 'No gravity for next shot (10-16 dmg)'
  },
  ninja_poison: {
    id: 'ninja_poison',
    characterId: 'ninja',
    name: 'Poison Tip',
    cost: 2,
    description: 'Adds poison DOT (6 dmg/turn for 2 turns)'
  },

  viking_berserk: {
    id: 'viking_berserk',
    characterId: 'viking',
    name: 'Berserk',
    cost: 1,
    description: '+50% damage (30-40 dmg)'
  },
  viking_pierce: {
    id: 'viking_pierce',
    characterId: 'viking',
    name: 'Piercing Throw',
    cost: 1,
    description: 'Passes through enemy (hits twice, 15-22 dmg)'
  },
  viking_quake: {
    id: 'viking_quake',
    characterId: 'viking',
    name: 'Earth Shatter',
    cost: 2,
    description: 'AOE shockwave on impact + stuns enemy'
  },

  mage_meteor: {
    id: 'mage_meteor',
    characterId: 'mage',
    name: 'Meteor',
    cost: 2,
    description: 'Large AOE explosion (20-30 dmg main, 10-15 splash)'
  },
  mage_firestorm: {
    id: 'mage_firestorm',
    characterId: 'mage',
    name: 'Firestorm',
    cost: 1,
    description: 'Leaves burning ground (8 dmg/turn for 2 turns)'
  },
  mage_shield: {
    id: 'mage_shield',
    characterId: 'mage',
    name: 'Flame Shield',
    cost: 1,
    description: 'Reduces next incoming damage by 60%'
  },

  punk_triple: {
    id: 'punk_triple',
    characterId: 'punk',
    name: 'Triple Shot',
    cost: 2,
    description: 'Shoots 3 arrows (10-14 dmg each)'
  },
  punk_emp: {
    id: 'punk_emp',
    characterId: 'punk',
    name: 'EMP Blast',
    cost: 1,
    description: 'Disables enemy power-ups for 2 turns'
  },
  punk_chain: {
    id: 'punk_chain',
    characterId: 'punk',
    name: 'Overcharge',
    cost: 1,
    description: 'Chains to nearby enemy (75% bonus dmg)'
  },

  samurai_railgun: {
    id: 'samurai_railgun',
    characterId: 'samurai',
    name: 'Railgun',
    cost: 2,
    description: 'Penetrating shot (25-35 dmg, ignores shields)'
  },
  samurai_overdrive: {
    id: 'samurai_overdrive',
    characterId: 'samurai',
    name: 'Overdrive',
    cost: 1,
    description: 'Fires 2 discs (12-18 dmg each)'
  },
  samurai_shield: {
    id: 'samurai_shield',
    characterId: 'samurai',
    name: 'Shield Generator',
    cost: 1,
    description: 'Blocks next incoming attack completely'
  },

  space_orbital: {
    id: 'space_orbital',
    characterId: 'space',
    name: 'Orbital Strike',
    cost: 2,
    description: 'Calls 3 lasers from sky (8-12 dmg each)'
  },
  space_phase: {
    id: 'space_phase',
    characterId: 'space',
    name: 'Phase Shift',
    cost: 1,
    description: 'Teleports to enemy (guaranteed hit, 14-20 dmg)'
  },
  space_heal: {
    id: 'space_heal',
    characterId: 'space',
    name: 'Nanite Repair',
    cost: 1,
    description: 'Heals 15 HP instantly'
  },

  tribal_homing: {
    id: 'tribal_homing',
    characterId: 'tribal',
    name: "Ancestor's Wrath",
    cost: 2,
    description: 'Homing spear seeks enemy (20-28 dmg)'
  },
  tribal_thorns: {
    id: 'tribal_thorns',
    characterId: 'tribal',
    name: 'Poison Thorns',
    cost: 1,
    description: 'Spear embeds (5 dmg/turn for 3 turns)'
  },
  tribal_warcry: {
    id: 'tribal_warcry',
    characterId: 'tribal',
    name: 'War Cry',
    cost: 1,
    description: 'Stuns enemy (skip next turn)'
  },

  archer_multi: {
    id: 'archer_multi',
    characterId: 'archer',
    name: 'Multi-shot',
    cost: 2,
    description: 'Fires 5 arrows in fan pattern (6-10 dmg each)'
  },
  archer_seek: {
    id: 'archer_seek',
    characterId: 'archer',
    name: 'Seeking Arrow',
    cost: 2,
    description: 'Guaranteed hit (18-25 dmg)'
  },
  archer_frost: {
    id: 'archer_frost',
    characterId: 'archer',
    name: 'Frost Arrow',
    cost: 1,
    description: 'Freezes enemy (skip next turn) + 10 dmg'
  }
};

export const MAPS: Record<string, MapDef> = {
  forest: {
    id: 'forest',
    name: 'Forest Temple',
    groundColor: '#2d5a27',
    skyColors: ['#87CEEB', '#E0F6FF'],
    theme: 'forest',
    backgroundImageUrl: "/0bca72e7-330d-430a-9bae-b2313bd18d90.jpg"

  },
  volcano: {
    id: 'volcano',
    name: 'Volcanic Peak',
    groundColor: '#3a0000',
    skyColors: ['#ff4500', '#1a0000'],
    theme: 'desert',
    backgroundImageUrl: "/f924734c-4bc0-44cd-a1af-9bd3567e8f6b.jpg"

  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk Alley',
    groundColor: '#1a1a2e',
    skyColors: ['#0f0c29', '#302b63'],
    theme: 'cyber',
    backgroundImageUrl: "/72660072-af8e-418d-b3c4-0fa9e8a97f14.jpg"

  },
  sunlit: {
    id: 'sunlit',
    name: 'Sunlit Grove',
    groundColor: '#7cb342',
    skyColors: ['#fff8b0', '#c5e1a5'],
    theme: 'forest',
    backgroundImageUrl: "/fd5e4b9b-d649-46ca-849d-9e7a7b0c018b.jpg"

  },
  moonlit: {
    id: 'moonlit',
    name: 'Moonlit Woods',
    groundColor: '#0f1a2a',
    skyColors: ['#1a2540', '#3b5078'],
    theme: 'forest',
    backgroundImageUrl: "/8daa867a-4cfd-43f1-a368-902ebd651c37.jpg"

  },
  sunnyMeadow: {
    id: 'sunnyMeadow',
    name: 'Sunny Meadow',
    groundColor: '#4a7c3f',
    skyColors: ['#87CEEB', '#E0F6FF'],
    theme: 'forest',
    backgroundImageUrl: '/maps/sunny-meadow.png',
  },
  alpineVista: {
    id: 'alpineVista',
    name: 'Alpine Vista',
    groundColor: '#3d6b4f',
    skyColors: ['#5eb3d4', '#b8e0f0'],
    theme: 'forest',
    backgroundImageUrl: '/maps/alpine-vista.png',
  },
  shadowGrove: {
    id: 'shadowGrove',
    name: 'Shadow Grove',
    groundColor: '#1b3321',
    skyColors: ['#1a2540', '#3b5078'],
    theme: 'forest',
    backgroundImageUrl: '/maps/shadow-grove.png',
  },
  riversideGrove: {
    id: 'riversideGrove',
    name: 'Riverside Grove',
    groundColor: '#2d5a27',
    skyColors: ['#a8d8ea', '#c5e8c5'],
    theme: 'forest',
    backgroundImageUrl: '/maps/riverside-grove.png',
  },
  sunsetHighway: {
    id: 'sunsetHighway',
    name: 'Sunset Highway',
    groundColor: '#3a3a3a',
    skyColors: ['#ff8c42', '#4a3728'],
    theme: 'desert',
    backgroundImageUrl: '/maps/sunset-highway.png',
  },
};