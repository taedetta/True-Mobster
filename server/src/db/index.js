import pg from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const isPostgres = !!process.env.DATABASE_URL;

let sqliteDb = null;
let pgPool = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_bot INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS players (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    respect INTEGER DEFAULT 0,
    money INTEGER DEFAULT 500,
    bank_balance INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 0,
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
    mob_size INTEGER DEFAULT 1,
    max_mob INTEGER DEFAULT 10,
    equipped_weapon TEXT,
    equipped_armor TEXT,
    equipped_vehicle TEXT,
    in_jail_until TIMESTAMPTZ,
    iced_until TIMESTAMPTZ,
    xp_boost_until TIMESTAMPTZ,
    last_energy_regen TIMESTAMPTZ DEFAULT NOW(),
    last_stamina_regen TIMESTAMPTZ DEFAULT NOW(),
    last_health_regen TIMESTAMPTZ DEFAULT NOW(),
    last_income_collect TIMESTAMPTZ DEFAULT NOW(),
    last_daily_claim TIMESTAMPTZ,
    daily_streak INTEGER DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    crew_id TEXT,
    crew_role TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    jobs_done INTEGER DEFAULT 0,
    bounties_claimed INTEGER DEFAULT 0,
    boss_kills INTEGER DEFAULT 0,
    scratch_jackpot INTEGER DEFAULT 0,
    daily_spent INTEGER DEFAULT 0,
    daily_mob_recruited INTEGER DEFAULT 0,
    daily_mission_date TEXT,
    daily_mission_progress TEXT DEFAULT '{}',
    daily_mission_claimed TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS hitlist (
    id SERIAL PRIMARY KEY,
    target_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    placed_by TEXT NOT NULL REFERENCES users(id),
    bounty INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS crews (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    leader_id TEXT NOT NULL REFERENCES users(id),
    description TEXT DEFAULT '',
    bank_balance INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS combat_log (
    id SERIAL PRIMARY KEY,
    attacker_id TEXT NOT NULL,
    defender_id TEXT NOT NULL,
    fight_type TEXT DEFAULT 'fight',
    attacker_won INTEGER NOT NULL,
    money_stolen INTEGER DEFAULT 0,
    respect_gained INTEGER DEFAULT 0,
    bounty_claimed INTEGER DEFAULT 0,
    killed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS job_log (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    success INTEGER NOT NULL,
    money_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    jailed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS bot_retaliation_queue (
    id SERIAL PRIMARY KEY,
    bot_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    execute_at TIMESTAMPTZ NOT NULL,
    processed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'accepted',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
  );

  CREATE TABLE IF NOT EXISTS gifts (
    id SERIAL PRIMARY KEY,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    gift_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    claimed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS achievements (
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    claimed INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, achievement_id)
  );

  CREATE TABLE IF NOT EXISTS mail (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    mail_type TEXT DEFAULT 'system',
    data TEXT DEFAULT '{}',
    read_status INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS news_feed (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS boss_fights (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    boss_id TEXT NOT NULL,
    won INTEGER NOT NULL,
    damage_dealt INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS scratch_log (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    amount INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS territories (
    id TEXT PRIMARY KEY,
    crew_id TEXT REFERENCES crews(id),
    captured_at TIMESTAMPTZ,
    last_war_at TIMESTAMPTZ
  );

  CREATE TABLE IF NOT EXISTS crew_wars (
    id SERIAL PRIMARY KEY,
    attacker_crew_id TEXT NOT NULL,
    defender_crew_id TEXT NOT NULL,
    territory_id TEXT NOT NULL,
    attacker_won INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    channel TEXT NOT NULL,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS private_messages (
    id SERIAL PRIMARY KEY,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    subject TEXT DEFAULT '',
    body TEXT NOT NULL,
    read_status INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS mob_allies (
    user_id TEXT NOT NULL,
    ally_id TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, ally_id)
  );

  CREATE INDEX IF NOT EXISTS idx_chat_channel ON chat_messages(channel, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_hitlist_target ON hitlist(target_id, claimed);
  CREATE INDEX IF NOT EXISTS idx_combat_attacker ON combat_log(attacker_id);
  CREATE INDEX IF NOT EXISTS idx_combat_defender ON combat_log(defender_id);
  CREATE INDEX IF NOT EXISTS idx_pm_to ON private_messages(to_id, read_status);
  CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
  CREATE INDEX IF NOT EXISTS idx_mail_user ON mail(user_id, read_status);
  CREATE INDEX IF NOT EXISTS idx_news_created ON news_feed(created_at DESC);
`;

const SQLITE_SCHEMA = SCHEMA
  .replace(/SERIAL/g, 'INTEGER')
  .replace(/TIMESTAMPTZ/g, 'TEXT')
  .replace(/NOW\(\)/g, "(datetime('now'))")
  .replace(/INTEGER DEFAULT 0/g, 'INTEGER DEFAULT 0');

function fixSqlForPg(sql) {
  return sql
    .replace(/DO UPDATE SET quantity=quantity\+1/g, 'DO UPDATE SET quantity=inventory.quantity+1')
    .replace(/INSERT INTO inventory \(user_id, item_id, category\) VALUES \(\$\d+, \$\d+, \$\d+\) ON CONFLICT DO NOTHING/g,
      (m) => m.replace('ON CONFLICT DO NOTHING', 'ON CONFLICT (user_id, item_id) DO NOTHING'));
}

function toPgParams(sql, params) {
  let i = 0;
  const pgSql = fixSqlForPg(sql.replace(/\?/g, () => `$${++i}`));
  return [pgSql, params];
}

export async function initDatabase() {
  if (isPostgres) {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    pgPool.on('connect', (client) => {
      client.query('SET search_path TO true_mobsters, public');
    });
    const client = await pgPool.connect();
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS true_mobsters');
      await client.query('SET search_path TO true_mobsters');
      await client.query(SCHEMA);
      const pgMigrations = [
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'default_01'",
        'ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_custom TEXT',
      ];
      for (const m of pgMigrations) {
        try { await client.query(m); } catch { /* */ }
      }
      for (const t of ['downtown_block', 'industrial_yard', 'waterfront_docks', 'casino_strip', 'skyline_crown', 'empire_throne']) {
        await client.query('INSERT INTO territories (id) VALUES ($1) ON CONFLICT DO NOTHING', [t]);
      }
    } finally {
      client.release();
    }
    return;
  }
  const dbPath = path.join(__dirname, '../../data/true-mobsters.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  sqliteDb.exec(SQLITE_SCHEMA);
  const migrations = [
    'ALTER TABLE players ADD COLUMN gold INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN mob_size INTEGER DEFAULT 1',
    'ALTER TABLE players ADD COLUMN max_mob INTEGER DEFAULT 10',
    'ALTER TABLE players ADD COLUMN iced_until TEXT',
    'ALTER TABLE players ADD COLUMN xp_boost_until TEXT',
    'ALTER TABLE players ADD COLUMN last_daily_claim TEXT',
    'ALTER TABLE players ADD COLUMN daily_streak INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN referral_code TEXT',
    'ALTER TABLE players ADD COLUMN referred_by TEXT',
    'ALTER TABLE players ADD COLUMN kills INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN bounties_claimed INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN boss_kills INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN scratch_jackpot INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN daily_spent INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN daily_mob_recruited INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN daily_mission_date TEXT',
    'ALTER TABLE players ADD COLUMN daily_mission_progress TEXT DEFAULT \'{}\'',
    'ALTER TABLE players ADD COLUMN daily_mission_claimed TEXT DEFAULT \'[]\'',
    'ALTER TABLE crews ADD COLUMN bank_balance INTEGER DEFAULT 0',
    'ALTER TABLE crews ADD COLUMN level INTEGER DEFAULT 1',
    'ALTER TABLE combat_log ADD COLUMN fight_type TEXT DEFAULT \'fight\'',
    'ALTER TABLE combat_log ADD COLUMN killed INTEGER DEFAULT 0',
    "ALTER TABLE players ADD COLUMN avatar_id TEXT DEFAULT 'default_01'",
    'ALTER TABLE players ADD COLUMN avatar_custom TEXT',
  ];
  for (const m of migrations) {
    try { sqliteDb.exec(m); } catch { /* column exists */ }
  }
  const territories = ['downtown_block', 'industrial_yard', 'waterfront_docks', 'casino_strip', 'skyline_crown', 'empire_throne'];
  for (const t of territories) {
    sqliteDb.prepare('INSERT OR IGNORE INTO territories (id) VALUES (?)').run(t);
  }
}

export async function run(sql, params = []) {
  if (isPostgres) {
    const [pgSql, pgParams] = toPgParams(sql, params);
    await pgPool.query(pgSql, pgParams);
    return;
  }
  sqliteDb.prepare(sql).run(...params);
}

export async function get(sql, params = []) {
  if (isPostgres) {
    const [pgSql, pgParams] = toPgParams(sql, params);
    const res = await pgPool.query(pgSql, pgParams);
    return res.rows[0] || null;
  }
  return sqliteDb.prepare(sql).get(...params) || null;
}

export async function all(sql, params = []) {
  if (isPostgres) {
    const [pgSql, pgParams] = toPgParams(sql, params);
    const res = await pgPool.query(pgSql, pgParams);
    return res.rows;
  }
  return sqliteDb.prepare(sql).all(...params);
}

export async function exec(sql) {
  if (isPostgres) {
    await pgPool.query(sql);
    return;
  }
  sqliteDb.exec(sql);
}

export default { run, get, all, exec, initDatabase, isPostgres };
