// Avatar loader with background chroma-key removal.
// Source images have a light gray/white studio background; this strips it so
// only the character silhouette remains.

type AvatarEntry = {
  canvas: HTMLCanvasElement | null;
  dataUrl: string | null;
  loading: boolean;
};

const cache = new Map<string, AvatarEntry>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((fn) => fn());

const processImage = (img: HTMLImageElement): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.drawImage(img, 0, 0);
  try {
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    // If the source already has alpha transparency, render as-is to preserve
    // the exact source edges (no chroma-key artifacts on the silhouette).
    const totalPixels = px.length / 4 | 0;
    const sampleCount = Math.min(2000, totalPixels);
    const stride = Math.max(1, Math.floor(totalPixels / sampleCount));
    let transparent = 0;
    for (let s = 0; s < sampleCount; s++) {
      if (px[s * stride * 4 + 3] < 250) transparent++;
    }
    if (transparent > sampleCount * 0.05) {
      return c;
    }
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
      const lum = (r + g + b) / 3;
      if (lum > 180 && sat < 0.15) {
        if (lum > 215) {
          px[i + 3] = 0;
        } else {
          const t = (215 - lum) / 35;
          px[i + 3] = Math.round(t * 255);
        }
      }
    }
    ctx.putImageData(data, 0, 0);
  } catch {

    // CORS may block readback; just keep original
  }return c;
};

// Plain image loader (no chroma key) for backgrounds, etc.
const rawCache = new Map<string, HTMLImageElement>();
export const loadImage = (url: string): HTMLImageElement => {
  const existing = rawCache.get(url);
  if (existing) return existing;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => notify();
  img.src = url;
  rawCache.set(url, img);
  return img;
};

export const loadAvatar = (url: string): AvatarEntry => {
  const existing = cache.get(url);
  if (existing) return existing;
  const entry: AvatarEntry = { canvas: null, dataUrl: null, loading: true };
  cache.set(url, entry);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const c = processImage(img);
    entry.canvas = c;
    try {
      entry.dataUrl = c.toDataURL('image/png');
    } catch {
      entry.dataUrl = url;
    }
    entry.loading = false;
    notify();
  };
  img.onerror = () => {
    entry.loading = false;
    notify();
  };
  img.src = url;
  return entry;
};

export const subscribeAvatars = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};