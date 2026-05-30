import { Signal, RunSummary, Game, Injury, MarketPrice } from '../types';
import { generateInjurySignals, generateCrossMarketSignals } from './signals';

export interface StrategyResult {
  signals: Signal[];
  summary: {
    injurySignals: number;
    crossMarketSignals: number;
    totalEdge: number;
  };
}

export function runStrategy(
  games: Game[],
  injuries: Injury[],
  markets: MarketPrice[],
  minEdge: number
): StrategyResult {
  if (markets.length === 0) {
    return { signals: [], summary: { injurySignals: 0, crossMarketSignals: 0, totalEdge: 0 } };
  }

  const injurySignals = generateInjurySignals(injuries, markets, minEdge);
  const crossMarketSignals = generateCrossMarketSignals(markets, minEdge);
  const allSignals = [...injurySignals, ...crossMarketSignals];

  const totalEdge = allSignals.reduce((sum, s) => sum + s.edge, 0);

  return {
    signals: allSignals.sort((a, b) => b.edge - a.edge),
    summary: {
      injurySignals: injurySignals.length,
      crossMarketSignals: crossMarketSignals.length,
      totalEdge: Math.round(totalEdge * 10000) / 10000,
    },
  };
}

export const MANTLE_MIGRATION_NOTES = {
  runStrategy: '100% reusable — takes abstract Game/Injury/MarketPrice, output generic Signal[]',
  signalSort: '100% reusable — edge-based prioritization is chain-agnostic',
};
