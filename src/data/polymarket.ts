import { MarketPrice, Trade } from '../types';
import { loadConfig } from '../config';

const GAMMA_API = 'https://gamma-api.polymarket.com';

export async function fetchNBAMarkets(): Promise<MarketPrice[]> {
  const res = await fetch(
    `${GAMMA_API}/markets?tag=nba&active=true&closed=false&limit=50`
  );

  if (!res.ok) {
    console.error(`[Polymarket] Gamma API error: ${res.status}`);
    return [];
  }

  const raw = await res.json() as Array<Record<string, unknown>>;

  return raw.map((m: Record<string, unknown>) => ({
    marketId: m.id as string,
    gameId: extractGameId(m.question as string),
    question: m.question as string,
    outcome: m.outcomes as string || '',
    price: parsePrice(m.outcomePrices),
    volume: Number(m.volumeNum) || 0,
    timestamp: new Date().toISOString(),
  }));
}

export async function executeTrade(
  marketId: string,
  side: 'BUY' | 'SELL',
  amount: number,
  price: number,
  dryRun: boolean
): Promise<Trade> {
  const trade: Trade = {
    signalId: '',
    marketId,
    direction: side,
    amount,
    price,
    status: dryRun ? 'dry_run' : 'executed',
    timestamp: new Date().toISOString(),
    details: '',
  };

  if (dryRun) {
    trade.details = `[DRY RUN] Would ${side} $${amount} at ${price.toFixed(3)} on market ${marketId}`;
    return trade;
  }

  try {
    const config = loadConfig();
    // Live execution via Polymarket CLOB API
    const res = await fetch('https://clob.polymarket.com/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.polymarketApiKey}`,
      },
      body: JSON.stringify({
        tokenID: marketId,
        price,
        size: amount / price,
        side: side.toLowerCase(),
      }),
    });

    if (!res.ok) {
      trade.status = 'failed';
      trade.details = `API error: ${res.status}`;
    } else {
      trade.details = `Executed ${side} $${amount} at ${price.toFixed(3)}`;
    }
  } catch (err) {
    trade.status = 'failed';
    trade.details = `Exception: ${String(err)}`;
  }

  return trade;
}

function extractGameId(question: string): string {
  const teams = question.match(/([A-Za-z ]+) vs ([A-Za-z ]+)/i);
  return teams ? `${teams[1].trim()} @ ${teams[2].trim()}` : question.slice(0, 50);
}

function parsePrice(prices: unknown): number {
  if (!prices || typeof prices !== 'string') return 0;
  try {
    const parsed = JSON.parse(prices);
    const values: number[] = Object.values(parsed);
    return values[0] || 0;
  } catch {
    return 0;
  }
}
