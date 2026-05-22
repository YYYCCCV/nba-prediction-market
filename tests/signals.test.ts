import { generateInjurySignals, generateCrossMarketSignals } from '../src/strategy/signals';
import { Injury, MarketPrice } from '../src/types';

const makeMarket = (overrides: Partial<MarketPrice> = {}): MarketPrice => ({
  marketId: 'm1',
  gameId: 'Boston Celtics @ Miami Heat',
  question: 'Boston Celtics vs Miami Heat - Moneyline',
  outcome: 'Boston Celtics win',
  price: 0.65,
  volume: 50000,
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe('generateInjurySignals', () => {
  it('generates signal when star player is OUT', () => {
    const injuries: Injury[] = [{
      player: 'Jayson Tatum',
      team: 'Boston Celtics',
      status: 'OUT',
      details: 'Ankle sprain',
    }];
    const markets = [makeMarket()];
    const signals = generateInjurySignals(injuries, markets, 0.03);

    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].type).toBe('injury_speed');
    expect(signals[0].reason).toContain('Jayson Tatum');
    expect(signals[0].reason).toContain('OUT');
  });

  it('ignores non-star players', () => {
    const injuries: Injury[] = [{
      player: 'Random Bench Player',
      team: 'Boston Celtics',
      status: 'OUT',
      details: 'Rest',
    }];
    const markets = [makeMarket()];
    const signals = generateInjurySignals(injuries, markets, 0.01);
    expect(signals.length).toBe(0);
  });

  it('ignores PROBABLE status', () => {
    const injuries: Injury[] = [{
      player: 'Jayson Tatum',
      team: 'Boston Celtics',
      status: 'PROBABLE',
      details: 'Minor',
    }];
    const markets = [makeMarket()];
    const signals = generateInjurySignals(injuries, markets, 0.01);
    expect(signals.length).toBe(0);
  });

  it('filters signals below min edge threshold', () => {
    const injuries: Injury[] = [{
      player: 'Jayson Tatum',
      team: 'Boston Celtics',
      status: 'OUT',
      details: 'Ankle',
    }];
    const markets = [makeMarket()];
    const signals = generateInjurySignals(injuries, markets, 0.20);
    expect(signals.length).toBe(0);
  });

  it('adjusts probability correctly for home team injury', () => {
    const injuries: Injury[] = [{
      player: 'Jayson Tatum',
      team: 'Boston Celtics',
      status: 'OUT',
      details: 'Knee',
    }];
    const markets = [makeMarket()];
    const signals = generateInjurySignals(injuries, markets, 0.03);

    expect(signals.length).toBeGreaterThan(0);
    const s = signals[0];
    expect(s.estimatedProbability).toBeLessThan(s.marketPrice);
    expect(s.direction).toBe('SELL');
  });

  it('returns empty array when no injuries', () => {
    const signals = generateInjurySignals([], [makeMarket()], 0.01);
    expect(signals).toEqual([]);
  });

  it('returns empty array when no markets', () => {
    const injuries: Injury[] = [{
      player: 'Jayson Tatum',
      team: 'Boston Celtics',
      status: 'OUT',
      details: 'Ankle',
    }];
    const signals = generateInjurySignals(injuries, [], 0.01);
    expect(signals).toEqual([]);
  });
});

describe('generateCrossMarketSignals', () => {
  it('detects price discrepancy between two markets for same game', () => {
    const markets = [
      makeMarket({ marketId: 'm1', question: 'BOS vs MIA - Moneyline', price: 0.65 }),
      makeMarket({ marketId: 'm2', question: 'BOS vs MIA - Spread', price: 0.55 }),
    ];
    const signals = generateCrossMarketSignals(markets, 0.05);
    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].type).toBe('cross_market_arb');
  });

  it('returns empty when only one market per game', () => {
    const markets = [makeMarket()];
    const signals = generateCrossMarketSignals(markets, 0.01);
    expect(signals).toEqual([]);
  });

  it('respects min edge threshold', () => {
    const markets = [
      makeMarket({ marketId: 'm1', price: 0.65 }),
      makeMarket({ marketId: 'm2', price: 0.63 }),
    ];
    const signals = generateCrossMarketSignals(markets, 0.05);
    expect(signals).toEqual([]);
  });

  it('returns empty for zero-price markets', () => {
    const markets = [
      makeMarket({ marketId: 'm1', price: 0 }),
      makeMarket({ marketId: 'm2', price: 0.55 }),
    ];
    const signals = generateCrossMarketSignals(markets, 0.01);
    expect(signals).toEqual([]);
  });
});
