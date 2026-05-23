import { Vector2D } from '../types/game';

export const distance = (p1: Vector2D, p2: Vector2D): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

export const lerpVec = (v1: Vector2D, v2: Vector2D, t: number): Vector2D => {
  return {
    x: lerp(v1.x, v2.x, t),
    y: lerp(v1.y, v2.y, t)
  };
};

export const clamp = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, val));
};

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomRange(min, max + 1));
};

export const normalize = (v: Vector2D): Vector2D => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
};

export const checkCircleRectCollision = (
circlePos: Vector2D,
circleRadius: number,
rectPos: Vector2D,
rectSize: Vector2D)
: boolean => {
  const testX = clamp(
    circlePos.x,
    rectPos.x - rectSize.x / 2,
    rectPos.x + rectSize.x / 2
  );
  const testY = clamp(
    circlePos.y,
    rectPos.y - rectSize.y / 2,
    rectPos.y + rectSize.y / 2
  );

  const distX = circlePos.x - testX;
  const distY = circlePos.y - testY;
  const distSq = distX * distX + distY * distY;

  return distSq <= circleRadius * circleRadius;
};