/** Map registry: builds (and caches) the town, zones, boss arenas and abyss floors. */
import { ZONES } from '../data/zones';
import { generateAbyssFloor } from './abyss';
import type { MapData } from './mapdata';
import { generateArena, generateZone } from './mapgen';
import { buildSolenne } from './solenne';
import { buildTown } from './town';
import { generateTrialMap } from './trial';

const cache = new Map<string, MapData>();

/** The layout each zone currently uses (the save's `layouts`, shared by reference). */
let layouts: Record<string, number> = {};
export function useZoneLayouts(l: Record<string, number>): void {
  layouts = l;
}
export const zoneLayout = (zone: string): number => layouts[zone] ?? 0;

/** A map by id. Zones use their current layout unless one is given. */
export function getMap(id: string, layout?: number): MapData {
  if (id.startsWith('abyss')) return generateAbyssFloor(Number(id.split('_')[1] ?? 1));
  if (id.startsWith('trial_')) return generateTrialMap(Number(id.split('_')[1] ?? 1));
  const zone = ZONES[id] && !id.endsWith('_boss');
  const key = zone ? `${id}#${layout ?? zoneLayout(id)}` : id;
  let m = cache.get(key);
  if (m) return m;
  if (id === 'town') m = buildTown();
  else if (id === 'solenne') m = buildSolenne();
  else if (id.endsWith('_boss')) m = generateArena(id.replace(/_boss$/, ''));
  else if (ZONES[id]) m = generateZone(ZONES[id], layout ?? zoneLayout(id));
  else throw new Error(`Unknown map ${id}`);
  cache.set(key, m);
  return m;
}

/** Human-readable name of an area (for portal prompts and the HUD). */
export function areaName(id: string): string {
  if (id === 'town') return 'Havenbrook';
  if (id === 'solenne') return 'Solenne';
  if (id.startsWith('abyss')) return `Abyss Floor ${Number(id.split('_')[1] ?? 1)}`;
  if (id.startsWith('trial_')) return 'Trial of Ascension';
  const zone = ZONES[id.replace(/_boss$/, '')];
  if (zone) return id.endsWith('_boss') ? `${zone.name} (Guardian)` : zone.name;
  return id;
}
