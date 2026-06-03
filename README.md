# True Mobsters

**True Mobsters** by **VisionIt Studio** — a server-authoritative multiplayer mafia RPG inspired by classic mobster games, with 100% original names, artwork, and content.

## Live Game

**Play now:** [https://true-mobster.onrender.com](https://true-mobster.onrender.com)

**GitHub:** [https://github.com/taedetta/True-Mobster](https://github.com/taedetta/True-Mobster)

## Full Feature Set (iMobsters-style)

### Core Gameplay
- **Jobs** — 90+ location-based missions across 12 districts in 3 cities
- **PvP Combat** — Slap, Fight, and Execute attack types with stamina costs
- **Mob / Allies** — Recruit up to 500 mob members for combat bonuses
- **Hitlist** — Place bounties with 1.5x bonus rewards for killers
- **Boss Battles** — 5 epic PvE bosses with huge payouts
- **Ice / Safehouse** — Buy protection from attacks
- **Jail & Bail** — Failed jobs send you to jail; pay bail to escape early

### Economy & Gear
- **20 Weapons, 20 Armor, 15 Vehicles, 15 Properties** — tiered shop with sell-back
- **6 Consumables** — Energy, stamina, health, mob contracts, ice packs, XP boost
- **Property Income** — Hourly passive cash collection
- **Bank** — Deposit and withdraw safely
- **Hospital** — Heal for cash
- **Gold Currency** — Premium currency from jobs and achievements
- **Scratch Cards** — Lottery-style instant prizes

### Social & Multiplayer
- **30 Bot Rivals** — Attack them; they fight back automatically
- **Friends & Gifts** — Add friends, send money/energy/stamina
- **Referral Codes** — Invite players for bonus cash
- **Crews** — Create gangs, donate, kick, transfer leadership
- **Territory Wars** — Crew leaders capture zones for bonuses
- **Mail & News Feed** — Combat notifications and city events
- **Revenge List** — Track who attacked you

### Progression
- **Leveling & Skills** — 5 skill trees (attack, defense, energy, stamina, health)
- **20 Achievements** — Unlock and claim rewards
- **Daily Login Streak** — 7-day reward cycle
- **Daily Missions** — Rotating objectives with gold/XP rewards
- **Collections** — Item set bonuses for combat
- **Leaderboard** — Respect and level rankings

### Security
- **100% server-authoritative** — All stats, combat, and economy validated server-side
- JWT authentication, bcrypt passwords, rate limiting
- Bots cannot be logged into

## Content Scale

| Category | Count |
|----------|-------|
| Locations / Districts | 12 |
| Jobs | 90+ |
| Weapons | 20 |
| Armor | 20 |
| Vehicles | 15 |
| Properties | 15 |
| Consumables | 6 |
| Bosses | 5 |
| Territories | 6 |
| Bot Rivals | 30 |
| SVG Thumbnails | 186 |
| Achievements | 20 |

## Local Development

```bash
cd "C:\Users\Darth Vader\Desktop\True Mobster"
npm install
npm run install:all
npm run generate-thumbnails

# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173**

## Deploy (Render)

The game is deployed on Render as **true-mobster**:
- Dashboard: https://dashboard.render.com/web/srv-d8focpq8qa3s73ageblg
- Uses PostgreSQL with isolated `true_mobsters` schema (shared free-tier DB)

To redeploy after changes:
```bash
git push origin main
```
Render auto-deploys from the `main` branch.

## Project Structure

```
True Mobster/
├── client/          React + Vite + Tailwind UI
├── server/          Express + PostgreSQL/SQLite + Socket.IO
├── shared/          Game data definitions
├── render.yaml      Render Blueprint config
└── README.md
```

## Studio

**VisionIt** — True Mobsters v2.0
