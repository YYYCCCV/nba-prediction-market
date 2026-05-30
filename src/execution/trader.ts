import { Signal, Trade, RiskParams } from '../types';
import { evaluateRisk } from '../strategy/risk';
import { executeTrade as polymarketExecute } from '../data/polymarket';

export async function processSignals(
  signals: Signal[],
  currentPositions: Trade[],
  params: RiskParams
): Promise<Trade[]> {
  const trades: Trade[] = [];

  for (const signal of signals) {
    const risk = evaluateRisk(signal, currentPositions, params);
    if (!risk.approved) continue;

    const trade = await polymarketExecute(
      signal.marketId,
      signal.direction,
      risk.adjustedAmount,
      signal.marketPrice,
      params.dryRun
    );

    trade.signalId = `${signal.type}_${signal.gameId}_${Date.now()}`;
    trades.push(trade);
    currentPositions.push(trade);
  }

  return trades;
}
