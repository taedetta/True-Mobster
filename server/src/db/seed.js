import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './index.js';
import {
  BASE_STATS, STAT_GROWTH_PER_LEVEL, BOT_NAMES, WEAPONS, ARMOR, VEHICLES, generateReferralCode,
  MOB_USABLE_PER_LEVEL,
} from '../../../shared/gameData.js';

const BOT_PASSWORD = bcrypt.hashSync('bot-internal-visionit-' + (process.env.JWT_SECRET || 'dev'), 10);

function xpForLevel(lvl) {
  let total = 0;
  for (let i = 1; i < lvl; i++) total += Math.floor(100 * Math.pow(i, 1.85));
  return total;
}

async function equipBotGear(userId, level, mobSize) {
  const tierWeapons = WEAPONS.filter((w) => w.minLevel <= level);
  const tierArmor = ARMOR.filter((a) => a.minLevel <= level);
  const tierVehicles = VEHICLES.filter((v) => v.minLevel <= level);
  const bestWeapon = tierWeapons[Math.min(tierWeapons.length - 1, Math.floor(level / 8))];
  const bestArmor = tierArmor[Math.min(tierArmor.length - 1, Math.floor(level / 8))];
  const bestVehicle = tierVehicles[Math.min(tierVehicles.length - 1, Math.floor(level / 10))];
  const usableMob = Math.min(mobSize, level * MOB_USABLE_PER_LEVEL);
  const gearQty = Math.max(1, Math.min(usableMob, 50));

  if (bestWeapon) {
    await db.run('INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=?',
      [userId, bestWeapon.id, 'weapon', gearQty, gearQty]);
    await db.run('UPDATE players SET equipped_weapon=? WHERE user_id=?', [bestWeapon.id, userId]);
  }
  if (bestArmor) {
    await db.run('INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=?',
      [userId, bestArmor.id, 'armor', gearQty, gearQty]);
    await db.run('UPDATE players SET equipped_armor=? WHERE user_id=?', [bestArmor.id, userId]);
  }
  if (bestVehicle) {
    await db.run('INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=?',
      [userId, bestVehicle.id, 'vehicle', gearQty, gearQty]);
    await db.run('UPDATE players SET equipped_vehicle=? WHERE user_id=?', [bestVehicle.id, userId]);
  }
}

async function createBot(name, level, stats) {
  const existing = await db.get('SELECT id FROM users WHERE username = ?', [name]);
  if (existing) {
    await db.run(`UPDATE players SET mob_size=?, attack_skill=?, defense_skill=? WHERE user_id=?`,
      [stats.mobSize, stats.attack, stats.defense, existing.id]);
    await equipBotGear(existing.id, level, stats.mobSize);
    return existing.id;
  }

  const id = uuidv4();
  await db.run('INSERT INTO users (id, username, email, password_hash, is_bot) VALUES (?, ?, ?, ?, 1)',
    [id, name, `${name.toLowerCase()}@bots.visionit.local`, BOT_PASSWORD]);

  await db.run(`INSERT INTO players (user_id, display_name, energy, max_energy, stamina, max_stamina, health, max_health, referral_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, BASE_STATS.maxEnergy, BASE_STATS.maxEnergy, BASE_STATS.maxStamina, BASE_STATS.maxStamina, BASE_STATS.maxHealth, BASE_STATS.maxHealth, generateReferralCode()]);

  const maxE = BASE_STATS.maxEnergy + (level - 1) * STAT_GROWTH_PER_LEVEL.maxEnergy + stats.energySkill;
  const maxS = BASE_STATS.maxStamina + (level - 1) * STAT_GROWTH_PER_LEVEL.maxStamina + stats.staminaSkill;
  const maxH = BASE_STATS.maxHealth + (level - 1) * STAT_GROWTH_PER_LEVEL.maxHealth + stats.healthSkill;

  await db.run(`UPDATE players SET level=?, xp=?, respect=?, money=?, mob_size=?, gold=?,
    max_energy=?, energy=?, max_stamina=?, stamina=?, max_health=?, health=?,
    attack_skill=?, defense_skill=?, wins=?, losses=? WHERE user_id=?`,
    [level, xpForLevel(level), stats.respect, stats.money, stats.mobSize, stats.gold,
      maxE, maxE, maxS, maxS, maxH, maxH, stats.attack, stats.defense, stats.wins, stats.losses, id]);

  await equipBotGear(id, level, stats.mobSize);
  return id;
}

export async function seedBots() {
  const levels = [5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 10, 18, 22, 28, 32, 38, 42, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 48, 62];
  for (let i = 0; i < BOT_NAMES.length; i++) {
    const level = levels[i] || 10 + i;
    const mobSize = level <= 12
      ? Math.max(1, 1 + (i % 4))
      : Math.min(500, 5 + level * 2);
    await createBot(BOT_NAMES[i], level, {
      respect: level * 15 + Math.floor(Math.random() * 200),
      money: level * 8000 + Math.floor(Math.random() * 20000),
      gold: Math.floor(level / 5),
      mobSize,
      attack: Math.min(8, 1 + Math.floor(level / 20)),
      defense: Math.min(8, 1 + Math.floor(level / 20)),
      energySkill: Math.floor(level / 5),
      staminaSkill: Math.floor(level / 6),
      healthSkill: Math.floor(level / 4),
      wins: Math.floor(level * 2.5),
      losses: Math.floor(level * 1.2),
    });
  }
  console.log(`Seeded ${BOT_NAMES.length} bot accounts for PvP.`);
}
