/**
 * Full-screen anime effects shared by cutscenes and gameplay:
 *  - impact frames: the high-contrast inverted flashes used at the moment of a huge hit
 *  - zoom punches: a quick push-in on a point that snaps back
 */

let scratch: HTMLCanvasElement | null = null;

function scratchCanvas(w: number, h: number): HTMLCanvasElement {
  if (!scratch || scratch.width !== w || scratch.height !== h) {
    scratch = document.createElement('canvas');
    scratch.width = w;
    scratch.height = h;
  }
  return scratch;
}

export type ImpactStyle = 'dark' | 'light' | 'red' | 'cyan';

const TINTS: Record<ImpactStyle, [[number, number, number], [number, number, number]]> = {
  // [ink, paper]
  dark: [
    [255, 255, 255],
    [12, 10, 18],
  ],
  light: [
    [12, 10, 18],
    [255, 255, 255],
  ],
  red: [
    [24, 4, 12],
    [255, 70, 90],
  ],
  cyan: [
    [8, 20, 40],
    [140, 245, 255],
  ],
};

/**
 * Turn the current frame into a two-tone manga impact frame. Bright areas become
 * ink and dark areas paper (an inversion), which reads as a blinding hit.
 */
export function applyImpactFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: ImpactStyle = 'dark',
): void {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  // at full resolution, work on a game-resolution copy (same look, same cost)
  const full = cw !== w;
  const target = full ? impactCanvas(w, h) : ctx;
  if (full) {
    target.imageSmoothingEnabled = false;
    target.drawImage(ctx.canvas, 0, 0, cw, ch, 0, 0, w, h);
  }
  const img = target.getImageData(0, 0, w, h);
  const d = img.data;
  const [ink, paper] = TINTS[style];
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    const c = lum > 96 ? ink : paper;
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
  }
  target.putImageData(img, 0, 0);
  if (full) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(target.canvas, 0, 0, w, h, 0, 0, cw, ch);
    ctx.restore();
  }
}

let impact: HTMLCanvasElement | null = null;
function impactCanvas(w: number, h: number): CanvasRenderingContext2D {
  if (!impact || impact.width !== w || impact.height !== h) {
    impact = document.createElement('canvas');
    impact.width = w;
    impact.height = h;
  }
  return impact.getContext('2d', { willReadFrequently: true })!;
}

/** Style that alternates every couple of frames for a strobing impact. */
export function impactStyleAt(t: number, colored: ImpactStyle = 'red'): ImpactStyle {
  const k = Math.floor(t * 24) % 3;
  return k === 0 ? 'dark' : k === 1 ? 'light' : colored;
}

/**
 * Re-draw the current frame magnified around (cx, cy). `scale` of 1 is a no-op.
 * Nearest-neighbour keeps the pixel look.
 */
export function zoomPunch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number,
  scale: number,
): void {
  if (scale <= 1.001) return;
  // work in canvas pixels (the canvas may be at full resolution: r canvas pixels per game pixel)
  const r = ctx.canvas.width / w;
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const c = scratchCanvas(cw, ch);
  const sc = c.getContext('2d')!;
  sc.imageSmoothingEnabled = false;
  sc.clearRect(0, 0, cw, ch);
  sc.drawImage(ctx.canvas, 0, 0, cw, ch, 0, 0, cw, ch);
  const sw = w / scale;
  const sh = h / scale;
  const sx = Math.max(0, Math.min(w - sw, cx - sw / 2));
  const sy = Math.max(0, Math.min(h - sh, cy - sh / 2));
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(c, sx * r, sy * r, sw * r, sh * r, 0, 0, cw, ch);
  ctx.restore();
}
