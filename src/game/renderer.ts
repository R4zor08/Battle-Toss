import { GameEngineState, Vector2D } from '../types/game';
import { GAME_CONSTANTS } from './constants';
import { CHARACTERS, WEAPONS, MAPS } from './data';
import { loadAvatar, loadImage } from '../utils/avatars';

export const renderGame = (
ctx: CanvasRenderingContext2D,
state: GameEngineState,
width: number,
height: number) =>
{
  // Clear
  ctx.clearRect(0, 0, width, height);

  // Save context for camera
  ctx.save();

  // Apply camera shake
  let shakeX = 0;
  let shakeY = 0;
  if (state.camera.shake > 0) {
    shakeX = (Math.random() - 0.5) * state.camera.shake;
    shakeY = (Math.random() - 0.5) * state.camera.shake;
  }

  // Center camera on target, clamp to bounds
  const scale = width / GAME_CONSTANTS.CANVAS_WIDTH;
  ctx.scale(scale, scale);

  // Apply dynamic zoom around the canvas center
  const zoom = state.camera.zoom || 1;
  const cx = GAME_CONSTANTS.CANVAS_WIDTH / 2;
  const cy = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-cx, -cy);

  const camX = state.camera.offset.x;
  ctx.translate(-camX + shakeX, -state.camera.offset.y + shakeY);

  // Draw Background
  drawBackground(ctx, state);

  // Draw Ground
  drawGround(ctx, state);

  // Draw Players
  state.players.forEach((player) => drawPlayer(ctx, player, state));

  // Draw Trajectory if aiming
  if (
  state.phase === 'aiming' &&
  state.aimDragStart &&
  state.aimDragCurrent &&
  !state.players[state.currentTurnIndex].isAI)
  {
    drawTrajectory(ctx, state);
  }

  // Draw Projectiles
  state.projectiles.forEach((proj) => {
    if (proj.active) drawProjectile(ctx, proj);
  });

  // Draw Particles
  state.particles.forEach((p) => drawParticle(ctx, p));

  // Draw Floating Texts
  state.floatingTexts.forEach((ft) => drawFloatingText(ctx, ft));

  ctx.restore();
};

const drawBackground = (
ctx: CanvasRenderingContext2D,
state: GameEngineState) =>
{
  const mapDef = MAPS[state.mapId];
  if (!mapDef) return;

  // If a background image is provided, stretch it across the full play area
  // (sky + ground) and skip the decorative procedural draws.
  if (mapDef.backgroundImageUrl) {
    const img = loadImage(mapDef.backgroundImageUrl);
    if (img.complete && img.naturalWidth > 0) {
      const tileW = GAME_CONSTANTS.CANVAS_WIDTH;
      const tileH = GAME_CONSTANTS.CANVAS_HEIGHT;
      const startX = -tileW * 3;
      const endX = GAME_CONSTANTS.CANVAS_WIDTH + tileW * 3;
      let tileIndex = 0;
      for (let x = startX; x < endX; x += tileW) {
        const flip = tileIndex % 2 === 1;
        if (flip) {
          ctx.save();
          ctx.translate(x + tileW, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, tileW, tileH);
          ctx.restore();
        } else {
          ctx.drawImage(img, x, 0, tileW, tileH);
        }
        tileIndex++;
      }
      return;
    }
    // Fallback while loading: solid sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, GAME_CONSTANTS.GROUND_Y);
    g.addColorStop(0, mapDef.skyColors[0]);
    g.addColorStop(1, mapDef.skyColors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(
      -2000,
      0,
      GAME_CONSTANTS.CANVAS_WIDTH + 4000,
      GAME_CONSTANTS.CANVAS_HEIGHT
    );
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONSTANTS.GROUND_Y);
  gradient.addColorStop(0, mapDef.skyColors[0]);
  gradient.addColorStop(1, mapDef.skyColors[1]);

  ctx.fillStyle = gradient;
  ctx.fillRect(
    -1000,
    -1000,
    GAME_CONSTANTS.CANVAS_WIDTH + 2000,
    GAME_CONSTANTS.CANVAS_HEIGHT + 1000
  );

  ctx.save();
  const time = Date.now() / 1000;

  if (state.mapId === 'forest') {
    // Distant mountains/trees
    ctx.fillStyle = '#4a7c59';
    ctx.beginPath();
    ctx.moveTo(-1000, GAME_CONSTANTS.GROUND_Y);
    for (let i = -1000; i < GAME_CONSTANTS.CANVAS_WIDTH + 1000; i += 100) {
      ctx.lineTo(i, GAME_CONSTANTS.GROUND_Y - 150 - Math.sin(i * 0.01) * 50);
    }
    ctx.lineTo(GAME_CONSTANTS.CANVAS_WIDTH + 1000, GAME_CONSTANTS.GROUND_Y);
    ctx.fill();

    // Midground trees
    ctx.fillStyle = '#2d5a27';
    for (let i = -5; i < 15; i++) {
      const x = i * 150 + Math.sin(i * 432) * 50;
      ctx.fillRect(x, GAME_CONSTANTS.GROUND_Y - 250, 20, 250); // Trunk
      ctx.beginPath();
      ctx.arc(x + 10, GAME_CONSTANTS.GROUND_Y - 250, 60, 0, Math.PI * 2);
      ctx.arc(x - 20, GAME_CONSTANTS.GROUND_Y - 200, 50, 0, Math.PI * 2);
      ctx.arc(x + 40, GAME_CONSTANTS.GROUND_Y - 220, 55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sun shafts
    ctx.fillStyle = 'rgba(255, 255, 200, 0.05)';
    ctx.beginPath();
    ctx.moveTo(200, -200);
    ctx.lineTo(600, GAME_CONSTANTS.GROUND_Y);
    ctx.lineTo(800, GAME_CONSTANTS.GROUND_Y);
    ctx.lineTo(300, -200);
    ctx.fill();
  } else if (state.mapId === 'volcano') {
    // Cave background
    ctx.fillStyle = '#2a0800';
    ctx.fillRect(
      -1000,
      -1000,
      GAME_CONSTANTS.CANVAS_WIDTH + 2000,
      GAME_CONSTANTS.CANVAS_HEIGHT + 1000
    );

    // Glowing core
    const coreGrad = ctx.createRadialGradient(
      GAME_CONSTANTS.CANVAS_WIDTH / 2,
      GAME_CONSTANTS.CANVAS_HEIGHT / 2,
      0,
      GAME_CONSTANTS.CANVAS_WIDTH / 2,
      GAME_CONSTANTS.CANVAS_HEIGHT / 2,
      400
    );
    coreGrad.addColorStop(0, 'rgba(255, 150, 0, 0.3)');
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.fillRect(
      -1000,
      -1000,
      GAME_CONSTANTS.CANVAS_WIDTH + 2000,
      GAME_CONSTANTS.CANVAS_HEIGHT + 1000
    );

    // Stalactites
    ctx.fillStyle = '#3a0f0f';
    for (let i = -10; i < 20; i++) {
      const x = i * 80 + Math.sin(i * 123) * 30;
      const h = 100 + Math.sin(i * 321) * 80;
      ctx.beginPath();
      ctx.moveTo(x - 20, -200);
      ctx.lineTo(x, -200 + h);
      ctx.lineTo(x + 20, -200);
      ctx.fill();
    }

    // Distant stalagmites
    ctx.fillStyle = '#4a1515';
    for (let i = -10; i < 20; i++) {
      const x = i * 90 + Math.sin(i * 555) * 40;
      const h = 80 + Math.sin(i * 777) * 60;
      ctx.beginPath();
      ctx.moveTo(x - 30, GAME_CONSTANTS.GROUND_Y);
      ctx.lineTo(x, GAME_CONSTANTS.GROUND_Y - h);
      ctx.lineTo(x + 30, GAME_CONSTANTS.GROUND_Y);
      ctx.fill();
    }
  } else if (state.mapId === 'cyber') {
    // Distant city
    ctx.fillStyle = '#0a0a1a';
    for (let i = -10; i < 30; i++) {
      const h = 100 + Math.sin(i * 123) * 150;
      ctx.fillRect(i * 60, GAME_CONSTANTS.GROUND_Y - h, 50, h);
    }

    // Midground buildings with neon
    for (let i = -5; i < 15; i++) {
      const x = i * 120;
      const h = 200 + Math.sin(i * 456) * 100;
      ctx.fillStyle = '#111122';
      ctx.fillRect(x, GAME_CONSTANTS.GROUND_Y - h, 80, h);

      // Windows / Neon
      ctx.fillStyle =
      i % 2 === 0 ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255, 0, 255, 0.5)';
      for (let j = 0; j < 5; j++) {
        if (Math.sin(i * j + time) > 0) {
          ctx.fillRect(
            x + 10,
            GAME_CONSTANTS.GROUND_Y - h + 20 + j * 30,
            20,
            10
          );
        }
      }
    }

    // Power lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-1000, 100);
    for (let i = -1000; i < GAME_CONSTANTS.CANVAS_WIDTH + 1000; i += 100) {
      ctx.lineTo(i, 100 + Math.sin(i * 0.01) * 20);
    }
    ctx.stroke();
  }
  ctx.restore();
};

const drawGround = (ctx: CanvasRenderingContext2D, state: GameEngineState) => {
  const mapDef = MAPS[state.mapId];
  if (!mapDef) return;

  // Background image already contains the ground — skip procedural drawing.
  if (mapDef.backgroundImageUrl) return;

  ctx.save();

  if (state.mapId === 'forest') {
    ctx.fillStyle = '#1e3f1a';
    ctx.beginPath();
    ctx.moveTo(-1000, GAME_CONSTANTS.GROUND_Y);
    for (let i = -1000; i < GAME_CONSTANTS.CANVAS_WIDTH + 1000; i += 50) {
      ctx.lineTo(i, GAME_CONSTANTS.GROUND_Y + Math.sin(i * 0.05) * 5);
    }
    ctx.lineTo(
      GAME_CONSTANTS.CANVAS_WIDTH + 2000,
      GAME_CONSTANTS.CANVAS_HEIGHT + 1000
    );
    ctx.lineTo(-1000, GAME_CONSTANTS.CANVAS_HEIGHT + 1000);
    ctx.fill();

    // Grass tufts
    ctx.fillStyle = '#2d5a27';
    for (let i = -20; i < 40; i++) {
      ctx.fillRect(i * 40, GAME_CONSTANTS.GROUND_Y - 5, 4, 10);
      ctx.fillRect(i * 40 + 5, GAME_CONSTANTS.GROUND_Y - 8, 4, 13);
    }
  } else if (state.mapId === 'volcano') {
    ctx.fillStyle = '#2a0800';
    ctx.fillRect(
      -1000,
      GAME_CONSTANTS.GROUND_Y,
      GAME_CONSTANTS.CANVAS_WIDTH + 2000,
      GAME_CONSTANTS.CANVAS_HEIGHT
    );

    // Lava cracks
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = -10; i < 20; i++) {
      ctx.beginPath();
      const startX = i * 120;
      ctx.moveTo(startX, GAME_CONSTANTS.GROUND_Y + 20);
      ctx.lineTo(startX + 30, GAME_CONSTANTS.GROUND_Y + 50);
      ctx.lineTo(startX - 10, GAME_CONSTANTS.GROUND_Y + 80);
      ctx.lineTo(startX + 40, GAME_CONSTANTS.GROUND_Y + 120);
      ctx.stroke();
    }
  } else if (state.mapId === 'cyber') {
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(
      -1000,
      GAME_CONSTANTS.GROUND_Y,
      GAME_CONSTANTS.CANVAS_WIDTH + 2000,
      GAME_CONSTANTS.CANVAS_HEIGHT
    );

    // Grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-1000, GAME_CONSTANTS.GROUND_Y);
    ctx.lineTo(GAME_CONSTANTS.CANVAS_WIDTH + 2000, GAME_CONSTANTS.GROUND_Y);
    for (let i = -20; i < 40; i++) {
      ctx.moveTo(i * 50, GAME_CONSTANTS.GROUND_Y);
      ctx.lineTo(i * 100 - 500, GAME_CONSTANTS.CANVAS_HEIGHT + 200);
    }
    for (let i = 1; i < 10; i++) {
      ctx.moveTo(-1000, GAME_CONSTANTS.GROUND_Y + i * i * 5);
      ctx.lineTo(
        GAME_CONSTANTS.CANVAS_WIDTH + 2000,
        GAME_CONSTANTS.GROUND_Y + i * i * 5
      );
    }
    ctx.stroke();
  }

  ctx.restore();
};

const drawPlayer = (
ctx: CanvasRenderingContext2D,
player: any,
state: GameEngineState) =>
{
  const charDef = CHARACTERS[player.characterId];
  if (!charDef) return;

  ctx.save();
  ctx.translate(player.position.x, player.position.y);
  ctx.scale(player.facing, 1);

  // Bobbing animation if alive
  let bobY = 0;
  if (player.hp > 0) {
    bobY = Math.sin(Date.now() / 200 + (player.id === 'p1' ? 0 : Math.PI)) * 2;
  }

  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, GAME_CONSTANTS.PLAYER_HEIGHT / 2, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (player.hp <= 0) {
    // Dead state (fallen over)
    ctx.rotate(Math.PI / 2);
    ctx.translate(
      GAME_CONSTANTS.PLAYER_HEIGHT / 2,
      -GAME_CONSTANTS.PLAYER_WIDTH / 2
    );
  } else {
    ctx.translate(0, bobY);
  }

  // If avatar image is available, draw it instead of the canvas humanoid
  if (charDef.avatarUrl) {
    // Show damaged sprite for the rest of the match once any damage is taken.
    // Damaged sprite during hitstun window only — reverts once hitFrames hits 0.
    const showDamaged =
    !!charDef.damagedAvatarUrl && player.characterState === 'hit';
    const activeUrl = showDamaged ?
    charDef.damagedAvatarUrl! :
    charDef.avatarUrl;
    const entry = loadAvatar(activeUrl);
    if (entry.canvas) {
      // Preserve source aspect ratio so characters never look stretched
      const targetHeight = GAME_CONSTANTS.PLAYER_HEIGHT * 1.6;
      const aspect = entry.canvas.width / entry.canvas.height;
      const targetWidth = targetHeight * aspect;
      const offsetY = GAME_CONSTANTS.PLAYER_HEIGHT / 2 - targetHeight + 5;

      ctx.save();
      ctx.drawImage(
        entry.canvas,
        -targetWidth / 2,
        offsetY,
        targetWidth,
        targetHeight
      );
      ctx.restore();
      ctx.restore();
      return;
    }
  }

  // Hit flash
  const isHit =
  state.hitStopFrames > 0 &&
  state.currentTurnIndex !== (player.id === 'p1' ? 0 : 1);

  // Body
  ctx.fillStyle = isHit ? '#ffffff' : charDef.color;
  ctx.beginPath();
  ctx.roundRect(
    -GAME_CONSTANTS.PLAYER_WIDTH / 2,
    -GAME_CONSTANTS.PLAYER_HEIGHT / 2,
    GAME_CONSTANTS.PLAYER_WIDTH,
    GAME_CONSTANTS.PLAYER_HEIGHT,
    10
  );
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(5, -15, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(8, -15, 3, 0, Math.PI * 2);
  ctx.fill();

  // Shield effect
  if (player.statusEffects.find((e: any) => e.type === 'shield')) {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, GAME_CONSTANTS.PLAYER_HEIGHT * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Poison effect
  if (player.statusEffects.find((e: any) => e.type === 'poison')) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(0, -GAME_CONSTANTS.PLAYER_HEIGHT / 2 - 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const drawTrajectory = (
ctx: CanvasRenderingContext2D,
state: GameEngineState) =>
{
  if (!state.aimDragStart || !state.aimDragCurrent) return;

  const dx = state.aimDragStart.x - state.aimDragCurrent.x;
  const dy = state.aimDragStart.y - state.aimDragCurrent.y;

  const dist = Math.sqrt(dx * dx + dy * dy);
  const power = Math.min(
    dist * GAME_CONSTANTS.DRAG_SCALE,
    GAME_CONSTANTS.MAX_POWER
  );
  const angle = Math.atan2(dy, dx);

  const currentPlayer = state.players[state.currentTurnIndex];
  const charDef = CHARACTERS[currentPlayer.characterId];
  const weaponDef = WEAPONS[charDef.weaponId];

  const startX = currentPlayer.position.x + currentPlayer.facing * 30;
  const startY = currentPlayer.position.y - 10;

  const vx = Math.cos(angle) * power * weaponDef.speedMultiplier;
  const vy = Math.sin(angle) * power * weaponDef.speedMultiplier;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.setLineDash([5, 10]);
  ctx.lineWidth = 2;

  let simX = startX;
  let simY = startY;
  let simVy = vy;
  let simVx = vx;

  ctx.moveTo(simX, simY);

  const noGravity = currentPlayer.activePowerUp === 'ninja_straight';

  for (let i = 0; i < GAME_CONSTANTS.TRAJECTORY_DOTS; i++) {
    simX += simVx * GAME_CONSTANTS.TRAJECTORY_STEP;
    simY += simVy * GAME_CONSTANTS.TRAJECTORY_STEP;
    simVx += state.wind * GAME_CONSTANTS.WIND_ACCEL * GAME_CONSTANTS.TRAJECTORY_STEP;
    if (!noGravity) {
      simVy +=
      GAME_CONSTANTS.GRAVITY *
      weaponDef.gravityScale *
      GAME_CONSTANTS.TRAJECTORY_STEP;
    }

    if (simY > GAME_CONSTANTS.GROUND_Y) break;

    ctx.lineTo(simX, simY);
  }

  ctx.stroke();
  ctx.setLineDash([]);
};

const drawProjectile = (ctx: CanvasRenderingContext2D, proj: any) => {
  const weaponDef = WEAPONS[proj.weaponId];
  if (!weaponDef) return;

  // Draw Trail
  if (proj.trail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(proj.trail[0].x, proj.trail[0].y);
    for (let i = 1; i < proj.trail.length; i++) {
      ctx.lineTo(proj.trail[i].x, proj.trail[i].y);
    }
    ctx.strokeStyle = weaponDef.trailColor;
    ctx.lineWidth = proj.modifiers.explosive ? 8 : 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(proj.position.x, proj.position.y);
  ctx.rotate(proj.rotation);

  ctx.fillStyle = weaponDef.color;

  if (weaponDef.shape === 'shuriken') {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.moveTo(0, -15);
      ctx.lineTo(5, -5);
      ctx.lineTo(15, 0);
      ctx.lineTo(5, 5);
      ctx.rotate(Math.PI / 2);
    }
    ctx.fill();
    ctx.stroke();
  } else if (weaponDef.shape === 'axe') {
    ctx.fillRect(-5, -15, 10, 30);
    ctx.beginPath();
    ctx.arc(5, -10, 10, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
  } else if (weaponDef.shape === 'fireball') {
    ctx.beginPath();
    ctx.arc(0, 0, proj.modifiers.explosive ? 20 : 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(0, 0, proj.modifiers.explosive ? 10 : 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (weaponDef.shape === 'arrow') {
    ctx.fillRect(-15, -2, 30, 4);
    ctx.beginPath();
    ctx.moveTo(15, -6);
    ctx.lineTo(25, 0);
    ctx.lineTo(15, 6);
    ctx.fill();
  }

  ctx.restore();
};

const drawParticle = (ctx: CanvasRenderingContext2D, p: any) => {
  const alpha = 1 - p.life / p.maxLife;
  ctx.fillStyle = p.color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

export const drawCharacterPortrait = (
ctx: CanvasRenderingContext2D,
charId: string,
width: number,
height: number) =>
{
  const charDef = CHARACTERS[charId];
  if (!charDef) return;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(1.2, 1.2); // Make it bigger for portrait

  // Draw Humanoid Character (simplified for portrait, no weapon)
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';

  // Torso
  ctx.fillStyle = charDef.color;
  ctx.beginPath();
  if (charId === 'mage' || charId === 'archer') {
    ctx.moveTo(-15, -15);
    ctx.lineTo(15, -15);
    ctx.lineTo(20, 20);
    ctx.lineTo(-20, 20);
    ctx.closePath();
  } else {
    ctx.roundRect(-15, -15, 30, 35, 8);
  }
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.fillStyle = '#ffccaa'; // Default skin
  if (charId === 'samurai' || charId === 'space') ctx.fillStyle = charDef.color;
  if (charId === 'ninja') ctx.fillStyle = '#ffccaa';
  if (charId === 'mage') ctx.fillStyle = '#000000';

  ctx.beginPath();
  ctx.arc(0, -25, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Character Specific Details
  if (charId === 'ninja') {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(0, -25, 14.5, Math.PI, Math.PI * 2);
    ctx.fill(); // Hood top
    ctx.fillRect(-14, -25, 28, 8); // Mask
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-14, -22, 28, 4); // Visor
  } else if (charId === 'viking') {
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI);
    ctx.fill(); // Beard
    ctx.fillStyle = '#aaaaaa';
    ctx.beginPath();
    ctx.arc(0, -28, 14, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke(); // Helmet
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-10, -30);
    ctx.lineTo(-20, -45);
    ctx.lineTo(-5, -35);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -30);
    ctx.lineTo(20, -45);
    ctx.lineTo(5, -35);
    ctx.fill();
    ctx.stroke();
  } else if (charId === 'mage') {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(-16, -15);
    ctx.lineTo(0, -45);
    ctx.lineTo(16, -15);
    ctx.fill();
    ctx.stroke(); // Hood
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(4, -25, 3, 0, Math.PI * 2);
    ctx.arc(-4, -25, 3, 0, Math.PI * 2);
    ctx.fill(); // Eyes
  } else if (charId === 'punk') {
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(-10, -35);
    ctx.lineTo(0, -55);
    ctx.lineTo(10, -35);
    ctx.fill();
    ctx.stroke(); // Mohawk
    ctx.fillStyle = '#333333';
    ctx.fillRect(-16, -15, 32, 15); // Jacket top
  } else if (charId === 'samurai') {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-12, -28, 24, 4); // Visor
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(0, -39);
    ctx.lineTo(-5, -45);
    ctx.lineTo(5, -45);
    ctx.fill();
    ctx.stroke(); // Crest
  } else if (charId === 'space') {
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(4, -25, 8, 0, Math.PI * 2);
    ctx.fill(); // Visor
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-2, -15, 4, 35); // Chest line
  } else if (charId === 'tribal') {
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-12, -35, 24, 20); // Mask
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -30, 4, 4);
    ctx.fillRect(6, -30, 4, 4); // Eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-15, -10, 30, 4);
    ctx.fillRect(-15, -2, 30, 4); // Chest paint
  } else if (charId === 'archer') {
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.moveTo(-16, -15);
    ctx.lineTo(0, -40);
    ctx.lineTo(16, -15);
    ctx.fill();
    ctx.stroke(); // Hood
    ctx.fillStyle = '#ffccaa';
    ctx.beginPath();
    ctx.moveTo(10, -25);
    ctx.lineTo(20, -30);
    ctx.lineTo(10, -20);
    ctx.fill();
    ctx.stroke(); // Ear
  }

  ctx.restore();
};

export const drawMapPreview = (
ctx: CanvasRenderingContext2D,
mapId: string,
width: number,
height: number) =>
{
  const mapDef = MAPS[mapId];
  if (!mapDef) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, mapDef.skyColors[0]);
  gradient.addColorStop(1, mapDef.skyColors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = mapDef.groundColor;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);
};

const drawFloatingText = (ctx: CanvasRenderingContext2D, ft: any) => {
  const alpha = 1 - ft.life / ft.maxLife;
  ctx.fillStyle = ft.color;
  ctx.globalAlpha = alpha;
  ctx.font = `bold ${ft.size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText(ft.text, ft.position.x, ft.position.y);
  ctx.fillText(ft.text, ft.position.x, ft.position.y);
  ctx.globalAlpha = 1;
};