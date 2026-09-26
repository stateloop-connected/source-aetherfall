import { describe, expect, it } from 'vitest';
import { Emitter } from '../src/engine/events';
import { CHEAT_IDS, CHEATS, DEV_UNLOCK_PRESSES } from '../src/game/dev';
import type { Game, GameEvents } from '../src/game/game';
import { QuestSystem } from '../src/game/quests';
import { DEFAULT_SETTINGS, loadSettings } from '../src/game/settings';
import { hasFlag, newGame } from '../src/game/state';

describe('developer mode', () => {
  it('is hidden and off by default, including for settings saved before it existed', () => {
    expect(DEFAULT_SETTINGS.devUnlocked).toBe(false);
    expect(DEFAULT_SETTINGS.devMode).toBe(false);
    const old = loadSettings({ getItem: () => JSON.stringify({ master: 0.5, showFps: true }) });
    expect(old.devUnlocked).toBe(false);
    expect(old.devMode).toBe(false);
    expect(old.master).toBe(0.5);
    expect(DEV_UNLOCK_PRESSES).toBeGreaterThan(3);
  });

  it('describes every cheat', () => {
    for (const id of CHEAT_IDS) {
      expect(CHEATS[id].label).toBeTruthy();
      expect(CHEATS[id].short).toMatch(/^[A-Z0-9]{2,5}$/);
      expect(CHEATS[id].help).toBeTruthy();
    }
  });

  it('can complete quest objectives, setting the boss and story flags they need', () => {
    const save = newGame(0, 'Kai', 'normal');
    const game = { save, events: new Emitter<GameEvents>(), toast: () => undefined } as unknown as Game;
    const quests = new QuestSystem(game);
    expect(quests.skipObjective('mq2_dusk')).toBe(false); // not started
    quests.start('mq2_dusk', true);
    // talk to Lyra → the portal to Solenne opens
    expect(quests.skipObjective('mq2_dusk')).toBe(true);
    expect(hasFlag(save, 'act2_start')).toBe(true);
    // arrive in Solenne
    quests.skipObjective('mq2_dusk');
    expect(hasFlag(save, 'visited_solenne')).toBe(true);
    expect(save.quests.mq2_dusk.stage).toBe(2);
    // a guardian objective marks the guardian beaten, which opens the next gate
    quests.start('mq2_sands', true);
    quests.skipObjective('mq2_sands');
    expect(hasFlag(save, 'boss_sandmaw')).toBe(true);
    expect(save.quests.mq2_sands.stage).toBe(1);
  });
});
