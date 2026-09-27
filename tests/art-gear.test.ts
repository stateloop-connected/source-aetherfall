import { describe, expect, it } from 'vitest';
import { buildIcon } from '../src/art/pixel/icons';
import { spriteInfo } from '../src/art/pixel/actors';
import { PROJECTILE_DEFS } from '../src/art/pixel/actors/fx';
import { drawWeapon, weaponSize } from '../src/art/pixel/actors/weapons';
import type { IconId, WeaponKind } from '../src/art/pixel/types';

const TIERS = [0, 1, 2, 3, 4, 5];
const MISSING = '#ff00ff';

const TINTED: IconId[] = [
  'icon_bow',
  'icon_crossbow',
  ...(['helm', 'armor', 'gloves', 'boots', 'belt'] as const).flatMap((slot) =>
    (['cloth', 'leather', 'plate'] as const).map((type) => `icon_${slot}_${type}` as IconId),
  ),
];

const ELEMENTS: IconId[] = [
  'icon_elem_physical',
  'icon_elem_fire',
  'icon_elem_ice',
  'icon_elem_lightning',
  'icon_elem_poison',
];

const opaque = (d: readonly (string | null)[]) => d.filter((c) => c !== null) as string[];

describe('new equipment icons', () => {
  it('covers all 15 armor-type variants plus bow and crossbow', () => {
    expect(new Set(TINTED).size).toBe(17);
  });

  for (const id of TINTED) {
    it(`${id} draws a real 16x16 icon for every tier`, () => {
      const sigs = new Set<string>();
      for (const t of TIERS) {
        const g = buildIcon(id, t);
        expect([g.w, g.h]).toEqual([16, 16]);
        const px = opaque(g.d);
        expect(px.length).toBeGreaterThan(40);
        expect(px.some((c) => c.toLowerCase().startsWith(MISSING))).toBe(false);
        sigs.add(g.d.join(','));
      }
      // tinted by tier: every tier looks different
      expect(sigs.size).toBe(TIERS.length);
    });
  }

  it('armor types differ from each other and from the plain (mail) icon', () => {
    for (const slot of ['helm', 'armor', 'gloves', 'boots', 'belt'] as const) {
      const sigs = new Set(
        [`icon_${slot}`, `icon_${slot}_cloth`, `icon_${slot}_leather`, `icon_${slot}_plate`].map((id) =>
          buildIcon(id as IconId, 2).d.join(','),
        ),
      );
      expect(sigs.size).toBe(4);
    }
  });
});

describe('element icons', () => {
  for (const id of ELEMENTS) {
    it(`${id} draws a real 16x16 glyph`, () => {
      const g = buildIcon(id, 0);
      expect([g.w, g.h]).toEqual([16, 16]);
      const px = opaque(g.d);
      expect(px.length).toBeGreaterThan(40);
      expect(px.some((c) => c.toLowerCase().startsWith(MISSING))).toBe(false);
      // not tinted
      expect(buildIcon(id, 5).d.join(',')).toBe(g.d.join(','));
    });
  }
});

describe('bow and crossbow weapons', () => {
  const sword = drawWeapon('sword', 0).d.join(',');
  for (const kind of ['bow', 'crossbow'] as WeaponKind[]) {
    it(`${kind} has its own art and a grip inside the image for every tier`, () => {
      const info = weaponSize(kind);
      expect(info.gripX).toBeGreaterThanOrEqual(0);
      expect(info.gripY).toBeGreaterThanOrEqual(0);
      expect(info.gripX).toBeLessThan(info.w);
      expect(info.gripY).toBeLessThan(info.h);
      const sigs = new Set<string>();
      for (const t of TIERS) {
        const b = drawWeapon(kind, t);
        expect([b.w, b.h]).toEqual([info.w, info.h]);
        expect(b.d.join(',')).not.toBe(sword);
        expect(opaque(b.d).length).toBeGreaterThan(30);
        sigs.add(b.d.join(','));
      }
      expect(sigs.size).toBe(TIERS.length);
    });
  }
});

describe('hero projectiles', () => {
  for (const [id, w, h] of [
    ['proj_hero_arrow', 12, 5],
    ['proj_quarrel', 11, 5],
  ] as const) {
    it(`${id} is registered with a ${w}x${h} flying frame`, () => {
      const info = spriteInfo(id);
      expect([info.w, info.h]).toEqual([w, h]);
      expect(info.anims.fly?.frames).toBeGreaterThanOrEqual(1);
      const b = PROJECTILE_DEFS[id].draw('fly', 0, 'right');
      expect([b.w, b.h]).toEqual([w, h]);
      const px = opaque(b.d);
      expect(px.length).toBeGreaterThan(15);
      expect(px.some((c) => c.toLowerCase().startsWith(MISSING))).toBe(false);
    });
  }
});
