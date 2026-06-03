import { v4 as uuidv4 } from 'uuid';
import {
  WEAPONS, ARMOR, VEHICLES, PROPERTIES, CONSUMABLES, JOBS, LOCATIONS, BOSSES,
  ACHIEVEMENTS, DAILY_LOGIN_REWARDS, DAILY_MISSIONS, SCRATCH_PRIZES, TERRITORIES,
  FIGHT_TYPES, REGEN, LEVEL_XP, HOSPITAL_COST_PER_HP, HITLIST_MIN_BOUNTY,
  HITLIST_FEE_PERCENT, HITLIST_BONUS_MULTIPLIER, CREW_BONUS_PER_MEMBER, CREW_MAX_BONUS,
  MOB_BONUS_PER_MEMBER, MOB_MAX_BONUS,   MOB_RECRUIT_COST, MOB_MAX_SIZE, ICE_COST_PER_HOUR,
  ICE_MAX_HOURS, BAIL_COST_PER_MINUTE, SELL_BACK_RATIO, SCRATCH_CARD_COST, BANK_FEE_PERCENT,
  DAILY_GIFTS_MAX, REFERRAL_BONUS, COLLECTIONS, BOT_NAMES, BASE_STATS, STAT_GROWTH_PER_LEVEL,
  generateReferralCode, GOLD_JOB_CHANCE, PROPERTY_MAX_STACK, DEFAULT_AVATARS, avatarUrl,
  MOB_USABLE_PER_LEVEL, getMobBracket, GODFATHER_STORE, GOLD_STORE, ECONOMY_TICK_MS, getItemById,
  ITEM_MAX_STACK, FIGHT_GEAR_LOSS_RATE, itemThumbnailPath,
} from '../../../shared/gameData.js';
import db, { isPostgres } from '../db/index.js';
import { getEffectiveMobSize, getMobAllies, getUnreadPmCount } from './chatEngine.js';

const nowFn = () => (isPostgres ? 'NOW()' : "datetime('now')");

function nowISO() { return new Date().toISOString(); }
function parseTime(iso) { return new Date(iso || nowISO()).getTime(); }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function dateStr(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function getItemBonus(itemId, list, stat) {
  const item = list.find((i) => i.id === itemId);
  return item ? (item[stat] || 0) : 0;
}

function getCatalogItem(itemId, category) {
  const maps = { weapon: WEAPONS, armor: ARMOR, vehicle: VEHICLES, property: PROPERTIES, consumable: CONSUMABLES };
  if (category && maps[category]) return maps[category].find((i) => i.id === itemId);
  return getItemById(itemId);
}

export function calculateHourlyEconomy(inventory, territoryBonus = 0) {
  let grossIncome = 0;
  let upkeep = 0;
  for (const row of inventory || []) {
    const qty = Number(row.quantity || 1);
    const item = getCatalogItem(row.item_id, row.category);
    if (!item) continue;
    if (row.category === 'property' && item.income) grossIncome += item.income * qty;
    if (['weapon', 'armor', 'vehicle'].includes(row.category) && item.upkeep) upkeep += item.upkeep * qty;
  }
  const bonusIncome = Math.floor(grossIncome * territoryBonus);
  return {
    grossIncome,
    bonusIncome,
    upkeep,
    netIncome: grossIncome + bonusIncome - upkeep,
  };
}

export async function processPassiveEconomy(userId) {
  const player = await getPlayerRow(userId);
  const inventory = await db.all('SELECT * FROM inventory WHERE user_id=?', [userId]);
  const territoryBonus = await getTerritoryBonusForCrew(player.crew_id);
  const hourly = calculateHourlyEconomy(inventory, territoryBonus);
  const lastTick = parseTime(player.last_income_collect || player.created_at);
  const ticks = Math.floor((Date.now() - lastTick) / ECONOMY_TICK_MS);
  if (ticks < 1) return { ...hourly, ticksProcessed: 0, incomeApplied: 0, upkeepApplied: 0 };

  const cappedTicks = Math.min(ticks, 24);
  const incomeApplied = Math.floor((hourly.grossIncome + hourly.bonusIncome) * cappedTicks);
  const upkeepApplied = Math.floor(hourly.upkeep * cappedTicks);
  const net = incomeApplied - upkeepApplied;
  const newMoney = Math.max(0, player.money + net);
  const newTick = new Date(lastTick + cappedTicks * ECONOMY_TICK_MS).toISOString();
  await db.run('UPDATE players SET money=?, last_income_collect=? WHERE user_id=?', [newMoney, newTick, userId]);
  return { ...hourly, ticksProcessed: cappedTicks, incomeApplied, upkeepApplied, netApplied: net };
}

function getCollectionBonus(inventory) {
  const owned = new Set(inventory.map((i) => i.item_id));
  let attack = 0, defense = 0;
  for (const col of COLLECTIONS) {
    if (col.items.every((id) => owned.has(id))) {
      attack += col.bonus.attack || 0;
      defense += col.bonus.defense || 0;
    }
  }
  return { attack, defense };
}

export async function applyRegen(player) {
  const now = Date.now();
  let { energy, stamina, health, max_energy, max_stamina, max_health } = player;
  let changed = false;
  let last_energy_regen = player.last_energy_regen;
  let last_stamina_regen = player.last_stamina_regen;
  let last_health_regen = player.last_health_regen;

  const energyElapsed = Math.floor((now - parseTime(last_energy_regen)) / (REGEN.energySeconds * 1000));
  if (energyElapsed > 0 && energy < max_energy) {
    energy = Math.min(max_energy, energy + energyElapsed);
    last_energy_regen = new Date(parseTime(last_energy_regen) + energyElapsed * REGEN.energySeconds * 1000).toISOString();
    changed = true;
  }
  const staminaElapsed = Math.floor((now - parseTime(last_stamina_regen)) / (REGEN.staminaSeconds * 1000));
  if (staminaElapsed > 0 && stamina < max_stamina) {
    stamina = Math.min(max_stamina, stamina + staminaElapsed);
    last_stamina_regen = new Date(parseTime(last_stamina_regen) + staminaElapsed * REGEN.staminaSeconds * 1000).toISOString();
    changed = true;
  }
  if (health < max_health && !player.in_jail_until) {
    const healthElapsed = Math.floor((now - parseTime(last_health_regen)) / (REGEN.healthSeconds * 1000));
    if (healthElapsed > 0) {
      health = Math.min(max_health, health + healthElapsed);
      last_health_regen = new Date(parseTime(last_health_regen) + healthElapsed * REGEN.healthSeconds * 1000).toISOString();
      changed = true;
    }
  }
  if (changed) {
    await db.run(`UPDATE players SET energy=?, stamina=?, health=?, last_energy_regen=?, last_stamina_regen=?, last_health_regen=? WHERE user_id=?`,
      [energy, stamina, health, last_energy_regen, last_stamina_regen, last_health_regen, player.user_id]);
    Object.assign(player, { energy, stamina, health, last_energy_regen, last_stamina_regen, last_health_regen });
  }
  return player;
}

export async function getCrewMemberCount(crewId) {
  if (!crewId) return 0;
  const row = await db.get('SELECT COUNT(*) as c FROM players WHERE crew_id = ?', [crewId]);
  return Number(row?.c || 0);
}

export async function getTerritoryBonusForCrew(crewId) {
  if (!crewId) return 0;
  const rows = await db.all('SELECT id FROM territories WHERE crew_id=?', [crewId]);
  let bonus = 0;
  for (const row of rows) {
    const ter = TERRITORIES.find((t) => t.id === row.id);
    if (ter) bonus += ter.bonus;
  }
  return bonus;
}

function allocateGearForFight(inventory, category, catalog, statKey, usableMob) {
  const rows = (inventory || []).filter((i) => i.category === category);
  const items = rows
    .map((r) => {
      const def = catalog.find((c) => c.id === r.item_id);
      return def ? { ...def, qty: Number(r.quantity || 1) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b[statKey] || 0) - (a[statKey] || 0));

  let remaining = usableMob;
  let total = 0;
  const used = [];
  for (const item of items) {
    if (remaining <= 0) break;
    const qtyUsed = Math.min(remaining, item.qty);
    total += (item[statKey] || 0) * qtyUsed;
    remaining -= qtyUsed;
    used.push({
      id: item.id,
      name: item.name,
      qtyUsed,
      stat: item[statKey] || 0,
      category,
      thumbnail: itemThumbnailPath(category, item.id),
    });
  }
  return { total, items: used, mobUsed: usableMob - remaining };
}

function calcGearStat(inventory, category, catalog, statKey, usableMob) {
  return allocateGearForFight(inventory, category, catalog, statKey, usableMob).total;
}

function buildFightSideReport(player, inventory, crewMemberCount) {
  const crewBonus = Math.min(CREW_MAX_BONUS, crewMemberCount * CREW_BONUS_PER_MEMBER);
  const effectiveMob = player.effective_mob_size ?? player.mob_size ?? 1;
  const usableMob = Math.min(effectiveMob, (player.level || 1) * MOB_USABLE_PER_LEVEL);
  const colBonus = getCollectionBonus(inventory);
  const territoryBonus = player.territory_bonus ?? 0;
  const weapons = allocateGearForFight(inventory, 'weapon', WEAPONS, 'attack', usableMob);
  const armor = allocateGearForFight(inventory, 'armor', ARMOR, 'defense', usableMob);
  const vehicles = allocateGearForFight(inventory, 'vehicle', VEHICLES, 'defense', usableMob);
  const mobAttack = weapons.total;
  const mobArmor = armor.total;
  const mobVehicle = vehicles.total;
  const attack = Math.floor((player.attack_skill + mobAttack + colBonus.attack) * (1 + crewBonus + territoryBonus));
  const defense = Math.floor((player.defense_skill + mobArmor + mobVehicle + colBonus.defense) * (1 + crewBonus + territoryBonus));
  return {
    userId: player.user_id,
    name: player.display_name,
    level: player.level,
    usableMob,
    effectiveMob,
    attack,
    defense,
    weapons: weapons.items,
    armor: armor.items,
    vehicles: vehicles.items,
    gearTotals: { weapons: mobAttack, armor: mobArmor, vehicles: mobVehicle },
  };
}

async function decrementInventory(userId, itemId, category, qty) {
  const owned = await db.get('SELECT quantity FROM inventory WHERE user_id=? AND item_id=? AND category=?', [userId, itemId, category]);
  if (!owned) return 0;
  const ownedQty = Number(owned.quantity || 1);
  const lose = Math.min(qty, ownedQty);
  if (ownedQty <= lose) {
    await db.run('DELETE FROM inventory WHERE user_id=? AND item_id=? AND category=?', [userId, itemId, category]);
  } else {
    await db.run('UPDATE inventory SET quantity=quantity-? WHERE user_id=? AND item_id=? AND category=?', [lose, userId, itemId, category]);
  }
  return lose;
}

async function applyFightGearLoss(userId, sideReport, fightType) {
  const rate = FIGHT_GEAR_LOSS_RATE[fightType] ?? FIGHT_GEAR_LOSS_RATE.fight;
  const lost = [];
  const groups = [
    { key: 'weapons', category: 'weapon' },
    { key: 'armor', category: 'armor' },
    { key: 'vehicles', category: 'vehicle' },
  ];
  for (const { key, category } of groups) {
    for (const item of sideReport[key] || []) {
      if (!item.qtyUsed) continue;
      const loseQty = Math.max(1, Math.floor(item.qtyUsed * rate));
      const qtyLost = await decrementInventory(userId, item.id, category, loseQty);
      if (qtyLost > 0) lost.push({ ...item, qtyLost });
    }
  }
  return lost;
}

function parseFightDetails(raw) {
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
}

export async function getCombatStats(player, crewMemberCount = 0, inventory = []) {
  const crewBonus = Math.min(CREW_MAX_BONUS, crewMemberCount * CREW_BONUS_PER_MEMBER);
  const effectiveMob = player.effective_mob_size ?? player.mob_size ?? 1;
  const usableMob = Math.min(effectiveMob, (player.level || 1) * MOB_USABLE_PER_LEVEL);
  const colBonus = getCollectionBonus(inventory);
  const territoryBonus = player.territory_bonus ?? 0;
  const mobAttack = calcGearStat(inventory, 'weapon', WEAPONS, 'attack', usableMob);
  const mobArmor = calcGearStat(inventory, 'armor', ARMOR, 'defense', usableMob);
  const mobVehicle = calcGearStat(inventory, 'vehicle', VEHICLES, 'defense', usableMob);
  const attack = Math.floor((player.attack_skill + mobAttack + colBonus.attack) * (1 + crewBonus + territoryBonus));
  const defense = Math.floor((player.defense_skill + mobArmor + mobVehicle + colBonus.defense) * (1 + crewBonus + territoryBonus));
  return {
    attack, defense, crewBonus, mobBonus: usableMob / Math.max(1, effectiveMob),
    usableMob, effectiveMob, collectionBonus: colBonus, territoryBonus,
    gearUsed: { attack: mobAttack, armor: mobArmor, vehicle: mobVehicle },
  };
}

export async function getPlayerRow(userId) {
  const player = await db.get(`SELECT p.*, u.username, u.is_bot, u.email FROM players p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?`, [userId]);
  if (!player) return null;
  if (player.in_jail_until && parseTime(player.in_jail_until) <= Date.now()) {
    await db.run('UPDATE players SET in_jail_until = NULL WHERE user_id = ?', [userId]);
    player.in_jail_until = null;
  }
  if (player.iced_until && parseTime(player.iced_until) <= Date.now()) {
    await db.run('UPDATE players SET iced_until = NULL WHERE user_id = ?', [userId]);
    player.iced_until = null;
  }
  return applyRegen(player);
}

export async function addXp(player, amount) {
  if (player.xp_boost_until && parseTime(player.xp_boost_until) > Date.now()) amount *= 2;
  let { level, xp, skill_points, max_energy, max_stamina, max_health, user_id } = player;
  xp += amount;
  let leveled = false;
  let levelUps = 0;
  while (xp >= LEVEL_XP(level)) {
    xp -= LEVEL_XP(level);
    level += 1;
    skill_points += 3;
    max_energy += 2;
    max_stamina += 1;
    max_health += 10;
    leveled = true;
    levelUps += 1;
  }
  if (leveled) {
    const current = await db.get('SELECT energy, health FROM players WHERE user_id=?', [user_id]);
    const energyNow = Number(current?.energy ?? player.energy);
    const newEnergy = Math.min(max_energy, energyNow + levelUps * 2);
    await db.run(`UPDATE players SET level=?, xp=?, skill_points=?, max_energy=?, max_stamina=?, max_health=?, energy=?, health=? WHERE user_id=?`,
      [level, xp, skill_points, max_energy, max_stamina, max_health, newEnergy, max_health, user_id]);
  } else {
    await db.run('UPDATE players SET xp=? WHERE user_id=?', [xp, user_id]);
  }
  return { leveled, level, xp, skill_points };
}

export async function sendMail(userId, subject, body, mailType = 'system', data = {}) {
  await db.run('INSERT INTO mail (user_id, subject, body, mail_type, data) VALUES (?, ?, ?, ?, ?)',
    [userId, subject, body, mailType, JSON.stringify(data)]);
}

export async function addNews(userId, eventType, message) {
  await db.run('INSERT INTO news_feed (user_id, event_type, message) VALUES (?, ?, ?)', [userId, eventType, message]);
  await db.run('INSERT INTO news_feed (user_id, event_type, message) VALUES (NULL, ?, ?)', [eventType, message]);
}

async function trackMission(userId, type, amount = 1) {
  const player = await getPlayerRow(userId);
  const today = todayStr();
  let progress = {};
  try { progress = JSON.parse(player.daily_mission_progress || '{}'); } catch { /* */ }
  if (dateStr(player.daily_mission_date) !== today) {
    progress = {};
    await db.run('UPDATE players SET daily_mission_date=?, daily_mission_progress=?, daily_mission_claimed=? WHERE user_id=?',
      [today, '{}', '[]', userId]);
  }
  progress[type] = (progress[type] || 0) + amount;
  await db.run('UPDATE players SET daily_mission_progress=? WHERE user_id=?', [JSON.stringify(progress), userId]);
}

export async function doJob(userId, jobId) {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) throw new Error('Invalid job');
  const player = await getPlayerRow(userId);
  if (!player) throw new Error('Player not found');
  if (player.in_jail_until && parseTime(player.in_jail_until) > Date.now()) throw new Error('You are in jail');
  if (player.energy < job.energy) throw new Error('Not enough energy');
  const loc = LOCATIONS.find((l) => l.id === job.location);
  if (player.level < (loc?.minLevel || 1)) throw new Error('Level too low');

  const failed = Math.random() < job.failRate;
  let money = 0, xp = 0, jailed = 0, goldEarned = 0;
  if (!failed) {
    money = randomInt(job.money[0], job.money[1]);
    xp = job.xp;
    if (Math.random() < GOLD_JOB_CHANCE) goldEarned = randomInt(1, 3);
  } else {
    jailed = 1;
    await db.run('UPDATE players SET in_jail_until = ? WHERE user_id = ?',
      [new Date(Date.now() + job.jailMinutes * 60000).toISOString(), userId]);
  }
  await db.run('UPDATE players SET energy=energy-?, money=money+?, gold=gold+?, jobs_done=jobs_done+1 WHERE user_id=?',
    [job.energy, money, goldEarned, userId]);
  const levelResult = await addXp(player, xp);
  await db.run('INSERT INTO job_log (user_id, job_id, success, money_earned, xp_earned, jailed) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, jobId, failed ? 0 : 1, money, xp, jailed]);
  await trackMission(userId, 'jobs');
  if (!failed) await checkAchievements(userId);
  return { success: !failed, money, xp, goldEarned, jailed: !!jailed, levelResult, job };
}

export async function resolveFight(attackerId, defenderId, fightType = 'fight') {
  const ft = FIGHT_TYPES[fightType] || FIGHT_TYPES.fight;
  const attacker = await getPlayerRow(attackerId);
  const defender = await getPlayerRow(defenderId);
  if (!attacker || !defender) throw new Error('Player not found');
  if (attackerId === defenderId) throw new Error('Cannot fight yourself');
  if (attacker.in_jail_until && parseTime(attacker.in_jail_until) > Date.now()) throw new Error('You are in jail');
  if (attacker.stamina < ft.stamina) throw new Error('Not enough stamina');
  if (attacker.health <= 0) throw new Error('You need hospital treatment');
  if (defender.health <= 0) throw new Error('Target is hospitalized');
  if (defender.iced_until && parseTime(defender.iced_until) > Date.now()) throw new Error('Target is iced (protected)');

  const invA = await db.all('SELECT * FROM inventory WHERE user_id=?', [attackerId]);
  const invD = await db.all('SELECT * FROM inventory WHERE user_id=?', [defenderId]);
  const crewA = await getCrewMemberCount(attacker.crew_id);
  const crewD = await getCrewMemberCount(defender.crew_id);
  const atkReport = buildFightSideReport(attacker, invA, crewA);
  const defReport = buildFightSideReport(defender, invD, crewD);
  const atkStats = {
    attack: atkReport.attack, defense: atkReport.defense, usableMob: atkReport.usableMob,
    effectiveMob: atkReport.effectiveMob, crewBonus: Math.min(CREW_MAX_BONUS, crewA * CREW_BONUS_PER_MEMBER),
    mobBonus: atkReport.usableMob / Math.max(1, atkReport.effectiveMob),
    gearUsed: atkReport.gearTotals,
  };
  const defStats = {
    attack: defReport.attack, defense: defReport.defense, usableMob: defReport.usableMob,
    effectiveMob: defReport.effectiveMob, crewBonus: Math.min(CREW_MAX_BONUS, crewD * CREW_BONUS_PER_MEMBER),
    mobBonus: defReport.usableMob / Math.max(1, defReport.effectiveMob),
    gearUsed: defReport.gearTotals,
  };

  const powerRatio = atkStats.attack / Math.max(1, defStats.defense);
  const winChance = Math.min(0.95, Math.max(0.05, 0.5 + (powerRatio - 1) * 0.25));
  const attackerWon = Math.random() < winChance;

  let moneyStolen = 0, respectGained = 0, bountyClaimed = 0, killed = 0;
  let attackerItemsLost = [];
  let defenderItemsLost = [];
  const hitlistEntry = await db.get('SELECT * FROM hitlist WHERE target_id=? AND claimed=0 ORDER BY bounty DESC LIMIT 1', [defenderId]);

  if (attackerWon) {
    defenderItemsLost = await applyFightGearLoss(defenderId, defReport, fightType);
    moneyStolen = randomInt(ft.money[0], Math.min(ft.money[1], Math.floor(defender.money * 0.15)));
    moneyStolen = Math.min(moneyStolen, defender.money);
    respectGained = ft.respect;
    if (hitlistEntry) {
      bountyClaimed = Math.floor(hitlistEntry.bounty * HITLIST_BONUS_MULTIPLIER);
      moneyStolen += bountyClaimed;
      await db.run('UPDATE hitlist SET claimed=1 WHERE id=?', [hitlistEntry.id]);
      await db.run('UPDATE players SET bounties_claimed=bounties_claimed+1 WHERE user_id=?', [attackerId]);
    }
    const dmg = randomInt(ft.damage[0], ft.damage[1]);
    if (fightType === 'execute' && Math.random() < (ft.killChance || 0)) killed = 1;
    const defHealth = killed ? 0 : Math.max(0, defender.health - dmg);
    await db.run('UPDATE players SET stamina=stamina-?, money=money+?, respect=respect+?, wins=wins+1, kills=kills+? WHERE user_id=?',
      [ft.stamina, moneyStolen, respectGained, killed, attackerId]);
    await db.run('UPDATE players SET money=CASE WHEN money-? < 0 THEN 0 ELSE money-? END, health=?, losses=losses+1 WHERE user_id=?',
      [moneyStolen - (hitlistEntry ? bountyClaimed : 0), moneyStolen - (hitlistEntry ? bountyClaimed : 0), defHealth, defenderId]);
    if (defender.is_bot) await scheduleBotRetaliation(defenderId, attackerId);
  } else {
    attackerItemsLost = await applyFightGearLoss(attackerId, atkReport, fightType);
    const dmg = randomInt(ft.damage[0] + 5, ft.damage[1] + 10);
    await db.run('UPDATE players SET stamina=stamina-?, health=CASE WHEN health-? < 0 THEN 0 ELSE health-? END, losses=losses+1 WHERE user_id=?', [ft.stamina, dmg, dmg, attackerId]);
  }

  const fightReport = {
    fightType,
    attackerWon: !!attackerWon,
    moneyStolen,
    respectGained,
    bountyClaimed,
    killed: !!killed,
    winChance: Math.round(winChance * 100),
    attacker: { ...atkReport, itemsLost: attackerItemsLost },
    defender: { ...defReport, itemsLost: defenderItemsLost },
  };

  if (attackerWon) {
    await addNews(attackerId, 'fight_win', `${attacker.display_name} defeated ${defender.display_name}`);
    await trackMission(attackerId, 'wins');
  }

  await addXp(attacker, attackerWon ? ft.xpWin : ft.xpLose);
  await db.run(
    'INSERT INTO combat_log (attacker_id, defender_id, fight_type, attacker_won, money_stolen, respect_gained, bounty_claimed, killed, fight_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [attackerId, defenderId, fightType, attackerWon ? 1 : 0, moneyStolen, respectGained, bountyClaimed, killed, JSON.stringify(fightReport)],
  );
  const lastLog = await db.get(
    'SELECT id FROM combat_log WHERE attacker_id=? AND defender_id=? ORDER BY id DESC LIMIT 1',
    [attackerId, defenderId],
  );
  fightReport.combatLogId = lastLog?.id ?? null;

  const lossSummary = (items) => items.length
    ? items.map((i) => `${i.qtyLost}x ${i.name}`).join(', ')
    : 'None';

  if (attackerWon) {
    await sendMail(
      defenderId,
      'You were attacked!',
      `${attacker.display_name} ${fightType}ed you and won $${moneyStolen.toLocaleString()}. You lost: ${lossSummary(defenderItemsLost)}.`,
      'combat',
      { fightReport, role: 'defender', combatLogId: fightReport.combatLogId },
    );
  } else {
    await sendMail(
      defenderId,
      'Defense successful',
      `${attacker.display_name} attacked you but failed! They lost: ${lossSummary(attackerItemsLost)}.`,
      'combat',
      { fightReport, role: 'defender', combatLogId: fightReport.combatLogId },
    );
  }

  await checkAchievements(attackerId);
  return {
    attackerWon, moneyStolen, respectGained, bountyClaimed, killed,
    hitlistBonus: bountyClaimed > 0, atkStats, defStats,
    winChance: Math.round(winChance * 100), fightType, fightReport, combatLogId,
  };
}

async function scheduleBotRetaliation(botId, targetId) {
  await db.run('INSERT INTO bot_retaliation_queue (bot_id, target_id, execute_at) VALUES (?, ?, ?)',
    [botId, targetId, new Date(Date.now() + randomInt(30, 120) * 1000).toISOString()]);
}

export async function processBotRetaliations() {
  const pending = await db.all(`SELECT * FROM bot_retaliation_queue WHERE processed=0 AND execute_at <= ${nowFn()}`);
  for (const entry of pending) {
    try {
      const bot = await getPlayerRow(entry.bot_id);
      const target = await getPlayerRow(entry.target_id);
      if (bot && target && bot.stamina >= 1 && bot.health > 0 && target.health > 0) {
        await resolveFight(entry.bot_id, entry.target_id, 'fight');
      }
    } catch { /* skip */ }
    await db.run('UPDATE bot_retaliation_queue SET processed=1 WHERE id=?', [entry.id]);
  }
}

export async function buyItem(userId, itemId, category, quantity = 1) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const lists = { weapon: WEAPONS, armor: ARMOR, vehicle: VEHICLES, property: PROPERTIES, consumable: CONSUMABLES };
  const item = lists[category]?.find((i) => i.id === itemId);
  if (!item) throw new Error('Invalid item');
  const player = await getPlayerRow(userId);
  if (player.level < item.minLevel) throw new Error('Level too low');
  const unitPrice = item.price;
  const totalPrice = unitPrice * qty;
  if (player.money < totalPrice) throw new Error(`Not enough money — need ${totalPrice.toLocaleString()}`);

  const owned = await db.get('SELECT quantity FROM inventory WHERE user_id=? AND item_id=? AND category=?', [userId, itemId, category]);
  const ownedQty = Number(owned?.quantity || 0);
  const maxStack = category === 'property' ? PROPERTY_MAX_STACK : ITEM_MAX_STACK;
  if (ownedQty + qty > maxStack) throw new Error(`Max ${maxStack} of this item`);

  await db.run('UPDATE players SET money=money-?, daily_spent=daily_spent+? WHERE user_id=?', [totalPrice, totalPrice, userId]);
  await trackMission(userId, 'spent', totalPrice);
  await db.run(
    `INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, item_id) DO UPDATE SET quantity=inventory.quantity+excluded.quantity`,
    [userId, itemId, category, qty],
  );
  return { item, quantity: qty, totalPrice, owned: ownedQty + qty };
}

export async function sellItem(userId, itemId, category, quantity = 1) {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Invalid quantity');
  const lists = { weapon: WEAPONS, armor: ARMOR, vehicle: VEHICLES, property: PROPERTIES, consumable: CONSUMABLES };
  const item = lists[category]?.find((i) => i.id === itemId);
  if (!item) throw new Error('Invalid item');
  const owned = await db.get('SELECT * FROM inventory WHERE user_id=? AND item_id=? AND category=?', [userId, itemId, category]);
  if (!owned) throw new Error('Item not owned');
  const ownedQty = Number(owned.quantity || 1);
  if (quantity > ownedQty) throw new Error('Not enough to sell');
  const sellPrice = Math.floor((item.price || 1000) * SELL_BACK_RATIO) * quantity;
  if (ownedQty <= quantity) {
    await db.run('DELETE FROM inventory WHERE user_id=? AND item_id=? AND category=?', [userId, itemId, category]);
    const player = await getPlayerRow(userId);
    const cols = { weapon: 'equipped_weapon', armor: 'equipped_armor', vehicle: 'equipped_vehicle' };
    if (cols[category] && player[cols[category]] === itemId) await db.run(`UPDATE players SET ${cols[category]}=NULL WHERE user_id=?`, [userId]);
  } else {
    await db.run('UPDATE inventory SET quantity=quantity-? WHERE user_id=? AND item_id=? AND category=?', [quantity, userId, itemId, category]);
  }
  await db.run('UPDATE players SET money=money+? WHERE user_id=?', [sellPrice, userId]);
  return { sold: item, price: sellPrice, quantity };
}

export async function useConsumable(userId, itemId) {
  const item = CONSUMABLES.find((i) => i.id === itemId);
  if (!item) throw new Error('Invalid consumable');
  const owned = await db.get('SELECT * FROM inventory WHERE user_id=? AND item_id=? AND category=? AND quantity>0', [userId, itemId, 'consumable']);
  if (!owned) throw new Error('Not owned');
  const player = await getPlayerRow(userId);
  const updates = {};
  if (item.effect === 'energy') updates.energy = Math.min(player.max_energy, player.energy + item.amount);
  else if (item.effect === 'stamina') updates.stamina = Math.min(player.max_stamina, player.stamina + item.amount);
  else if (item.effect === 'health') updates.health = Math.min(player.max_health, player.health + item.amount);
  else if (item.effect === 'mob') {
    const newMob = Math.min(MOB_MAX_SIZE, player.mob_size + item.amount);
    await db.run('UPDATE players SET mob_size=? WHERE user_id=?', [newMob, userId]);
  }
  else if (item.effect === 'ice') await db.run('UPDATE players SET iced_until=? WHERE user_id=?',
    [new Date(Date.now() + item.amount * 3600000).toISOString(), userId]);
  else if (item.effect === 'xp_boost') await db.run('UPDATE players SET xp_boost_until=? WHERE user_id=?',
    [new Date(Date.now() + item.amount * 3600000).toISOString(), userId]);
  if (updates.energy !== undefined) await db.run('UPDATE players SET energy=? WHERE user_id=?', [updates.energy, userId]);
  if (updates.stamina !== undefined) await db.run('UPDATE players SET stamina=? WHERE user_id=?', [updates.stamina, userId]);
  if (updates.health !== undefined) await db.run('UPDATE players SET health=? WHERE user_id=?', [updates.health, userId]);
  if (owned.quantity <= 1) await db.run('DELETE FROM inventory WHERE user_id=? AND item_id=?', [userId, itemId]);
  else await db.run('UPDATE inventory SET quantity=quantity-1 WHERE user_id=? AND item_id=?', [userId, itemId]);
  return { item, effect: item.effect };
}

export async function equipItem(userId, itemId, category) {
  const owned = await db.get('SELECT 1 FROM inventory WHERE user_id=? AND item_id=? AND category=?', [userId, itemId, category]);
  if (!owned) throw new Error('Item not owned');
  const col = { weapon: 'equipped_weapon', armor: 'equipped_armor', vehicle: 'equipped_vehicle' }[category];
  if (!col) throw new Error('Cannot equip');
  await db.run(`UPDATE players SET ${col}=? WHERE user_id=?`, [itemId, userId]);
}

export async function recruitMob(userId, amount = 1) {
  if (!Number.isInteger(amount) || amount < 1 || amount > 50) throw new Error('Invalid amount');
  const player = await getPlayerRow(userId);
  if (player.mob_size + amount > MOB_MAX_SIZE) throw new Error(`Max mob size is ${MOB_MAX_SIZE}`);
  let totalCost = 0;
  for (let i = 0; i < amount; i++) totalCost += MOB_RECRUIT_COST(player.mob_size + i);
  if (player.money < totalCost) throw new Error('Not enough money');
  await db.run('UPDATE players SET money=money-?, mob_size=mob_size+?, daily_mob_recruited=daily_mob_recruited+? WHERE user_id=?',
    [totalCost, amount, amount, userId]);
  await trackMission(userId, 'mob_recruited', amount);
  await checkAchievements(userId);
  return { recruited: amount, cost: totalCost };
}

export async function buyIce(userId, hours) {
  if (!Number.isInteger(hours) || hours < 1 || hours > ICE_MAX_HOURS) throw new Error(`Ice 1-${ICE_MAX_HOURS} hours`);
  const cost = hours * ICE_COST_PER_HOUR;
  const player = await getPlayerRow(userId);
  if (player.money < cost) throw new Error('Not enough money');
  const icedUntil = new Date(Math.max(Date.now(), parseTime(player.iced_until)) + hours * 3600000).toISOString();
  await db.run('UPDATE players SET money=money-?, iced_until=? WHERE user_id=?', [cost, icedUntil, userId]);
  return { hours, cost, icedUntil };
}

export async function payBail(userId) {
  const player = await getPlayerRow(userId);
  if (!player.in_jail_until || parseTime(player.in_jail_until) <= Date.now()) throw new Error('Not in jail');
  const minutesLeft = Math.ceil((parseTime(player.in_jail_until) - Date.now()) / 60000);
  const cost = minutesLeft * BAIL_COST_PER_MINUTE;
  if (player.money < cost) throw new Error('Not enough money for bail');
  await db.run('UPDATE players SET money=money-?, in_jail_until=NULL WHERE user_id=?', [cost, userId]);
  return { cost, minutesLeft };
}

export async function collectPropertyIncome(userId) {
  return processPassiveEconomy(userId);
}

export async function healAtHospital(userId, healAmount = null) {
  const player = await getPlayerRow(userId);
  const missing = player.max_health - player.health;
  if (missing <= 0) throw new Error('Already at full health');
  const amount = healAmount ? Math.min(Math.max(1, Math.floor(healAmount)), missing) : missing;
  const cost = amount * HOSPITAL_COST_PER_HP;
  if (player.money < cost) throw new Error(`Not enough money — need $${cost.toLocaleString()}`);
  await db.run('UPDATE players SET money=money-?, health=health+? WHERE user_id=?', [cost, amount, userId]);
  return { cost, healed: amount, health: player.health + amount };
}

export async function bankDeposit(userId, amount) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Invalid amount');
  const player = await getPlayerRow(userId);
  if (player.money < amount) throw new Error('Not enough cash');
  const fee = Math.floor(amount * BANK_FEE_PERCENT);
  await db.run('UPDATE players SET money=money-?, bank_balance=bank_balance+? WHERE user_id=?', [amount, amount - fee, userId]);
  return { deposited: amount - fee, fee };
}

export async function bankWithdraw(userId, amount) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Invalid amount');
  const player = await getPlayerRow(userId);
  if (player.bank_balance < amount) throw new Error('Insufficient bank balance');
  await db.run('UPDATE players SET money=money+?, bank_balance=bank_balance-? WHERE user_id=?', [amount, amount, userId]);
  return { withdrawn: amount };
}

export async function addToHitlist(userId, targetId, bounty) {
  if (!Number.isInteger(bounty) || bounty < HITLIST_MIN_BOUNTY) throw new Error(`Minimum bounty is $${HITLIST_MIN_BOUNTY}`);
  if (userId === targetId) throw new Error('Cannot hitlist yourself');
  const player = await getPlayerRow(userId);
  const fee = Math.floor(bounty * HITLIST_FEE_PERCENT);
  const total = bounty + fee;
  if (player.money < total) throw new Error('Not enough money');
  await db.run('UPDATE players SET money=money-? WHERE user_id=?', [total, userId]);
  await db.run('INSERT INTO hitlist (target_id, placed_by, bounty) VALUES (?, ?, ?)', [targetId, userId, bounty]);
  return { bounty, fee, total };
}

export async function allocateSkill(userId, stat) {
  const valid = ['attack_skill', 'defense_skill', 'energy_skill', 'stamina_skill', 'health_skill'];
  if (!valid.includes(stat)) throw new Error('Invalid stat');
  const player = await getPlayerRow(userId);
  if (player.skill_points < 1) throw new Error('No skill points');
  let sql = `UPDATE players SET ${stat} = ${stat} + 1, skill_points = skill_points - 1`;
  if (stat === 'energy_skill') sql += ', max_energy = max_energy + 2';
  if (stat === 'stamina_skill') sql += ', max_stamina = max_stamina + 1';
  if (stat === 'health_skill') sql += ', max_health = max_health + 10';
  sql += ' WHERE user_id = ?';
  await db.run(sql, [userId]);
}

export async function claimDailyLogin(userId) {
  const player = await getPlayerRow(userId);
  const today = todayStr();
  const lastClaim = dateStr(player.last_daily_claim);
  if (lastClaim === today) throw new Error('Already claimed today');
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = lastClaim === yesterday ? (player.daily_streak || 0) + 1 : 1;
  if (streak > 7) streak = 1;
  const reward = DAILY_LOGIN_REWARDS[streak - 1] || DAILY_LOGIN_REWARDS[0];
  const newEnergy = Math.min(player.max_energy, player.energy + (reward.energy || 0));
  const newStamina = Math.min(player.max_stamina, player.stamina + (reward.stamina || 0));
  await db.run(`UPDATE players SET money=money+?, gold=gold+?, energy=?, stamina=?, last_daily_claim=?, daily_streak=? WHERE user_id=?`,
    [reward.money, reward.gold, newEnergy, newStamina, nowISO(), streak, userId]);
  await checkAchievements(userId);
  return { streak, reward };
}

export async function getDailyMissions(userId) {
  const player = await getPlayerRow(userId);
  const today = todayStr();
  let progress = {};
  try { progress = JSON.parse(player.daily_mission_progress || '{}'); } catch { /* */ }
  if (dateStr(player.daily_mission_date) !== today) progress = {};
  let claimed = [];
  try { claimed = JSON.parse(player.daily_mission_claimed || '[]'); } catch { /* */ }
  return DAILY_MISSIONS.map((m) => ({
    ...m,
    progress: progress[m.type] || 0,
    completed: (progress[m.type] || 0) >= m.target,
    claimed: claimed.includes(m.id),
  }));
}

export async function claimMission(userId, missionId) {
  const mission = DAILY_MISSIONS.find((m) => m.id === missionId);
  if (!mission) throw new Error('Invalid mission');
  const missions = await getDailyMissions(userId);
  const m = missions.find((x) => x.id === missionId);
  if (!m?.completed) throw new Error('Mission not complete');
  if (m.claimed) throw new Error('Already claimed');
  const player = await getPlayerRow(userId);
  let claimed = [];
  try { claimed = JSON.parse(player.daily_mission_claimed || '[]'); } catch { /* */ }
  claimed.push(missionId);
  await db.run('UPDATE players SET money=money+?, gold=gold+?, daily_mission_claimed=? WHERE user_id=?',
    [mission.reward, mission.gold, JSON.stringify(claimed), userId]);
  await addXp(player, mission.xp);
  return { mission, reward: mission.reward };
}

export async function checkAchievements(userId) {
  const player = await getPlayerRow(userId);
  const inventory = await db.all('SELECT * FROM inventory WHERE user_id=?', [userId]);
  const refCount = await db.get('SELECT COUNT(*) as c FROM referrals WHERE referrer_id=?', [userId]);
  const ctx = {
    ...player,
    propertyCount: inventory.filter((i) => i.category === 'property').reduce((s, i) => s + Number(i.quantity || 1), 0),
    referralCount: Number(refCount?.c || 0),
    bossKills: player.boss_kills,
    scratchJackpot: !!player.scratch_jackpot,
  };
  const unlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (!ach.check(ctx)) continue;
    const existing = await db.get('SELECT 1 FROM achievements WHERE user_id=? AND achievement_id=?', [userId, ach.id]);
    if (!existing) {
      await db.run('INSERT INTO achievements (user_id, achievement_id) VALUES (?, ?)', [userId, ach.id]);
      unlocked.push(ach);
    }
  }
  return unlocked;
}

export async function getAchievements(userId) {
  await checkAchievements(userId);
  const rows = await db.all('SELECT * FROM achievements WHERE user_id=?', [userId]);
  const claimedSet = new Set(rows.filter((r) => r.claimed).map((r) => r.achievement_id));
  const unlockedSet = new Set(rows.map((r) => r.achievement_id));
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: unlockedSet.has(a.id), claimed: claimedSet.has(a.id) }));
}

export async function claimAchievement(userId, achievementId) {
  const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!ach) throw new Error('Invalid achievement');
  const row = await db.get('SELECT * FROM achievements WHERE user_id=? AND achievement_id=?', [userId, achievementId]);
  if (!row) throw new Error('Not unlocked');
  if (row.claimed) throw new Error('Already claimed');
  await db.run('UPDATE achievements SET claimed=1 WHERE user_id=? AND achievement_id=?', [userId, achievementId]);
  await db.run('UPDATE players SET money=money+?, gold=gold+? WHERE user_id=?', [ach.reward, ach.gold, userId]);
  return { achievement: ach };
}

export async function scratchCard(userId) {
  const player = await getPlayerRow(userId);
  if (player.money < SCRATCH_CARD_COST) throw new Error('Not enough money');
  await db.run('UPDATE players SET money=money-? WHERE user_id=?', [SCRATCH_CARD_COST, userId]);
  const totalWeight = SCRATCH_PRIZES.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * totalWeight;
  let prize = SCRATCH_PRIZES[0];
  for (const p of SCRATCH_PRIZES) { roll -= p.weight; if (roll <= 0) { prize = p; break; } }
  let amount = 0;
  if (prize.money) {
    amount = randomInt(prize.money[0], prize.money[1]);
    await db.run('UPDATE players SET money=money+? WHERE user_id=?', [amount, userId]);
  }
  if (prize.energy) {
    const p = await getPlayerRow(userId);
    await db.run('UPDATE players SET energy=? WHERE user_id=?', [Math.min(p.max_energy, p.energy + prize.energy), userId]);
  }
  if (prize.gold) await db.run('UPDATE players SET gold=gold+? WHERE user_id=?', [prize.gold, userId]);
  if (prize.jackpot) await db.run('UPDATE players SET scratch_jackpot=1 WHERE user_id=?', [userId]);
  await db.run('INSERT INTO scratch_log (user_id, prize, amount) VALUES (?, ?, ?)', [userId, prize.label, amount]);
  await checkAchievements(userId);
  return { prize: prize.label, amount, gold: prize.gold, energy: prize.energy, jackpot: !!prize.jackpot };
}

export async function fightBoss(userId, bossId) {
  const boss = BOSSES.find((b) => b.id === bossId);
  if (!boss) throw new Error('Invalid boss');
  const player = await getPlayerRow(userId);
  if (player.level < boss.minLevel) throw new Error('Level too low');
  if (player.stamina < boss.stamina) throw new Error('Not enough stamina');
  const inv = await db.all('SELECT * FROM inventory WHERE user_id=?', [userId]);
  const stats = await getCombatStats(player, await getCrewMemberCount(player.crew_id), inv);
  const winChance = Math.min(0.9, Math.max(0.1, stats.attack / (boss.defense + boss.attack * 0.5)));
  const won = Math.random() < winChance;
  await db.run('UPDATE players SET stamina=stamina-? WHERE user_id=?', [boss.stamina, userId]);
  let money = 0;
  if (won) {
    money = randomInt(boss.money[0], boss.money[1]);
    await db.run('UPDATE players SET money=money+?, respect=respect+?, boss_kills=boss_kills+1 WHERE user_id=?', [money, boss.respect, userId]);
    await addXp(player, boss.xp);
    await trackMission(userId, 'boss_fights');
    await checkAchievements(userId);
    await addNews(userId, 'boss_kill', `${player.display_name} defeated ${boss.name}!`);
  }
  await db.run('INSERT INTO boss_fights (user_id, boss_id, won, damage_dealt) VALUES (?, ?, ?, ?)', [userId, bossId, won ? 1 : 0, stats.attack]);
  return { won, money, boss, winChance: Math.round(winChance * 100) };
}

// Social
export async function addFriend(userId, friendUsername) {
  const friend = await db.get('SELECT u.id FROM users u WHERE u.username=? AND u.is_bot=0', [friendUsername]);
  if (!friend) throw new Error('Player not found');
  if (friend.id === userId) throw new Error('Cannot add yourself');
  await db.run('INSERT INTO friends (user_id, friend_id) VALUES (?, ?) ON CONFLICT (user_id, friend_id) DO NOTHING', [userId, friend.id]);
  await db.run('INSERT INTO friends (user_id, friend_id) VALUES (?, ?) ON CONFLICT (user_id, friend_id) DO NOTHING', [friend.id, userId]);
  return { friendId: friend.id };
}

export async function removeFriend(userId, friendId) {
  await db.run('DELETE FROM friends WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)', [userId, friendId, friendId, userId]);
}

export async function getFriends(userId) {
  return db.all(`SELECT p.user_id, p.display_name, p.level, p.respect FROM friends f JOIN players p ON p.user_id=f.friend_id WHERE f.user_id=?`, [userId]);
}

export async function sendGift(userId, friendId, giftType, amount) {
  if (!['money', 'energy', 'stamina'].includes(giftType)) throw new Error('Invalid gift type');
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Invalid amount');
  const friend = await db.get('SELECT 1 FROM friends WHERE user_id=? AND friend_id=?', [userId, friendId]);
  if (!friend) throw new Error('Not friends');
  const todayGifts = await db.get(`SELECT COUNT(*) as c FROM gifts WHERE from_id=? AND created_at >= ?`, [userId, todayStr()]);
  if (Number(todayGifts?.c || 0) >= DAILY_GIFTS_MAX) throw new Error('Daily gift limit reached');
  const player = await getPlayerRow(userId);
  if (giftType === 'money' && player.money < amount) throw new Error('Not enough money');
  if (giftType === 'energy' && player.energy < amount) throw new Error('Not enough energy');
  if (giftType === 'stamina' && player.stamina < amount) throw new Error('Not enough stamina');
  if (giftType === 'money') await db.run('UPDATE players SET money=money-? WHERE user_id=?', [amount, userId]);
  if (giftType === 'energy') await db.run('UPDATE players SET energy=energy-? WHERE user_id=?', [amount, userId]);
  if (giftType === 'stamina') await db.run('UPDATE players SET stamina=stamina-? WHERE user_id=?', [amount, userId]);
  await db.run('INSERT INTO gifts (from_id, to_id, gift_type, amount) VALUES (?, ?, ?, ?)', [userId, friendId, giftType, amount]);
  await sendMail(friendId, 'Gift received!', `You received ${amount} ${giftType} from a friend.`, 'gift');
  return { giftType, amount };
}

export async function getGifts(userId) {
  return db.all('SELECT g.*, p.display_name as from_name FROM gifts g JOIN players p ON p.user_id=g.from_id WHERE g.to_id=? AND g.claimed=0', [userId]);
}

export async function claimGifts(userId) {
  const gifts = await getGifts(userId);
  const player = await getPlayerRow(userId);
  let energy = player.energy;
  let stamina = player.stamina;
  for (const g of gifts) {
    if (g.gift_type === 'money') await db.run('UPDATE players SET money=money+? WHERE user_id=?', [g.amount, userId]);
    if (g.gift_type === 'energy') energy = Math.min(player.max_energy, energy + g.amount);
    if (g.gift_type === 'stamina') stamina = Math.min(player.max_stamina, stamina + g.amount);
    await db.run('UPDATE gifts SET claimed=1 WHERE id=?', [g.id]);
  }
  if (energy !== player.energy || stamina !== player.stamina) {
    await db.run('UPDATE players SET energy=?, stamina=? WHERE user_id=?', [energy, stamina, userId]);
  }
  return { claimed: gifts.length };
}

export async function processReferral(newUserId, referralCode) {
  if (!referralCode) return;
  const referrer = await db.get('SELECT user_id FROM players WHERE referral_code=?', [referralCode.toUpperCase()]);
  if (!referrer || referrer.user_id === newUserId) return;
  await db.run('INSERT INTO referrals (referrer_id, referred_id) VALUES (?, ?)', [referrer.user_id, newUserId]);
  await db.run('UPDATE players SET referred_by=?, money=money+? WHERE user_id=?', [referrer.user_id, REFERRAL_BONUS, newUserId]);
  await db.run('UPDATE players SET money=money+?, gold=gold+5 WHERE user_id=?', [REFERRAL_BONUS, referrer.user_id]);
  await sendMail(referrer.user_id, 'Referral bonus!', `A new player joined using your code! +$${REFERRAL_BONUS}`, 'referral');
}

export async function getMail(userId) {
  const rows = await db.all('SELECT * FROM mail WHERE user_id=? ORDER BY created_at DESC LIMIT 50', [userId]);
  return rows.map((row) => {
    let data = {};
    try { data = row.data ? (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) : {}; } catch { /* */ }
    return { ...row, data };
  });
}

export async function readMail(userId, mailId) {
  await db.run('UPDATE mail SET read_status=1 WHERE id=? AND user_id=?', [mailId, userId]);
}

export async function readAllMail(userId) {
  await db.run('UPDATE mail SET read_status=1 WHERE user_id=?', [userId]);
}

export async function getNews(limit = 30) {
  const rows = await db.all('SELECT * FROM news_feed ORDER BY created_at DESC LIMIT ?', [limit]);
  return rows.map((n) => ({
    ...n,
    title: n.title || n.event_type?.replace(/_/g, ' ') || 'News',
    body: n.body || n.message || '',
  }));
}

export async function buyGodfatherItem(userId, packId, quantity = 1) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const pack = GODFATHER_STORE.find((p) => p.id === packId);
  if (!pack) throw new Error('Invalid item');
  const player = await getPlayerRow(userId);
  const totalCost = pack.favorCost * qty;
  if ((player.gold || 0) < totalCost) throw new Error(`Not enough Favor Points — need ${totalCost}`);

  await db.run('UPDATE players SET gold=gold-? WHERE user_id=?', [totalCost, userId]);

  if (pack.effect === 'energy') {
    await db.run('UPDATE players SET energy=max_energy WHERE user_id=?', [userId]);
    return { pack, quantity: qty, favorSpent: totalCost };
  }
  if (pack.effect === 'stamina') {
    await db.run('UPDATE players SET stamina=max_stamina WHERE user_id=?', [userId]);
    return { pack, quantity: qty, favorSpent: totalCost };
  }
  if (pack.effect === 'health') {
    await db.run('UPDATE players SET health=max_health WHERE user_id=?', [userId]);
    return { pack, quantity: qty, favorSpent: totalCost };
  }
  if (pack.effect === 'cash') {
    const cash = Math.floor((pack.cashPerLevel || 500) * player.level * qty);
    await db.run('UPDATE players SET money=money+? WHERE user_id=?', [cash, userId]);
    return { pack, quantity: qty, favorSpent: totalCost, cash };
  }
  if (pack.effect === 'mob') {
    const add = (pack.amount || 1) * qty;
    const newMob = Math.min(MOB_MAX_SIZE, player.mob_size + add);
    await db.run('UPDATE players SET mob_size=? WHERE user_id=?', [newMob, userId]);
    return { pack, quantity: qty, favorSpent: totalCost, mobAdded: newMob - player.mob_size };
  }
  if (pack.effect === 'xp_boost') {
    const hours = (pack.amount || 2) * qty;
    await db.run('UPDATE players SET xp_boost_until=? WHERE user_id=?',
      [new Date(Date.now() + hours * 3600000).toISOString(), userId]);
    return { pack, quantity: qty, favorSpent: totalCost };
  }
  if (pack.effect === 'ice') {
    const hours = (pack.amount || 4) * qty;
    await db.run('UPDATE players SET iced_until=? WHERE user_id=?',
      [new Date(Date.now() + hours * 3600000).toISOString(), userId]);
    return { pack, quantity: qty, favorSpent: totalCost };
  }
  throw new Error('Unknown Godfather item');
}

/** @deprecated */
export async function buyGoldStoreItem(userId, packId, quantity = 1) {
  return buyGodfatherItem(userId, packId, quantity);
}

export function getCollectionProgress(inventory) {
  const owned = new Set((inventory || []).map((i) => i.item_id));
  return COLLECTIONS.map((col) => ({
    ...col,
    owned: col.items.filter((id) => owned.has(id)).length,
    total: col.items.length,
    complete: col.items.every((id) => owned.has(id)),
  }));
}

export async function updateAvatar(userId, avatarId) {
  const av = DEFAULT_AVATARS.find((a) => a.id === avatarId);
  if (!av) throw new Error('Invalid avatar');
  await db.run('UPDATE players SET avatar_id=?, avatar_custom=NULL WHERE user_id=?', [avatarId, userId]);
  return { avatar_id: avatarId, avatar_url: avatarUrl({ avatar_id: avatarId }) };
}

export async function updateCustomAvatar(userId, dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') throw new Error('Invalid image');
  if (!dataUrl.startsWith('data:image/')) throw new Error('Image must be PNG or JPEG');
  if (dataUrl.length > 120000) throw new Error('Image too large (max ~90KB)');
  await db.run('UPDATE players SET avatar_custom=?, avatar_id=? WHERE user_id=?', [dataUrl, 'custom', userId]);
  return { avatar_url: dataUrl };
}

export async function getRevengeList(userId) {
  return db.all(`SELECT DISTINCT p.user_id, p.display_name, p.level, cl.created_at as last_attack
    FROM combat_log cl JOIN players p ON p.user_id=cl.attacker_id
    WHERE cl.defender_id=? AND cl.attacker_won=1 ORDER BY cl.created_at DESC LIMIT 20`, [userId]);
}

function getBestGear(inventory, category, catalog, statKey) {
  let best = null;
  for (const row of inventory || []) {
    if (row.category !== category) continue;
    const def = catalog.find((c) => c.id === row.item_id);
    if (!def) continue;
    const stat = def[statKey] || 0;
    if (!best || stat > best.stat) best = { name: def.name, qty: Number(row.quantity || 1), stat };
  }
  return best;
}

export async function getPlayerProfile(userId) {
  const player = await getPlayerRow(userId);
  if (!player) throw new Error('Player not found');
  const inventory = await db.all('SELECT * FROM inventory WHERE user_id=?', [userId]);
  const combat = await getCombatStats(player, await getCrewMemberCount(player.crew_id), inventory);
  const gear = {
    weapon: getBestGear(inventory, 'weapon', WEAPONS, 'attack'),
    armor: getBestGear(inventory, 'armor', ARMOR, 'defense'),
    vehicle: getBestGear(inventory, 'vehicle', VEHICLES, 'defense'),
  };
  const ownedTotals = inventory.reduce((acc, row) => {
    acc[row.category] = (acc[row.category] || 0) + Number(row.quantity || 1);
    return acc;
  }, {});
  return {
    user_id: player.user_id,
    display_name: player.display_name,
    level: player.level,
    respect: player.respect,
    wins: player.wins,
    losses: player.losses,
    kills: player.kills,
    mob_size: player.mob_size,
    crew_role: player.crew_role,
    referral_code: player.referral_code,
    avatar_url: avatarUrl(player),
    combat,
    inventory,
    gear,
    ownedTotals,
  };
}

export async function getTerritories() {
  const rows = await db.all(`SELECT t.*, c.name as crew_name FROM territories t LEFT JOIN crews c ON c.id=t.crew_id`);
  return TERRITORIES.map((ter) => {
    const row = rows.find((r) => r.id === ter.id);
    return { ...ter, crew_id: row?.crew_id, crew_name: row?.crew_name, captured_at: row?.captured_at };
  });
}

export async function declareTerritoryWar(userId, territoryId, targetCrewId) {
  const player = await getPlayerRow(userId);
  if (!player.crew_id || player.crew_role !== 'leader') throw new Error('Must be crew leader');
  const territory = TERRITORIES.find((t) => t.id === territoryId);
  if (!territory) throw new Error('Invalid territory');
  const crew = await db.get('SELECT * FROM crews WHERE id=?', [player.crew_id]);
  if ((crew?.level || 1) < territory.minCrewLevel) throw new Error('Crew level too low');
  const atkCount = await getCrewMemberCount(player.crew_id);
  const defCount = await getCrewMemberCount(targetCrewId);
  const atkPower = atkCount * (crew?.level || 1);
  const defPower = defCount;
  const attackerWon = atkPower > defPower * randomInt(8, 12) / 10;
  if (attackerWon) {
    await db.run('UPDATE territories SET crew_id=?, captured_at=? WHERE id=?', [player.crew_id, nowISO(), territoryId]);
    await db.run('UPDATE crews SET level=level+1 WHERE id=?', [player.crew_id]);
  }
  await db.run('INSERT INTO crew_wars (attacker_crew_id, defender_crew_id, territory_id, attacker_won) VALUES (?, ?, ?, ?)',
    [player.crew_id, targetCrewId, territoryId, attackerWon ? 1 : 0]);
  await addNews(userId, 'crew_war', `${crew.name} ${attackerWon ? 'captured' : 'failed to capture'} ${territory.name}`);
  return { attackerWon, territory: territory.name };
}

export async function donateToCrew(userId, amount) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Invalid amount');
  const player = await getPlayerRow(userId);
  if (!player.crew_id) throw new Error('Not in a crew');
  if (player.money < amount) throw new Error('Not enough money');
  await db.run('UPDATE players SET money=money-? WHERE user_id=?', [amount, userId]);
  await db.run('UPDATE crews SET bank_balance=bank_balance+? WHERE id=?', [amount, player.crew_id]);
  return { donated: amount };
}

export async function kickCrewMember(leaderId, memberId) {
  const leader = await getPlayerRow(leaderId);
  if (leader.crew_role !== 'leader') throw new Error('Not crew leader');
  const member = await getPlayerRow(memberId);
  if (member.crew_id !== leader.crew_id) throw new Error('Not in your crew');
  if (memberId === leaderId) throw new Error('Cannot kick yourself');
  await db.run('UPDATE players SET crew_id=NULL, crew_role=NULL WHERE user_id=?', [memberId]);
}

export async function transferLeadership(leaderId, memberId) {
  const leader = await getPlayerRow(leaderId);
  if (leader.crew_role !== 'leader') throw new Error('Not crew leader');
  const member = await getPlayerRow(memberId);
  if (member.crew_id !== leader.crew_id) throw new Error('Not in your crew');
  await db.run('UPDATE crews SET leader_id=? WHERE id=?', [memberId, leader.crew_id]);
  await db.run('UPDATE players SET crew_role=? WHERE user_id=?', ['member', leaderId]);
  await db.run('UPDATE players SET crew_role=? WHERE user_id=?', ['leader', memberId]);
}

export async function buildPlayerState(userId) {
  await processPassiveEconomy(userId);
  const player = await getPlayerRow(userId);
  if (!player) return null;
  const inventory = await db.all('SELECT * FROM inventory WHERE user_id=?', [userId]);
  const mobAllies = await getMobAllies(userId);
  const effectiveMobSize = await getEffectiveMobSize(userId, player.mob_size);
  player.effective_mob_size = effectiveMobSize;
  player.territory_bonus = await getTerritoryBonusForCrew(player.crew_id);
  const hourly = calculateHourlyEconomy(inventory, player.territory_bonus);
  const lastTick = parseTime(player.last_income_collect || player.created_at);
  const nextTickAt = lastTick + ECONOMY_TICK_MS;
  const crew = player.crew_id ? await db.get('SELECT * FROM crews WHERE id=?', [player.crew_id]) : null;
  if (crew) crew.treasury = crew.bank_balance;
  const crewMembers = player.crew_id
    ? await db.all('SELECT p.display_name, p.level, p.respect, p.user_id, p.crew_role, p.crew_role as role FROM players p WHERE p.crew_id=? ORDER BY p.respect DESC LIMIT 50', [player.crew_id])
    : [];
  const combat = await getCombatStats(player, await getCrewMemberCount(player.crew_id), inventory);
  const unreadMail = await db.get('SELECT COUNT(*) as c FROM mail WHERE user_id=? AND read_status=0', [userId]);
  const unreadPm = await getUnreadPmCount(userId);
  const missions = await getDailyMissions(userId);
  const canClaimDaily = !player.last_daily_claim || dateStr(player.last_daily_claim) !== todayStr();
  const now = Date.now();
  const incomeHours = (now - lastTick) / 3600000;
  const mobBracket = getMobBracket(effectiveMobSize);
  const nextRegen = (field, max, last, sec) => {
    if (player[field] >= player[max]) return null;
    return parseTime(last) + sec * 1000;
  };
  return {
    ...player, is_bot: !!player.is_bot, inventory, crew, crewMembers, combat, mobAllies,
    effective_mob_size: effectiveMobSize,
    usable_mob_in_fight: Math.min(effectiveMobSize, (player.level || 1) * MOB_USABLE_PER_LEVEL),
    mob_bracket: mobBracket,
    collections: getCollectionProgress(inventory),
    xpNeeded: LEVEL_XP(player.level), regen: REGEN,
    regenAt: {
      energy: nextRegen('energy', 'max_energy', 'last_energy_regen', REGEN.energySeconds),
      stamina: nextRegen('stamina', 'max_stamina', 'last_stamina_regen', REGEN.staminaSeconds),
      health: nextRegen('health', 'max_health', 'last_health_regen', REGEN.healthSeconds),
    },
    incomeReady: incomeHours >= 1,
    incomeHoursAccrued: Math.floor(Math.min(incomeHours, 24)),
    economy: {
      grossIncome: hourly.grossIncome,
      bonusIncome: hourly.bonusIncome,
      upkeep: hourly.upkeep,
      netIncome: hourly.netIncome,
      nextTickAt,
      minutesToTick: Math.max(0, Math.ceil((nextTickAt - now) / 60000)),
    },
    unreadMail: Number(unreadMail?.c || 0), unreadPm,
    dailyMissions: missions, canClaimDaily,
    iced: player.iced_until && parseTime(player.iced_until) > Date.now(),
    referralCode: player.referral_code,
    avatar_url: avatarUrl(player),
    defaultAvatars: DEFAULT_AVATARS,
    goldStore: GODFATHER_STORE,
    godfatherStore: GODFATHER_STORE,
    favor_points: player.gold || 0,
  };
}

export async function getFightList(userId, limit = 30) {
  const player = await getPlayerRow(userId);
  if (!player) return [];
  const effectiveMob = await getEffectiveMobSize(userId, player.mob_size);
  const bracket = getMobBracket(effectiveMob);
  const minLevel = Math.max(1, player.level - 15);
  const maxLevel = player.level + 15;
  const rows = await db.all(
    `SELECT p.user_id, p.display_name, p.level, p.respect, u.is_bot, p.wins, p.losses, p.health, p.max_health,
      p.iced_until, p.in_jail_until, p.mob_size,
      (p.mob_size + COALESCE((SELECT COUNT(*) FROM mob_allies ma WHERE ma.user_id=p.user_id), 0)) AS effective_mob
     FROM players p JOIN users u ON u.id=p.user_id
     WHERE p.user_id!=? AND p.health>0 AND p.level BETWEEN ? AND ?
     ORDER BY ABS(p.level - ?), p.respect DESC LIMIT ?`,
    [userId, minLevel, maxLevel, player.level, limit * 3],
  );
  const now = Date.now();
  return rows.filter((r) => {
    const em = Number(r.effective_mob || r.mob_size || 1);
    if (em < bracket.min || em > bracket.max) return false;
    if (r.iced_until && parseTime(r.iced_until) > now) return false;
    if (r.in_jail_until && parseTime(r.in_jail_until) > now) return false;
    return true;
  }).slice(0, limit);
}

export async function getHitlist() {
  return db.all(`SELECT h.*, p.display_name as target_name, p.level as target_level, placer.display_name as placed_by_name
    FROM hitlist h JOIN players p ON p.user_id=h.target_id JOIN players placer ON placer.user_id=h.placed_by
    WHERE h.claimed=0 ORDER BY h.bounty DESC LIMIT 50`);
}

export async function getLeaderboard(limit = 50) {
  return db.all('SELECT display_name, level, respect, wins, losses, kills, user_id FROM players ORDER BY respect DESC, level DESC LIMIT ?', [limit]);
}

export async function createCrew(userId, name, description = '') {
  const player = await getPlayerRow(userId);
  if (player.crew_id) throw new Error('Already in a crew');
  if (name.length < 3 || name.length > 24) throw new Error('Crew name must be 3-24 characters');
  const id = uuidv4();
  await db.run('INSERT INTO crews (id, name, leader_id, description) VALUES (?, ?, ?, ?)', [id, name, userId, description]);
  await db.run('UPDATE players SET crew_id=?, crew_role=? WHERE user_id=?', [id, 'leader', userId]);
  return { id, name };
}

export async function joinCrew(userId, crewId) {
  const player = await getPlayerRow(userId);
  if (player.crew_id) throw new Error('Already in a crew');
  const crew = await db.get('SELECT * FROM crews WHERE id=?', [crewId]);
  if (!crew) throw new Error('Crew not found');
  if (await getCrewMemberCount(crewId) >= 50) throw new Error('Crew is full');
  await db.run('UPDATE players SET crew_id=?, crew_role=? WHERE user_id=?', [crewId, 'member', userId]);
}

export async function leaveCrew(userId) {
  const player = await getPlayerRow(userId);
  if (!player.crew_id) throw new Error('Not in a crew');
  if (player.crew_role === 'leader') throw new Error('Transfer leadership first');
  await db.run('UPDATE players SET crew_id=NULL, crew_role=NULL WHERE user_id=?', [userId]);
}

export async function listCrews(limit = 30) {
  return db.all(`SELECT c.id, c.name, c.leader_id, c.description, c.bank_balance, c.level, c.created_at,
    (SELECT COUNT(*) FROM players p WHERE p.crew_id = c.id) as member_count,
    leader.display_name as leader_name
    FROM crews c JOIN players leader ON leader.user_id = c.leader_id
    ORDER BY member_count DESC LIMIT ?`, [limit]);
}

export async function getCombatHistory(userId, limit = 20) {
  const rows = await db.all(`SELECT cl.*, atk.display_name as attacker_name, def.display_name as defender_name
    FROM combat_log cl JOIN players atk ON atk.user_id=cl.attacker_id JOIN players def ON def.user_id=cl.defender_id
    WHERE cl.attacker_id=? OR cl.defender_id=? ORDER BY cl.created_at DESC LIMIT ?`, [userId, userId, limit]);
  return rows.map((row) => {
    const isAttacker = row.attacker_id === userId;
    const fightReport = parseFightDetails(row.fight_details);
    return {
      ...row,
      fightReport,
      isAttacker,
      playerWon: isAttacker ? !!row.attacker_won : !row.attacker_won,
      opponent_name: isAttacker ? row.defender_name : row.attacker_name,
      opponent_id: isAttacker ? row.defender_id : row.attacker_id,
    };
  });
}
