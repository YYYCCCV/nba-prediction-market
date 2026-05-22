# NBA Prediction Market Trading Bot

AI-powered automated trading bot for NBA Playoffs prediction markets. Built for the **DEGA NBA Playoffs Prediction Market Hackathon** (DoraHacks).

## Strategy

Multi-signal prediction market trading engine:

- **Injury Speed-Based**: Detects star player injuries from ESPN and trades before market prices adjust
- **Cross-Market Arbitrage**: Identifies price discrepancies across related markets for the same game

## Architecture

```
ESPN API → Games + Injuries → ┐
                               ├→ Strategy Engine → Risk Manager → Trade Executor → Dashboard
Polymarket API → Market Prices → ┘
```

```
nba-prediction-market/
├── src/
│   ├── index.ts              # Main entry, bot loop
│   ├── config.ts             # Environment-based config
│   ├── types.ts              # TypeScript interfaces
│   ├── data/
│   │   ├── espn.ts           # ESPN public API (games, injuries)
│   │   └── polymarket.ts     # Polymarket Gamma API (markets, trades)
│   ├── strategy/
│   │   ├── engine.ts         # ⭐ Strategy engine (Mantle B reusable)
│   │   ├── signals.ts        # ⭐ Signal generation (Mantle B reusable)
│   │   └── risk.ts           # ⭐ Risk management (Mantle B reusable)
│   ├── execution/
│   │   └── trader.ts         # Trade execution (dry-run / live)
│   └── reporting/
│       ├── dashboard.ts      # Terminal dashboard
│       └── logger.ts         # File-based audit logs
├── tests/
│   ├── signals.test.ts
│   ├── strategy.test.ts
│   └── risk.test.ts
└── logs/                     # Auto-generated run logs
```

## Quick Start

```bash
npm install
cp .env.example .env
npm test
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DRY_RUN` | `true` | Dry-run mode (no real money) |
| `MAX_TRADE_AMOUNT` | `10` | Max $ per trade |
| `MIN_EDGE_THRESHOLD` | `0.05` | Minimum edge to trigger |
| `MAX_POSITION_PER_GAME` | `50` | Max exposure per game |
| `SCAN_INTERVAL_SECONDS` | `300` | Seconds between scans |
| `POLYMARKET_API_KEY` | - | Polymarket API key |
| `POLYMARKET_PRIVATE_KEY` | - | Polymarket private key |
| `POLYMARKET_PROXY_ADDRESS` | - | Polymarket proxy address |

## Migration Path → Mantle Turing Test Hackathon (B)

Modules marked ⭐ are **100% reusable** for the Mantle hackathon:

| Module | Reuse | Migration Needed |
|--------|-------|------------------|
| `strategy/engine.ts` | Full | None — pure math, generic interfaces |
| `strategy/signals.ts` | Full | Signal interface is chain-agnostic |
| `strategy/risk.ts` | Full | Kelly sizing + exposure tracking is universal |
| `data/espn.ts` | Replace | Swap ESPN → on-chain oracle / alert feed |
| `data/polymarket.ts` | Replace | Swap Polymarket → Bybit API / Mantle DEX |
| `execution/trader.ts` | Partial | Swap execution target to Bybit API |
| `reporting/` | Full | Dashboard + logger work with any Trade[] |

## Safety Features

- **Dry Run Mode** — test without real money
- **Max Trade Amount** — per-trade cap
- **Min Edge Threshold** — only trade on meaningful edge
- **Position Limits** — max exposure per game
- **Quarter-Kelly Sizing** — conservative bet sizing
- **Full Audit Logs** — every decision recorded
