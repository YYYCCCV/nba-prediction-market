import { loadConfig } from './config';
import { fetchGames, fetchInjuries } from './data/espn';
import { fetchNBAMarkets } from './data/polymarket';
import { generateMockMarkets, generateDemoData } from './data/mock';
import { runStrategy } from './strategy/engine';
import { processSignals } from './execution/trader';
import { printDashboard } from './reporting/dashboard';
import { writeRunLog } from './reporting/logger';
import { Trade, MarketPrice, Game, Injury } from './types';

let positions: Trade[] = [];

async function run(): Promise<void> {
  const config = loadConfig();
  const useMock = process.env.USE_MOCK_DATA === 'true';
  const useDemo = process.env.USE_DEMO_DATA === 'true';

  console.log('[NBA Bot] Starting scan cycle...');

  let gamesOk: Game[] = [];
  let injuriesOk: Injury[] = [];
  let marketsOk: MarketPrice[] = [];

  if (useDemo) {
    const demo = generateDemoData();
    gamesOk = demo.games;
    injuriesOk = demo.injuries;
    marketsOk = demo.markets;
    console.log('[Demo] Using pre-built demo data (2 games, 4 star injuries, 3 markets)');
  } else {
    const [games, injuries, markets] = await Promise.allSettled([
      fetchGames(),
      fetchInjuries(),
      useMock ? Promise.resolve([]) : fetchNBAMarkets(),
    ]);

    gamesOk = (games as PromiseFulfilledResult<Game[]>).value || [];
    injuriesOk = (injuries as PromiseFulfilledResult<Injury[]>).value || [];

    if (games.status === 'rejected') console.error('[ESPN] Games API failed:', (games as PromiseRejectedResult).reason);

    if (useMock) {
      marketsOk = generateMockMarkets(gamesOk);
      console.log(`[Mock] Generated ${marketsOk.length} simulated markets`);
    } else if (markets.status === 'fulfilled') {
      marketsOk = (markets as PromiseFulfilledResult<MarketPrice[]>).value;
    } else {
      console.error('[Polymarket] API failed (VPN needed), no market data — use USE_MOCK_DATA=true for demo');
    }
  }

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
  const useDemo = process.env.USE_DEMO_DATA === 'true';
  const dataLabel = useDemo ? 'DEMO' : (useMock ? 'MOCK' : 'LIVE');
  console.log(`[NBA Bot] Mode: ${config.risk.dryRun ? 'DRY RUN' : 'LIVE'} | Data: ${dataLabel}`);
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
