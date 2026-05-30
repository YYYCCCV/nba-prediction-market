import { Signal, Trade, RiskParams } from '../types';

export interface RiskDecision {
  approved: boolean;
  adjustedAmount: number;
  reason: string;
}

export function evaluateRisk(
  signal: Signal,
  currentPositions: Trade[],
  params: RiskParams
): RiskDecision {
  if (signal.edge < params.minEdgeThreshold) {
    return { approved: false, adjustedAmount: 0, reason: 'Edge below threshold' };
  }

  const gameExposure = currentPositions
    .filter((t) => t.marketId === signal.marketId)
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = params.maxPositionPerGame - gameExposure;
  if (remaining <= 0) {
    return { approved: false, adjustedAmount: 0, reason: 'Max position reached for game' };
  }

  const kellyFraction = signal.edge / signal.marketPrice;
  const kellyAdjusted = Math.max(kellyFraction * 0.25, 0); // quarter-Kelly for safety
  const rawAmount = params.maxTradeAmount * kellyAdjusted * signal.confidence;
  const adjustedAmount = Math.min(rawAmount, remaining, params.maxTradeAmount);

  return {
    approved: adjustedAmount > 0,
    adjustedAmount: Math.round(adjustedAmount * 100) / 100,
    reason: adjustedAmount > 0
      ? `Approved: $${adjustedAmount.toFixed(2)} on ${signal.marketId}`
      : 'Amount too small after risk adjustment',
  };
}

export const MANTLE_MIGRATION_NOTES = {
  evaluateRisk: '100% reusable — pure math, RiskParams + Signal → RiskDecision',
  kellySizing: '100% reusable — quarter-Kelly is standard across all trading domains',
  exposureTracking: 'Swap Trade[] source; logic identical for chain-based positions',
};
