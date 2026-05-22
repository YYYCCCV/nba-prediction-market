import { evaluateRisk } from '../src/strategy/risk';
import { Signal, Trade, RiskParams } from '../src/types';

const defaultParams: RiskParams = {
  maxTradeAmount: 10,
  minEdgeThreshold: 0.05,
  maxPositionPerGame: 50,
  dryRun: true,
};

const makeSignal = (overrides: Partial<Signal> = {}): Signal => ({
  type: 'injury_speed',
  gameId: 'g1',
  marketId: 'm1',
  direction: 'BUY',
  side: 'HOME',
  estimatedProbability: 0.60,
  marketPrice: 0.50,
  edge: 0.10,
  confidence: 0.75,
  reason: 'Test signal',
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe('evaluateRisk', () => {
  it('approves signal with sufficient edge', () => {
    const result = evaluateRisk(makeSignal(), [], defaultParams);
    expect(result.approved).toBe(true);
    expect(result.adjustedAmount).toBeGreaterThan(0);
  });

  it('rejects signal below min edge threshold', () => {
    const signal = makeSignal({ edge: 0.01 });
    const result = evaluateRisk(signal, [], defaultParams);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('Edge below threshold');
  });

  it('rejects when max position for game is reached', () => {
    const existing: Trade[] = [{
      signalId: 's1',
      marketId: 'm1',
      direction: 'BUY',
      amount: 50,
      price: 0.50,
      status: 'dry_run',
      timestamp: new Date().toISOString(),
      details: '',
    }];

    const result = evaluateRisk(makeSignal(), existing, {
      ...defaultParams,
      maxPositionPerGame: 50,
    });
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('Max position');
  });

  it('reduces amount when partially filled', () => {
    const existing: Trade[] = [{
      signalId: 's1',
      marketId: 'm1',
      direction: 'BUY',
      amount: 45,
      price: 0.50,
      status: 'dry_run',
      timestamp: new Date().toISOString(),
      details: '',
    }];

    const result = evaluateRisk(makeSignal(), existing, defaultParams);
    expect(result.approved).toBe(true);
    expect(result.adjustedAmount).toBeLessThanOrEqual(5);
  });

  it('scales amount with confidence', () => {
    const lowConf = evaluateRisk(makeSignal({ confidence: 0.2 }), [], defaultParams);
    const highConf = evaluateRisk(makeSignal({ confidence: 0.9 }), [], defaultParams);
    expect(highConf.adjustedAmount).toBeGreaterThanOrEqual(lowConf.adjustedAmount);
  });

  it('caps amount at maxTradeAmount', () => {
    const result = evaluateRisk(makeSignal({ edge: 0.20, confidence: 0.95 }), [], defaultParams);
    expect(result.adjustedAmount).toBeLessThanOrEqual(defaultParams.maxTradeAmount);
  });
});
