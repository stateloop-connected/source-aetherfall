/**
 * Cloth (mage) armor icons: hood, robe, hand wraps, slippers and sash. The
 * fabric colour follows the tier and the trim / runes carry the tier accent.
 */
import { PAL } from '../../palette';
import { Grid, mix, ramp, sphereLight } from '../env/raster';
import { accent, fabric, fabricTrim } from './armor-kit';
import { finish, S } from './equip';
import type { Material } from './materials';

/** A deep cowl with a shadowed face opening and a trimmed mantle. */
export function hoodCloth(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const F = fabric(tier);
  const T = fabricTrim(tier);
  g.poly(
    [
      [9.6, 0.6],
      [12.2, 2.6],
      [13.3, 6],
      [13.6, 10],
      [14.8, 13],
      [14.8, 15],
      [1.2, 15],
      [1.2, 13],
      [2.4, 10],
      [2.7, 6],
      [4.4, 2.8],
      [7, 1.1],
    ],
    (x, y, nx, ny) => ramp(F, sphereLight(nx * 0.9, ny * 0.8, 0.25) + 0.08, x, y, 0.3),
  );
  // fold running down from the tip
  g.line(9, 2, 5, 6, F[1]).set(10, 2, F[3]);
  // face opening: deep shadow, darkest under the brow
  const shadow = mix(F[0], PAL.black, 0.65);
  g.ellipse(8, 9.3, 4.4, 4.9, (_x, _y, nx, ny) => {
    const r = Math.hypot(nx, ny);
    if (r < 0.74) return ny < -0.1 ? PAL.black : shadow;
    return nx + ny < -0.3 ? T[2] : nx + ny > 0.6 ? T[0] : T[1];
  });
  if (m.glow) g.set(6, 9, m.glow).set(9, 9, m.glow);
  // mantle hem and clasp
  g.hline(2, 13, 14, T[0]).hline(2, 13, 13, F[1]);
  g.set(1, 14, T[0]).set(14, 14, T[0]);
  g.set(7, 14, m.gem).set(8, 14, m.gem).set(7, 13, m.gemHi).set(8, 13, T[2]);
  return finish(g, m);
}

/** A long robe with bell sleeves, a trimmed front panel and a rune at the waist. */
export function robeCloth(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const F = fabric(tier);
  const T = fabricTrim(tier);
  const shadeF = (dark: number) => (x: number, y: number, nx: number, ny: number) =>
    ramp(F, 0.72 - nx * 0.3 - ny * 0.12 - dark, x, y, 0.3);
  // bell sleeves behind the body
  g.poly(
    [
      [5, 1.6],
      [3, 3.2],
      [1.2, 10.6],
      [4.8, 10.6],
      [5.6, 6],
    ],
    shadeF(0.08),
  );
  g.poly(
    [
      [11, 1.6],
      [13, 3.2],
      [14.8, 10.6],
      [11.2, 10.6],
      [10.4, 6],
    ],
    shadeF(0.22),
  );
  // sleeve cuffs
  g.hline(1, 4, 10, T[1]).hline(12, 14, 10, T[0]);
  // body flaring to the hem
  g.poly(
    [
      [4.6, 1.2],
      [11.4, 1.2],
      [11.2, 7],
      [13.4, 15],
      [2.6, 15],
      [4.8, 7],
    ],
    shadeF(0),
  );
  // folds in the skirt
  g.line(5, 9, 4, 14, F[1]).line(11, 9, 12, 14, F[0]);
  // V neck with trim
  g.poly(
    [
      [6.2, 1.2],
      [9.8, 1.2],
      [8, 4.2],
    ],
    mix(F[0], PAL.black, 0.55),
  );
  g.set(5, 1, T[2])
    .set(6, 2, T[2])
    .set(7, 3, T[1])
    .set(8, 4, T[1])
    .set(9, 3, T[0])
    .set(10, 2, T[1])
    .set(10, 1, T[0]);
  // front panel down to the hem
  for (let y = 5; y <= 14; y++) {
    g.set(7, y, T[y < 10 ? 2 : 1]).set(8, y, T[y < 10 ? 1 : 0]);
  }
  // sash with a rune gem
  g.hline(5, 11, 7, T[0]).set(5, 7, T[1]);
  g.set(7, 7, m.gem).set(8, 7, m.gem).set(7, 6, m.gemHi);
  const a = accent(m);
  g.set(7, 11, a).set(8, 12, a).set(7, 13, a);
  // hem trim
  g.hline(3, 13, 14, T[0]);
  g.hline(3, 12, 14, T[1]);
  return finish(g, m);
}

/** Hands bound in cloth wraps (a rune on the back of the front hand) with loose ends trailing. */
export function wrapsCloth(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const F = fabric(tier);
  const T = fabricTrim(tier);
  const hand = (ox: number, oy: number, dark: number) => {
    const col = (x: number, y: number, lit: number) => {
      // diagonal wrap bands separated by thin shadowed seams
      const seam = (x - ox + (y - oy) * 2) % 3 === 0;
      return seam ? F[Math.max(0, 1 - dark)] : ramp(F, lit - dark * 0.3, x, y, 0.2);
    };
    // palm and back of the hand
    for (let y = oy + 3; y < oy + 10; y++)
      for (let x = ox; x < ox + 5; x++) g.set(x, y, col(x, y, 0.95 - (x - ox) * 0.1));
    // fingers
    for (let f = 0; f < 4; f++) {
      const top = oy + (f === 0 || f === 3 ? 1 : 0);
      const fx = ox + f + (f > 1 ? 1 : 0) - (f === 3 ? 1 : 0);
      for (let y = top; y < oy + 3; y++) g.set(fx, y, col(fx, y, 0.95 - f * 0.1));
    }
    // thumb
    const tx = dark ? ox + 5 : ox - 1;
    g.set(tx, oy + 4, col(tx, oy + 4, 0.6)).set(tx, oy + 5, col(tx, oy + 5, 0.5));
    // wrist tie
    g.hline(ox, ox + 4, oy + 10, T[1 - dark]).set(ox, oy + 10, T[2 - dark]);
  };
  hand(9, 0, 1);
  hand(3, 2, 0);
  // rune on the back of the front hand
  const a = accent(m);
  g.set(5, 6, a).set(4, 7, a).set(6, 7, a).set(5, 8, a).set(5, 7, F[0]);
  // loose ends trailing from the ties
  g.set(4, 13, F[2]).set(3, 14, F[2]).set(4, 14, F[1]).set(2, 15, F[1]);
  g.set(12, 11, F[1]).set(13, 12, F[1]).set(13, 13, F[0]).set(14, 14, F[0]);
  return finish(g, m);
}

/** Soft slippers with long toes that curl up and back to a pompom. */
export function slippersCloth(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const F = fabric(tier);
  const T = fabricTrim(tier);
  const rows = [
    '.........pp',
    '..........b',
    'tuuuuu...bc',
    'bkkkkkubbbc',
    'abbbbbbbbc.',
    'bbbbbbbbc..',
    'vvvvvvvv...',
  ];
  const slipper = (ox: number, oy: number, dark: number) => {
    const f = (i: number) => F[Math.max(0, i - dark)];
    g.stamp(
      rows,
      {
        a: f(3),
        b: f(2),
        c: f(1),
        k: mix(F[0], PAL.black, 0.55),
        t: T[Math.max(0, 2 - dark)],
        u: T[Math.max(0, 1 - dark)],
        v: dark ? F[0] : T[0],
        p: dark ? mix(accent(m), PAL.black, 0.3) : accent(m),
      },
      ox,
      oy,
    );
  };
  slipper(4, 2, 1);
  slipper(1, 8, 0);
  return finish(g, m);
}

/** A soft sash tied in a loop, knotted at the hip with its ends hanging to a tassel. */
export function sashCloth(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const F = fabric(tier);
  const T = fabricTrim(tier);
  // the loop, seen from slightly above: back half in shadow, front half lit
  g.ellipse(8, 6.5, 6.9, 4.4, (x, y, nx, ny) => {
    const r = Math.hypot(nx * 1.02, ny * 1.25);
    if (r < 0.72 && ny < 0.55) return undefined;
    if (ny < 0) return ramp(F, 0.35 - nx * 0.15, x, y, 0.25);
    const wr = (x * 2 + y) % 5 === 0 ? -0.18 : 0;
    return ramp(F, 0.85 - nx * 0.25 - ny * 0.2 + wr, x, y, 0.25);
  });
  // embroidered lower edge
  for (let x = 2; x <= 13; x++) {
    for (let y = 15; y > 0; y--)
      if (g.get(x, y)) {
        g.set(x, y, T[(x + 1) % 2]);
        break;
      }
  }
  // two ends hanging from the knot
  for (let y = 10; y <= 13; y++) {
    g.set(4 - (y > 11 ? 1 : 0), y, F[3]).set(5 - (y > 11 ? 1 : 0), y, F[2]);
    if (y < 13) g.set(6 + (y > 11 ? 1 : 0), y, F[2]).set(7 + (y > 11 ? 1 : 0), y, F[1]);
  }
  // knot with a clasp gem
  g.ellipse(5.5, 9.5, 2.1, 1.8, (x, y, nx, ny) => ramp(F, sphereLight(nx, ny, 0.3) + 0.15, x, y, 0.2));
  g.set(5, 9, m.gem).set(6, 9, m.gem).set(5, 8, m.gemHi);
  // tassel
  g.hline(2, 5, 14, T[2]).set(3, 13, T[1]).set(4, 13, T[1]).set(2, 15, T[1]).set(4, 15, T[0]);
  g.set(7, 13, T[1]).set(8, 14, T[0]);
  return finish(g, m);
}
