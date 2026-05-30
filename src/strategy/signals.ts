import { Injury, MarketPrice, Signal } from '../types';

const STAR_PLAYERS: Record<string, string[]> = {
  'Atlanta Hawks': ['Trae Young'],
  'Boston Celtics': ['Jayson Tatum', 'Jaylen Brown'],
  'Brooklyn Nets': ['Mikal Bridges'],
  'Charlotte Hornets': ['LaMelo Ball'],
  'Chicago Bulls': ['Zach LaVine', 'DeMar DeRozan'],
  'Cleveland Cavaliers': ['Donovan Mitchell'],
  'Dallas Mavericks': ['Luka Doncic', 'Kyrie Irving'],
  'Denver Nuggets': ['Nikola Jokic', 'Jamal Murray'],
  'Detroit Pistons': ['Cade Cunningham'],
  'Golden State Warriors': ['Stephen Curry'],
  'Houston Rockets': ['Jalen Green'],
  'Indiana Pacers': ['Tyrese Haliburton'],
  'LA Clippers': ['Kawhi Leonard', 'James Harden'],
  'Los Angeles Lakers': ['LeBron James', 'Anthony Davis'],
  'Memphis Grizzlies': ['Ja Morant'],
  'Miami Heat': ['Jimmy Butler', 'Bam Adebayo'],
  'Milwaukee Bucks': ['Giannis Antetokounmpo', 'Damian Lillard'],
  'Minnesota Timberwolves': ['Anthony Edwards'],
  'New Orleans Pelicans': ['Zion Williamson'],
  'New York Knicks': ['Jalen Brunson'],
  'Oklahoma City Thunder': ['Shai Gilgeous-Alexander'],
  'Orlando Magic': ['Paolo Banchero', 'Franz Wagner'],
  'Philadelphia 76ers': ['Joel Embiid', 'Tyrese Maxey'],
  'Phoenix Suns': ['Kevin Durant', 'Devin Booker'],
  'Portland Trail Blazers': ['Anfernee Simons'],
  'Sacramento Kings': ["De'Aaron Fox", 'Domantas Sabonis'],
  'San Antonio Spurs': ['Victor Wembanyama'],
  'Toronto Raptors': ['Scottie Barnes'],
  'Utah Jazz': ['Lauri Markkanen'],
  'Washington Wizards': ['Kyle Kuzma'],
};

const IMPACT_WEIGHTS: Record<string, number> = {
  OUT: 0.08,
  DOUBTFUL: 0.04,
  QUESTIONABLE: 0.02,
  PROBABLE: 0,
};

export function generateInjurySignals(
  injuries: Injury[],
  markets: MarketPrice[],
  minEdge: number
): Signal[] {
  const signals: Signal[] = [];
  const now = new Date().toISOString();

  for (const injury of injuries) {
    if (!IMPACT_WEIGHTS[injury.status]) continue;

    const stars = STAR_PLAYERS[injury.team] || [];
    if (!stars.includes(injury.player)) continue;

    const impact = IMPACT_WEIGHTS[injury.status];
    const relevantMarkets = findMarketsForTeam(injury.team, markets);

    for (const market of relevantMarkets) {
      const isHome = isHomeTeam(injury.team, market.question);
      const estimatedProb = adjustProbability(
        market.price,
        injury.team,
        impact,
        isHome
      );
      const edge = Math.abs(estimatedProb - market.price);

      if (edge < minEdge) continue;

      const direction = estimatedProb > market.price ? 'BUY' : 'SELL';
      signals.push({
        type: 'injury_speed',
        gameId: market.gameId,
        marketId: market.marketId,
        direction,
        side: isHome ? 'HOME' : 'AWAY',
        estimatedProbability: estimatedProb,
        marketPrice: market.price,
        edge: Math.round(edge * 10000) / 10000,
        confidence: Math.min(edge * 15 + 0.2, 0.95),
        reason: `${injury.player} (${injury.team}) is ${injury.status}`,
        timestamp: now,
      });
    }
  }

  return signals;
}

export function generateCrossMarketSignals(
  markets: MarketPrice[],
  minEdge: number
): Signal[] {
  const signals: Signal[] = [];
  const now = new Date().toISOString();

  const grouped = groupByGame(markets);
  for (const [gameId, gameMarkets] of Object.entries(grouped)) {
    if (gameMarkets.length < 2) continue;

    for (let i = 0; i < gameMarkets.length; i++) {
      for (let j = i + 1; j < gameMarkets.length; j++) {
        const a = gameMarkets[i];
        const b = gameMarkets[j];
        if (!a.price || !b.price) continue;

        const edge = Math.abs(a.price - b.price);
        if (edge < minEdge) continue;

        signals.push({
          type: 'cross_market_arb',
          gameId,
          marketId: a.marketId,
          direction: a.price < b.price ? 'BUY' : 'SELL',
          side: 'HOME',
          estimatedProbability: (a.price + b.price) / 2,
          marketPrice: a.price,
          edge: Math.round(edge * 10000) / 10000,
          confidence: Math.min(edge * 8 + 0.15, 0.7),
          reason: `Cross-market price gap: $${a.price.toFixed(2)} vs $${b.price.toFixed(2)}`,
          timestamp: now,
        });
      }
    }
  }

  return signals;
}

function findMarketsForTeam(team: string, markets: MarketPrice[]): MarketPrice[] {
  return markets.filter((m) => m.question.toLowerCase().includes(team.toLowerCase()));
}

function isHomeTeam(team: string, question: string): boolean {
  const parts = question.split(/ vs\.? /i);
  return parts[0]?.toLowerCase().includes(team.toLowerCase());
}

function adjustProbability(
  marketPrice: number,
  team: string,
  impact: number,
  isHome: boolean
): number {
  return isHome ? marketPrice - impact : marketPrice + impact;
}

function groupByGame(markets: MarketPrice[]): Record<string, MarketPrice[]> {
  const grouped: Record<string, MarketPrice[]> = {};
  for (const m of markets) {
    if (!grouped[m.gameId]) grouped[m.gameId] = [];
    grouped[m.gameId].push(m);
  }
  return grouped;
}

export const MANTLE_MIGRATION_NOTES = {
  injurySignals: 'Swap ESPN injuries → on-chain event oracle or TG/Discord alert feed',
  crossMarketSignals: 'Swap Polymarket → Mantle DEX pairs / Bybit price feeds',
  starPlayers: 'Reusable as-is for sports-related strategies; replace for crypto token metrics',
  edgeCalculation: '100% reusable — pure math, no external dependency',
  signalStructure: '100% reusable — Signal interface is chain-agnostic',
};
