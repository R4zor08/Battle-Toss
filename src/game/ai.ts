import { Difficulty, GameEngineState, Player } from '../types/game';
import { GAME_CONSTANTS } from './constants';
import { CHARACTERS, WEAPONS, POWER_UPS } from './data';
import { activatePowerUpForPlayer, isTechniqueShot } from './engine';
import { distance, randomRange } from '../utils/math';

export interface DifficultyConfig {
  powerUpChance: number;
  suboptimalPickChance: number;
  strategicWeight: number;
  disableFinisherBonus: boolean;
  angleErrorDeg: number;
  powerErrorPct: number;
  groundMissChance: number;
  longRangeDist: number;
  longRangeExtraAngleDeg: number;
  coarseAngleStepDeg: number;
  enableRefinement: boolean;
  refineAngleStep: number;
  enableExhaustive: boolean;
  targetLeadPx: number;
  reactionMs: [number, number];
  baseThinkingMs: number;
  distanceThinkingFactor: number;
  showInputReading: boolean;
  finisherMinEnemyHpPct: number;
}

const MULTI_SHOT_SPREAD = 0.15;
const COARSE_POWERS = [15, 18, 21, 24, 27, 30, 33, GAME_CONSTANTS.MAX_POWER];

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    powerUpChance: 0.15,
    suboptimalPickChance: 0.5,
    strategicWeight: 0,
    disableFinisherBonus: true,
    angleErrorDeg: 15,
    powerErrorPct: 0.25,
    groundMissChance: 0.15,
    longRangeDist: 700,
    longRangeExtraAngleDeg: 8,
    coarseAngleStepDeg: 4,
    enableRefinement: false,
    refineAngleStep: 0.005,
    enableExhaustive: false,
    targetLeadPx: 0,
    reactionMs: [500, 800],
    baseThinkingMs: 800,
    distanceThinkingFactor: 400,
    showInputReading: false,
    finisherMinEnemyHpPct: 0,
  },
  intermediate: {
    powerUpChance: 0.65,
    suboptimalPickChance: 0.2,
    strategicWeight: 0.6,
    disableFinisherBonus: false,
    angleErrorDeg: 5,
    powerErrorPct: 0.06,
    groundMissChance: 0,
    longRangeDist: Infinity,
    longRangeExtraAngleDeg: 0,
    coarseAngleStepDeg: 2,
    enableRefinement: true,
    refineAngleStep: 0.005,
    enableExhaustive: false,
    targetLeadPx: 0,
    reactionMs: [180, 280],
    baseThinkingMs: 350,
    distanceThinkingFactor: 150,
    showInputReading: false,
    finisherMinEnemyHpPct: 0,
  },
  hard: {
    powerUpChance: 0.9,
    suboptimalPickChance: 0,
    strategicWeight: 1,
    disableFinisherBonus: false,
    angleErrorDeg: 1,
    powerErrorPct: 0.01,
    groundMissChance: 0,
    longRangeDist: Infinity,
    longRangeExtraAngleDeg: 0,
    coarseAngleStepDeg: 2,
    enableRefinement: true,
    refineAngleStep: 0.002,
    enableExhaustive: false,
    targetLeadPx: 15,
    reactionMs: [60, 100],
    baseThinkingMs: 150,
    distanceThinkingFactor: 70,
    showInputReading: true,
    finisherMinEnemyHpPct: 0,
  },
  impossible: {
    powerUpChance: 0.99,
    suboptimalPickChance: 0,
    strategicWeight: 1.5,
    disableFinisherBonus: false,
    angleErrorDeg: 0,
    powerErrorPct: 0,
    groundMissChance: 0,
    longRangeDist: Infinity,
    longRangeExtraAngleDeg: 0,
    coarseAngleStepDeg: 2,
    enableRefinement: true,
    refineAngleStep: 0.005,
    enableExhaustive: true,
    targetLeadPx: 20,
    reactionMs: [20, 40],
    baseThinkingMs: 80,
    distanceThinkingFactor: 60,
    showInputReading: true,
    finisherMinEnemyHpPct: 0.35,
  },
};

export function getAIThinkDelay(state: GameEngineState): number {
  const difficulty = state.difficulty || 'intermediate';
  const config = DIFFICULTY_CONFIG[difficulty];
  const ai = state.players[state.currentTurnIndex];
  const target = state.players.find((p) => p.id !== ai.id);
  const dist = target
    ? Math.hypot(
        target.position.x - ai.position.x,
        target.position.y - ai.position.y
      )
    : 600;
  const distRatio = Math.min(1, dist / 1200);
  const reaction =
    config.reactionMs[0] +
    Math.random() * (config.reactionMs[1] - config.reactionMs[0]);
  const thinking =
    config.baseThinkingMs + distRatio * config.distanceThinkingFactor;
  return reaction + thinking;
}

interface SimResult {
  hit: boolean;
  dist: number;
  directHit: boolean;
}

function getAimTarget(
  aiPlayer: Player,
  targetPlayer: Player,
  config: DifficultyConfig
): { x: number; y: number } {
  let targetX = targetPlayer.position.x;
  let targetY = targetPlayer.position.y;

  if (config.targetLeadPx > 0) {
    const knockDir = Math.sign(targetX - aiPlayer.position.x) || 1;
    targetX += knockDir * config.targetLeadPx;
  }

  if (config.groundMissChance > 0 && Math.random() < config.groundMissChance) {
    targetY = GAME_CONSTANTS.GROUND_Y - 20;
  }

  return { x: targetX, y: targetY };
}

function isBetterShot(
  candidate: SimResult,
  current: SimResult,
  preferDirect: boolean
): boolean {
  if (candidate.hit && !current.hit) return true;
  if (!candidate.hit && current.hit) return false;
  if (candidate.hit && current.hit && preferDirect) {
    if (candidate.directHit && !current.directHit) return true;
    if (!candidate.directHit && current.directHit) return false;
  }
  return candidate.dist < current.dist;
}

function trySelectPowerUp(
  state: GameEngineState,
  aiPlayer: Player,
  targetPlayer: Player,
  config: DifficultyConfig
): void {
  if (aiPlayer.powerPoints <= 0 || aiPlayer.activePowerUp) return;
  const isEmpd = aiPlayer.statusEffects.some((e) => e.type === 'emp');
  if (isEmpd) return;

  const charDef = CHARACTERS[aiPlayer.characterId];
  const availablePowerUps = charDef.powerUpIds.filter(
    (id) => aiPlayer.powerPoints >= POWER_UPS[id].cost
  );
  if (availablePowerUps.length === 0 || Math.random() >= config.powerUpChance) {
    return;
  }

  const hpPercent = aiPlayer.hp / aiPlayer.maxHp;
  const enemyHpPercent = targetPlayer.hp / targetPlayer.maxHp;
  const enemyHasShield = targetPlayer.statusEffects.some(
    (e) => e.type === 'shield'
  );
  const strategicWeight = config.strategicWeight;

  const scorePowerUp = (id: string): number => {
    let score = 1;

    const isDefensive = id.includes('shield') || id.includes('heal');
    const isPiercing = id.includes('pierce') || id.includes('railgun');
    const isExplosive =
      id.includes('explosive') ||
      id.includes('meteor') ||
      id.includes('firestorm') ||
      id.includes('quake');
    const isHoming = id.includes('homing') || id.includes('seek');
    const isStun =
      id.includes('warcry') || id.includes('frost') || id.includes('emp');
    const isFinisher =
      isHoming ||
      id.includes('railgun') ||
      id.includes('phase') ||
      id.includes('orbital') ||
      id.includes('berserk');

    if (isDefensive) {
      if (hpPercent < 0.3) score += 8 * strategicWeight;
      else if (hpPercent < 0.5) score += 4 * strategicWeight;
      else score -= 3 * strategicWeight;
    }

    if (
      isFinisher &&
      !config.disableFinisherBonus &&
      enemyHpPercent < 0.35
    ) {
      score += 7 * strategicWeight;
    }

    if (enemyHasShield && (isPiercing || isExplosive)) {
      score += 5 * strategicWeight;
    }

    if (isStun) {
      score += (hpPercent < 0.5 ? 3 : 2) * strategicWeight;
    }

    if (!isDefensive && hpPercent > enemyHpPercent) {
      score += 2 * strategicWeight;
    }

    if (
      isFinisher &&
      config.finisherMinEnemyHpPct > 0 &&
      enemyHpPercent > config.finisherMinEnemyHpPct
    ) {
      score -= 12 * strategicWeight;
    }

    if (config.disableFinisherBonus) {
      score += Math.random() * 6;
    } else {
      score += Math.random() * 0.5;
    }

    return score;
  };

  const ranked = availablePowerUps
    .map((id) => ({ id, score: scorePowerUp(id) }))
    .sort((a, b) => b.score - a.score);

  const pickIndex =
    config.suboptimalPickChance > 0 &&
    Math.random() < config.suboptimalPickChance
      ? Math.floor(Math.random() * ranked.length)
      : 0;
  const chosenPu = ranked[pickIndex].id;
  activatePowerUpForPlayer(state, aiPlayer, chosenPu);
}

export const calculateAIAim = (
  state: GameEngineState
): { power: number; angle: number } | null => {
  const aiPlayer = state.players[state.currentTurnIndex];
  if (!aiPlayer.isAI) return null;

  const targetPlayer = state.players.find((p) => p.id !== aiPlayer.id);
  if (!targetPlayer) return null;

  const difficulty = state.difficulty || 'intermediate';
  const config = DIFFICULTY_CONFIG[difficulty];

  trySelectPowerUp(state, aiPlayer, targetPlayer, config);

  if (isTechniqueShot(aiPlayer.activePowerUp)) {
    const dir = targetPlayer.position.x >= aiPlayer.position.x ? 1 : -1;
    return { power: 20, angle: dir > 0 ? 0 : Math.PI };
  }

  const charDef = CHARACTERS[aiPlayer.characterId];
  const weaponDef = WEAPONS[charDef.weaponId];
  const dist = distance(aiPlayer.position, targetPlayer.position);

  const aimTarget = getAimTarget(aiPlayer, targetPlayer, config);
  const targetX = aimTarget.x;
  const targetY = aimTarget.y;
  const startX = aiPlayer.position.x + aiPlayer.facing * 30;
  const startY = aiPlayer.position.y - 10;
  const dir = targetX >= startX ? 1 : -1;

  const noGravity = aiPlayer.activePowerUp === 'ninja_straight';
  const isExplosive =
    aiPlayer.activePowerUp === 'mage_meteor' ||
    aiPlayer.activePowerUp === 'viking_quake';
  const grav = noGravity ? 0 : GAME_CONSTANTS.GRAVITY * weaponDef.gravityScale;
  const speedMult = weaponDef.speedMultiplier;
  const groundY = GAME_CONSTANTS.GROUND_Y;
  const halfW =
    GAME_CONSTANTS.PLAYER_WIDTH / 2 + GAME_CONSTANTS.PROJECTILE_RADIUS;
  const halfH =
    GAME_CONSTANTS.PLAYER_HEIGHT / 2 + GAME_CONSTANTS.PROJECTILE_RADIUS;
  const aoeRadius = isExplosive ? 150 : 0;
  const isMultiShot =
    aiPlayer.activePowerUp === 'ninja_split' ||
    aiPlayer.activePowerUp === 'punk_triple';
  const preferDirect = difficulty === 'hard' && !isExplosive;

  const simulate = (power: number, worldAngle: number): SimResult => {
    let vx = Math.cos(worldAngle) * power * speedMult;
    let vy = Math.sin(worldAngle) * power * speedMult;
    let x = startX;
    let y = startY;
    let bestDist = Infinity;
    for (let step = 0; step < 800; step++) {
      x += vx;
      y += vy;
      vy += grav;
      const ddx = Math.abs(x - targetX);
      const ddy = Math.abs(y - targetY);
      const d = Math.hypot(ddx, ddy);
      if (d < bestDist) bestDist = d;
      if (ddx < halfW && ddy < halfH) {
        return { hit: true, dist: 0, directHit: true };
      }
      if (y >= groundY) {
        if (aoeRadius > 0) {
          const groundDist = Math.hypot(x - targetX, groundY - targetY);
          if (groundDist < aoeRadius) {
            return { hit: true, dist: 0, directHit: false };
          }
        }
        break;
      }
      if (x < -1500 || x > GAME_CONSTANTS.CANVAS_WIDTH + 1500) break;
    }
    return { hit: false, dist: bestDist, directHit: false };
  };

  const evaluateShot = (power: number, worldAngle: number): SimResult => {
    if (!isMultiShot) return simulate(power, worldAngle);
    let best: SimResult = { hit: false, dist: Infinity, directHit: false };
    for (let i = 0; i < 3; i++) {
      const spreadAngle = worldAngle + (i - 1) * MULTI_SHOT_SPREAD;
      const result = simulate(power, spreadAngle);
      if (result.hit) return result;
      if (isBetterShot(result, best, preferDirect)) best = result;
    }
    return best;
  };

  let bestPower = 20;
  let bestLocalAngle = Math.PI / 4;
  let bestResult: SimResult = { hit: false, dist: Infinity, directHit: false };

  const updateBest = (p: number, localA: number, result: SimResult) => {
    if (isBetterShot(result, bestResult, preferDirect)) {
      bestResult = result;
      bestPower = p;
      bestLocalAngle = localA;
    }
  };

  const localToWorld = (localA: number) =>
    dir > 0 ? -localA : Math.PI + localA;

  for (const p of COARSE_POWERS) {
    for (
      let degA = 8;
      degA <= 85;
      degA += config.coarseAngleStepDeg
    ) {
      const localA = (degA * Math.PI) / 180;
      const result = evaluateShot(p, localToWorld(localA));
      updateBest(p, localA, result);
      if (bestResult.hit) break;
    }
    if (bestResult.hit) break;
  }

  if (config.enableRefinement && !bestResult.hit) {
    const angleStart = Math.max(0.05, bestLocalAngle - 0.15);
    const angleEnd = Math.min(Math.PI / 2 - 0.05, bestLocalAngle + 0.15);
    const refinedPowers = [
      Math.max(10, bestPower - 4),
      Math.max(10, bestPower - 2),
      bestPower - 1,
      bestPower,
      bestPower + 1,
      Math.min(GAME_CONSTANTS.MAX_POWER, bestPower + 2),
      Math.min(GAME_CONSTANTS.MAX_POWER, bestPower + 4),
    ];

    for (const p of refinedPowers) {
      for (let a = angleStart; a <= angleEnd; a += config.refineAngleStep) {
        const result = evaluateShot(p, localToWorld(a));
        updateBest(p, a, result);
        if (bestResult.hit) break;
      }
      if (bestResult.hit) break;
    }
  }

  if (config.enableExhaustive && !bestResult.hit) {
    outer: for (let p = 12; p <= GAME_CONSTANTS.MAX_POWER; p += 0.5) {
      for (let a = 0.08; a <= Math.PI / 2 - 0.05; a += 0.005) {
        const result = evaluateShot(p, localToWorld(a));
        updateBest(p, a, result);
        if (bestResult.hit) break outer;
      }
    }
  }

  let angleErrorDeg = config.angleErrorDeg;
  if (dist > config.longRangeDist && config.longRangeExtraAngleDeg > 0) {
    angleErrorDeg += config.longRangeExtraAngleDeg;
  }

  const angleNoise =
    randomRange(-angleErrorDeg, angleErrorDeg) * (Math.PI / 180);
  const powerNoise = 1 + randomRange(-config.powerErrorPct, config.powerErrorPct);

  const finalLocalAngle = bestLocalAngle + angleNoise;
  let power = bestPower * powerNoise;
  power = Math.max(10, Math.min(GAME_CONSTANTS.MAX_POWER, power));

  const angle = dir > 0 ? -finalLocalAngle : Math.PI + finalLocalAngle;

  return { power, angle };
};
