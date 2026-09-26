/**
 * Developer mode: testing cheats and shortcuts. Hidden until the version line in
 * Settings is pressed DEV_UNLOCK_PRESSES times, then switched on with a toggle.
 */

/** Confirm presses on the Settings version line that reveal the Developer section. */
export const DEV_UNLOCK_PRESSES = 7;

export type Cheat = 'god' | 'oneHit' | 'swift' | 'freeSkills' | 'xp10';

export const CHEATS: Record<Cheat, { label: string; short: string; help: string }> = {
  god: { label: 'God Mode', short: 'GOD', help: 'You take no damage and no status effects.' },
  oneHit: { label: 'One-Hit Kills', short: '1HIT', help: 'Every hit kills, guardians included.' },
  swift: { label: 'Swift Feet', short: 'FAST', help: 'Move twice as fast.' },
  freeSkills: {
    label: 'Free Skills',
    short: 'FREE',
    help: 'Skills cost no MP (or HP) and have no cooldown.',
  },
  xp10: { label: 'XP ×10', short: 'XP10', help: 'Ten times the XP from everything.' },
};

export const CHEAT_IDS = Object.keys(CHEATS) as Cheat[];
