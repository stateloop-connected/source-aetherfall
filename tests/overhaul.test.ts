import { describe, expect, it } from 'vitest';
import { ARMOR } from '../src/data/armor';
import { CONVERSION, resistMult } from '../src/data/elements';
import { LEGENDARIES, WEAPON_FEEL } from '../src/data/items';
import { RECIPES } from '../src/data/recipes';
import { SETS, SET_IDS } from '../src/data/sets';
import { SKILLS, skillMult } from '../src/data/skills';
import { ZONES } from '../src/data/zones';
import { RNG } from '../src/engine/rng';
import { computeDamage, DIFFICULTY, SURGE } from '../src/game/balance';
import { craft, imbueTargets } from '../src/game/crafting';
import { generateItem, generateSetItem, RARITY_INDEX, weaponElement } from '../src/game/items';
import { migrate, newGame } from '../src/game/state';
import { computeHeroStats, deriveStats } from '../src/game/stats';
import { ARMOR_SLOTS, isArmorSlot, type ArmorType, type Item } from '../src/game/types';
import { generateZone } from '../src/world/mapgen';

const hit = (elemFrac: number, elemMult = 1): number =>
  computeDamage({
    power: 100,
    mult: 1,
    attackerLevel: 20,
    defenderLevel: 20,
    defenderDef: 200,
    critChance: 0,
    critDmg: 0,
    rollCrit: 1,
    rollVar: 0.5,
    elemFrac,
    elemMult,
    elemPierce: 0.5,
  }).amount;

describe('elements', () => {
  it('armor blocks elemental damage less, and resistances cut it', () => {
    expect(hit(1)).toBeGreaterThan(hit(0));
    expect(hit(0.4)).toBeGreaterThan(hit(0));
    expect(hit(1, 0.5)).toBeLessThan(hit(1));
    expect(hit(1, 1.3)).toBeGreaterThan(hit(1));
  });

  it('monsters resist their own element and fear the opposite one', () => {
    expect(resistMult('fire', 'fire')).toBeLessThan(1);
    expect(resistMult('fire', 'ice')).toBeGreaterThan(1);
    expect(resistMult('ice', 'fire')).toBeGreaterThan(1);
    expect(resistMult('nature', 'poison')).toBeLessThan(1);
    expect(resistMult(undefined, 'lightning')).toBe(1);
  });

  it('elemental weapons convert a share that grows with rarity', () => {
    const rng = new RNG('elem');
    let elemental = 0;
    for (let i = 0; i < 400; i++) {
      const it = generateItem(rng, 20, { slot: 'weapon', rarity: 'epic' });
      const e = weaponElement(it);
      if (!e) continue;
      elemental++;
      const [lo, hi] = CONVERSION[RARITY_INDEX.epic];
      expect(e.conv).toBeGreaterThanOrEqual(lo - 1e-9);
      expect(e.conv).toBeLessThanOrEqual(hi + 1e-9);
    }
    expect(elemental).toBeGreaterThan(150);
    expect(elemental).toBeLessThan(350);
  });

  it('every spell has an element', () => {
    for (const id of ['fireball', 'frostnova', 'lightning', 'meteor', 'blizzard'] as const)
      expect(SKILLS[id].element).toBeDefined();
  });

  it('the forge can imbue ordinary weapons, but not legendary or set ones', () => {
    const s = newGame(0, 'Kai', 'normal');
    const rng = new RNG('imbue');
    const plain = generateItem(rng, 10, { slot: 'weapon', rarity: 'rare' });
    const legend = generateItem(rng, 10, { legendary: 'frostreaver' });
    s.inventory.push(plain, legend);
    expect(imbueTargets(s)).toContain(plain);
    expect(imbueTargets(s)).not.toContain(legend);
    s.hero.gold = 1e6;
    s.materials = { ember: 10, crystal: 10 };
    const recipe = RECIPES.find((r) => r.id === 'forge_imbue_fire')!;
    expect(craft(s, recipe, rng, plain)?.kind).toBe('imbue');
    expect(weaponElement(plain)).toEqual({ element: 'fire', conv: Math.max(0.4, plain.elemConv!) });
  });
});

describe('armor types', () => {
  const piece = (type: ArmorType): Item =>
    generateItem(new RNG(`armor-${type}`), 30, { slot: 'armor', rarity: 'rare', armorType: type });

  it('only armor slots have a type', () => {
    const rng = new RNG('types');
    for (let i = 0; i < 300; i++) {
      const it = generateItem(rng, 15);
      expect(!!it.armorType).toBe(isArmorSlot(it.slot));
    }
  });

  it('cloth trades defense and health for Magic, plate is the toughest', () => {
    const cloth = piece('cloth');
    const mail = piece('mail');
    const plate = piece('plate');
    expect(cloth.base.mag).toBeGreaterThan(0);
    expect(plate.base.mag ?? 0).toBe(0);
    expect(cloth.base.def!).toBeLessThan(mail.base.def!);
    expect(mail.base.def!).toBeLessThan(plate.base.def!);
    expect(cloth.base.maxHp!).toBeLessThan(plate.base.maxHp!);
    expect(cloth.name).toContain(ARMOR.cloth.nouns.armor);
  });

  it('a full cloth outfit makes a mage much stronger and much frailer than plate', () => {
    const dress = (type: ArmorType) => {
      const s = newGame(0, 'Kai', 'normal');
      s.hero.level = 30;
      const rng = new RNG(`outfit-${type}`);
      for (const slot of ARMOR_SLOTS)
        s.equipment[slot] = generateItem(rng, 30, { slot, rarity: 'rare', armorType: type });
      s.equipment.weapon = generateItem(rng, 30, { slot: 'weapon', kind: 'staff', rarity: 'rare' });
      const st = computeHeroStats(s);
      return { st, d: deriveStats(30, st, 'staff') };
    };
    const cloth = dress('cloth');
    const plate = dress('plate');
    expect(cloth.st.mag).toBeGreaterThan(plate.st.mag * 1.4);
    expect(cloth.d.toughness).toBeLessThan(plate.d.toughness * 0.7);
  });
});

describe('item sets', () => {
  it('every piece can drop, and matches its set', () => {
    const rng = new RNG('sets');
    for (const id of SET_IDS)
      for (const p of SETS[id].pieces) {
        const it = generateSetItem(rng, 25, { set: id, slot: p.slot })!;
        expect(it.rarity).toBe('set');
        expect(it.set).toBe(id);
        expect(it.slot).toBe(p.slot);
        if (p.slot === 'weapon') expect(it.kind).toBe(p.kind);
        expect(it.armorType).toBe(p.armorType);
      }
  });

  it('bonuses grow with the pieces worn', () => {
    const s = newGame(0, 'Kai', 'normal');
    s.hero.level = 30;
    const rng = new RNG('warden');
    const base = computeHeroStats(s);
    for (const p of SETS.warden.pieces.slice(0, 3))
      s.equipment[p.slot === 'ring' ? 'ring1' : (p.slot as 'helm')] = generateSetItem(rng, 30, {
        set: 'warden',
        slot: p.slot,
      });
    const three = computeHeroStats(s);
    expect(three.setCounts.get('warden')).toBe(3);
    expect(three.damageTaken).toBeLessThan(base.damageTaken);
    expect(three.setPowers.has('warden_quake')).toBe(false);
    for (const p of SETS.warden.pieces)
      s.equipment[p.slot as 'helm'] = generateSetItem(rng, 30, { set: 'warden', slot: p.slot });
    expect(computeHeroStats(s).setPowers.has('warden_quake')).toBe(true);
  });

  it('bonus thresholds fit the set', () => {
    for (const id of SET_IDS) {
      const set = SETS[id];
      expect(set.bonuses.at(-1)!.pieces).toBe(set.pieces.length);
      expect(set.bonuses.at(-1)!.power).toBeDefined();
      expect(new Set(set.pieces.map((p) => p.slot)).size).toBe(set.pieces.length);
    }
  });
});

describe('legendaries', () => {
  it('has plenty of variety, and every one generates', () => {
    expect(LEGENDARIES.length).toBeGreaterThanOrEqual(30);
    const rng = new RNG('leg');
    for (const def of LEGENDARIES) {
      const it = generateItem(rng, 30, { legendary: def.id });
      expect(it.legendary).toBe(def.id);
      expect(it.slot).toBe(def.slot);
      if (def.slot === 'weapon') expect(it.kind).toBe(def.kind);
      if (isArmorSlot(def.slot)) expect(it.armorType).toBeDefined();
      if (def.element) expect(weaponElement(it)?.element).toBe(def.element);
    }
    for (const kind of ['bow', 'crossbow'] as const)
      expect(LEGENDARIES.filter((l) => l.kind === kind).length).toBeGreaterThanOrEqual(2);
  });
});

describe('weapon balance', () => {
  const dps = (kind: 'sword' | 'staff' | 'bow' | 'crossbow' | 'greatsword' | 'dagger'): number => {
    const s = newGame(0, 'Kai', 'normal');
    s.hero.level = 30;
    s.equipment.weapon = {
      ...generateItem(new RNG(kind), 30, { slot: 'weapon', kind, rarity: 'rare' }),
      affixes: [],
    };
    delete s.equipment.weapon.element;
    return deriveStats(30, computeHeroStats(s), kind).dps;
  };

  it('ranged weapons deal less than melee, and the staff is no longer the best', () => {
    const sword = dps('sword');
    for (const k of ['staff', 'bow', 'crossbow'] as const) {
      expect(WEAPON_FEEL[k].ranged).toBe(true);
      expect(dps(k)).toBeLessThan(sword * 0.85);
    }
    expect(dps('staff')).toBeLessThan(dps('greatsword'));
    expect(dps('staff')).toBeLessThan(dps('dagger'));
  });
});

describe('skills and the Surge', () => {
  // sword basic attack: about 3.7x Attack per second at rank-free baseline
  const basicPerSec = 3.6 / 0.98;

  it('damaging skills are worth using over their cooldown', () => {
    const hits: Partial<Record<keyof typeof SKILLS, number>> = {
      whirlwind: 4,
      earthshatter: 6,
      blizzard: 8,
      blades: 8,
    };
    for (const def of Object.values(SKILLS)) {
      if (def.scaling === 'none') continue;
      const total = skillMult(def, 1) * (hits[def.id] ?? 1);
      // at least a fifth of your basic-attack damage over the cooldown, as burst
      expect(total, def.id).toBeGreaterThan(basicPerSec * def.cooldown * 0.2);
      expect(total, def.id).toBeGreaterThan(1.5 * WEAPON_FEEL.sword.dmg * 1.5);
    }
  });

  it('the Surge beam hits at least three times harder than before', () => {
    const old = (5 + 5 * 1.2) * 1.3;
    expect((SURGE.beam + 5 * SURGE.perShard) * 1.3).toBeGreaterThan(old * 3);
  });
});

describe('difficulty', () => {
  const order = ['story', 'normal', 'hard', 'nightmare'] as const;
  it('harder settings bring bigger packs and tougher monsters', () => {
    for (let i = 1; i < order.length; i++) {
      const a = DIFFICULTY[order[i - 1]];
      const b = DIFFICULTY[order[i]];
      expect(b.spawnMult).toBeGreaterThan(a.spawnMult);
      expect(b.enemyHp).toBeGreaterThan(a.enemyHp);
      expect(b.enemyDmg).toBeGreaterThan(a.enemyDmg);
    }
  });

  it('XP is scarce on every difficulty', () => {
    for (const d of order) expect(DIFFICULTY[d].xpMult).toBeLessThanOrEqual(0.6);
    expect(DIFFICULTY.nightmare.xpMult).toBeLessThan(DIFFICULTY.normal.xpMult);
  });
});

describe('zone layouts', () => {
  it('layouts differ from each other', () => {
    const a = generateZone(ZONES.forest, 0);
    const b = generateZone(ZONES.forest, 1);
    expect(Array.from(a.cells)).not.toEqual(Array.from(b.cells));
  });

  it('zones are bigger than before', () => {
    for (const z of Object.values(ZONES)) expect(z.w * z.h).toBeGreaterThan(10000);
  });

  it('v7 saves get layouts and forget exploration of the old zone maps', () => {
    const old = JSON.parse(JSON.stringify(newGame(0, 'Old', 'normal'))) as Record<string, unknown>;
    old.version = 7;
    delete old.layouts;
    old.explored = { forest: 'abc', town: 'def' };
    const s = migrate(old)!;
    expect(s.layouts).toEqual({});
    expect(s.explored).toEqual({ town: 'def' });
  });
});
