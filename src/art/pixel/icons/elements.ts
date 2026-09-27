/**
 * Damage element glyphs (physical, fire, ice, lightning, poison). They show up
 * small in tooltips and the character sheet, so each is one bold shape with a
 * strong outline. Not tinted by tier.
 */
import { PAL } from '../../palette';
import { Grid, mix, ramp, sphereLight, type Col } from '../env/raster';

const S = 16;

function done(g: Grid, ink: Col): Grid {
  return g.outline((inner) => mix(ink, inner, 0.1));
}

/** Physical: a steel impact burst split by a bright slash. */
function physical(): Grid {
  const g = new Grid(S, S);
  const steel = [PAL.darkSlate, PAL.slate, PAL.gray, PAL.lightGray, PAL.white] as const;
  const pts: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 8;
    const r = i % 2 ? 3.6 : i % 4 === 0 ? 7.6 : 6.1;
    pts.push([8 + Math.cos(a) * r, 8 + Math.sin(a) * r]);
  }
  g.poly(pts, (x, y) => {
    const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 8) / 7;
    const lit = (8 - x + (8 - y)) * 0.03;
    return ramp(steel, 1.05 - d * 1.1 + lit, x, y, 0.3);
  });
  // a clean cut through the middle: a dark split with a bright edge beside it
  for (let k = -4; k <= 4; k++) {
    g.set(8 + k, 7 - k, PAL.darkSlate);
    if (Math.abs(k) < 4) g.set(7 + k, 7 - k, Math.abs(k) < 3 ? PAL.white : PAL.lightGray);
  }
  return done(g, PAL.black);
}

/** Fire: a tall flame with a white-hot core. */
function fire(): Grid {
  const g = new Grid(S, S);
  const F = [PAL.darkRed, PAL.red, PAL.orange, PAL.gold, PAL.yellow, '#fff6c8'] as const;
  const inFlame = (px: number, py: number): number => {
    // body: a teardrop with the tip leaning right, plus a smaller tongue on the left
    const t = (14.5 - py) / 13.5; // 0 base → 1 tip
    if (t < 0 || t > 1) return -1;
    const cx = 8 + Math.sin(t * 3.4) * 1.4 * t;
    const w = 5.2 * Math.pow(1 - t, 0.75) * (t < 0.2 ? 0.7 + t * 1.5 : 1);
    const d = Math.abs(px - cx) / Math.max(w, 0.5);
    const tongue = Math.hypot((px - 4.3) / 1.6, (py - 8.2 - Math.max(0, px - 4.3) * 0.5) / 3.2);
    if (d <= 1) return (1 - d) * 0.8 + (1 - t) * 0.55 - 0.25;
    if (tongue <= 1 && py > 5) return 0.15 + (1 - tongue) * 0.2;
    return -1;
  };
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const h = inFlame(x + 0.5, y + 0.5);
      if (h >= 0) g.set(x, y, ramp(F, h, x, y, 0.35));
    }
  g.set(8, 11, '#ffffff').set(7, 11, F[5]).set(8, 10, F[5]);
  return done(g, '#2a0f14');
}

/** Ice: a bold six-armed snowflake with a white core. */
function ice(): Grid {
  const g = new Grid(S, S);
  const C = [PAL.blue, PAL.sky, PAL.cyan, '#c9fbff', PAL.white] as const;
  const arm = (ang: number) => {
    const ex = 8 + Math.cos(ang) * 6.6;
    const ey = 8 + Math.sin(ang) * 6.6;
    g.line(7.5, 7.5, ex - 0.5, ey - 0.5, (_x, _y, t) => (t > 0.7 ? C[2] : C[3]));
    // branch ticks
    for (const s of [-1, 1]) {
      const b = ang + s * 0.95;
      const bx = 8 + Math.cos(ang) * 4.2;
      const by = 8 + Math.sin(ang) * 4.2;
      g.line(bx - 0.5, by - 0.5, bx - 0.5 + Math.cos(b) * 1.8, by - 0.5 + Math.sin(b) * 1.8, C[2]);
    }
  };
  for (let i = 0; i < 6; i++) arm(-Math.PI / 2 + (i * Math.PI) / 3);
  g.ellipse(8, 8, 2.2, 2.2, (x, y, nx, ny) => ramp(C, sphereLight(nx, ny, 0.4) + 0.2, x, y, 0.2));
  g.set(7, 7, PAL.white);
  return done(g, '#0b1f3a');
}

/** Lightning: a bold zigzag bolt. */
function lightning(): Grid {
  const g = new Grid(S, S);
  const Y = [PAL.rust, PAL.gold, PAL.yellow, '#fff3b0', PAL.white] as const;
  g.poly(
    [
      [9.6, 0.6],
      [3.2, 8.6],
      [7.4, 8.6],
      [4.6, 15.4],
      [12.8, 6.4],
      [8.6, 6.4],
      [12.4, 0.6],
    ],
    (x, y, nx, ny) => ramp(Y, 0.6 - nx * 0.3 - ny * 0.1, x, y, 0.3),
  );
  // bright core
  g.line(10, 2, 6, 7, Y[3]).line(8, 9, 6, 13, Y[3]).set(9, 3, Y[4]);
  return done(g, '#2a1a10');
}

/** Poison: a green droplet with a little skull, bubbles rising off it. */
function poison(): Grid {
  const g = new Grid(S, S);
  const G = [PAL.forest, PAL.darkGreen, PAL.green, '#9cd455', '#d8f7a4'] as const;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const inDrop =
        Math.hypot(px - 7.5, py - 10) < 4.9 ||
        (py > 1.5 && py < 10 && Math.abs(px - 7.5) < (py - 1.5) * 0.58);
      if (!inDrop) continue;
      g.set(x, y, ramp(G, sphereLight((px - 7.5) / 5, (py - 9.5) / 5.5, 0.3) + 0.12, x, y, 0.3));
    }
  // skull
  const bone = '#e8f4d8';
  const hole = PAL.forest;
  g.rect(5, 8, 5, 3, bone).hline(6, 8, 7, bone).hline(6, 8, 11, bone);
  g.set(6, 9, hole).set(8, 9, hole).set(7, 10, PAL.darkGreen).set(6, 11, hole).set(8, 11, hole);
  g.set(5, 8, G[4]);
  // highlight and bubbles
  g.set(5, 5, G[4]).set(4, 7, G[3]);
  const d = done(g, '#0f2418');
  d.set(12, 3, G[3]).set(13, 2, G[2]).set(12, 2, G[4]);
  d.set(13, 6, G[3]);
  return d.outline((inner) => mix('#0f2418', inner, 0.1));
}

export const ELEMENT_ICONS = {
  icon_elem_physical: physical,
  icon_elem_fire: fire,
  icon_elem_ice: ice,
  icon_elem_lightning: lightning,
  icon_elem_poison: poison,
} as const;
