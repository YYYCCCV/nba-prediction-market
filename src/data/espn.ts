import { Game, Injury } from '../types';

const ESPN_BASE = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba';

export async function fetchGames(): Promise<Game[]> {
  const res = await fetch(`${ESPN_BASE}/scoreboard`);
  if (!res.ok) throw new Error(`ESPN scoreboard failed: ${res.status}`);

  const data = await res.json() as { events: Array<Record<string, unknown>> };

  return (data.events || []).map((e: Record<string, unknown>) => {
    const comps = (e.competitions as Array<Record<string, unknown>>)?.[0] || {};
    const competitors = (comps.competitors as Array<Record<string, unknown>>) || [];
    const home = competitors.find((c: Record<string, unknown>) => c.homeAway === 'home');
    const away = competitors.find((c: Record<string, unknown>) => c.homeAway === 'away');

    return {
      id: e.id as string,
      homeTeam: (home?.team as Record<string, unknown>)?.displayName as string || 'Unknown',
      awayTeam: (away?.team as Record<string, unknown>)?.displayName as string || 'Unknown',
      status: ((e.status as Record<string, unknown>)?.type as Record<string, unknown>)?.name as Game['status'] || 'scheduled',
      startTime: e.date as string,
    };
  });
}

export async function fetchInjuries(): Promise<Injury[]> {
  const res = await fetch(`${ESPN_BASE}/injuries`);
  if (!res.ok) throw new Error(`ESPN injuries failed: ${res.status}`);

  const data = await res.json() as { injuries: Array<Record<string, unknown>> };

  return (data.injuries || []).map((i: Record<string, unknown>) => ({
    player: i.athlete as string || 'Unknown',
    team: i.team as string || 'Unknown',
    status: i.status as Injury['status'] || 'OUT',
    details: i.details as string || '',
  }));
}
