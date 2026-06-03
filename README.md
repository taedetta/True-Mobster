# True Mobsters

**True Mobsters** is a server-authoritative multiplayer mafia RPG by **VisionIt Studio**. Build your criminal empire, complete jobs, fight rivals, manage crews, and climb the hitlist — inspired by classic mobster games but with entirely original names, assets, and artwork.

## Features

- **Server-side everything** — All stats, combat, economy, and progression are validated on the server. The client cannot modify money, stats, or outcomes.
- **Jobs** — Location-based missions across 6 districts with energy costs, XP, money, and jail risk
- **PvP Combat** — Attack other players using stamina; win money and respect
- **Hitlist** — Place bounties on rivals for bonus rewards when defeated
- **Shop** — Weapons, armor, vehicles, and income-generating properties
- **Crews** — Form gangs for combat bonuses
- **Bank & Hospital** — Store cash safely and heal after fights
- **20 Bot Rivals** — AI-controlled accounts for PvP that **fight back** when attacked
- **Leaderboard** — Compete for respect and level rankings
- **Original SVG thumbnails** — Every job, item, and location has a unique generated thumbnail

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+

### Install

```bash
cd "C:\Users\Darth Vader\Desktop\True Mobster"
npm install
npm run install:all
npm run generate-thumbnails
```

### Run (development)

Terminal 1 — Server:
```bash
cd server
npm run dev
```

Terminal 2 — Client:
```bash
cd client
npm run dev
```

Open **http://localhost:5173** and register an account.

### Production

```bash
npm run build
cd server
set NODE_ENV=production
npm start
```

Serves the built client from the server on port 3001.

## Security

| Layer | Protection |
|-------|-----------|
| Auth | JWT tokens, bcrypt password hashing |
| Game logic | 100% server-side — client sends actions only |
| Rate limiting | Global + per-action limits on fights/jobs/buys |
| Validation | All inputs validated; no client-trusted values |
| Bots | Internal-only credentials, not login-accessible |

Change `JWT_SECRET` in `server/.env` before deploying to production.

## Project Structure

```
True Mobster/
├── client/          React + Vite + Tailwind UI
├── server/          Express + SQLite game server
├── shared/          Game data definitions
└── README.md
```

## Bot Accounts

On first server start, 20 bot rivals are seeded (ShadowViper, IronFist, etc.) at various levels with gear. Attack them from the **Fight** tab — they will retaliate within 30–120 seconds.

## Studio

**VisionIt** — True Mobsters v1.0

## License

Private project. All assets and names are original.
