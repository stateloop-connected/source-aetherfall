/**
 * Plate (heavy knight) armor icons: great helm, breastplate with pauldrons,
 * a single big gauntlet, greaves with sabatons and a plated girdle. Bulkier
 * than the plain (mail) icons, in the tier metal with trim accents.
 */
import { PAL } from '../../palette';
import { Grid, mix, ramp, sphereLight } from '../env/raster';
import { finish, S } from './equip';
import type { Material } from './materials';

/** A flat-topped great helm with a cross visor, breaths and a crest. */
export function helmPlate(m: Material): Grid {
  const g = new Grid(S, S);
  const M = m.metal;
  const T = m.trim;
  const rows: [number, number][] = [
    [5, 10], // y2
    [3, 12],
    [2, 13],
    [2, 13],
    [2, 13],
    [2, 13],
    [2, 13],
    [2, 13],
    [2, 13],
    [2, 13],
    [2, 13],
    [2, 13],
    [1, 14], // y14
  ];
  rows.forEach(([a, b], i) => {
    const y = 2 + i;
    for (let x = a; x <= b; x++) {
      const nx = (x + 0.5 - 8) / 6;
      // a cylinder: bright band left of centre, falling off to the right
      const l = 0.95 - Math.abs(nx + 0.3) * 0.7 - (nx > 0 ? nx * 0.25 : 0) - (i < 2 ? -0.1 : 0);
      g.set(x, y, ramp(M, l, x, y, 0.3));
    }
  });
  // centre ridge
  g.vline(7, 2, 14, M[4]).vline(8, 3, 14, M[1]);
  // cross visor: eye slits and a nose bar
  const dark = mix(M[0], PAL.black, 0.6);
  g.hline(3, 6, 7, dark).hline(9, 12, 7, dark).hline(3, 6, 8, M[4]).hline(9, 12, 8, M[2]);
  g.vline(7, 6, 11, T[2]).vline(8, 6, 11, T[1]);
  // breathing holes on the right cheek
  for (const [x, y] of [
    [10, 10],
    [12, 10],
    [11, 11],
    [10, 12],
    [12, 12],
  ] as const)
    g.set(x, y, dark);
  // riveted rim
  g.hline(1, 14, 14, T[0]);
  for (let x = 2; x <= 13; x += 3) g.set(x, 14, T[2]);
  // crest
  g.hline(6, 9, 1, T[1]).set(6, 1, T[2]).hline(7, 8, 0, T[2]);
  if (m.glow) g.hline(3, 6, 7, m.glow).hline(9, 12, 7, m.glow);
  return finish(g, m);
}

/** A sculpted breastplate with big domed pauldrons, a gorget and a flared plated skirt. */
export function breastplatePlate(m: Material): Grid {
  const g = new Grid(S, S);
  const M = m.metal;
  const T = m.trim;
  // torso: broad chest, pinched waist, flared skirt
  const rows: [number, number][] = [
    [4, 11], // y3
    [3, 12],
    [3, 12],
    [3, 12],
    [4, 11],
    [4, 11],
    [4, 11],
    [4, 11],
    [3, 12],
    [3, 12],
    [2, 13],
    [2, 13], // y14
  ];
  rows.forEach(([a0, b0], i) => {
    const y = 3 + i;
    for (let x = a0; x <= b0; x++) {
      const nx = (x + 0.5 - 8) / 5;
      const ny = (y + 0.5 - 7) / 6;
      g.set(x, y, ramp(M, sphereLight(nx, ny, 0.3) + 0.15, x, y, 0.3));
    }
  });
  // neck opening and gorget
  for (const [x, y] of [
    [6, 3],
    [7, 3],
    [8, 3],
    [9, 3],
    [7, 4],
    [8, 4],
  ] as const)
    g.set(x, y, null);
  g.set(5, 3, T[2]).set(6, 4, T[2]).set(7, 5, T[1]).set(8, 5, T[1]).set(9, 4, T[0]).set(10, 3, T[0]);
  // centre ridge and a polished glint
  g.vline(7, 6, 10, M[4]).vline(8, 6, 10, M[1]);
  g.set(5, 6, M[4]).set(5, 7, M[3]);
  // plated skirt
  g.hline(3, 12, 11, M[0]).hline(2, 13, 13, M[0]).hline(3, 12, 12, M[3]).hline(2, 13, 14, T[1]);
  // pauldrons: broad domes over two lames, out on the shoulder corners
  const mask = new Grid(S, S);
  const pauldron = (cx: number, lit: number) => {
    mask.ellipse(cx, 4.6, 2.7, 2.5, (x, y, nx, ny) =>
      ramp(M, sphereLight(nx, ny, 0.25) + 0.12 + lit, x, y, 0.3),
    );
    const x0 = Math.round(cx - 2.5);
    for (let x = x0; x < x0 + 5; x++) mask.set(x, 7, T[lit > 0 ? 1 : 0]).set(x, 8, M[lit > 0 ? 3 : 1]);
    mask.set(x0, 8, null).set(x0 + 4, 8, null);
  };
  pauldron(3.3, 0.1);
  pauldron(12.7, -0.15);
  // a dark seam where the pauldrons sit on the chest
  const seam: [number, number][] = [];
  g.each((x, y, c) => {
    if (c === null || mask.get(x, y)) return undefined;
    if (mask.get(x - 1, y) || mask.get(x + 1, y) || mask.get(x, y + 1)) seam.push([x, y]);
    return undefined;
  });
  g.blit(mask, 0, 0);
  for (const [x, y] of seam) g.set(x, y, M[0]);
  // gem at the sternum
  g.set(7, 7, m.gem).set(8, 7, m.gem).set(7, 6, m.gemHi);
  if (m.glow) g.set(7, 12, m.glow).set(8, 12, m.glow);
  return finish(g, m);
}

/** One heavy gauntlet clenched into a fist, knuckle plates forward, over a flared cuff. */
export function gauntletPlate(m: Material): Grid {
  const g = new Grid(S, S);
  const M = m.metal;
  const T = m.trim;
  // flared cuff
  for (let y = 10; y <= 14; y++) {
    const half = 3.5 + (y - 10) * 0.6;
    for (let x = Math.round(8 - half); x < Math.round(8 + half); x++) {
      const nx = (x + 0.5 - 8) / half;
      g.set(x, y, ramp(M, 0.72 - nx * 0.45 - (y - 10) * 0.05, x, y, 0.3));
    }
  }
  g.hline(2, 13, 14, T[1]).set(2, 14, T[2]).set(13, 14, T[0]);
  g.vline(7, 11, 13, M[4]);
  // the fist
  g.rect(3, 3, 10, 7, (x, y, nx, ny) => ramp(M, sphereLight(nx * 0.9, ny, 0.3) + 0.12, x, y, 0.3));
  g.set(3, 3, null).set(12, 3, null).set(12, 9, null);
  // knuckle plates: four domes along the top
  for (let f = 0; f < 4; f++) {
    const x0 = 4 + f * 2;
    g.set(x0, 2, M[4 - (f > 1 ? 1 : 0)]).set(x0 + 1, 2, M[2]);
    g.set(x0 + 1, 3, M[1]);
  }
  // curled fingers
  g.hline(4, 11, 5, M[1]).hline(4, 11, 7, M[1]);
  for (const x of [5, 7, 9]) g.set(x, 4, M[0]).set(x, 6, M[0]);
  // thumb folded across the front
  g.hline(3, 7, 8, M[4]).hline(4, 8, 9, M[2]).set(8, 8, M[3]);
  g.set(9, 4, m.gem).set(10, 4, m.gem).set(9, 3, m.gemHi);
  if (m.glow) g.set(5, 12, m.glow).set(10, 12, m.glow);
  return finish(g, m);
}

/** Greaves with domed knee cops and pointed, articulated sabatons. */
export function greavesPlate(m: Material): Grid {
  const g = new Grid(S, S);
  const M = m.metal;
  const T = m.trim;
  const leg = (ox: number, oy: number, dark: number) => {
    const c = (i: number) => M[Math.max(0, i - dark)];
    // shin guard with a raised centre line
    for (let y = oy + 3; y < oy + 10; y++)
      for (let x = ox; x < ox + 5; x++)
        g.set(x, y, c(x === ox ? 3 : x === ox + 1 ? 4 : x === ox + 4 ? 1 : 2));
    g.hline(ox, ox + 4, oy + 4, c(0));
    // knee cop with a side fan
    g.ellipse(ox + 2.5, oy + 2, 3.1, 2.3, (x, y, nx, ny) =>
      ramp(M, sphereLight(nx, ny, 0.25) + 0.15 - dark * 0.3, x, y, 0.3),
    );
    g.set(ox + 2, oy + 1, c(4));
    g.set(ox + 5, oy + 1, T[Math.max(0, 2 - dark)])
      .set(ox + 5, oy + 2, T[Math.max(0, 1 - dark)])
      .set(ox + 5, oy + 3, T[0]);
    // sabaton: stacked lames ending in a pointed toe
    for (let y = oy + 10; y < oy + 13; y++)
      for (let x = ox; x < ox + 7 - (y === oy + 10 ? 2 : 0); x++) g.set(x, y, c(y === oy + 10 ? 3 : 2));
    g.set(ox + 7, oy + 12, c(2)).set(ox + 8, oy + 12, c(1));
    g.vline(ox + 3, oy + 10, oy + 12, c(0)).vline(ox + 5, oy + 11, oy + 12, c(1));
    g.hline(ox, ox + 8, oy + 13, T[Math.max(0, 1 - dark)]);
  };
  leg(8, 0, 1);
  leg(2, 1, 0);
  if (m.glow) g.set(4, 6, m.glow);
  return finish(g, m);
}

/** A broad girdle of riveted plates with a heavy buckle and hanging tassets. */
export function girdlePlate(m: Material): Grid {
  const g = new Grid(S, S);
  const M = m.metal;
  const T = m.trim;
  // plated band
  for (let x = 1; x < 15; x++) {
    const sag = Math.round(Math.abs(x - 7.5) / 5);
    const y0 = 3 - sag;
    for (let y = y0; y < y0 + 6; y++) {
      const seam = (x - 1) % 4 === 3;
      g.set(x, y, seam ? M[0] : ramp(M, 0.85 - (y - y0) * 0.12 - (x - 7.5) * 0.02, x, y, 0.3));
    }
    g.set(x, y0, M[4]);
    if ((x - 1) % 4 === 1) g.set(x, y0 + 4, T[2]);
  }
  // tassets
  for (const [x0, lit] of [
    [2, 0.1],
    [9, -0.1],
  ] as const) {
    for (let y = 9; y <= 14; y++)
      for (let x = x0; x < x0 + 5; x++) {
        if (y === 14 && (x === x0 || x === x0 + 4)) continue;
        g.set(x, y, ramp(M, 0.72 - (x - x0) * 0.1 + lit - (y - 9) * 0.03, x, y, 0.3));
      }
    g.hline(x0, x0 + 4, 11, M[0]).hline(x0, x0 + 4, 12, M[3]);
    g.hline(x0 + 1, x0 + 3, 14, T[1]);
  }
  // heavy buckle
  g.rect(5, 1, 6, 8, (x, y, nx, ny) => ramp(T, sphereLight(nx, ny, 0.3) + 0.1, x, y, 0.2));
  g.rect(6, 2, 4, 6, mix(T[0], PAL.black, 0.3));
  g.rect(7, 3, 2, 4, m.gem);
  g.set(7, 3, m.gemHi);
  return finish(g, m);
}
