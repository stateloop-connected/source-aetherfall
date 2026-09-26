/**
 * Dev tab (developer mode only): cheats and shortcuts for testing. Everything here
 * changes the current save, so it's meant for a spare slot.
 */
import { audio } from '../../audio';
import { enemyDef } from '../../data/enemies';
import { GEM_TYPES, MAX_DROP_QUALITY } from '../../data/gems';
import { MATERIALS } from '../../data/items';
import { ZONE_ORDER, ZONES } from '../../data/zones';
import { drawText } from '../../engine/font';
import type { Rect } from '../../engine/math';
import { rng } from '../../engine/rng';
import { MAX_LEVEL, xpToNext } from '../../game/balance';
import { CHEAT_IDS, CHEATS, type Cheat } from '../../game/dev';
import { addGem } from '../../game/gems';
import { generateAbyssal } from '../../game/items';
import { addMaterial, setFlag } from '../../game/state';
import type { MaterialId } from '../../game/types';
import { drawTooltip, ListView, UI } from '../../ui/widgets';
import { worldBossesUnlocked } from '../../world/worldboss';
import type { MenuScene, TabView } from './menu';

type Row =
  | { kind: 'header'; label: string }
  | { kind: 'cheat'; id: Cheat }
  | { kind: 'action'; label: string; help: string; run: () => 'close' | void };

interface Dest {
  label: string;
  map: string;
  spawn: string;
  /** A guardian arena: bring the guardian back even if it was beaten. */
  rematch?: boolean;
}

export class DevTab implements TabView {
  readonly label = 'Dev';
  private list: ListView<Row>;
  private dests: ListView<Dest>;
  private teleporting = false;

  constructor(private menu: MenuScene) {
    const g = menu.game;
    const act = (label: string, help: string, run: () => 'close' | void): Row => ({
      kind: 'action',
      label,
      help,
      run,
    });
    const rows: Row[] = [
      { kind: 'header', label: 'Cheats' },
      ...CHEAT_IDS.map((id) => ({ kind: 'cheat' as const, id })),
      { kind: 'header', label: 'Hero' },
      act('Level Up', 'Gain exactly one level.', () => this.levelUp(1)),
      act('Level Up ×10', 'Gain ten levels.', () => this.levelUp(10)),
      act('Full Restore', 'Refill HP, MP, flasks and Aether Surge.', () => this.restore()),
      act('+100,000 Gold', 'For vendors, upgrades and the stash.', () => g.giveGold(100000)),
      act('+5 Skill Points', 'Spend them on skills or talents.', () => {
        g.save.hero.skillPoints += 5;
        g.toast('+5 skill points', 'ui_star');
      }),
      { kind: 'header', label: 'Loot' },
      act('Legendary Item', 'A random legendary at your level.', () => {
        g.giveItem(g.rollItem(g.save.hero.level, { rarity: 'legendary' }));
      }),
      act('Abyssal Item', 'A random Abyssal item with sockets.', () => {
        g.giveItem(generateAbyssal(rng, g.save.hero.level + 4));
      }),
      act('Gems & Materials', 'Three of every gem up to Radiant, and 20 of every material.', () => {
        const s = g.save;
        for (const type of GEM_TYPES) for (let q = 0; q <= MAX_DROP_QUALITY; q++) addGem(s, { type, q }, 3);
        for (const id of Object.keys(MATERIALS) as MaterialId[]) addMaterial(s, id, 20);
        g.events.emit('materialsChanged', undefined);
        g.quests.checkCollect();
        g.toast('Gems and materials added', 'ui_check');
      }),
      { kind: 'header', label: 'World' },
      act('Teleport…', 'Go to any town, zone, guardian or the Abyss.', () => {
        this.teleporting = true;
      }),
      act('Kill All Enemies Here', 'Everything on this map dies (with loot and XP).', () => {
        const w = menu.ws.world;
        for (const e of [...w.enemies]) if (!e.dead && !e.removed) w.killEnemy(e, true);
        return 'close';
      }),
      act('Complete Quest Objective', 'Finish the tracked quest’s current step.', () => {
        const q = g.quests.tracked();
        if (!q || !g.quests.skipObjective(q.id)) {
          audio.playSfx('ui_error');
          g.toast('No tracked quest.', 'ui_lock', 0, UI.bad);
        }
      }),
      act(
        'Unlock All Areas',
        'Opens every zone gate and portal and adds every crystal to fast travel. Marks the guardians before each area as beaten.',
        () => this.unlockAll(),
      ),
      act('Summon World Boss', 'Starts a world boss event right away.', () => {
        const s = g.save;
        if (s.worldBoss) {
          g.toast('A world boss is already out.', 'ui_skull');
          return;
        }
        if (!worldBossesUnlocked(s)) {
          audio.playSfx('ui_error');
          g.toast('World bosses start once Thornmaw falls (or Unlock All Areas).', 'ui_lock', 0, UI.bad);
          return;
        }
        s.worldBossNext = s.playTime;
        return 'close';
      }),
    ];
    this.list = new ListView(rows, 12, 14, false);
    this.list.index = 1;
    const dests: Dest[] = [
      { label: 'Havenbrook', map: 'town', spawn: 'start' },
      { label: 'Solenne', map: 'solenne', spawn: 'start' },
    ];
    for (const id of ZONE_ORDER) {
      const z = ZONES[id];
      dests.push({ label: `${z.name} {gray}Lv ${z.levels[0]}-${z.levels[1]}{/}`, map: id, spawn: 'entry' });
      dests.push({
        label: `  ${enemyDef(z.boss.enemy).name} {gray}(guardian){/}`,
        map: z.boss.arena,
        spawn: 'entry',
        rematch: true,
      });
    }
    dests.push({ label: 'The Abyss — Floor 1', map: 'abyss_1', spawn: 'entry' });
    this.dests = new ListView(dests, 12, 14, true);
  }

  visible(): boolean {
    return this.menu.game.settings.devMode;
  }

  busy(): boolean {
    return this.teleporting;
  }

  private levelUp(n: number): void {
    const g = this.menu.game;
    const h = g.save.hero;
    if (h.level >= MAX_LEVEL) {
      audio.playSfx('ui_error');
      g.toast('Already at the level cap.', 'ui_lock', 0, UI.bad);
      return;
    }
    for (let i = 0; i < n && h.level < MAX_LEVEL; i++) g.giveXp(xpToNext(h.level) - h.xp, true);
  }

  private restore(): void {
    const g = this.menu.game;
    const h = g.save.hero;
    const st = g.stats();
    h.hp = st.maxHp;
    h.mp = st.maxMp;
    h.flaskHp = st.flaskHpMax;
    h.flaskMp = st.flaskMpMax;
    if (h.surgeUnlocked) h.surge = 100;
    const w = this.menu.ws.world;
    w.player.syncFromSave(w);
    g.toast('Fully restored', 'ui_check');
  }

  private unlockAll(): void {
    const g = this.menu.game;
    const s = g.save;
    for (const id of ZONE_ORDER) {
      const z = ZONES[id];
      if (z.unlockFlag) setFlag(s, z.unlockFlag);
      for (const c of ['a', 'b']) {
        const crystal = `${id}_crystal_${c}`;
        if (!s.discovered.includes(crystal)) s.discovered.push(crystal);
      }
    }
    // the Havenbrook portal's route to Solenne
    for (const f of ['act2_start', 'visited_solenne']) setFlag(s, f);
    if (!s.discovered.includes('solenne_crystal')) s.discovered.push('solenne_crystal');
    g.toast('All areas unlocked', 'ui_check');
  }

  update(): 'close' | void {
    const g = this.menu.game;
    const input = g.app.input;
    if (this.teleporting) {
      const r = this.dests.update(input);
      if (r === 'cancel') this.teleporting = false;
      if (r !== 'confirm') return;
      const d = this.dests.selected!;
      const ws = this.menu.ws;
      this.teleporting = false;
      audio.playSfx('teleport');
      ws.world.rematch = !!d.rematch;
      ws.travelTo(d.map, d.spawn);
      return 'close';
    }
    const r = this.list.update(input, { enabled: (x) => x.kind !== 'header' });
    // skip headers
    if (this.list.selected?.kind === 'header' && r === 'move') {
      const dir = input.repeat('up') ? -1 : 1;
      const n = this.list.items.length;
      this.list.index = (this.list.index + dir + n) % n;
    }
    if (r === 'cancel') return 'close';
    const row = this.list.selected;
    if (!row) return;
    if (row.kind === 'cheat') {
      if (r === 'confirm' || input.repeat('left') || input.repeat('right')) {
        if (g.cheats.has(row.id)) g.cheats.delete(row.id);
        else g.cheats.add(row.id);
        audio.playSfx('ui_select');
      }
      return;
    }
    if (row.kind === 'action' && r === 'confirm') {
      audio.playSfx('ui_select');
      return row.run();
    }
  }

  hints(): [string, string][] {
    return [['confirm', this.teleporting ? 'Go' : 'Use']];
  }

  render(ctx: CanvasRenderingContext2D, r: Rect): void {
    const g = this.menu.game;
    const listW = 170;
    const rows = Math.floor((r.h - 12) / 12);
    if (this.teleporting) {
      this.dests.visibleRows = rows;
      drawText(ctx, 'TELEPORT', r.x + 2, r.y + 4, { color: UI.cyan });
      this.dests.draw(ctx, r.x + 4, r.y + 16, listW + 40, (d, x, y, sel) =>
        drawText(ctx, d.label, x + 2, y, { color: sel ? UI.accent : '#ffffff' }),
      );
      drawTooltip(
        ctx,
        ['Guardians come back even if you beat them.'],
        r.x + listW + 56,
        r.y + 16,
        r.w - listW - 60,
      );
      return;
    }
    this.list.visibleRows = rows;
    this.list.draw(ctx, r.x + 4, r.y + 4, listW, (row, x, y, sel) => {
      if (row.kind === 'header') {
        drawText(ctx, row.label.toUpperCase(), x - 2, y, { color: UI.cyan });
        return;
      }
      const label = row.kind === 'cheat' ? CHEATS[row.id].label : row.label;
      drawText(ctx, label, x + 2, y, { color: sel ? UI.accent : '#ffffff' });
      if (row.kind === 'cheat') {
        const on = g.cheats.has(row.id);
        drawText(ctx, on ? 'ON' : 'OFF', x + listW - 12, y, {
          align: 'right',
          color: on ? UI.good : UI.dim,
        });
      }
    });
    const row = this.list.selected;
    const help = row?.kind === 'cheat' ? CHEATS[row.id].help : row?.kind === 'action' ? row.help : '';
    drawTooltip(
      ctx,
      [
        help,
        '',
        '{gray}Developer mode: changes here are saved to this slot, so use a spare one. Press ` to open this tab from anywhere.{/}',
      ],
      r.x + listW + 16,
      r.y + 4,
      r.w - listW - 20,
    );
  }
}
