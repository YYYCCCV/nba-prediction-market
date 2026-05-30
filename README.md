# NBA Prediction Market Trading Bot

AI-powered automated trading bot for NBA Playoffs prediction markets. Built for the DEGA NBA Playoffs Prediction Market Hackathon on DoraHacks.

Demo video: https://youtu.be/IN5WcnTFFIM

## What It Does

The bot combines NBA game data, injury reports, market prices, signal generation, risk management, and dry-run execution into one reproducible trading workflow.

Core strategies:

- Injury speed signals: detect star player injuries from ESPN-style reports before prediction market prices fully adjust.
- Cross-market arbitrage: compare related markets for the same game and flag meaningful price gaps.
- Quarter-Kelly sizing: apply conservative position sizing before any trade reaches the executor.
- Dry-run execution: demonstrate the full trading loop without risking real funds.

## Architecture

```text
ESPN games + injuries       \
                             -> Strategy Engine -> Risk Manager -> Dry-Run Trader -> Dashboard
Prediction market prices    /
```

```text
nba-prediction-market/
|-- src/
|   |-- index.ts              # Main entry and scan loop
|   |-- config.ts             # Environment-based config
|   |-- types.ts              # Shared TypeScript interfaces
|   |-- data/
|   |   |-- espn.ts           # ESPN public API integration
|   |   |-- polymarket.ts     # Polymarket market integration
|   |   `-- mock.ts           # Mock and deterministic demo data
|   |-- strategy/
|   |   |-- engine.ts         # Strategy orchestration
|   |   |-- signals.ts        # Injury-speed and cross-market signals
|   |   `-- risk.ts           # Quarter-Kelly risk management
|   |-- execution/
|   |   `-- trader.ts         # Dry-run/live trade executor
|   `-- reporting/
|       |-- dashboard.ts      # Terminal dashboard
|       `-- logger.ts         # Audit logs
|-- tests/
|   |-- signals.test.ts
|   |-- strategy.test.ts
|   `-- risk.test.ts
`-- logs/
```

## Quick Start

```bash
npm install
npm test
npm start
```

Windows demo mode used in the submission video:

```bash
npm.cmd test -- --runInBand
npm.cmd run demo
```

Demo mode forces deterministic data so reviewers can reproduce the video output without VPN access or live market availability.

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `DRY_RUN` | `true` | Dry-run mode; no real money is used. |
| `MAX_TRADE_AMOUNT` | `10` | Maximum simulated dollars per trade. |
| `MIN_EDGE_THRESHOLD` | `0.05` | Minimum edge needed to trigger a signal. |
| `MAX_POSITION_PER_GAME` | `50` | Maximum exposure per game. |
| `SCAN_INTERVAL_SECONDS` | `300` | Seconds between scan cycles. |
| `USE_MOCK_DATA` | `false` | Use mock market prices instead of live market data. |
| `USE_DEMO_DATA` | `false` | Use deterministic demo data with guaranteed signals. |
| `POLYMARKET_API_KEY` | - | Optional Polymarket API key. |
| `POLYMARKET_PRIVATE_KEY` | - | Optional private key for live execution. |
| `POLYMARKET_PROXY_ADDRESS` | - | Optional proxy address for live execution. |

## Demo Output

The submitted demo run uses deterministic data:

```text
[NBA Bot] Mode: DRY RUN | Data: DEMO
[Demo] Using pre-built demo data (2 games, 4 star injuries, 3 markets)

Games Today      : 2
Injuries Reported: 4
Markets Scanned  : 3
Signals Generated: 3
Trades Executed  : 3
```

The three generated signals include one cross-market arbitrage opportunity and two injury-speed signals. All trades execute as dry-run simulations.

## Safety Features

- Dry-run mode by default.
- Minimum edge threshold.
- Per-game exposure limits.
- Quarter-Kelly position sizing.
- Graceful data fallback using `Promise.allSettled`.
- File and terminal audit output.

## Migration Path: Mantle Turing Test Hackathon

The core modules are designed as pure, chain-agnostic functions and can be reused for a Mantle or Bybit-based trading agent.

| Module | Reuse | Migration Needed |
| --- | --- | --- |
| `strategy/engine.ts` | Full | None; generic orchestration. |
| `strategy/signals.ts` | Full | Signal interface is chain-agnostic. |
| `strategy/risk.ts` | Full | Kelly sizing and exposure tracking are universal. |
| `data/espn.ts` | Replace | Swap ESPN for oracle, news, or on-chain alert feeds. |
| `data/polymarket.ts` | Replace | Swap Polymarket for Bybit, Mantle DEX, or another venue. |
| `execution/trader.ts` | Partial | Replace execution target. |
| `reporting/` | Full | Dashboard and logs work with any trade source. |

## Submission Links

- Demo video: https://youtu.be/IN5WcnTFFIM
- Source code: https://github.com/YYYCCCV/nba-prediction-market
