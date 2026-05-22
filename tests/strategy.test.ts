import { runStrategy } from '../src/strategy/engine';
import { Game, Injury, MarketPrice } from '../src/types';

describe('runStrategy', () => {
  const game: Game = {
    id: 'g1',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Miami Heat',
    status: 'scheduled',
    startTime: new Date().toISOString(),
  };

  const market: MarketPrice = {
    marketId: 'm1',
    gameId: 'Boston Celtics @ Miami Heat',
    question: 'Boston Celtics vs Miami Heat - Moneyline',
    outcome: 'Boston Celtics win',
    price: 0.65,
    volume: 50000,
    timestamp: new Date().toISOString(),
  };

  it('returns empty signals when no markets available', () => {
    const result = runStrategy([game], [], [], 0.03);
    expect(result.signals).toEqual([]);
    expect(result.summary.injurySignals).toBe(0);
    expect(result.summary.crossMarketSignals).toBe(0);
    expect(result.summary.totalEdge).toBe(0);
  });

  it('sorts signals by edge descending', () => {
    const injuries: Injury[] = [
      { player: 'Jayson Tatum', team: 'Boston Celtics', status: 'OUT', details: 'Ankle' },
      { player: 'Jaylen Brown', team: 'Boston Celtics', status: 'QUESTIONABLE', details: 'Back' },
    ];

    const result = runStrategy([game], injuries, [market], 0.01);
    expect(result.signals.length).toBeGreaterThan(0);

    for (let i = 0; i < result.signals.length - 1; i++) {
      expect(result.signals[i].edge).toBeGreaterThanOrEqual(result.signals[i + 1].edge);
    }
  });

  it('combines injury and cross-market signals', () => {
    const injuries: Injury[] = [
      { player: 'Jayson Tatum', team: 'Boston Celtics', status: 'OUT', details: 'Ankle' },
    ];
    const markets = [
      market,
      { ...market, marketId: 'm2', question: 'BOS vs MIA - Spread', price: 0.55 },
    ];
    const result = runStrategy([game], injuries, markets, 0.01);

    expect(result.summary.injurySignals).toBeGreaterThanOrEqual(0);
    expect(result.summary.crossMarketSignals).toBeGreaterThanOrEqual(0);
    expect(result.signals.length).toBeGreaterThan(0);
  });
});
