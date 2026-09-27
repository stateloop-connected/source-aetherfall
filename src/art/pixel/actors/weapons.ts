/**
 * Hero weapons. Images point RIGHT with the grip on the left; the engine
 * rotates them around (gripX, gripY). `tier` 0-5 selects the material:
 * 0 wood/rusty iron · 1 iron · 2 polished steel · 3 crystal · 4 ember · 5 aether.
 */
import { PAL } from '../../palette';
import type { WeaponInfo, WeaponKind } from '../types';
import { alpha, Buf, INK, shade, type Col, type Ramp } from './buf';

interface Mat {
  /** blade: dark, mid, light, edge highlight */
  blade: readonly [Col, Col, Col, Col];
  guard: readonly [Col, Col, Col];
  grip: readonly [Col, Col];
  shaft: readonly [Col, Col];
  orb: Ramp;
  gem: Col;
  /** bow limbs when they are not the blade material (wooden tiers), dark → light */
  limb?: readonly [Col, Col, Col, Col];
  /** crossbow stock, dark → light */
  stock: readonly [Col, Col, Col];
  /** bow / crossbow string */
  string: Col;
  rust?: Col;
  glow?: Col;
  hot?: Col;
}

const MATS: readonly Mat[] = [
  {
    blade: ['#4f4547', '#7b6f70', '#a29591', '#c2b4a8'],
    guard: [PAL.plum, PAL.darkBrown, PAL.brown],
    grip: [PAL.plum, PAL.darkBrown],
    shaft: [PAL.darkBrown, PAL.brown],
    orb: [PAL.darkSlate, PAL.slate, PAL.gray],
    gem: PAL.gray,
    limb: [PAL.plum, PAL.darkBrown, PAL.brown, PAL.tan],
    stock: [PAL.plum, PAL.darkBrown, PAL.brown],
    string: PAL.sand,
    rust: PAL.rust,
  },
  {
    blade: [PAL.slate, PAL.gray, PAL.lightGray, '#e3e9f2'],
    guard: [PAL.navy, PAL.darkSlate, PAL.slate],
    grip: [PAL.darkBrown, PAL.brown],
    shaft: [PAL.darkBrown, PAL.brown],
    orb: [PAL.blue, PAL.sky, PAL.cyan],
    gem: PAL.sky,
    limb: [PAL.darkBrown, PAL.brown, PAL.tan, PAL.sand],
    stock: [PAL.darkBrown, PAL.brown, PAL.tan],
    string: PAL.lightGray,
  },
  {
    blade: [PAL.gray, PAL.lightGray, '#eef3fa', '#ffffff'],
    guard: [PAL.rust, PAL.gold, PAL.yellow],
    grip: [PAL.navy, PAL.blue],
    shaft: [PAL.navy, PAL.darkSlate],
    orb: [PAL.darkRed, PAL.red, PAL.pink, '#ffffff'],
    gem: PAL.red,
    stock: [PAL.navy, PAL.blue, PAL.sky],
    string: PAL.lightGray,
  },
  {
    blade: [PAL.blue, PAL.sky, PAL.cyan, '#ffffff'],
    guard: [PAL.slate, PAL.lightGray, '#ffffff'],
    grip: [PAL.navy, PAL.blue],
    shaft: [PAL.slate, PAL.lightGray],
    orb: [PAL.blue, PAL.sky, PAL.cyan, '#ffffff'],
    gem: PAL.cyan,
    stock: [PAL.slate, PAL.lightGray, '#ffffff'],
    string: '#c9fbff',
  },
  {
    blade: [PAL.darkRed, PAL.orange, PAL.gold, PAL.yellow],
    guard: [PAL.darkBrown, PAL.gold, PAL.yellow],
    grip: [PAL.plum, PAL.darkRed],
    shaft: [PAL.plum, PAL.darkRed],
    orb: [PAL.darkRed, PAL.orange, PAL.gold, PAL.yellow],
    gem: PAL.orange,
    stock: [PAL.plum, PAL.darkRed, PAL.rust],
    string: PAL.yellow,
    hot: '#fff6c8',
  },
  {
    blade: [PAL.purple, PAL.magenta, PAL.pink, '#ffffff'],
    guard: [PAL.blue, PAL.cyan, '#ffffff'],
    grip: ['#1c0f2a', PAL.purple],
    shaft: ['#1c0f2a', PAL.purple],
    orb: [PAL.purple, PAL.magenta, PAL.pink, '#ffffff'],
    gem: PAL.cyan,
    stock: ['#1c0f2a', PAL.purple, PAL.magenta],
    string: PAL.cyan,
    glow: PAL.cyan,
  },
];

const INFO: Record<WeaponKind, WeaponInfo> = {
  sword: { w: 16, h: 7, gripX: 3, gripY: 3 },
  greatsword: { w: 24, h: 9, gripX: 3, gripY: 4 },
  dagger: { w: 10, h: 5, gripX: 1, gripY: 2 },
  staff: { w: 20, h: 8, gripX: 5, gripY: 4 },
  // held at the nocking point on the string, so the whole bow sits in front of the hero
  bow: { w: 10, h: 17, gripX: 2, gripY: 8 },
  crossbow: { w: 17, h: 11, gripX: 4, gripY: 5 },
};

export function weaponSize(kind: WeaponKind): WeaponInfo {
  return INFO[kind] ?? INFO.sword;
}

function gripWrap(b: Buf, x0: number, x1: number, y: number, m: Mat): void {
  for (let x = x0; x <= x1; x++) b.set(x, y, (x - x0) % 2 ? m.grip[0] : m.grip[1]);
}

function sword(m: Mat): Buf {
  const b = new Buf(16, 7);
  b.set(1, 3, m.guard[2]);
  gripWrap(b, 2, 3, 3, m);
  b.vline(4, 1, 5, m.guard[1]).set(4, 1, m.guard[2]).set(4, 5, m.guard[0]);
  b.set(5, 3, m.guard[0]);
  for (let x = 5; x <= 12; x++) {
    b.set(x, 2, m.blade[2]).set(x, 3, m.blade[1]).set(x, 4, m.blade[0]);
  }
  b.set(13, 2, m.blade[2]).set(13, 3, m.blade[1]).set(14, 3, m.blade[3]);
  b.set(6, 2, m.blade[3]).set(7, 2, m.blade[3]);
  b.hline(6, 11, 3, m.blade[1]);
  if (m.rust) b.set(8, 4, m.rust).set(10, 3, m.rust).set(11, 4, m.rust).set(12, 2, m.blade[1]);
  if (m.hot) b.hline(6, 12, 3, m.blade[2]).set(9, 3, m.hot).set(10, 3, m.hot);
  if (m.glow) b.set(8, 2, m.glow).set(10, 2, m.glow).set(12, 2, m.glow).set(14, 3, m.glow);
  b.set(1, 3, m.gem);
  return b.outline(INK);
}

function greatsword(m: Mat): Buf {
  const b = new Buf(24, 9);
  b.set(1, 4, m.gem).set(1, 3, m.guard[1]).set(1, 5, m.guard[0]);
  gripWrap(b, 2, 5, 4, m);
  b.vline(6, 1, 7, m.guard[1]).vline(7, 2, 6, m.guard[0]);
  b.set(6, 1, m.guard[2]).set(6, 7, m.guard[0]).set(7, 4, m.gem);
  for (let x = 8; x <= 20; x++) {
    b.set(x, 2, m.blade[2])
      .set(x, 3, m.blade[2])
      .set(x, 4, m.blade[1])
      .set(x, 5, m.blade[1])
      .set(x, 6, m.blade[0]);
  }
  // fuller groove
  b.hline(9, 17, 4, m.blade[0]);
  b.set(21, 3, m.blade[2]).set(21, 4, m.blade[1]).set(21, 5, m.blade[0]).set(22, 4, m.blade[3]);
  b.set(9, 2, m.blade[3]).set(10, 2, m.blade[3]).set(11, 2, m.blade[3]);
  if (m.rust)
    b.set(12, 6, m.rust).set(15, 5, m.rust).set(18, 2, m.rust).set(19, 6, m.rust).set(20, 2, m.blade[1]);
  if (m.hot) b.hline(9, 17, 4, m.hot).set(13, 4, PAL.yellow);
  if (m.glow) {
    for (let x = 9; x <= 20; x += 2) b.set(x, 2, m.glow);
    b.set(22, 4, m.glow);
  }
  return b.outline(INK);
}

function dagger(m: Mat): Buf {
  const b = new Buf(10, 5);
  gripWrap(b, 1, 2, 2, m);
  b.vline(3, 1, 3, m.guard[1]).set(3, 1, m.guard[2]);
  for (let x = 4; x <= 6; x++) b.set(x, 1, m.blade[2]).set(x, 2, m.blade[1]).set(x, 3, m.blade[0]);
  b.set(7, 1, m.blade[2]).set(7, 2, m.blade[1]).set(8, 2, m.blade[3]);
  b.set(5, 1, m.blade[3]);
  if (m.rust) b.set(6, 3, m.rust);
  if (m.hot) b.set(5, 2, m.hot);
  if (m.glow) b.set(8, 2, m.glow).set(6, 1, m.glow);
  return b.outline(INK);
}

function staff(m: Mat, tier: number): Buf {
  const b = new Buf(20, 8);
  for (let x = 1; x <= 14; x++) b.set(x, 3, m.shaft[1]).set(x, 4, m.shaft[0]);
  b.set(1, 3, m.guard[1]).set(1, 4, m.guard[0]);
  for (let x = 4; x <= 7; x++) b.set(x, 3, x % 2 ? m.grip[1] : m.grip[0]).set(x, 4, m.grip[0]);
  const orb = (cx: number, cy: number, r: number): void => {
    const l = new Buf(20, 8).ellipse(cx, cy, r, r, '#000000');
    shade(l, m.orb, { rim: 0.25 });
    b.blit(l);
  };
  if (tier === 0) {
    // gnarled wooden staff with a stone knob
    b.set(13, 2, m.shaft[1]).set(14, 2, m.shaft[1]).set(15, 2, m.shaft[0]);
    orb(16.5, 4, 2.2);
    b.set(10, 4, PAL.plum);
  } else if (tier === 3) {
    // cyan crystal held in silver prongs
    b.set(14, 2, m.guard[1]).set(15, 1, m.guard[2]).set(14, 5, m.guard[0]).set(15, 6, m.guard[1]);
    b.poly(
      [
        [14.5, 3.5],
        [16.5, 1],
        [19.2, 4],
        [16.5, 7],
      ],
      PAL.sky,
    );
    b.set(16, 2, '#ffffff')
      .set(16, 3, PAL.cyan)
      .set(17, 3, PAL.cyan)
      .set(17, 4, PAL.cyan)
      .set(16, 4, '#c9fbff')
      .set(17, 5, PAL.blue)
      .set(16, 6, PAL.blue);
  } else {
    // prongs + orb
    b.set(14, 2, m.guard[1]).set(15, 1, m.guard[2]).set(14, 5, m.guard[0]).set(15, 6, m.guard[1]);
    orb(16.8, 3.8, tier >= 4 ? 2.5 : 2.2);
    b.set(16, 3, '#ffffff');
  }
  if (tier === 4) b.set(18, 1, PAL.gold).set(17, 0, PAL.yellow);
  b.outline(INK);
  if (tier === 5) {
    // cyan halo ring around the aether orb
    for (const [x, y] of [
      [16, 0],
      [19, 2],
      [19, 5],
      [16, 7],
      [14, 1],
    ] as const)
      if (!b.has(x, y) || b.get(x, y) === INK) b.set(x, y, PAL.cyan);
  }
  return b;
}

/**
 * Bow seen from above, arrows fly to the right: the limbs arc forward to the
 * wrapped handle and the string runs down the left, toward the archer.
 * Tier 2+ get recurved tips, metal fittings and a gem on the arrow rest.
 */
function bow(m: Mat, tier: number): Buf {
  const b = new Buf(10, 17);
  const L = m.limb ?? m.blade;
  const recurve = tier >= 2;
  // right edge of the limb for rows 1..8 (upper half, mirrored below)
  const edge = recurve ? [3, 3, 4, 5, 6, 6, 7, 7] : [2, 3, 4, 5, 6, 6, 7, 7];
  for (let k = 0; k < 8; k++) {
    const x = edge[k];
    for (const y of [1 + k, 15 - k]) {
      const up = y < 8;
      if (k === 0) {
        b.set(x, y, tier >= 1 ? (up ? m.guard[2] : m.guard[1]) : up ? L[2] : L[1]);
        continue;
      }
      b.set(x - 1, y, up ? (k < 2 || k > 4 ? L[3] : L[2]) : L[2]).set(x, y, up ? L[1] : L[0]);
    }
  }
  // wrapped handle
  for (let y = 7; y <= 9; y++) b.set(6, y, y % 2 ? m.grip[1] : m.grip[0]).set(7, y, m.grip[0]);
  b.set(5, 8, m.grip[1]);
  if (recurve) {
    // fittings where the limbs meet the handle, and a gem on the arrow rest
    b.set(6, 6, m.guard[2]).set(7, 6, m.guard[1]).set(6, 10, m.guard[1]).set(7, 10, m.guard[0]);
    b.set(8, 8, m.gem);
  }
  if (m.rust) b.set(4, 3, m.rust).set(5, 12, m.rust);
  if (m.hot) b.set(4, 4, m.hot).set(5, 5, m.hot).set(5, 11, m.hot).set(4, 12, PAL.yellow);
  if (m.glow) b.set(4, 3, m.glow).set(5, 5, m.glow).set(4, 13, m.glow);
  b.outline(INK);
  // the string: one light pixel wide, inked only on the outside so it stays thin
  const s0 = recurve ? 2 : 1;
  b.vline(1, s0, 16 - s0, m.string).vline(0, s0, 16 - s0, INK);
  if (m.glow) b.set(1, 8, '#ffffff');
  return b;
}

/**
 * Crossbow seen from above, pointing right: a stock with a shoulder butt, a
 * prod across the front and a bolt loaded in the groove.
 */
function crossbow(m: Mat, tier: number): Buf {
  const b = new Buf(17, 11);
  const S = m.stock;
  const B = m.blade;
  // stock body and shoulder butt
  for (let x = 1; x <= 12; x++) b.set(x, 4, S[2]).set(x, 5, S[1]).set(x, 6, S[0]);
  b.vline(1, 3, 7, S[1]).vline(2, 3, 7, S[1]).set(1, 3, S[2]).set(2, 3, S[2]).set(1, 7, S[0]).set(2, 7, S[0]);
  b.set(3, 5, S[0]);
  // trigger lever
  b.set(5, 7, m.guard[1]);
  // prod: a straight bar across the front whose tips sweep back a little
  for (let y = 2; y <= 8; y++) b.set(12, y, y < 5 ? B[2] : B[1]).set(13, y, y < 5 ? B[1] : B[0]);
  b.set(12, 2, B[3]).set(13, 2, B[2]).set(11, 1, B[2]).set(12, 1, B[3]);
  b.set(11, 9, B[0]).set(12, 9, B[1]);
  // metal band where the prod is lashed on
  b.vline(11, 4, 6, m.guard[2]).set(11, 6, m.guard[1]);
  // loaded bolt in the groove: fletching, shaft, head poking past the prod
  b.hline(6, 13, 5, PAL.tan).set(6, 5, PAL.sand).set(7, 5, PAL.lightGray);
  b.set(14, 5, tier >= 3 ? B[3] : PAL.lightGray).set(15, 5, tier >= 3 ? '#ffffff' : PAL.gray);
  if (tier === 3) {
    // crystal magazine of the repeater
    b.hline(4, 6, 3, PAL.sky).set(4, 3, PAL.cyan).set(5, 3, '#ffffff');
  }
  if (m.rust) b.set(12, 3, m.rust).set(13, 7, m.rust);
  if (m.hot) b.set(12, 4, m.hot).set(12, 6, PAL.yellow).set(15, 5, m.hot);
  if (tier === 2 || tier === 5) b.set(4, 5, m.gem);
  b.outline(INK);
  // drawn string from the prod tips back to the latch
  b.set(10, 1, m.string).set(10, 2, m.string).set(9, 3, m.string).set(8, 4, m.string);
  b.set(10, 9, m.string).set(10, 8, m.string).set(9, 7, m.string).set(8, 6, m.string);
  if (m.glow) b.set(12, 0, alpha(m.glow, 0.7)).set(12, 10, alpha(m.glow, 0.7)).set(16, 5, m.glow);
  return b;
}

export function drawWeapon(kind: WeaponKind, tier: number): Buf {
  const t = Math.max(0, Math.min(5, Math.floor(Number.isFinite(tier) ? tier : 0)));
  const m = MATS[t];
  switch (kind) {
    case 'greatsword':
      return greatsword(m);
    case 'dagger':
      return dagger(m);
    case 'staff':
      return staff(m, t);
    case 'bow':
      return bow(m, t);
    case 'crossbow':
      return crossbow(m, t);
    default:
      return sword(m);
  }
}
