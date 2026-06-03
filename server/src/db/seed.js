import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './database.js';
import {
  BASE_STATS, STAT_GROWTH_PER_LEVEL, BOT_NAMES, WEAPONS, ARMOR, VEHICLES,
} from '../../../shared/gameData.js';

const BOT_PASSWORD = bcrypt.hashSync('bot-internal-only-' + process.env.JWT_SECRET, 10);

function createPlayer(userId, displayName) {
  db.prepare(`
    INSERT INTO players (user_id, display_name, energy, max_energy, stamina, max_stamina, health, max_health)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, displayName,
    BASE_STATS.maxEnergy, BASE_STATS.maxEnergy,
    BASE_STATS.maxStamina, BASE_STATS.maxStamina,
    BASE_STATS.maxHealth, BASE_STATS.maxHealth,
  );
}

function equipStarterGear(userId, level) {
  const weapon = WEAPONS.filter((w) => w.minLevel <= level).pop();
  const armor = ARMOR.filter((a) => a.minLevel <= level).pop();
  const vehicle = VEHICLES.filter((v) => v.minLevel <= level).pop();

  const insert = db.prepare(`
    INSERT OR IGNORE INTO inventory (user_id, item_id, category) VALUES (?, ?, ?)
  `);

  if (weapon) {
    insert.run(userId, weapon.id, 'weapon');
    db.prepare('UPDATE players SET equipped_weapon = ? WHERE user_id = ?').run(weapon.id, userId);
  }
  if (armor) {
    insert.run(userId, armor.id, 'armor');
    db.prepare('UPDATE players SET equipped_armor = ? WHERE user_id = ?').run(armor.id, userId);
  }
  if (vehicle) {
    insert.run(userId, vehicle.id, 'vehicle');
    db.prepare('UPDATE players SET equipped_vehicle = ? WHERE user_id = ?').run(vehicle.id, userId);
  }
}

function createBot(name, level, stats) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(name);
  if (existing) return existing.id;

  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, email, password_hash, is_bot) VALUES (?, ?, ?, ?, 1)')
    .run(id, name, `${name.toLowerCase()}@bots.visionit.local`, BOT_PASSWORD);

  createPlayer(id, name);

  const xpForLevel = (lvl) => {
    let total = 0;
    for (let i = 1; i < lvl; i++) total += Math.floor(100 * Math.pow(i, 1.85));
    return total;
  };

  db.prepare(`
    UPDATE players SET
      level = ?, xp = ?, respect = ?, money = ?,
      max_energy = ?, energy = ?, max_stamina = ?, stamina = ?,
      max_health = ?, health = ?,
      attack_skill = ?, defense_skill = ?,
      wins = ?, losses = ?
    WHERE user_id = ?
  `).run(
    level, xpForLevel(level), stats.respect, stats.money,
    BASE_STATS.maxEnergy + (level - 1) * STAT_GROWTH_PER_LEVEL.maxEnergy + stats.energySkill,
    BASE_STATS.maxEnergy + (level - 1) * STAT_GROWTH_PER_LEVEL.maxEnergy + stats.energySkill,
    BASE_STATS.maxStamina + (level - 1) * STAT_GROWTH_PER_LEVEL.maxStamina + stats.staminaSkill,
    BASE_STATS.maxStamina + (level - 1) * STAT_GROWTH_PER_LEVEL.maxStamina + stats.staminaSkill,
    BASE_STATS.maxHealth + (level - 1) * STAT_GROWTH_PER_LEVEL.maxHealth + stats.healthSkill,
    BASE_STATS.maxHealth + (level - 1) * STAT_GROWTH_PER_LEVEL.maxHealth + stats.healthSkill,
    stats.attack, stats.defense,
    stats.wins, stats.losses,
    id,
  );

  equipStarterGear(id, level);

  const tierWeapons = WEAPONS.filter((w) => w.minLevel <= level);
  const tierArmor = ARMOR.filter((a) => a.minLevel <= level);
  const bestWeapon = tierWeapons[Math.min(tierWeapons.length - 1, Math.floor(level / 8))];
  const bestArmor = tierArmor[Math.min(tierArmor.length - 1, Math.floor(level / 8))];

  if (bestWeapon) db.prepare('UPDATE players SET equipped_weapon = ? WHERE user_id = ?').run(bestWeapon.id, id);
  if (bestArmor) db.prepare('UPDATE players SET equipped_armor = ? WHERE user_id = ?').run(bestArmor.id, id);

  return id;
}

export function seedBots() {
  const levels = [5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 10, 18, 22, 28, 32, 38, 42, 50, 55, 60];
  BOT_NAMES.forEach((name, i) => {
    const level = levels[i] || 10 + i;
    createBot(name, level, {
      respect: level * 15 + Math.floor(Math.random() * 100),
      money: level * 5000 + Math.floor(Math.random() * 10000),
      attack: Math.max(1, Math.floor(level * 0.8)),
      defense: Math.max(1, Math.floor(level * 0.7)),
      energySkill: Math.floor(level / 5),
      staminaSkill: Math.floor(level / 6),
      healthSkill: Math.floor(level / 4),
      wins: Math.floor(level * 2.5),
      losses: Math.floor(level * 1.2),
    });
  });
  console.log(`Seeded ${BOT_NAMES.length} bot accounts for PvP.`);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
    process.argv[1]?.endsWith('seed.js')) {
  seedBots();
  console.log('Database seed complete.');
}
