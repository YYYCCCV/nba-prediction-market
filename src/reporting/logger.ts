import { Signal, Trade, RunSummary } from '../types';
import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');

export function writeRunLog(summary: RunSummary): string {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(LOG_DIR, `run_${date}.log`);

  const lines = [
    `=== Run ${timestamp} ===`,
    `Games Today    : ${summary.gamesFound}`,
    `Injuries       : ${summary.injuriesFound}`,
    `Markets Scanned: ${summary.marketsScanned}`,
    `Signals Found  : ${summary.signalsGenerated.length}`,
    `Trades Executed: ${summary.tradesExecuted.length}`,
    '',
  ];

  for (const s of summary.signalsGenerated) {
    lines.push(
      `[SIGNAL] ${s.type} | ${s.gameId} | ${s.direction} ${s.side} ` +
      `| edge=${s.edge.toFixed(4)} | conf=${s.confidence.toFixed(2)} ` +
      `| reason="${s.reason}"`
    );
  }

  for (const t of summary.tradesExecuted) {
    lines.push(
      `[TRADE] ${t.status} | ${t.direction} $${t.amount.toFixed(2)} ` +
      `@ ${t.price.toFixed(3)} | ${t.details}`
    );
  }

  lines.push('\n');
  fs.appendFileSync(logPath, lines.join('\n'), 'utf-8');
  return logPath;
}
