// ---- Data Structures ----

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: 'scheduled' | 'live' | 'final';
  startTime: string;
}

export interface Injury {
  player: string;
  team: string;
  status: 'OUT' | 'QUESTIONABLE' | 'DOUBTFUL' | 'PROBABLE';
  details: string;
}

export interface MarketPrice {
  marketId: string;
  gameId: string;
  question: string;
  outcome: string;
  price: number; // 0.00 - 1.00 (probability)
  volume: number;
  timestamp: string;
}

// ---- Signal Types ----

export type SignalType = 'injury_speed' | 'cross_market_arb' | 'momentum';

export interface Signal {
  type: SignalType;
  gameId: string;
  marketId: string;
  direction: 'BUY' | 'SELL';
  side: 'HOME' | 'AWAY';
  estimatedProbability: number;
  marketPrice: number;
  edge: number;
  confidence: number;
  reason: string;
  timestamp: string;
}

// ---- Execution ----

export interface Trade {
  signalId: string;
  marketId: string;
  direction: 'BUY' | 'SELL';
  amount: number;
  price: number;
  status: 'dry_run' | 'executed' | 'failed';
  timestamp: string;
  details: string;
}

export interface RiskParams {
  maxTradeAmount: number;
  minEdgeThreshold: number;
  maxPositionPerGame: number;
  dryRun: boolean;
}

// ---- Bot Configuration ----

export interface BotConfig {
  polymarketApiKey: string;
  polymarketPrivateKey: string;
  polymarketProxyAddress: string;
  risk: RiskParams;
  scanIntervalSeconds: number;
}

// ---- Run Summary ----

export interface RunSummary {
  timestamp: string;
  gamesFound: number;
  injuriesFound: number;
  marketsScanned: number;
  signalsGenerated: Signal[];
  tradesExecuted: Trade[];
}
