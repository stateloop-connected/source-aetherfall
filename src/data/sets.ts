/**
 * Item sets (Diablo 3 style): named pieces that grant bonuses when worn together.
 * Stat bonuses are applied in computeHeroStats; powers are checked in combat.
 */
import type { WeaponKind } from '../art/pixel/types';
import type { ArmorType, DamageElement, GearSlot, SetId, Stats } from '../game/types';
import type { PassiveEffects } from './skills';

/** Set powers with special mechanics (see World). */
export type SetPower =
  | 'warden_quake'
  | 'whisper_ambush'
  | 'archmage_nova'
  | 'storm_strike'
  | 'ember_heart'
  | 'venom_plague'
  | 'frost_shatter'
  | 'deadeye_volley';

export interface SetPiece {
  slot: GearSlot;
  name: string;
  kind?: WeaponKind;
  armorType?: ArmorType;
}

export interface SetBonus {
  /** Pieces needed. */
  pieces: number;
  stats?: Partial<Stats>;
  passives?: Partial<PassiveEffects>;
  power?: SetPower;
  desc: string;
}

export interface SetDef {
  id: SetId;
  name: string;
  /** Element of the set's weapon (converted like other elemental weapons). */
  element?: DamageElement;
  pieces: readonly SetPiece[];
  bonuses: readonly SetBonus[];
}

export const SETS: Record<SetId, SetDef> = {
  warden: {
    id: 'warden',
    name: 'Warden of the Mountain',
    pieces: [
      { slot: 'weapon', kind: 'greatsword', name: "Warden's Oath" },
      { slot: 'helm', armorType: 'plate', name: "Warden's Greathelm" },
      { slot: 'armor', armorType: 'plate', name: "Warden's Bulwark" },
      { slot: 'gloves', armorType: 'plate', name: "Warden's Grasp" },
      { slot: 'boots', armorType: 'plate', name: "Warden's Stride" },
    ],
    bonuses: [
      { pieces: 2, passives: { hpPct: 0.2 }, desc: '+20% Max HP' },
      { pieces: 3, passives: { damageReduction: 0.1 }, desc: 'Take 10% less damage' },
      {
        pieces: 5,
        power: 'warden_quake',
        desc: 'Combo finishers split the earth for 250% ATK, and being hit releases a shockwave (3s cooldown).',
      },
    ],
  },
  whisperwind: {
    id: 'whisperwind',
    name: 'Whisperwind Regalia',
    pieces: [
      { slot: 'weapon', kind: 'dagger', name: 'Whisperwind Edge' },
      { slot: 'helm', armorType: 'leather', name: 'Whisperwind Mask' },
      { slot: 'armor', armorType: 'leather', name: 'Whisperwind Jerkin' },
      { slot: 'gloves', armorType: 'leather', name: 'Whisperwind Grips' },
      { slot: 'boots', armorType: 'leather', name: 'Whisperwind Treads' },
    ],
    bonuses: [
      { pieces: 2, stats: { atkSpeed: 0.1, moveSpeed: 0.06 }, desc: '+10% Attack Speed, +6% Move Speed' },
      { pieces: 3, stats: { crit: 0.08 }, desc: '+8% Crit Chance' },
      {
        pieces: 5,
        power: 'whisper_ambush',
        desc: 'After a dodge roll, your next 3 hits are critical and deal 60% more damage.',
      },
    ],
  },
  archmage: {
    id: 'archmage',
    name: 'Vestments of the Archmage',
    pieces: [
      { slot: 'weapon', kind: 'staff', name: "Archmage's Focus" },
      { slot: 'helm', armorType: 'cloth', name: "Archmage's Cowl" },
      { slot: 'armor', armorType: 'cloth', name: "Archmage's Robe" },
      { slot: 'gloves', armorType: 'cloth', name: "Archmage's Wraps" },
      { slot: 'boots', armorType: 'cloth', name: "Archmage's Slippers" },
    ],
    bonuses: [
      { pieces: 2, passives: { magPct: 0.2 }, desc: '+20% Magic' },
      { pieces: 3, stats: { skillDmg: 0.25, cdr: 0.1 }, desc: '+25% Skill Damage, +10% Cooldown Reduction' },
      {
        pieces: 5,
        power: 'archmage_nova',
        desc: 'Casting a skill releases an arcane nova for 200% MAG around you. Skills cost 30% less MP.',
      },
    ],
  },
  stormlord: {
    id: 'stormlord',
    name: "Stormlord's Mantle",
    element: 'lightning',
    pieces: [
      { slot: 'weapon', kind: 'sword', name: "Stormlord's Brand" },
      { slot: 'helm', armorType: 'mail', name: "Stormlord's Crown" },
      { slot: 'armor', armorType: 'mail', name: "Stormlord's Hauberk" },
      { slot: 'amulet', name: "Stormlord's Torc" },
    ],
    bonuses: [
      { pieces: 2, stats: { elemDmg: 0.2 }, desc: '+20% Elemental Damage' },
      {
        pieces: 4,
        power: 'storm_strike',
        desc: 'Hits have a 20% chance to call lightning on the target and 2 nearby enemies for 150% damage.',
      },
    ],
  },
  emberforged: {
    id: 'emberforged',
    name: 'Emberforged Legacy',
    element: 'fire',
    pieces: [
      { slot: 'weapon', kind: 'greatsword', name: 'Emberforged Maul' },
      { slot: 'armor', armorType: 'plate', name: 'Emberforged Plate' },
      { slot: 'belt', armorType: 'plate', name: 'Emberforged Girdle' },
      { slot: 'ring', name: 'Emberforged Signet' },
    ],
    bonuses: [
      { pieces: 2, stats: { burnChance: 0.15 }, desc: '+15% Burn Chance' },
      {
        pieces: 4,
        power: 'ember_heart',
        desc: 'Burning enemies take 30% more damage from you and explode when they die (100% ATK).',
      },
    ],
  },
  venomcaller: {
    id: 'venomcaller',
    name: "Venomcaller's Embrace",
    element: 'poison',
    pieces: [
      { slot: 'weapon', kind: 'bow', name: "Venomcaller's Recurve" },
      { slot: 'gloves', armorType: 'leather', name: "Venomcaller's Gloves" },
      { slot: 'belt', armorType: 'leather', name: "Venomcaller's Belt" },
      { slot: 'ring', name: "Venomcaller's Coil" },
    ],
    bonuses: [
      { pieces: 2, stats: { atkSpeed: 0.08, elemDmg: 0.1 }, desc: '+8% Attack Speed, +10% Elemental Damage' },
      {
        pieces: 4,
        power: 'venom_plague',
        desc: 'Poison stacks up to 5 times, deals double damage and spreads to nearby enemies when its victim dies.',
      },
    ],
  },
  frostbound: {
    id: 'frostbound',
    name: 'Frostbound Aegis',
    element: 'ice',
    pieces: [
      { slot: 'weapon', kind: 'crossbow', name: 'Frostbound Arbalest' },
      { slot: 'helm', armorType: 'mail', name: 'Frostbound Helm' },
      { slot: 'gloves', armorType: 'mail', name: 'Frostbound Gauntlets' },
      { slot: 'belt', armorType: 'mail', name: 'Frostbound Belt' },
    ],
    bonuses: [
      {
        pieces: 2,
        passives: { freezeDur: 0.3, defPct: 0.1 },
        desc: '+30% chill and freeze duration, +10% Defense',
      },
      {
        pieces: 4,
        power: 'frost_shatter',
        desc: 'Chilled and frozen enemies take 40% more damage; frozen ones shatter for 150% damage around them when slain.',
      },
    ],
  },
  deadeye: {
    id: 'deadeye',
    name: "Deadeye's Quarry",
    pieces: [
      { slot: 'weapon', kind: 'bow', name: "Deadeye's Longbow" },
      { slot: 'helm', armorType: 'leather', name: "Deadeye's Hood" },
      { slot: 'gloves', armorType: 'leather', name: "Deadeye's Bracers" },
      { slot: 'boots', armorType: 'leather', name: "Deadeye's Boots" },
      { slot: 'belt', armorType: 'leather', name: "Deadeye's Quiver" },
    ],
    bonuses: [
      { pieces: 2, stats: { crit: 0.06, moveSpeed: 0.05 }, desc: '+6% Crit Chance, +5% Move Speed' },
      { pieces: 3, stats: { critDmg: 0.4 }, desc: '+40% Crit Damage' },
      {
        pieces: 5,
        power: 'deadeye_volley',
        desc: 'Every shot fires 2 extra arrows, and your volley finisher pierces.',
      },
    ],
  },
};

export const SET_IDS = Object.keys(SETS) as SetId[];

/** Set pieces worn, counting each named piece once. */
export function setPieceCounts(items: readonly ({ set?: SetId; name: string } | null)[]): Map<SetId, number> {
  const seen = new Map<SetId, Set<string>>();
  for (const it of items) {
    if (!it?.set) continue;
    let names = seen.get(it.set);
    if (!names) seen.set(it.set, (names = new Set()));
    names.add(SETS[it.set].pieces.find((p) => it.name.startsWith(p.name))?.name ?? it.name);
  }
  return new Map([...seen].map(([id, names]) => [id, names.size]));
}
