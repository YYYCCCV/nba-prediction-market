import { BotConfig, RiskParams } from './types';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseRiskParams(): RiskParams {
  return {
    maxTradeAmount: Number(process.env.MAX_TRADE_AMOUNT) || 10,
    minEdgeThreshold: Number(process.env.MIN_EDGE_THRESHOLD) || 0.05,
    maxPositionPerGame: Number(process.env.MAX_POSITION_PER_GAME) || 50,
    dryRun: process.env.DRY_RUN !== 'false',
  };
}

export function loadConfig(): BotConfig {
  return {
    polymarketApiKey: process.env.POLYMARKET_API_KEY || '',
    polymarketPrivateKey: process.env.POLYMARKET_PRIVATE_KEY || '',
    polymarketProxyAddress: process.env.POLYMARKET_PROXY_ADDRESS || '',
    risk: parseRiskParams(),
    scanIntervalSeconds: Number(process.env.SCAN_INTERVAL_SECONDS) || 300,
  };
}
