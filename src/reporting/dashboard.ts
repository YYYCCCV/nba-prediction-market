import { RunSummary } from '../types';

const SEP = '─'.repeat(57);

export function printDashboard(summary: RunSummary): void {
  console.clear();

  console.log('');
  console.log('╔' + '═'.repeat(53) + '╗');
  console.log('║        🏀  NBA PREDICTION MARKET TRADING BOT  🏀     ║');
  console.log('║           DEGA Hackathon — Strategy Engine           ║');
  console.log('╚' + '═'.repeat(53) + '╝');
  console.log('');
  console.log(`${SEP}`);
  console.log('  📊  RUN SUMMARY');
  console.log(`${SEP}`);
  console.log(`  Games Today      : ${summary.gamesFound}`);
  console.log(`  Injuries Reported: ${summary.injuriesFound}`);
  console.log(`  Markets Scanned  : ${summary.marketsScanned}`);
  console.log(`  Signals Generated: ${summary.signalsGenerated.length}`);
  console.log(`  Trades Executed  : ${summary.tradesExecuted.length}`);
  console.log(`${SEP}`);

  if (summary.signalsGenerated.length > 0) {
    console.log('  🎯  SIGNALS');
    console.log(`${SEP}`);
    for (const s of summary.signalsGenerated) {
      console.log(`  [${s.type.padEnd(16)}] ${s.direction} ${s.side.padEnd(5)} ` +
        `| edge=${s.edge.toFixed(4)} | conf=${s.confidence.toFixed(2)}`);
      console.log(`  ${s.reason}`);
      console.log('');
    }
  }

  if (summary.tradesExecuted.length > 0) {
    console.log('  💰  TRADES');
    console.log(`${SEP}`);
    for (const t of summary.tradesExecuted) {
      const status = t.status === 'dry_run' ? '🧪 DRY' : '✅ LIVE';
      console.log(`  ${status} ${t.direction} $${t.amount.toFixed(2)} @ ${t.price.toFixed(3)}`);
    }
    console.log(`${SEP}`);
  }

  console.log(`  Next scan in ${process.env.SCAN_INTERVAL_SECONDS || '300'}s...`);
  console.log('');
}
