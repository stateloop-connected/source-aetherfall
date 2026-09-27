/**
 * Armor types (Diablo style). Helms, chest armor, gloves, boots and belts come in cloth,
 * leather, mail or plate. Mail is the old baseline. Cloth gives up most of its armor and
 * health for Magic; leather trades some for speed and crits; plate is the toughest.
 */
import type { ArmorSlot, ArmorType, StatKey, Stats } from '../game/types';

export interface ArmorTypeDef {
  label: string;
  desc: string;
  /** Multipliers on the slot's implicit Defense and Max HP. */
  def: number;
  hp: number;
  /** Extra implicit stats per slot at an item level. */
  extra: (slot: ArmorSlot, ilvl: number) => Partial<Stats>;
  /** Affix weight multipliers (0 removes the affix); stats listed here can also roll on every slot of this type. */
  affixWeights: Partial<Record<StatKey, number>>;
  /** Base names per tier. */
  materials: readonly string[];
  nouns: Record<ArmorSlot, string>;
}

export const ARMOR: Record<ArmorType, ArmorTypeDef> = {
  cloth: {
    label: 'Cloth',
    desc: 'Mage gear: high Magic, very little armor or health.',
    def: 0.3,
    hp: 0.55,
    extra: (slot, l) => {
      switch (slot) {
        case 'helm':
          return { mag: 1 + 0.7 * l, maxMp: 3 + 0.8 * l };
        case 'armor':
          return { mag: 2 + 1.3 * l, maxMp: 5 + 1.2 * l };
        case 'gloves':
          return { mag: 0.5 + 0.5 * l };
        case 'boots':
          return { mag: 0.5 + 0.35 * l, moveSpeed: 0.04 };
        case 'belt':
          return { mag: 0.5 + 0.35 * l, mpRegen: 0.3 + 0.03 * l };
      }
    },
    affixWeights: { mag: 2.5, skillDmg: 2, cdr: 1.5, maxMp: 1.5, mpRegen: 1.5, def: 0.3, atk: 0.3 },
    materials: ['Linen', 'Woolen', 'Silken', 'Starweave', 'Emberweave', 'Aetherweave'],
    nouns: { helm: 'Hood', armor: 'Robe', gloves: 'Wraps', boots: 'Slippers', belt: 'Sash' },
  },
  leather: {
    label: 'Leather',
    desc: 'Light gear: less armor, more speed and critical hits.',
    def: 0.7,
    hp: 0.85,
    extra: (slot) => {
      switch (slot) {
        case 'helm':
          return { crit: 0.02 };
        case 'armor':
          return { dodgeCost: 0.06, atkSpeed: 0.03 };
        case 'gloves':
          return { atkSpeed: 0.05 };
        case 'boots':
          return { moveSpeed: 0.06 };
        case 'belt':
          return { dodgeCost: 0.04 };
      }
    },
    affixWeights: { crit: 2, critDmg: 1.5, atkSpeed: 2, moveSpeed: 1.5, lifesteal: 1.5, def: 0.6 },
    materials: ['Rawhide', 'Tanned', 'Studded', 'Crystalhide', 'Drakeskin', 'Aetherhide'],
    nouns: { helm: 'Cap', armor: 'Jerkin', gloves: 'Gloves', boots: 'Boots', belt: 'Belt' },
  },
  mail: {
    label: 'Mail',
    desc: 'Balanced gear: solid armor with a little Attack.',
    def: 1,
    hp: 1,
    extra: () => ({}),
    affixWeights: { atk: 1.5, mag: 0.6 },
    materials: ['Rusted', 'Iron', 'Steel', 'Crystal', 'Ember', 'Aether'],
    nouns: { helm: 'Coif', armor: 'Hauberk', gloves: 'Chain Gloves', boots: 'Chausses', belt: 'Link Belt' },
  },
  plate: {
    label: 'Plate',
    desc: 'Heavy gear: the most armor and health, slower boots, no Magic.',
    def: 1.45,
    hp: 1.3,
    extra: (slot) => (slot === 'boots' ? { moveSpeed: -0.02 } : {}),
    affixWeights: { def: 2, maxHp: 1.6, hpRegen: 1.5, mag: 0, skillDmg: 0.5, moveSpeed: 0.5 },
    materials: ['Bronze', 'Iron', 'Steel', 'Crystal', 'Ember', 'Aether'],
    nouns: {
      helm: 'Greathelm',
      armor: 'Breastplate',
      gloves: 'Gauntlets',
      boots: 'Sabatons',
      belt: 'Girdle',
    },
  },
};

/** How often each type drops. */
export const ARMOR_WEIGHTS: readonly (readonly [ArmorType, number])[] = [
  ['cloth', 2],
  ['leather', 3],
  ['mail', 3],
  ['plate', 2],
];

export const armorName = (type: ArmorType, slot: ArmorSlot, tier: number): string =>
  `${ARMOR[type].materials[Math.max(0, Math.min(5, tier))]} ${ARMOR[type].nouns[slot]}`;
