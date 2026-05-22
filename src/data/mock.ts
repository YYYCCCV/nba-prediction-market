import { MarketPrice, Game } from '../types';

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
