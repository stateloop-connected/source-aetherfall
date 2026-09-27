/**
 * Damage elements. A weapon can convert part of its physical damage into an element:
 * armor (defense) only blunts the physical part, while each element has an on-hit
 * effect and meets resistances and weaknesses on monsters of an element.
 */
import type { IconId } from '../art/pixel/types';
import type { DamageElement, Element } from '../game/types';
import type { EnemyDef } from './enemies';

export interface ElementInfo {
  label: string;
  icon: IconId;
  /** What the element does on hit (character sheet). */
  effect: string;
  /** The same, in a few words (item tooltips). */
  brief: string;
}

export const ELEMENTS: Record<Element, ElementInfo> = {
  physical: {
    label: 'Physical',
    icon: 'icon_elem_physical',
    effect: 'Reduced by armor.',
    brief: 'armor blocks it',
  },
  fire: {
    label: 'Fire',
    icon: 'icon_elem_fire',
    effect: '25% chance to burn for 40% of the fire damage per second for 3s.',
    brief: 'may burn; armor blocks less',
  },
  ice: {
    label: 'Ice',
    icon: 'icon_elem_ice',
    effect: 'Chills (30% slower) for 2s, 10% chance to freeze for 1s.',
    brief: 'chills, may freeze; armor blocks less',
  },
  lightning: {
    label: 'Lightning',
    icon: 'icon_elem_lightning',
    effect: '20% chance to arc to 2 nearby enemies for half the damage.',
    brief: 'may arc to 2 more; armor blocks less',
  },
  poison: {
    label: 'Poison',
    icon: 'icon_elem_poison',
    effect: 'Poisons for 60% of the poison damage over 3s. Stacks up to 3 times.',
    brief: 'stacking poison; armor blocks less',
  },
};

/** Chance for fire to burn, ice to freeze and lightning to arc. */
export const BURN_CHANCE = 0.25;
export const FREEZE_CHANCE = 0.1;
export const ARC_CHANCE = 0.2;
/** Poison stacks: the poison's strength can build to this many applications. */
export const POISON_STACKS = 3;

/** Elemental damage ignores this much of the armor that blunts physical damage. */
export const ELEMENT_ARMOR_PIERCE = 0.5;

type MonsterElement = NonNullable<EnemyDef['element']>;

/** Monster resistances (below 1) and weaknesses (above 1) to elemental damage, by the monster's element. */
export const MONSTER_RESIST: Record<MonsterElement, Partial<Record<DamageElement, number>>> = {
  fire: { fire: 0.5, ice: 1.3 },
  ice: { ice: 0.5, fire: 1.3 },
  nature: { poison: 0.5, fire: 1.3 },
  earth: { lightning: 0.6, ice: 1.2, poison: 1.2 },
  void: { poison: 0.6, lightning: 1.25 },
};

export function resistMult(monster: EnemyDef['element'], el: DamageElement): number {
  return monster ? (MONSTER_RESIST[monster][el] ?? 1) : 1;
}

/** Weapon conversion range by rarity index (common … abyssal). */
export const CONVERSION: readonly (readonly [number, number])[] = [
  [0.2, 0.3],
  [0.25, 0.35],
  [0.3, 0.45],
  [0.35, 0.5],
  [0.4, 0.55],
  [0.45, 0.6],
  [0.45, 0.6],
];

/** Chance a dropped weapon is elemental, by rarity index. */
export const ELEMENT_CHANCE: readonly number[] = [0.15, 0.3, 0.45, 0.6, 0.6, 0.6, 0.7];
