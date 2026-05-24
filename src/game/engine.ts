import {
  GameEngineState,
  Player,
  Vector2D } from
'../types/game';
import { GAME_CONSTANTS } from './constants';
import { CHARACTERS, WEAPONS, POWER_UPS } from './data';
import {
  distance,
  randomRange,
  checkCircleRectCollision,
  lerp } from
'../utils/math';
import { playSfx } from '../audio/soundManager';

export const createInitialGameState = (
p1CharId: string,
p2CharId: string,
isP2AI: boolean,
mapId: string)
: GameEngineState => {
  return {
    players: [
    {
      id: 'p1',
      characterId: p1CharId,
      hp: GAME_CONSTANTS.MAX_HP,
      maxHp: GAME_CONSTANTS.MAX_HP,
      powerPoints: 1,
      isAI: false,
      position: {
        x: 200,
        y: GAME_CONSTANTS.GROUND_Y - GAME_CONSTANTS.PLAYER_HEIGHT / 2
      },
      facing: 1,
      activePowerUp: null,
      statusEffects: []
    },
    {
      id: 'p2',
      characterId: p2CharId,
      hp: GAME_CONSTANTS.MAX_HP,
      maxHp: GAME_CONSTANTS.MAX_HP,
      powerPoints: 1,
      isAI: isP2AI,
      position: {
        x: GAME_CONSTANTS.CANVAS_WIDTH - 200,
        y: GAME_CONSTANTS.GROUND_Y - GAME_CONSTANTS.PLAYER_HEIGHT / 2
      },
      facing: -1,
      activePowerUp: null,
      statusEffects: []
    }],

    currentTurnIndex: 0,
    projectiles: [],
    particles: [],
    floatingTexts: [],
    mapId,
    wind: randomRange(GAME_CONSTANTS.WIND_MIN, GAME_CONSTANTS.WIND_MAX),
    camera: {
      offset: { x: 0, y: 0 },
      shake: 0,
      zoom: 1,
      targetZoom: 1,
      targetOffset: { x: 0, y: 0 }
    },
    hitStopFrames: 0,
    phase: 'aiming',
    aimDragStart: null,
    aimDragCurrent: null,
    winnerId: null,
    turnCount: 0
  };
};

export const createExplosion = (
state: GameEngineState,
pos: Vector2D,
color: string,
count: number = 20) =>
{
  for (let i = 0; i < count; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(2, 10);
    state.particles.push({
      position: { x: pos.x, y: pos.y },
      velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      life: 0,
      maxLife: randomRange(20, 40),
      color,
      size: randomRange(2, 6)
    });
  }
};

export const addFloatingText = (
state: GameEngineState,
text: string,
pos: Vector2D,
color: string,
size: number = 24) =>
{
  state.floatingTexts.push({
    id: Math.random().toString(),
    text,
    position: { x: pos.x, y: pos.y },
    life: 0,
    maxLife: 60,
    color,
    size
  });
};

const applyHeal = (
  state: GameEngineState,
  player: Player,
  amount: number
) => {
  const before = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + amount);
  const healed = player.hp - before;
  if (healed > 0) {
    playSfx('heal');
    addFloatingText(
      state,
      `+${healed}`,
      { x: player.position.x, y: player.position.y - 40 },
      '#00ff88',
      22
    );
    createExplosion(state, player.position, '#00ff88', 15);
  }
};

export const isTechniqueShot = (powerUpId: string | null): boolean =>
  powerUpId === 'space_phase' || powerUpId === 'space_orbital';

export const activatePowerUpForPlayer = (
  state: GameEngineState,
  player: Player,
  powerUpId: string
): boolean => {
  const pu = POWER_UPS[powerUpId];
  if (!pu || player.powerPoints < pu.cost || player.activePowerUp) return false;
  if (player.statusEffects.some((e) => e.type === 'emp')) return false;

  player.powerPoints -= pu.cost;

  if (powerUpId === 'space_heal') {
    applyHeal(state, player, 15);
    return true;
  }

  player.activePowerUp = powerUpId;
  playSfx('powerUp');
  return true;
};

const executeTechniqueShot = (
  state: GameEngineState,
  powerUp: string
) => {
  const currentPlayer = state.players[state.currentTurnIndex];
  const enemy = state.players.find((p) => p.id !== currentPlayer.id);
  if (!enemy) return;

  playSfx('technique');

  if (powerUp === 'space_phase') {
    const approachDir =
      Math.sign(enemy.position.x - currentPlayer.position.x) || 1;
    currentPlayer.position.x = Math.max(
      80,
      Math.min(
        GAME_CONSTANTS.CANVAS_WIDTH - 80,
        enemy.position.x - approachDir * 55
      )
    );
    currentPlayer.facing = approachDir as 1 | -1;
    const dmg = Math.floor(randomRange(14, 20));
    applyDamage(state, enemy, dmg, currentPlayer.id);
    addFloatingText(
      state,
      'PHASE SHIFT',
      { x: enemy.position.x, y: enemy.position.y - 50 },
      '#a78bfa',
      22
    );
    createExplosion(state, enemy.position, '#a78bfa', 30);
    state.camera.shake = 15;
  }

  if (powerUp === 'space_orbital') {
    addFloatingText(
      state,
      'ORBITAL STRIKE',
      { x: enemy.position.x, y: enemy.position.y - 70 },
      '#22d3ee',
      24
    );
    for (let i = 0; i < 3; i++) {
      const offsetX = (i - 1) * 45;
      const strikePos = {
        x: enemy.position.x + offsetX,
        y: enemy.position.y - 100
      };
      createExplosion(state, strikePos, '#22d3ee', 20);
      applyDamage(
        state,
        enemy,
        Math.floor(randomRange(8, 12)),
        currentPlayer.id
      );
    }
    state.camera.shake = 25;
  }

  currentPlayer.activePowerUp = null;
  state.phase = 'firing';
  state.aimDragStart = null;
  state.aimDragCurrent = null;
};

export const fireProjectile = (
state: GameEngineState,
power: number,
angle: number) =>
{
  const currentPlayer = state.players[state.currentTurnIndex];
  const charDef = CHARACTERS[currentPlayer.characterId];
  const weaponDef = WEAPONS[charDef.weaponId];

  const powerUp = currentPlayer.activePowerUp;

  if (powerUp === 'space_phase' || powerUp === 'space_orbital') {
    executeTechniqueShot(state, powerUp);
    return;
  }

  let count = 1;
  let spread = 0;

  if (powerUp === 'ninja_split' || powerUp === 'punk_triple') {
    count = 3;
    spread = 0.15;
  }

  playSfx('throw');

  for (let i = 0; i < count; i++) {
    const currentAngle = angle + (i - Math.floor(count / 2)) * spread;
    const vx = Math.cos(currentAngle) * power * weaponDef.speedMultiplier;
    const vy = Math.sin(currentAngle) * power * weaponDef.speedMultiplier;

    state.projectiles.push({
      id: Math.random().toString(),
      ownerId: currentPlayer.id,
      weaponId: weaponDef.id,
      position: {
        x: currentPlayer.position.x + currentPlayer.facing * 30,
        y: currentPlayer.position.y - 10
      },
      velocity: { x: vx, y: vy },
      rotation: 0,
      active: true,
      trail: [],
      modifiers: {
        damageMultiplier: powerUp === 'viking_berserk' ? 1.5 : 1,
        piercing: powerUp === 'viking_pierce',
        explosive: powerUp === 'mage_meteor' || powerUp === 'viking_quake',
        poison: powerUp === 'ninja_poison',
        noGravity: powerUp === 'ninja_straight',
        chain: powerUp === 'punk_chain'
      }
    });
  }

  currentPlayer.activePowerUp = null;
  state.phase = 'firing';
  state.aimDragStart = null;
  state.aimDragCurrent = null;
};

export const updateEngine = (state: GameEngineState) => {
  // --- HIT-state machine tick (runs EVERY frame, even during hit-stop) ---
  const dt = 1 / 60;
  for (const p of state.players) {
    if (p.characterState === 'hit') {
      p.hitstunTimer = (p.hitstunTimer ?? 0) - dt;
      if (p.hitstunTimer <= 0) {
        p.characterState = 'idle';
        p.hitstunTimer = 0;
        p.hitFrames = 0;
      }
    }
    if (p.hitFrames && p.hitFrames > 0) p.hitFrames--;
  }

  if (state.hitStopFrames > 0) {
    state.hitStopFrames--;
    return;
  }

  // Update Camera Shake
  if (state.camera.shake > 0) {
    state.camera.shake *= 0.9;
    if (state.camera.shake < 0.5) state.camera.shake = 0;
  }

  // Update Particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life++;
    p.position.x += p.velocity.x;
    p.position.y += p.velocity.y;
    p.velocity.y += GAME_CONSTANTS.GRAVITY * 0.5; // Particles have less gravity
    if (p.life >= p.maxLife) {
      state.particles.splice(i, 1);
    }
  }

  // Update Floating Texts
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.life++;
    ft.position.y -= 1; // Float up
    if (ft.life >= ft.maxLife) {
      state.floatingTexts.splice(i, 1);
    }
  }

  // Update Projectiles
  let anyActiveProjectiles = false;

  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    if (!proj.active) continue;

    anyActiveProjectiles = true;
    const weaponDef = WEAPONS[proj.weaponId];

    // Physics
    proj.position.x += proj.velocity.x;
    proj.position.y += proj.velocity.y;

    if (!proj.modifiers.noGravity) {
      proj.velocity.y += GAME_CONSTANTS.GRAVITY * weaponDef.gravityScale;
    }

    proj.velocity.x += state.wind * GAME_CONSTANTS.WIND_ACCEL;

    proj.rotation += weaponDef.spinSpeed * (proj.velocity.x > 0 ? 1 : -1);

    // Trail
    proj.trail.push({ x: proj.position.x, y: proj.position.y });
    if (proj.trail.length > GAME_CONSTANTS.MAX_TRAIL_LENGTH) {
      proj.trail.shift();
    }

    // Camera follow projectile
    state.camera.targetOffset.x =
    proj.position.x - GAME_CONSTANTS.CANVAS_WIDTH / 2;
    state.camera.targetOffset.y = Math.min(
      0,
      proj.position.y - GAME_CONSTANTS.CANVAS_HEIGHT / 2
    );

    // Collision with ground
    if (proj.position.y >= GAME_CONSTANTS.GROUND_Y) {
      proj.position.y = GAME_CONSTANTS.GROUND_Y;
      proj.active = false;
      createExplosion(state, proj.position, '#888888', 10);
      state.camera.shake = 5;

      if (proj.modifiers.explosive) {
        playSfx('explosion');
        createExplosion(state, proj.position, '#ff5500', 30);
        state.camera.shake = 15;
        // Apply AOE damage
        state.players.forEach((p) => {
          if (distance(p.position, proj.position) < 150) {
            applyDamage(state, p, 15, proj.ownerId);
          }
        });
      }
      continue;
    }

    // Out of bounds
    if (
    proj.position.x < -1000 ||
    proj.position.x > GAME_CONSTANTS.CANVAS_WIDTH + 1000 ||
    proj.position.y > GAME_CONSTANTS.CANVAS_HEIGHT + 500)
    {
      proj.active = false;
      continue;
    }

    // Collision with players
    for (const player of state.players) {
      if (player.id === proj.ownerId) continue; // Don't hit self

      const hit = checkCircleRectCollision(
        proj.position,
        GAME_CONSTANTS.PROJECTILE_RADIUS,
        player.position,
        { x: GAME_CONSTANTS.PLAYER_WIDTH, y: GAME_CONSTANTS.PLAYER_HEIGHT }
      );

      if (hit) {
        let damage = randomRange(
          weaponDef.baseDamage[0],
          weaponDef.baseDamage[1]
        );
        if (proj.modifiers.damageMultiplier)
        damage *= proj.modifiers.damageMultiplier;

        // Critical hit (top 20% of damage range)
        const isCrit =
        damage >
        weaponDef.baseDamage[1] -
        (weaponDef.baseDamage[1] - weaponDef.baseDamage[0]) * 0.2;
        if (isCrit) {
          damage *= 1.5;
          playSfx('crit');
          state.hitStopFrames = 5;
          state.camera.shake = 20;
          addFloatingText(
            state,
            'CRITICAL!',
            { x: player.position.x, y: player.position.y - 60 },
            '#ffcc00',
            30
          );
        } else {
          playSfx('hit');
          state.camera.shake = 10;
        }

        // Shield check
        const shieldEffect = player.statusEffects.find(
          (e) => e.type === 'shield'
        );
        if (shieldEffect) {
          damage *= 0.5;
          playSfx('shield');
          addFloatingText(
            state,
            'SHIELDED',
            { x: player.position.x, y: player.position.y - 40 },
            '#00ffff',
            20
          );
        }

        const finalDamage = Math.floor(damage);
        applyDamage(state, player, finalDamage, proj.ownerId);
        createExplosion(state, proj.position, weaponDef.color, 20);

        // Knockback — push hit player away from projectile direction
        const knockDir =
        Math.sign(proj.velocity.x) || (player.id === 'p1' ? -1 : 1);
        const knockAmount = Math.min(80, finalDamage * 2.5);
        player.position.x = Math.max(
          80,
          Math.min(
            GAME_CONSTANTS.CANVAS_WIDTH - 80,
            player.position.x + knockDir * knockAmount
          )
        );

        if (proj.modifiers.poison) {
          player.statusEffects.push({ type: 'poison', duration: 2, value: 5 });
        }

        if (proj.modifiers.explosive) {
          playSfx('explosion');
          createExplosion(state, proj.position, '#ff5500', 30);
          state.camera.shake = 15;
        }

        if (!proj.modifiers.piercing) {
          proj.active = false;
        }
      }
    }
  }

  // Dynamic camera zoom + pan based on distance between alive players
  const aliveForZoom = state.players.filter((p) => p.hp > 0);
  if (aliveForZoom.length === 2 && state.phase !== 'firing') {
    const dist = Math.abs(
      aliveForZoom[0].position.x - aliveForZoom[1].position.x
    );
    const baseDist = 700;
    if (dist > baseDist) {
      state.camera.targetZoom = Math.max(0.6, baseDist / dist);
    } else {
      state.camera.targetZoom = 1;
    }
    const midX = (aliveForZoom[0].position.x + aliveForZoom[1].position.x) / 2;
    state.camera.targetOffset.x = midX - GAME_CONSTANTS.CANVAS_WIDTH / 2;
  }

  // Phase transitions
  if (state.phase === 'firing' && !anyActiveProjectiles) {
    state.phase = 'resolving';

    // Check win condition
    const alivePlayers = state.players.filter((p) => p.hp > 0);
    if (alivePlayers.length <= 1) {
      state.winnerId = alivePlayers.length === 1 ? alivePlayers[0].id : 'draw';
    } else {
      setTimeout(() => {
        if (state.winnerId) return;
        endTurn(state);
      }, 1000);
    }
  }

  // Camera Lerp
  state.camera.offset.x = lerp(
    state.camera.offset.x,
    state.camera.targetOffset.x,
    GAME_CONSTANTS.CAMERA_LERP
  );
  state.camera.offset.y = lerp(
    state.camera.offset.y,
    state.camera.targetOffset.y,
    GAME_CONSTANTS.CAMERA_LERP
  );
  state.camera.zoom = lerp(
    state.camera.zoom,
    state.camera.targetZoom,
    GAME_CONSTANTS.CAMERA_LERP
  );
};

const applyDamage = (
state: GameEngineState,
player: Player,
amount: number,
_sourceId: string) =>
{
  player.hp = Math.max(0, player.hp - amount);

  // --- IDLE → HIT state transition (always resets on each new hit) ---
  player.characterState = 'hit';
  player.hitstunTimer = 0.4; // seconds — required hitstun duration
  player.hitFrames = 45; // legacy: kept in sync for any code still referencing it
  addFloatingText(
    state,
    `-${amount}`,
    { x: player.position.x, y: player.position.y - 30 },
    '#ff0000'
  );
  if (player.hp > 0) {
    player.powerPoints = Math.min(
      GAME_CONSTANTS.MAX_POWER_POINTS,
      player.powerPoints + 1
    );
  }
};

const endTurn = (state: GameEngineState) => {
  state.currentTurnIndex = (state.currentTurnIndex + 1) % state.players.length;
  state.phase = 'aiming';
  state.turnCount++;
  state.wind = randomRange(GAME_CONSTANTS.WIND_MIN, GAME_CONSTANTS.WIND_MAX);
  playSfx('turn');

  const currentPlayer = state.players[state.currentTurnIndex];

  for (let i = currentPlayer.statusEffects.length - 1; i >= 0; i--) {
    const effect = currentPlayer.statusEffects[i];
    if (effect.type === 'poison' && effect.value) {
      applyDamage(state, currentPlayer, effect.value, 'poison');
    }
    effect.duration--;
    if (effect.duration <= 0) {
      currentPlayer.statusEffects.splice(i, 1);
    }
  }

  if (state.turnCount % 2 === 0) {
    currentPlayer.powerPoints = Math.min(
      GAME_CONSTANTS.MAX_POWER_POINTS,
      currentPlayer.powerPoints + 1
    );
  }

  if (currentPlayer.hp <= 0) {
    state.winnerId =
    state.players.find((p) => p.id !== currentPlayer.id)?.id || 'draw';
  }
};