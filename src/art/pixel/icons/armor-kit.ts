/**
 * Shared palettes for the armor-type icon variants (cloth / leather / plate).
 * The plain helm/armor/gloves/boots/belt icons are mail; these swap the
 * silhouette and base material while still picking up the tier accents.
 */
import { PAL } from '../../palette';
import type { Col } from '../env/raster';
import type { Material } from './materials';

export type Ramp4 = readonly [Col, Col, Col, Col];
export type Ramp3 = readonly [Col, Col, Col];

/** Mage fabric per tier: undyed linen, grey wool, royal blue, white silk, crimson, violet. */
const FABRIC: readonly Ramp4[] = [
  [PAL.darkBrown, PAL.brown, PAL.tan, PAL.sand],
  [PAL.navy, PAL.darkSlate, PAL.slate, PAL.gray],
  [PAL.navy, PAL.blue, PAL.sky, '#7fd3f5'],
  [PAL.slate, PAL.gray, PAL.lightGray, PAL.white],
  [PAL.plum, PAL.darkRed, PAL.red, PAL.pink],
  ['#2a1238', PAL.purple, PAL.magenta, PAL.pink],
];

/** Embroidered trim on the fabric (dark → light). */
const FABRIC_TRIM: readonly Ramp3[] = [
  [PAL.plum, PAL.darkBrown, '#8f5a44'],
  [PAL.slate, PAL.gray, PAL.lightGray],
  [PAL.rust, PAL.gold, PAL.yellow],
  [PAL.blue, PAL.sky, PAL.cyan],
  [PAL.rust, PAL.gold, PAL.yellow],
  [PAL.rust, PAL.gold, PAL.yellow],
];

/** Leather per tier: worn hide, tanned, oiled, blue-dyed, ember-red, violet. */
const LEATHER: readonly Ramp4[] = [
  [PAL.plum, PAL.darkBrown, '#8f5a44', PAL.brown],
  [PAL.plum, PAL.darkBrown, PAL.brown, PAL.tan],
  ['#2a1a22', PAL.plum, PAL.darkBrown, PAL.brown],
  [PAL.navy, PAL.darkSlate, PAL.blue, PAL.sky],
  [PAL.plum, PAL.darkRed, PAL.rust, PAL.orangeBrown],
  ['#1c0f2a', PAL.purple, PAL.magenta, PAL.pink],
];

/** Fittings on leather (buckles, studs): dull iron, iron, then the tier trim. */
const FITTINGS: readonly Ramp3[] = [
  [PAL.darkSlate, PAL.slate, PAL.gray],
  [PAL.slate, PAL.gray, PAL.lightGray],
];

const clampTier = (t: number) => Math.max(0, Math.min(5, Math.floor(Number.isFinite(t) ? t : 0)));

export function fabric(tier: number): Ramp4 {
  return FABRIC[clampTier(tier)];
}

export function fabricTrim(tier: number): Ramp3 {
  return FABRIC_TRIM[clampTier(tier)];
}

export function leather(tier: number): Ramp4 {
  return LEATHER[clampTier(tier)];
}

export function fittings(m: Material, tier: number): Ramp3 {
  const t = clampTier(tier);
  return t < FITTINGS.length ? FITTINGS[t] : m.trim;
}

/** Accent colour for runes, gems and feathers; glowing tiers use their glow. */
export function accent(m: Material): Col {
  return m.glow ?? m.gem;
}
