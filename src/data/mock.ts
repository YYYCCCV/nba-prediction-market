import { MarketPrice, Game, Injury } from '../types';

export function generateMockMarkets(games: Game[]): MarketPrice[] {
  const markets: MarketPrice[] = [];

  for (const game of games) {
    const basePrice = 0.45 + Math.random() * 0.3;

    markets.push({
      marketId: `mock_${game.id}_moneyline`,
      gameId: `${game.homeTeam} @ ${game.awayTeam}`,
      question: `${game.homeTeam} vs ${game.awayTeam} - Moneyline`,
      outcome: `${game.homeTeam} win`,
      price: Math.round(basePrice * 100) / 100,
      volume: Math.floor(Math.random() * 100000) + 10000,
      timestamp: new Date().toISOString(),
    });

    markets.push({
      marketId: `mock_${game.id}_spread`,
      gameId: `${game.homeTeam} @ ${game.awayTeam}`,
      question: `${game.homeTeam} vs ${game.awayTeam} - Spread`,
      outcome: `${game.homeTeam} -5.5`,
      price: Math.round((basePrice + (Math.random() - 0.5) * 0.15) * 100) / 100,
      volume: Math.floor(Math.random() * 50000) + 5000,
      timestamp: new Date().toISOString(),
    });
  }

  return markets;
}

export function generateDemoData(): { games: Game[]; injuries: Injury[]; markets: MarketPrice[] } {
  const now = new Date().toISOString();

  const games: Game[] = [
    {
      id: 'demo_lal_bos',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Boston Celtics',
      status: 'scheduled',
      startTime: now,
    },
    {
      id: 'demo_gsw_den',
      homeTeam: 'Golden State Warriors',
      awayTeam: 'Denver Nuggets',
      status: 'scheduled',
      startTime: now,
    },
  ];

  const injuries: Injury[] = [
    {
      player: 'LeBron James',
      team: 'Los Angeles Lakers',
      status: 'OUT',
      details: 'Left ankle sprain — out indefinitely',
    },
    {
      player: 'Anthony Davis',
      team: 'Los Angeles Lakers',
      status: 'QUESTIONABLE',
      details: 'Right foot soreness',
    },
    {
      player: 'Jayson Tatum',
      team: 'Boston Celtics',
      status: 'DOUBTFUL',
      details: 'Left knee soreness',
    },
    {
      player: 'Nikola Jokic',
      team: 'Denver Nuggets',
      status: 'PROBABLE',
      details: 'Wrist — expected to play',
    },
  ];

  const markets: MarketPrice[] = [
    {
      marketId: 'demo_lal_bos_moneyline',
      gameId: 'demo_lal_bos',
      question: 'Los Angeles Lakers vs Boston Celtics - Moneyline',
      outcome: 'Los Angeles Lakers win',
      price: 0.55,
      volume: 85000,
      timestamp: now,
    },
    {
      marketId: 'demo_lal_bos_spread',
      gameId: 'demo_lal_bos',
      question: 'Los Angeles Lakers vs Boston Celtics - Spread',
      outcome: 'Los Angeles Lakers -2.5',
      price: 0.45,
      volume: 42000,
      timestamp: now,
    },
    {
      marketId: 'demo_gsw_den_moneyline',
      gameId: 'demo_gsw_den',
      question: 'Golden State Warriors vs Denver Nuggets - Moneyline',
      outcome: 'Golden State Warriors win',
      price: 0.50,
      volume: 65000,
      timestamp: now,
    },
  ];

  return { games, injuries, markets };
}
