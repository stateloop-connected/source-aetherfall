/**
 * Leather (rogue / ranger) armor icons: feathered cap, laced jerkin,
 * fingerless gloves, tall buckled boots and a belt with pouches. Leather is
 * brown in the low tiers and dyed in the tier colour higher up; buckles and
 * studs carry the tier accent.
 */
import { PAL } from '../../palette';
import { Grid, mix, ramp, sphereLight } from '../env/raster';
import { accent, fittings, leather } from './armor-kit';
import { finish, S } from './equip';
import type { Material } from './materials';

/** A leather cap with ear flaps, a studded band and a feather tucked in. */
export function capLeather(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const L = leather(tier);
  const K = fittings(m, tier);
  // dome
  g.ellipse(7.5, 8.2, 6, 6, (x, y, nx, ny) =>
    y > 8 ? undefined : ramp(L, sphereLight(nx, ny, 0.25) + 0.1, x, y, 0.3),
  );
  // stitched seam over the crown
  for (let y = 3; y <= 7; y++) if (y % 2) g.set(7, y, L[3]);
  g.line(4, 4, 3, 7, L[1]);
  // band with studs
  g.hline(2, 13, 8, L[1]).hline(2, 13, 9, L[0]);
  for (const x of [3, 6, 9, 12]) g.set(x, 8, K[2]);
  // rounded ear flaps, each with a stud
  for (const ox of [2, 11]) {
    for (let y = 10; y <= 12; y++)
      for (let x = ox; x < ox + 3; x++)
        g.set(x, y, ramp(L, 0.62 - (y - 10) * 0.1 - (ox > 5 ? 0.2 : 0), x, y, 0.3));
    g.set(ox, 12, null)
      .set(ox + 2, 12, null)
      .set(ox + 1, 13, L[0]);
    g.set(ox + 1, 11, K[ox > 5 ? 1 : 2]);
  }
  // feather sweeping up from the band
  const a = accent(m);
  const Fe = [mix(a, PAL.black, 0.35), a, mix(a, PAL.white, 0.55)];
  for (let k = 0; k < 7; k++) {
    const x = 10 + Math.floor(k / 2);
    const y = 8 - k;
    g.set(x, y, Fe[2]).set(x + 1, y, k > 0 && k < 6 ? Fe[1] : Fe[0]);
    if (k > 1 && k < 5) g.set(x + 2, y, Fe[0]);
  }
  g.set(10, 8, K[2]).set(9, 9, Fe[0]);
  return finish(g, m);
}

/** A sleeveless jerkin laced up the front, studded on the chest, with a tabbed hem. */
export function jerkinLeather(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const L = leather(tier);
  const K = fittings(m, tier);
  // silhouette: shoulder straps, arm holes, body, tabbed hem
  const rows: [number, number][] = [
    [4, 11], // y2
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12],
    [3, 12], // y13
  ];
  rows.forEach(([a, b], i) => {
    const y = 2 + i;
    for (let x = a; x <= b; x++) {
      const nx = (x + 0.5 - 8) / 5;
      g.set(x, y, ramp(L, 0.72 - nx * 0.4 - i * 0.02, x, y, 0.3));
    }
  });
  // shoulder straps and arm holes: the sides curve in below the straps
  g.set(3, 2, null).set(12, 2, null).set(3, 3, null).set(12, 3, null);
  g.set(2, 4, L[2]).set(13, 4, L[0]).set(2, 5, L[2]).set(13, 5, L[0]);
  // neck
  for (const [x, y] of [
    [6, 2],
    [7, 2],
    [8, 2],
    [9, 2],
    [7, 3],
    [8, 3],
  ] as const)
    g.set(x, y, null);
  g.set(5, 2, L[3]).set(6, 3, L[3]).set(10, 2, L[1]).set(9, 3, L[1]);
  // front opening with criss-cross laces
  g.vline(7, 4, 12, L[0]).vline(8, 4, 12, L[0]);
  for (let y = 4; y <= 11; y++) g.set(y % 2 ? 7 : 8, y, K[y % 2 ? 2 : 1]);
  // studs
  for (const y of [5, 7, 9]) g.set(4, y, K[2]).set(11, y, K[1]);
  // belt line and tabbed hem
  g.hline(3, 12, 12, L[0]).set(7, 12, K[2]).set(8, 12, K[1]);
  for (let x = 3; x <= 12; x++) g.set(x, 13, x % 3 === 2 ? null : ramp(L, 0.5 - (x - 8) * 0.05, x, 13, 0.3));
  g.set(4, 14, L[1]).set(9, 14, L[0]).set(12, 14, L[0]);
  if (m.glow) g.set(6, 6, m.glow).set(9, 8, m.glow);
  else g.set(6, 6, m.gem);
  return finish(g, m);
}

/** Fingerless gloves: leather backs, bare fingertips, a buckled wrist strap. */
export function glovesLeather(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const L = leather(tier);
  const K = fittings(m, tier);
  const skin = [PAL.skinShade, PAL.skin];
  const glove = (ox: number, oy: number, dark: number) => {
    // bracer
    for (let y = oy + 8; y < oy + 12; y++)
      for (let x = ox; x < ox + 5; x++) g.set(x, y, L[Math.max(0, (x === ox ? 2 : 1) - dark)]);
    // strap with buckle
    g.hline(ox, ox + 4, oy + 10, L[0])
      .set(ox + 1, oy + 10, K[2 - dark])
      .set(ox + 2, oy + 10, K[1 - dark]);
    // back of the hand
    for (let y = oy + 3; y < oy + 8; y++)
      for (let x = ox; x < ox + 5; x++) {
        const nx = (x + 0.5 - (ox + 2.5)) / 2.5;
        g.set(x, y, ramp(L, 0.8 - nx * 0.35 - dark * 0.3 - (y - oy - 3) * 0.04, x, y, 0.3));
      }
    // knuckle seam
    g.hline(ox, ox + 4, oy + 3, L[Math.max(0, 1 - dark)]);
    // fingers: leather stubs, bare tips
    for (let f = 0; f < 4; f++) {
      const fx = ox + f + (f > 1 ? 1 : 0) - (f === 3 ? 1 : 0);
      const top = oy + (f === 0 || f === 3 ? 1 : 0);
      g.set(fx, oy + 2, L[Math.max(0, 2 - dark - (f % 2))]);
      for (let y = top; y < oy + 2; y++) g.set(fx, y, skin[dark ? 0 : 1 - (f % 2)]);
    }
    // thumb
    const tx = dark ? ox + 5 : ox - 1;
    g.set(tx, oy + 4, L[2 - dark])
      .set(tx, oy + 5, L[1])
      .set(tx, oy + 3, skin[dark ? 0 : 1]);
  };
  glove(9, 1, 1);
  glove(3, 3, 0);
  g.set(5, 8, accent(m));
  return finish(g, m);
}

/** Tall riding boots with a folded cuff and two buckled straps. */
export function bootsLeather(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const L = leather(tier);
  const K = fittings(m, tier);
  const boot = (ox: number, oy: number, dark: number) => {
    const c = (i: number) => L[Math.max(0, i - dark)];
    // shaft
    for (let y = oy + 2; y < oy + 10; y++)
      for (let x = ox; x < ox + 4; x++) g.set(x, y, c(x === ox ? 3 : x === ox + 3 ? 1 : 2));
    // folded cuff, a little wider, with a dark underside
    g.hline(ox - 1, ox + 4, oy, c(3))
      .hline(ox - 1, ox + 4, oy + 1, c(2))
      .set(ox + 4, oy + 1, c(1));
    g.hline(ox, ox + 3, oy + 2, c(0));
    // foot with a rounded toe
    for (let y = oy + 9; y < oy + 12; y++)
      for (let x = ox; x < ox + 7; x++) g.set(x, y, c(y === oy + 9 ? 3 : 2));
    g.set(ox + 6, oy + 9, null).set(ox + 6, oy + 11, c(1));
    // sole and heel
    g.hline(ox, ox + 6, oy + 12, L[0])
      .set(ox, oy + 12, K[0])
      .set(ox + 1, oy + 12, K[0]);
    // buckled straps
    for (const y of [oy + 4, oy + 7]) {
      g.hline(ox, ox + 3, y, c(0));
      g.set(ox + 1, y, K[Math.max(0, 2 - dark)]).set(ox + 2, y, K[Math.max(0, 1 - dark)]);
    }
  };
  boot(9, 1, 1);
  boot(3, 2, 0);
  return finish(g, m);
}

/** A leather belt with a plain buckle and two pouches hanging from it. */
export function beltLeather(m: Material, tier: number): Grid {
  const g = new Grid(S, S);
  const L = leather(tier);
  const K = fittings(m, tier);
  // strap with stitching
  for (let x = 1; x < 15; x++) {
    const y0 = 4 + (x > 3 && x < 12 ? 1 : 0);
    for (let y = y0; y < y0 + 3; y++) g.set(x, y, ramp(L, 0.8 - (y - y0) * 0.22, x, y, 0.25));
    if (x % 2) g.set(x, y0 + 1, L[3]);
  }
  // buckle
  g.rect(2, 3, 3, 5, K[1]);
  g.set(3, 4, L[1]).set(3, 5, K[2]).set(3, 6, L[0]).set(2, 3, K[2]).set(4, 7, K[0]);
  // pouches
  const pouch = (x0: number, y0: number, w: number, h: number) => {
    g.rect(x0, y0, w, h, (x, y, nx, ny) => ramp(L, sphereLight(nx, ny, 0.3) + 0.1, x, y, 0.3));
    g.set(x0, y0 + h - 1, null).set(x0 + w - 1, y0 + h - 1, null);
    // flap
    g.hline(x0, x0 + w - 1, y0, L[3]).hline(x0, x0 + w - 1, y0 + 1, L[1]);
    g.set(x0 + Math.floor(w / 2), y0 + 2, K[2]);
  };
  pouch(6, 7, 4, 6);
  pouch(11, 7, 3, 5);
  g.set(7, 11, accent(m));
  return finish(g, m);
}
