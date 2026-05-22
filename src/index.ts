import { loadConfig } from './config';
import { fetchGames, fetchInjuries } from './data/espn';
import { fetchNBAMarkets } from './data/polymarket';
import { generateMockMarkets } from './data/mock';
import { runStrategy } from './strategy/engine';
import { processSignals } from './execution/trader';
import { printDashboard } from './reporting/dashboard';
import { writeRunLog } from './reporting/logger';
import { Trade, MarketPrice, Game, Injury } from './types';

let positions: Trade[] = [];

async function run(): Promise<void> {
  const config = loadConfig();
  const useMock = process.env.USE_MOCK_DATA === 'true';

  console.log('[NBA Bot] Starting scan cycle...');

  const [games, injuries, markets] = await Promise.allSettled([
    fetchGames(),
    fetchInjuries(),
    useMock ? Promise.resolve([]) : fetchNBAMarkets(),
  ]);

  const gamesOk = (games as PromiseFulfilledResult<Game[]>).value || [];
  const injuriesOk = (injuries as PromiseFulfilledResult<Injury[]>).value || [];

  let marketsOk: MarketPrice[] = [];
  if (useMock) {
    marketsOk = generateMockMarkets(gamesOk);
    console.log(`[Mock] Generated ${marketsOk.length} simulated markets`);
  } else if (markets.status === 'fulfilled') {
    marketsOk = (markets as PromiseFulfilledResult<MarketPrice[]>).value;
  } else {
    console.error('[Polymarket] API failed (VPN needed), no market data — use USE_MOCK_DATA=true for demo');
  }

  if (games.status === 'rejected') console.error('[ESPN] Games API failed:', (games as PromiseRejectedResult).reason);

  const result = runStrategy(gamesOk, injuriesOk, marketsOk, config.risk.minEdgeThreshold);

  const trades = await processSignals(result.signals, positions, config.risk);
  positions = [...positions, ...trades];

  const summary = {
    timestamp: new Date().toISOString(),
    gamesFound: gamesOk.length,
    injuriesFound: injuriesOk.length,
    marketsScanned: marketsOk.length,
    signalsGenerated: result.signals,
    tradesExecuted: trades,
  };

  printDashboard(summary);
  writeRunLog(summary);
}

async function main(): Promise<void> {
  const config = loadConfig();
  const useMock = process.env.USE_MOCK_DATA === 'true';
  console.log(`[NBA Bot] Mode: ${config.risk.dryRun ? 'DRY RUN 🧪' : 'LIVE 💰'} | Data: ${useMock ? 'MOCK' : 'LIVE'}`);
  console.log(`[NBA Bot] Max trade: $${config.risk.maxTradeAmount} | Min edge: ${config.risk.minEdgeThreshold}`);
  console.log(`[NBA Bot] Scan interval: ${config.scanIntervalSeconds}s`);
  console.log('');

  await run();
  setInterval(run, config.scanIntervalSeconds * 1000);
}

main().catch((err) => {
  console.error('[NBA Bot] Fatal error:', err);
  process.exit(1);
});
