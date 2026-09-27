/**
 * Ranged weapon icons (bow, crossbow), tinted per tier material like the
 * swords: they point to the top-right, grip toward the bottom-left.
 */
import { PAL } from '../../palette';
import { Grid, mix, ramp, type Col } from '../env/raster';
import { finish, S } from './equip';
import type { Material } from './materials';

const R2 = Math.SQRT1_2;

/** Limb / prod ramp: wood for the first two tiers, the tier metal after that. */
function limbRamp(m: Material, tier: number): readonly Col[] {
  if (tier === 1) return [PAL.plum, PAL.darkBrown, PAL.brown, PAL.tan, PAL.sand];
  return m.metal;
}

/** Crossbow stock ramp (dark → light). */
function stockRamp(m: Material, tier: number): readonly Col[] {
  if (tier <= 1) return [PAL.plum, PAL.darkBrown, '#8f5a44', PAL.brown];
  if (tier === 2) return [PAL.navy, PAL.blue, PAL.sky, '#6fc3ec'];
  if (tier === 3) return [PAL.slate, PAL.gray, PAL.lightGray, PAL.white];
  return [mix(m.grip[0], PAL.black, 0.2), m.grip[0], m.grip[1], m.grip[2]];
}

function stringCol(m: Material, tier: number): Col {
  if (m.glow) return tier === 4 ? PAL.yellow : m.glow;
  return tier === 0 ? PAL.sand : PAL.lightGray;
}

interface Arc {
  /** chord centre */
  cx: number;
  cy: number;
  /** half chord length and bulge depth (toward the top-right) */
  hl: number;
  dp: number;
  /** extra forward flick of the tips */
  recurve: number;
}

const arcV = (a: Arc, s: number): number =>
  a.dp * (1 - s * s) + a.recurve * Math.max(0, Math.abs(s) - 0.7) * 4;

/** Pixel on the arc's centre line at chord parameter s (-1 top-left tip … 1 bottom-right tip). */
function arcAt(a: Arc, s: number, back = 0): [number, number] {
  const v = arcV(a, s) - back;
  return [Math.floor(a.cx + (s * a.hl + v) * R2), Math.floor(a.cy + (s * a.hl - v) * R2)];
}

/**
 * Rasterise a bow limb. `paint` gets the chord parameter s, the signed
 * offset from the centre line d (positive = outer/front side) and the half
 * thickness th.
 */
function drawArc(
  g: Grid,
  a: Arc,
  half: (s: number) => number,
  paint: (x: number, y: number, s: number, d: number, th: number) => Col | undefined,
): void {
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const rx = x + 0.5 - a.cx;
      const ry = y + 0.5 - a.cy;
      const s = ((rx + ry) * R2) / a.hl;
      if (Math.abs(s) > 1) continue;
      const d = (rx - ry) * R2 - arcV(a, s);
      const th = half(s);
      if (Math.abs(d) <= th) g.set(x, y, paint(x, y, s, d, th));
    }
}

/**
 * Bow: the limb arcs toward the top-right (the way the arrow flies) and the
 * string runs straight between the tips along the other diagonal.
 */
export function bow(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const L = limbRamp(m, tier);
  const G = m.grip;
  const T = m.trim;
  const a: Arc = { cx: 6.8, cy: 9.2, hl: 8.4, dp: 4.3, recurve: tier >= 2 ? 1 : 0 };
  drawArc(
    g,
    a,
    (s) => (Math.abs(s) < 0.16 ? 1.8 : 0.8 + 0.95 * (1 - Math.abs(s))),
    (x, y, s, d, th) => {
      const as = Math.abs(s);
      if (as < 0.16) return (x + y) % 2 ? G[1] : d > 0 ? G[2] : G[0];
      if (as < 0.26 && tier >= 1) return d > 0 ? T[2] : T[1];
      return ramp(L, 0.6 + (d / th) * 0.3 - s * 0.2, x, y, 0.25);
    },
  );
  const [ax, ay] = arcAt(a, -0.97);
  const [bx, by] = arcAt(a, 0.97);
  if (tier >= 1) g.set(ax, ay, T[2]).set(bx, by, T[1]);
  if (tier >= 2) {
    const [gx, gy] = arcAt(a, 0, -1.2);
    g.set(gx, gy, m.gem).set(gx - 1, gy, m.gemHi);
  }
  g.line(ax, ay + 1, bx - 1, by, stringCol(m, tier));
  return finish(g, m);
}

/**
 * Crossbow: a stock from the butt (bottom-left) to the front (top-right) with
 * a small bow (the prod) across it, the string drawn back and a bolt loaded.
 */
export function crossbow(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const P = limbRamp(m, tier);
  const W = stockRamp(m, tier);
  const T = m.trim;
  // stock: a 2px diagonal band with a broad shoulder butt
  for (let k = 0; k <= 9; k++) {
    const x = 2 + k;
    const y = 13 - k;
    g.set(x, y, ramp(W, 0.85 - k * 0.02, x, y, 0.2)).set(x + 1, y, ramp(W, 0.45 - k * 0.02, x, y, 0.2));
  }
  g.set(1, 13, W[2]).set(1, 14, W[1]).set(2, 14, W[1]).set(3, 14, W[0]).set(1, 12, W[3]);
  // trigger
  g.set(6, 11, T[1]);
  // prod across the front
  const a: Arc = { cx: 9.6, cy: 6.4, hl: 5.6, dp: 1.9, recurve: 0 };
  drawArc(
    g,
    a,
    (s) => 0.7 + 0.55 * (1 - Math.abs(s)),
    (x, y, s, d, th) => ramp(P, 0.62 + (d / th) * 0.3 - s * 0.25, x, y, 0.25),
  );
  // metal band where the prod meets the stock
  g.set(10, 5, T[2]).set(11, 5, T[1]);
  // string drawn back to the latch
  const sc = stringCol(m, tier);
  const [ax, ay] = arcAt(a, -1);
  const [bx, by] = arcAt(a, 1);
  g.line(ax, ay + 1, 8, 8, sc).line(bx - 1, by, 8, 8, sc);
  // loaded bolt: fletching at the latch, shaft down the groove, head past the prod
  g.set(8, 7, PAL.lightGray).set(9, 6, PAL.tan).set(10, 5, PAL.tan).set(11, 4, PAL.tan);
  g.set(12, 3, m.metal[3]).set(13, 2, PAL.white).set(12, 2, m.metal[2]).set(13, 3, m.metal[1]);
  if (tier === 2 || tier >= 4) g.set(3, 12, m.gem);
  return finish(g, m);
}
