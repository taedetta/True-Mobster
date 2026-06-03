import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/true-mobsters.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_bot INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS players (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    respect INTEGER DEFAULT 0,
    money INTEGER DEFAULT 500,
    bank_balance INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 10,
    max_energy INTEGER DEFAULT 10,
    stamina INTEGER DEFAULT 5,
    max_stamina INTEGER DEFAULT 5,
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    attack_skill INTEGER DEFAULT 1,
    defense_skill INTEGER DEFAULT 1,
    energy_skill INTEGER DEFAULT 0,
    stamina_skill INTEGER DEFAULT 0,
    health_skill INTEGER DEFAULT 0,
    skill_points INTEGER DEFAULT 0,
    equipped_weapon TEXT,
    equipped_armor TEXT,
    equipped_vehicle TEXT,
    in_jail_until TEXT,
    last_energy_regen TEXT DEFAULT (datetime('now')),
    last_stamina_regen TEXT DEFAULT (datetime('now')),
    last_health_regen TEXT DEFAULT (datetime('now')),
    last_income_collect TEXT DEFAULT (datetime('now')),
    crew_id TEXT,
    crew_role TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    jobs_done INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS hitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    placed_by TEXT NOT NULL REFERENCES users(id),
    bounty INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    claimed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS crews (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    leader_id TEXT NOT NULL REFERENCES users(id),
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS combat_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attacker_id TEXT NOT NULL,
    defender_id TEXT NOT NULL,
    attacker_won INTEGER NOT NULL,
    money_stolen INTEGER DEFAULT 0,
    respect_gained INTEGER DEFAULT 0,
    bounty_claimed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS job_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    success INTEGER NOT NULL,
    money_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    jailed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bot_retaliation_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    execute_at TEXT NOT NULL,
    processed INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_hitlist_target ON hitlist(target_id, claimed);
  CREATE INDEX IF NOT EXISTS idx_combat_attacker ON combat_log(attacker_id);
  CREATE INDEX IF NOT EXISTS idx_combat_defender ON combat_log(defender_id);
`);

export default db;
