import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './index.js';
import {
  BASE_STATS, STAT_GROWTH_PER_LEVEL, BOT_NAMES, BOT_EMAIL_DOMAINS, DEFAULT_AVATARS,
  WEAPONS, ARMOR, VEHICLES, generateReferralCode, MOB_USABLE_PER_LEVEL, MOB_GEAR_FULL_SLOTS,
} from '../../../shared/gameData.js';

const BOT_PASSWORD = bcrypt.hashSync('bot-internal-visionit-' + (process.env.JWT_SECRET || 'dev'), 10);

function xpForLevel(lvl) {
  let total = 0;
  for (let i = 1; i < lvl; i++) total += Math.floor(100 * Math.pow(i, 1.85));
  return total;
}

function botSeed(i) {
  let s = (i + 1) * 7919;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function botEmail(name, i) {
  const local = name.toLowerCase().replace(/[^a-z0-9]/g, '') + (i % 97);
  return `${local}@${BOT_EMAIL_DOMAINS[i % BOT_EMAIL_DOMAINS.length]}`;
}

function botMobSize(level, i) {
  const rng = botSeed(i + 500);
  if (level <= 10) return 1 + Math.floor(rng() * 7);
  if (level <= 25) return 4 + Math.floor(rng() * 28);
  if (level <= 45) return 12 + Math.floor(rng() * 65);
  if (level <= 70) return 35 + Math.floor(rng() * 140);
  return 90 + Math.floor(rng() * 380);
}

async function clearBotGear(userId) {
  await db.run("DELETE FROM inventory WHERE user_id=? AND category IN ('weapon','armor','vehicle')", [userId]);
  await db.run('UPDATE players SET equipped_weapon=NULL, equipped_armor=NULL, equipped_vehicle=NULL WHERE user_id=?', [userId]);
}

async function equipBotGear(userId, level, mobSize, seedIndex) {
  const rng = botSeed(seedIndex + 900);
  const tierWeapons = WEAPONS.filter((w) => w.minLevel <= level);
  const tierArmor = ARMOR.filter((a) => a.minLevel <= level);
  const tierVehicles = VEHICLES.filter((v) => v.minLevel <= level);
  if (!tierWeapons.length && !tierArmor.length && !tierVehicles.length) return;

  const maxTier = Math.min(tierWeapons.length, Math.max(1, Math.floor(level / 6) + 1));
  const weaponIdx = Math.floor(rng() * maxTier);
  const armorIdx = Math.floor(rng() * Math.min(tierArmor.length, maxTier));
  const vehicleIdx = Math.floor(rng() * Math.min(tierVehicles.length, Math.max(1, Math.floor(level / 10))));

  const weapon = tierWeapons[weaponIdx];
  const armor = tierArmor[armorIdx];
  const vehicle = tierVehicles[vehicleIdx];
  const usableMob = Math.min(mobSize, level * MOB_USABLE_PER_LEVEL);
  const gearCap = MOB_GEAR_FULL_SLOTS + Math.floor(level / 4);
  const gearQty = Math.max(1, Math.min(usableMob, gearCap, 1 + Math.floor(rng() * Math.min(usableMob, gearCap))));

  if (weapon) {
    const qty = Math.max(1, Math.floor(gearQty * (0.55 + rng() * 0.45)));
    await db.run('INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=?',
      [userId, weapon.id, 'weapon', qty, qty]);
    await db.run('UPDATE players SET equipped_weapon=? WHERE user_id=?', [weapon.id, userId]);
    if (rng() > 0.55 && tierWeapons.length > 1) {
      const alt = tierWeapons[Math.floor(rng() * Math.min(tierWeapons.length, maxTier))];
      if (alt && alt.id !== weapon.id) {
        const altQty = Math.max(1, Math.floor(qty * (0.25 + rng() * 0.35)));
        await db.run('INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=?',
          [userId, alt.id, 'weapon', altQty, altQty]);
      }
    }
  }
  if (armor) {
    const qty = Math.max(1, Math.floor(gearQty * (0.5 + rng() * 0.5)));
    await db.run('INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=?',
      [userId, armor.id, 'armor', qty, qty]);
    await db.run('UPDATE players SET equipped_armor=? WHERE user_id=?', [armor.id, userId]);
  }
  if (vehicle) {
    const qty = Math.max(1, Math.floor(gearQty * (0.35 + rng() * 0.45)));
    await db.run('INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=?',
      [userId, vehicle.id, 'vehicle', qty, qty]);
    await db.run('UPDATE players SET equipped_vehicle=? WHERE user_id=?', [vehicle.id, userId]);
  }
}

async function pruneLegacyBots() {
  const keep = new Set(BOT_NAMES);
  const bots = await db.all('SELECT id, username FROM users WHERE is_bot=1');
  for (const b of bots) {
    if (!keep.has(b.username)) {
      await db.run('DELETE FROM users WHERE id=?', [b.id]);
    }
  }
}

async function createBot(name, level, stats, index) {
  const avatarId = DEFAULT_AVATARS[index % DEFAULT_AVATARS.length].id;
  const existing = await db.get('SELECT id FROM users WHERE username = ?', [name]);
  if (existing) {
    await db.run(`UPDATE players SET display_name=?, mob_size=?, attack_skill=?, defense_skill=?, avatar_id=?, avatar_custom=NULL WHERE user_id=?`,
      [name, stats.mobSize, stats.attack, stats.defense, avatarId, existing.id]);
    await clearBotGear(existing.id);
    await equipBotGear(existing.id, level, stats.mobSize, index);
    return existing.id;
  }

  const id = uuidv4();
  await db.run('INSERT INTO users (id, username, email, password_hash, is_bot) VALUES (?, ?, ?, ?, 1)',
    [id, name, botEmail(name, index), BOT_PASSWORD]);

  await db.run(`INSERT INTO players (user_id, display_name, energy, max_energy, stamina, max_stamina, health, max_health, referral_code, avatar_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, BASE_STATS.maxEnergy, BASE_STATS.maxEnergy, BASE_STATS.maxStamina, BASE_STATS.maxStamina,
      BASE_STATS.maxHealth, BASE_STATS.maxHealth, generateReferralCode(), avatarId]);

  const maxE = BASE_STATS.maxEnergy + (level - 1) * STAT_GROWTH_PER_LEVEL.maxEnergy + stats.energySkill;
  const maxS = BASE_STATS.maxStamina + (level - 1) * STAT_GROWTH_PER_LEVEL.maxStamina + stats.staminaSkill;
  const maxH = BASE_STATS.maxHealth + (level - 1) * STAT_GROWTH_PER_LEVEL.maxHealth + stats.healthSkill;

  await db.run(`UPDATE players SET level=?, xp=?, respect=?, money=?, mob_size=?, gold=?,
    max_energy=?, energy=?, max_stamina=?, stamina=?, max_health=?, health=?,
    attack_skill=?, defense_skill=?, wins=?, losses=? WHERE user_id=?`,
    [level, xpForLevel(level), stats.respect, stats.money, stats.mobSize, stats.gold,
      maxE, maxE, maxS, maxS, maxH, maxH, stats.attack, stats.defense, stats.wins, stats.losses, id]);

  await equipBotGear(id, level, stats.mobSize, index);
  return id;
}

export async function seedBots() {
  await pruneLegacyBots();
  const levels = [5, 8, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55,
    58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98, 100, 10, 14, 16, 24, 26, 34, 36, 44, 46, 54, 56, 66];
  for (let i = 0; i < BOT_NAMES.length; i++) {
    const level = levels[i] || 10 + (i % 40);
    const rng = botSeed(i);
    const mobSize = botMobSize(level, i);
    await createBot(BOT_NAMES[i], level, {
      respect: Math.floor(level * 18 + rng() * 250),
      money: Math.floor(level * 9000 + rng() * 25000),
      gold: Math.floor(level / 6) + (rng() > 0.7 ? 1 : 0),
      mobSize,
      attack: Math.min(10, 1 + Math.floor(level / 18) + Math.floor(rng() * 4)),
      defense: Math.min(10, 1 + Math.floor(level / 20) + Math.floor(rng() * 4)),
      energySkill: Math.floor(level / 5) + Math.floor(rng() * 3),
      staminaSkill: Math.floor(level / 6) + Math.floor(rng() * 2),
      healthSkill: Math.floor(level / 4) + Math.floor(rng() * 3),
      wins: Math.floor(level * (2 + rng() * 1.5)),
      losses: Math.floor(level * (0.8 + rng() * 0.8)),
    }, i);
  }
  console.log(`Seeded ${BOT_NAMES.length} PvP rival accounts.`);
}
