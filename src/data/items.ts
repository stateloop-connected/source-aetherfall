/** Static item data: base types, affix pools, legendary uniques, consumables and materials. */
import type { IconId, WeaponKind } from '../art/pixel/types';
import type {
  ArmorType,
  ConsumableDef,
  ConsumableId,
  DamageElement,
  LegendaryId,
  MaterialDef,
  MaterialId,
  Slot,
  StatKey,
  Stats,
} from '../game/types';

export const TIER_NAMES: Record<Slot | WeaponKind, readonly string[]> = {
  weapon: ['Blade', 'Blade', 'Blade', 'Blade', 'Blade', 'Blade'],
  sword: ['Rusty Blade', 'Iron Sword', 'Steel Sword', 'Crystal Edge', 'Emberbrand', 'Aetherblade'],
  greatsword: [
    'Heavy Cleaver',
    'Iron Greatsword',
    'Steel Zweihander',
    'Crystal Greatblade',
    'Inferno Claymore',
    'Aether Colossus',
  ],
  dagger: ['Chipped Knife', 'Iron Dagger', 'Steel Stiletto', 'Crystal Fang', 'Ember Kris', 'Aether Needle'],
  staff: ['Oak Staff', 'Iron Rod', 'Mage Staff', 'Crystal Scepter', 'Ember Staff', 'Aether Stave'],
  bow: ['Hunting Bow', 'Ash Longbow', 'Steel Recurve', 'Crystal Warbow', 'Ember Longbow', 'Aether Bow'],
  crossbow: [
    'Rusty Crossbow',
    'Iron Crossbow',
    'Steel Arbalest',
    'Crystal Repeater',
    'Ember Arbalest',
    'Aether Ballista',
  ],
  helm: ['Leather Cap', 'Iron Helm', 'Steel Visor', 'Crystal Circlet', 'Ember Crown', 'Aether Diadem'],
  armor: ['Padded Vest', 'Chainmail', 'Steel Plate', 'Crystal Mail', 'Ember Plate', 'Aether Raiment'],
  boots: ['Sandals', 'Iron Boots', 'Steel Greaves', 'Crystal Treads', 'Ember Striders', 'Aether Walkers'],
  ring: ['Copper Ring', 'Iron Band', 'Silver Ring', 'Crystal Ring', 'Ember Signet', 'Aether Loop'],
  gloves: [
    'Leather Gloves',
    'Iron Gauntlets',
    'Steel Gauntlets',
    'Crystal Grips',
    'Ember Fists',
    'Aether Gauntlets',
  ],
  belt: ['Rope Belt', 'Leather Belt', 'Iron Girdle', 'Crystal Sash', 'Ember Cinch', 'Aether Girdle'],
  charm: ['Charm', 'Charm', 'Charm', 'Charm', 'Charm', 'Charm'],
  amulet: [
    'Wooden Charm',
    'Iron Pendant',
    'Silver Amulet',
    'Crystal Locket',
    'Ember Talisman',
    'Aether Heart',
  ],
};

export const SLOT_ICON: Record<Slot | WeaponKind, IconId> = {
  weapon: 'icon_sword',
  sword: 'icon_sword',
  greatsword: 'icon_greatsword',
  dagger: 'icon_dagger',
  staff: 'icon_staff',
  bow: 'icon_bow',
  crossbow: 'icon_crossbow',
  helm: 'icon_helm',
  armor: 'icon_armor',
  boots: 'icon_boots',
  ring: 'icon_ring',
  amulet: 'icon_amulet',
  gloves: 'icon_gloves',
  belt: 'icon_belt',
  charm: 'icon_charm_small',
};

export const SLOT_LABEL: Record<Slot, string> = {
  weapon: 'Weapon',
  helm: 'Helm',
  armor: 'Armor',
  boots: 'Boots',
  ring: 'Ring',
  amulet: 'Amulet',
  gloves: 'Gloves',
  belt: 'Belt',
  charm: 'Charm',
};

export const WEAPON_LABEL: Record<WeaponKind, string> = {
  sword: 'Sword',
  greatsword: 'Greatsword',
  dagger: 'Dagger',
  staff: 'Staff',
  bow: 'Bow',
  crossbow: 'Crossbow',
};

export const WEAPON_KINDS: readonly WeaponKind[] = [
  'sword',
  'greatsword',
  'dagger',
  'staff',
  'bow',
  'crossbow',
];

/** Per-weapon combat feel. Timings are in seconds (before attack speed). */
export interface WeaponFeel {
  range: number;
  arc: number; // full arc in radians
  windup: number;
  active: number;
  recover: number;
  dmg: number; // combo hit multiplier
  knockback: number;
  lunge: number;
  ranged: boolean;
  /** The stat the weapon's hits scale with. */
  stat: 'atk' | 'mag';
  desc: string;
}

export const WEAPON_FEEL: Record<WeaponKind, WeaponFeel> = {
  sword: {
    range: 26,
    arc: 2.4,
    windup: 0.05,
    active: 0.09,
    recover: 0.16,
    dmg: 1,
    knockback: 90,
    lunge: 40,
    ranged: false,
    stat: 'atk',
    desc: 'Balanced reach and speed.',
  },
  greatsword: {
    range: 34,
    arc: 3.0,
    windup: 0.12,
    active: 0.12,
    recover: 0.28,
    dmg: 1.55,
    knockback: 170,
    lunge: 30,
    ranged: false,
    stat: 'atk',
    desc: 'Slow, wide, devastating swings.',
  },
  dagger: {
    range: 20,
    arc: 1.8,
    windup: 0.03,
    active: 0.06,
    recover: 0.09,
    dmg: 0.62,
    knockback: 50,
    lunge: 55,
    ranged: false,
    stat: 'atk',
    desc: 'Lightning-fast stabs. High crit.',
  },
  staff: {
    range: 140,
    arc: 0,
    windup: 0.1,
    active: 0.05,
    recover: 0.25,
    dmg: 0.8,
    knockback: 50,
    lunge: 0,
    ranged: true,
    stat: 'mag',
    desc: 'Fires magic bolts scaling with Magic. Mages lean on their skills.',
  },
  bow: {
    range: 160,
    arc: 0,
    windup: 0.06,
    active: 0.04,
    recover: 0.2,
    dmg: 0.75,
    knockback: 40,
    lunge: 0,
    ranged: true,
    stat: 'atk',
    desc: 'Quick arrows scaling with Attack. The finisher looses a volley.',
  },
  crossbow: {
    range: 170,
    arc: 0,
    windup: 0.15,
    active: 0.05,
    recover: 0.35,
    dmg: 1.35,
    knockback: 90,
    lunge: 0,
    ranged: true,
    stat: 'atk',
    desc: 'Slow, heavy bolts that pierce, scaling with Attack.',
  },
};

/** Implicit base stats for a slot at an item level (before rarity/upgrade multipliers). */
export function slotBaseStats(slot: Slot, kind: WeaponKind | undefined, ilvl: number): Partial<Stats> {
  const w = 5 + 2.4 * ilvl;
  switch (slot) {
    case 'weapon':
      switch (kind ?? 'sword') {
        case 'sword':
          return { atk: w };
        case 'greatsword':
          return { atk: w * 1.5 };
        case 'dagger':
          return { atk: w * 0.75, crit: 0.06 };
        case 'staff':
          return { atk: w * 0.3, mag: w * 1.2 };
        case 'bow':
          return { atk: w };
        case 'crossbow':
          return { atk: w * 1.1 };
      }
      break;
    case 'helm':
      return { def: 2 + 0.8 * ilvl, maxHp: 4 + 2 * ilvl };
    case 'armor':
      return { def: 4 + 1.6 * ilvl, maxHp: 8 + 4 * ilvl };
    case 'boots':
      return { def: 1.5 + 0.6 * ilvl, moveSpeed: 0.04 };
    case 'ring':
      return { atk: 1 + 0.6 * ilvl };
    case 'amulet':
      return { maxMp: 5 + 1.5 * ilvl, mag: 1 + 0.6 * ilvl };
    case 'gloves':
      return { def: 1 + 0.5 * ilvl, atk: 0.5 + 0.4 * ilvl };
    case 'belt':
      return { def: 1 + 0.5 * ilvl, maxHp: 6 + 3 * ilvl };
    case 'charm':
      return {};
  }
  return {};
}

export interface AffixDef {
  stat: StatKey;
  slots: readonly Slot[];
  weight: number;
  min: (ilvl: number) => number;
  max: (ilvl: number) => number;
  prefix: string;
  suffix: string;
}

const flat =
  (a: number, b: number) =>
  (ilvl: number): number =>
    a + b * ilvl;
const fixed = (v: number) => (): number => v;

export const AFFIXES: readonly AffixDef[] = [
  {
    stat: 'atk',
    slots: ['weapon', 'ring', 'amulet', 'helm', 'gloves'],
    weight: 10,
    min: flat(1, 0.5),
    max: flat(2, 1),
    prefix: 'Vicious',
    suffix: 'of Might',
  },
  {
    stat: 'mag',
    slots: ['weapon', 'ring', 'amulet', 'helm'],
    weight: 10,
    min: flat(1, 0.5),
    max: flat(2, 1),
    prefix: 'Arcane',
    suffix: 'of the Magi',
  },
  {
    stat: 'def',
    slots: ['armor', 'helm', 'boots', 'ring', 'gloves', 'belt'],
    weight: 10,
    min: flat(1, 0.4),
    max: flat(2, 0.8),
    prefix: 'Sturdy',
    suffix: 'of the Bulwark',
  },
  {
    stat: 'maxHp',
    slots: ['weapon', 'helm', 'armor', 'boots', 'ring', 'amulet', 'gloves', 'belt'],
    weight: 12,
    min: flat(5, 3),
    max: flat(10, 6),
    prefix: 'Hale',
    suffix: 'of Vigor',
  },
  {
    stat: 'maxMp',
    slots: ['helm', 'amulet', 'ring', 'weapon', 'belt'],
    weight: 7,
    min: flat(3, 1),
    max: flat(6, 2),
    prefix: 'Mystic',
    suffix: 'of Insight',
  },
  {
    stat: 'crit',
    slots: ['weapon', 'ring', 'amulet', 'helm', 'gloves'],
    weight: 7,
    min: fixed(0.02),
    max: fixed(0.06),
    prefix: 'Keen',
    suffix: 'of Precision',
  },
  {
    stat: 'critDmg',
    slots: ['weapon', 'amulet', 'ring', 'gloves'],
    weight: 6,
    min: fixed(0.08),
    max: fixed(0.3),
    prefix: 'Brutal',
    suffix: 'of Slaughter',
  },
  {
    stat: 'atkSpeed',
    slots: ['weapon', 'ring', 'boots', 'gloves'],
    weight: 6,
    min: fixed(0.04),
    max: fixed(0.12),
    prefix: 'Swift',
    suffix: 'of Haste',
  },
  {
    stat: 'moveSpeed',
    slots: ['boots', 'amulet'],
    weight: 5,
    min: fixed(0.03),
    max: fixed(0.08),
    prefix: 'Fleet',
    suffix: 'of the Wind',
  },
  {
    stat: 'lifesteal',
    slots: ['weapon', 'ring', 'amulet', 'gloves'],
    weight: 4,
    min: fixed(0.01),
    max: fixed(0.03),
    prefix: 'Vampiric',
    suffix: 'of the Leech',
  },
  {
    stat: 'cdr',
    slots: ['helm', 'amulet', 'ring'],
    weight: 5,
    min: fixed(0.03),
    max: fixed(0.1),
    prefix: 'Focused',
    suffix: 'of Clarity',
  },
  {
    stat: 'goldFind',
    slots: ['ring', 'amulet', 'helm', 'boots', 'belt', 'gloves'],
    weight: 5,
    min: fixed(0.08),
    max: fixed(0.25),
    prefix: 'Gilded',
    suffix: 'of Fortune',
  },
  {
    stat: 'magicFind',
    slots: ['ring', 'amulet', 'helm'],
    weight: 4,
    min: fixed(0.05),
    max: fixed(0.2),
    prefix: 'Lucky',
    suffix: 'of Treasure',
  },
  {
    stat: 'xpBonus',
    slots: ['amulet', 'helm', 'belt'],
    weight: 4,
    min: fixed(0.03),
    max: fixed(0.1),
    prefix: 'Wise',
    suffix: 'of Learning',
  },
  {
    stat: 'hpRegen',
    slots: ['armor', 'amulet', 'ring', 'belt'],
    weight: 6,
    min: flat(0.3, 0.1),
    max: flat(0.6, 0.25),
    prefix: 'Mending',
    suffix: 'of Renewal',
  },
  {
    stat: 'mpRegen',
    slots: ['amulet', 'weapon', 'helm', 'belt'],
    weight: 5,
    min: flat(0.2, 0.05),
    max: flat(0.5, 0.1),
    prefix: 'Flowing',
    suffix: 'of the Spring',
  },
  {
    stat: 'burnChance',
    slots: ['weapon', 'gloves'],
    weight: 3,
    min: fixed(0.04),
    max: fixed(0.12),
    prefix: 'Blazing',
    suffix: 'of Embers',
  },
  {
    stat: 'skillDmg',
    slots: ['amulet', 'helm', 'weapon', 'gloves'],
    weight: 5,
    min: fixed(0.05),
    max: fixed(0.15),
    prefix: 'Empowered',
    suffix: 'of Sorcery',
  },
  {
    stat: 'elemDmg',
    slots: ['weapon', 'ring', 'amulet', 'gloves'],
    weight: 5,
    min: fixed(0.08),
    max: fixed(0.25),
    prefix: 'Prismatic',
    suffix: 'of the Elements',
  },
];

export interface LegendaryDef {
  id: LegendaryId;
  name: string;
  slot: Slot;
  kind?: WeaponKind;
  armorType?: ArmorType;
  /** Weapons: their element and how much damage they convert to it. */
  element?: DamageElement;
  elemConv?: number;
  power: string;
  bonus: Partial<Stats>;
}

export const LEGENDARIES: readonly LegendaryDef[] = [
  {
    id: 'thornfang',
    name: "Thornmaw's Fang",
    slot: 'weapon',
    kind: 'dagger',
    element: 'poison',
    elemConv: 0.4,
    power: 'Hits poison enemies for 40% ATK over 3s.',
    bonus: { crit: 0.05 },
  },
  {
    id: 'mountain_heart',
    name: 'Heart of the Mountain',
    slot: 'armor',
    armorType: 'plate',
    power: '+25% Max HP. Reflects 25% of melee damage taken.',
    bonus: {},
  },
  {
    id: 'dragonbreath',
    name: 'Dragonbreath',
    slot: 'weapon',
    kind: 'sword',
    element: 'fire',
    elemConv: 0.4,
    power: 'Every 3rd combo hit unleashes a wave of fire.',
    bonus: { burnChance: 0.1 },
  },
  {
    id: 'seraphs_tear',
    name: "Seraphine's Tear",
    slot: 'amulet',
    power: 'When hit, release a Frost Nova (8s cooldown).',
    bonus: { maxMp: 20 },
  },
  {
    id: 'hollow_crown',
    name: 'The Hollow Crown',
    slot: 'helm',
    armorType: 'mail',
    power: '+30% damage dealt, but -15% Max HP.',
    bonus: { dmgBonus: 0.3 },
  },
  {
    id: 'windwalkers',
    name: 'Windwalker Treads',
    slot: 'boots',
    armorType: 'leather',
    power: 'Dodge rolls cost 50% less and leave a slashing gust.',
    bonus: { moveSpeed: 0.06 },
  },
  {
    id: 'phoenix_band',
    name: 'Phoenix Band',
    slot: 'ring',
    power: 'Once per area, cheat death and revive with 40% HP.',
    bonus: { hpRegen: 2 },
  },
  {
    id: 'stormcaller',
    name: 'Stormcaller',
    slot: 'weapon',
    kind: 'staff',
    element: 'lightning',
    elemConv: 0.5,
    power: 'Staff bolts chain lightning to 2 nearby enemies.',
    bonus: { mpRegen: 1 },
  },
  {
    id: 'vampire_kiss',
    name: 'Crimson Kiss',
    slot: 'ring',
    power: 'Kills restore 3% Max HP.',
    bonus: { lifesteal: 0.06 },
  },
  {
    id: 'echo_blade',
    name: 'Echo of the First Hero',
    slot: 'weapon',
    kind: 'greatsword',
    power: 'Each swing echoes with a second slash (60% dmg).',
    bonus: { atkSpeed: 0.08 },
  },
  // ---- weapons ----
  {
    id: 'frostreaver',
    name: 'Frostreaver',
    slot: 'weapon',
    kind: 'greatsword',
    element: 'ice',
    elemConv: 0.5,
    power: 'Chilled and frozen enemies take 30% more damage from you.',
    bonus: { critDmg: 0.2 },
  },
  {
    id: 'venomfang',
    name: 'Venomfang',
    slot: 'weapon',
    kind: 'dagger',
    element: 'poison',
    elemConv: 0.6,
    power: 'Your poison stacks up to 6 times.',
    bonus: { atkSpeed: 0.06 },
  },
  {
    id: 'lightbringer',
    name: 'Lightbringer',
    slot: 'weapon',
    kind: 'sword',
    element: 'lightning',
    elemConv: 0.4,
    power: 'Every 3rd combo hit calls down a lightning bolt on your target for 200% ATK.',
    bonus: { crit: 0.04 },
  },
  {
    id: 'sunstrike',
    name: 'Sunstrike Longbow',
    slot: 'weapon',
    kind: 'bow',
    element: 'fire',
    elemConv: 0.5,
    power: 'Every 4th arrow is a blazing arrow that explodes for 150% ATK around its target.',
    bonus: { burnChance: 0.08 },
  },
  {
    id: 'galeforce',
    name: 'Galeforce',
    slot: 'weapon',
    kind: 'bow',
    power: 'Arrows pierce 2 extra enemies and knock them back.',
    bonus: { moveSpeed: 0.05 },
  },
  {
    id: 'siegebreaker',
    name: 'Siegebreaker',
    slot: 'weapon',
    kind: 'crossbow',
    power: 'Bolts explode on impact for 80% ATK around the target.',
    bonus: { critDmg: 0.25 },
  },
  {
    id: 'thunderlord',
    name: "Thunderlord's Arbalest",
    slot: 'weapon',
    kind: 'crossbow',
    element: 'lightning',
    elemConv: 0.5,
    power: 'Bolts chain lightning to 3 nearby enemies.',
    bonus: { elemDmg: 0.15 },
  },
  {
    id: 'pestilence',
    name: 'Pestilence',
    slot: 'weapon',
    kind: 'staff',
    element: 'poison',
    elemConv: 0.6,
    power: 'Poisoned enemies burst into a toxic cloud when they die, poisoning everything nearby.',
    bonus: { mpRegen: 1 },
  },
  // ---- armor and jewelry ----
  {
    id: 'robe_archmage',
    name: 'Robe of the Mad Archmage',
    slot: 'armor',
    armorType: 'cloth',
    power: '+40% Magic, but you take 20% more damage.',
    bonus: { skillDmg: 0.1 },
  },
  {
    id: 'aegis_dawn',
    name: 'Aegis of Dawn',
    slot: 'armor',
    armorType: 'plate',
    power: '20% chance to block an enemy attack completely.',
    bonus: { hpRegen: 3 },
  },
  {
    id: 'starfall',
    name: 'Starfall Diadem',
    slot: 'helm',
    armorType: 'cloth',
    power: 'Meteor calls down 2 extra meteors around its target.',
    bonus: { cdr: 0.06 },
  },
  {
    id: 'mask_berserker',
    name: 'Mask of the Berserker',
    slot: 'helm',
    armorType: 'leather',
    power: 'Kills grant Frenzy: +5% attack speed and damage for 5s, stacking up to 6 times.',
    bonus: { lifesteal: 0.02 },
  },
  {
    id: 'pyres_grip',
    name: "Pyrelord's Grip",
    slot: 'gloves',
    armorType: 'mail',
    power: 'Fireball splits into three.',
    bonus: { burnChance: 0.06 },
  },
  {
    id: 'stormweave',
    name: 'Stormweave Wraps',
    slot: 'gloves',
    armorType: 'cloth',
    power: 'Chain Lightning jumps to 3 more enemies and deals 30% more damage.',
    bonus: { mpRegen: 0.8 },
  },
  {
    id: 'emberstride',
    name: 'Emberstride',
    slot: 'boots',
    armorType: 'plate',
    power: 'Dodge rolls leave a trail of fire that burns enemies (60% ATK per second).',
    bonus: { def: 12 },
  },
  {
    id: 'tempest_sash',
    name: 'Tempest Sash',
    slot: 'belt',
    armorType: 'leather',
    power: 'Whirlwind lasts twice as long and you spin faster.',
    bonus: { atkSpeed: 0.05 },
  },
  {
    id: 'bladedancer',
    name: "Bladedancer's Girdle",
    slot: 'belt',
    armorType: 'mail',
    power: 'Spectral Blades summons 3 more blades.',
    bonus: { crit: 0.03 },
  },
  {
    id: 'sprinters_oath',
    name: "Sprinter's Oath",
    slot: 'boots',
    armorType: 'leather',
    power: "Aether Slash's cooldown resets when it kills an enemy.",
    bonus: { moveSpeed: 0.06 },
  },
  {
    id: 'band_ascendant',
    name: 'Band of the Ascendant',
    slot: 'ring',
    power: 'Aether Surge charges 50% faster.',
    bonus: { critDmg: 0.15 },
  },
  {
    id: 'serpent_eye',
    name: 'Eye of the Serpent',
    slot: 'amulet',
    power: 'Burns and poisons you inflict last 50% longer.',
    bonus: { elemDmg: 0.2 },
  },
];

export const LEGENDARY_BY_ID = Object.fromEntries(LEGENDARIES.map((l) => [l.id, l])) as Record<
  LegendaryId,
  LegendaryDef
>;

export const CONSUMABLES: Record<ConsumableId, ConsumableDef> = {
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    icon: 'icon_elixir',
    desc: 'Fully restores HP and MP.',
    price: 240,
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix Feather',
    icon: 'icon_phoenix',
    desc: 'Auto-revives you with 50% HP when you fall.',
    price: 600,
  },
  tonic_might: {
    id: 'tonic_might',
    name: 'Tonic of Might',
    icon: 'icon_potion_hp',
    desc: '+20% damage for 3 minutes.',
    price: 160,
  },
  tonic_guard: {
    id: 'tonic_guard',
    name: 'Tonic of Guarding',
    icon: 'icon_potion_mp',
    desc: 'Take 20% less damage for 3 minutes.',
    price: 160,
  },
  tonic_fortune: {
    id: 'tonic_fortune',
    name: 'Tonic of Fortune',
    icon: 'icon_elixir',
    desc: '+50% Magic Find and Gold Find for 5 minutes. (Crafted only.)',
    price: 0,
  },
};

/** Consumables sold by Mira (crafted-only ones have no price). */
export const SHOP_CONSUMABLES = (Object.keys(CONSUMABLES) as ConsumableId[]).filter(
  (id) => CONSUMABLES[id].price > 0,
);

export const MATERIALS: Record<MaterialId, MaterialDef> = {
  dust: {
    id: 'dust',
    name: 'Aether Dust',
    icon: 'icon_dust',
    desc: 'Salvaged essence. Used by the blacksmith.',
    sell: 0,
  },
  herb: {
    id: 'herb',
    name: 'Moonpetal',
    icon: 'icon_herb',
    desc: 'A glowing herb from the Whispering Woods. Used in brewing.',
    sell: 6,
  },
  pelt: {
    id: 'pelt',
    name: 'Thick Pelt',
    icon: 'icon_pelt',
    desc: 'Warm fur from a wild beast. Used to craft armor and tonics.',
    sell: 8,
  },
  crystal: {
    id: 'crystal',
    name: 'Cave Crystal',
    icon: 'icon_crystal',
    desc: 'Resonates with faint aether. Used to craft jewelry, weapons and dust.',
    sell: 14,
  },
  ember: {
    id: 'ember',
    name: 'Ember Core',
    icon: 'icon_ember',
    desc: 'Still warm to the touch. Used to forge weapons and brew tonics.',
    sell: 20,
  },
  frost: {
    id: 'frost',
    name: 'Frost Essence',
    icon: 'icon_frost',
    desc: 'Never melts. Used to forge armor and brew tonics.',
    sell: 26,
  },
  void: {
    id: 'void',
    name: 'Void Fragment',
    icon: 'icon_void',
    desc: 'A sliver of nothing. Unsettling. Used for charms and sockets.',
    sell: 34,
  },
};
