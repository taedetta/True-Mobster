import {
  WEAPONS, ARMOR, VEHICLES, PROPERTIES, JOBS, LOCATIONS,
  REGEN, LEVEL_XP, HOSPITAL_COST_PER_HP, FIGHT_STAMINA_COST,
  FIGHT_XP_WIN, FIGHT_XP_LOSE, FIGHT_MONEY_WIN, FIGHT_RESPECT_WIN,
  HITLIST_MIN_BOUNTY, HITLIST_FEE_PERCENT, HITLIST_BONUS_MULTIPLIER,
  CREW_BONUS_PER_MEMBER, CREW_MAX_BONUS, BANK_FEE_PERCENT,
} from '../../../shared/gameData.js';
import db from '../db/database.js';

function nowISO() {
  return new Date().toISOString();
}

function parseTime(iso) {
  return new Date(iso || nowISO()).getTime();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getItemBonus(itemId, list, stat) {
  const item = list.find((i) => i.id === itemId);
  return item ? (item[stat] || 0) : 0;
}

export function applyRegen(player) {
  const now = Date.now();
  let { energy, stamina, health, max_energy, max_stamina, max_health } = player;
  let changed = false;

  const energyElapsed = Math.floor((now - parseTime(player.last_energy_regen)) / (REGEN.energySeconds * 1000));
  if (energyElapsed > 0 && energy < max_energy) {
    energy = Math.min(max_energy, energy + energyElapsed);
    player.last_energy_regen = new Date(parseTime(player.last_energy_regen) + energyElapsed * REGEN.energySeconds * 1000).toISOString();
    changed = true;
  }

  const staminaElapsed = Math.floor((now - parseTime(player.last_stamina_regen)) / (REGEN.staminaSeconds * 1000));
  if (staminaElapsed > 0 && stamina < max_stamina) {
    stamina = Math.min(max_stamina, stamina + staminaElapsed);
    player.last_stamina_regen = new Date(parseTime(player.last_stamina_regen) + staminaElapsed * REGEN.staminaSeconds * 1000).toISOString();
    changed = true;
  }

  if (health < max_health && !player.in_jail_until) {
    const healthElapsed = Math.floor((now - parseTime(player.last_health_regen)) / (REGEN.healthSeconds * 1000));
    if (healthElapsed > 0) {
      health = Math.min(max_health, health + healthElapsed);
      player.last_health_regen = new Date(parseTime(player.last_health_regen) + healthElapsed * REGEN.healthSeconds * 1000).toISOString();
      changed = true;
    }
  }

  if (changed) {
    db.prepare(`
      UPDATE players SET energy=?, stamina=?, health=?,
        last_energy_regen=?, last_stamina_regen=?, last_health_regen=?
      WHERE user_id=?
    `).run(energy, stamina, health, player.last_energy_regen, player.last_stamina_regen, player.last_health_regen, player.user_id);
    player.energy = energy;
    player.stamina = stamina;
    player.health = health;
  }

  return player;
}

export function getCombatStats(player, crewMemberCount = 0) {
  const weaponAtk = getItemBonus(player.equipped_weapon, WEAPONS, 'attack');
  const armorDef = getItemBonus(player.equipped_armor, ARMOR, 'defense');
  const vehicleDef = getItemBonus(player.equipped_vehicle, VEHICLES, 'defense');
  const crewBonus = Math.min(CREW_MAX_BONUS, crewMemberCount * CREW_BONUS_PER_MEMBER);

  const attack = Math.floor((player.attack_skill + weaponAtk) * (1 + crewBonus));
  const defense = Math.floor((player.defense_skill + armorDef + vehicleDef) * (1 + crewBonus));

  return { attack, defense, crewBonus };
}

export function getPlayerRow(userId) {
  const player = db.prepare(`
    SELECT p.*, u.username, u.is_bot, u.email
    FROM players p JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
  `).get(userId);
  if (!player) return null;

  if (player.in_jail_until && parseTime(player.in_jail_until) <= Date.now()) {
    db.prepare('UPDATE players SET in_jail_until = NULL WHERE user_id = ?').run(userId);
    player.in_jail_until = null;
  }

  return applyRegen(player);
}

export function getCrewMemberCount(crewId) {
  if (!crewId) return 0;
  return db.prepare('SELECT COUNT(*) as c FROM players WHERE crew_id = ?').get(crewId).c;
}

export function addXp(player, amount) {
  let { level, xp, skill_points, max_energy, max_stamina, max_health } = player;
  xp += amount;
  let leveled = false;

  while (xp >= LEVEL_XP(level)) {
    xp -= LEVEL_XP(level);
    level += 1;
    skill_points += 3;
    max_energy += 2;
    max_stamina += 1;
    max_health += 10;
    leveled = true;
  }

  db.prepare(`
    UPDATE players SET level=?, xp=?, skill_points=?, max_energy=?, max_stamina=?, max_health=?,
      energy=MIN(energy+2, ?), health=?
    WHERE user_id=?
  `).run(level, xp, skill_points, max_energy, max_stamina, max_health, max_energy, max_health, player.user_id);

  return { leveled, level, xp, skill_points };
}

export function doJob(userId, jobId) {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) throw new Error('Invalid job');

  const player = getPlayerRow(userId);
  if (!player) throw new Error('Player not found');
  if (player.in_jail_until && parseTime(player.in_jail_until) > Date.now()) throw new Error('You are in jail');
  if (player.energy < job.energy) throw new Error('Not enough energy');
  if (player.level < (LOCATIONS.find((l) => l.id === job.location)?.minLevel || 1)) throw new Error('Level too low');

  const failed = Math.random() < job.failRate;
  let money = 0;
  let xp = 0;
  let jailed = 0;

  if (!failed) {
    money = randomInt(job.money[0], job.money[1]);
    xp = job.xp;
  } else {
    jailed = 1;
    const jailUntil = new Date(Date.now() + job.jailMinutes * 60 * 1000).toISOString();
    db.prepare('UPDATE players SET in_jail_until = ? WHERE user_id = ?').run(jailUntil, userId);
  }

  db.prepare('UPDATE players SET energy = energy - ?, money = money + ?, jobs_done = jobs_done + 1 WHERE user_id = ?')
    .run(job.energy, money, userId);

  const levelResult = addXp(player, xp);

  db.prepare('INSERT INTO job_log (user_id, job_id, success, money_earned, xp_earned, jailed) VALUES (?, ?, ?, ?, ?, ?)')
    .run(userId, jobId, failed ? 0 : 1, money, xp, jailed);

  return {
    success: !failed,
    money,
    xp,
    jailed: !!jailed,
    levelResult,
    job,
  };
}

export function resolveFight(attackerId, defenderId) {
  const attacker = getPlayerRow(attackerId);
  const defender = getPlayerRow(defenderId);
  if (!attacker || !defender) throw new Error('Player not found');
  if (attackerId === defenderId) throw new Error('Cannot fight yourself');
  if (attacker.stamina < FIGHT_STAMINA_COST) throw new Error('Not enough stamina');
  if (attacker.health <= 0) throw new Error('You need hospital treatment');
  if (defender.health <= 0) throw new Error('Target is hospitalized');

  const atkCrew = getCrewMemberCount(attacker.crew_id);
  const defCrew = getCrewMemberCount(defender.crew_id);
  const atkStats = getCombatStats(attacker, atkCrew);
  const defStats = getCombatStats(defender, defCrew);

  const powerRatio = atkStats.attack / Math.max(1, defStats.defense);
  const winChance = Math.min(0.95, Math.max(0.05, 0.5 + (powerRatio - 1) * 0.25));
  const attackerWon = Math.random() < winChance;

  let moneyStolen = 0;
  let respectGained = 0;
  let bountyClaimed = 0;
  let xp = attackerWon ? FIGHT_XP_WIN : FIGHT_XP_LOSE;

  const hitlistEntry = db.prepare('SELECT * FROM hitlist WHERE target_id = ? AND claimed = 0 ORDER BY bounty DESC LIMIT 1').get(defenderId);

  if (attackerWon) {
    moneyStolen = randomInt(FIGHT_MONEY_WIN[0], Math.min(FIGHT_MONEY_WIN[1], Math.floor(defender.money * 0.1)));
    moneyStolen = Math.min(moneyStolen, defender.money);
    respectGained = FIGHT_RESPECT_WIN;

    if (hitlistEntry) {
      bountyClaimed = hitlistEntry.bounty;
      moneyStolen += bountyClaimed;
      db.prepare('UPDATE hitlist SET claimed = 1 WHERE id = ?').run(hitlistEntry.id);
    }

    const dmg = randomInt(10, 30);
    db.prepare(`
      UPDATE players SET stamina=stamina-?, money=money+?, respect=respect+?, wins=wins+1 WHERE user_id=?
    `).run(FIGHT_STAMINA_COST, moneyStolen, respectGained, attackerId);

    db.prepare(`
      UPDATE players SET money=MAX(0, money-?), health=MAX(0, health-?), losses=losses+1 WHERE user_id=?
    `).run(moneyStolen - (hitlistEntry ? bountyClaimed : 0), dmg, defenderId);

    if (defender.is_bot) {
      scheduleBotRetaliation(defenderId, attackerId);
    }
  } else {
    const dmg = randomInt(15, 35);
    db.prepare('UPDATE players SET stamina=stamina-?, health=MAX(0, health-?), losses=losses+1 WHERE user_id=?')
      .run(FIGHT_STAMINA_COST, dmg, attackerId);
    db.prepare('UPDATE players SET wins=wins+1 WHERE user_id=?').run(defenderId);
  }

  addXp(attacker, xp);

  db.prepare(`
    INSERT INTO combat_log (attacker_id, defender_id, attacker_won, money_stolen, respect_gained, bounty_claimed)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(attackerId, defenderId, attackerWon ? 1 : 0, moneyStolen, respectGained, bountyClaimed);

  return {
    attackerWon,
    moneyStolen,
    respectGained,
    bountyClaimed,
    hitlistBonus: bountyClaimed > 0,
    atkStats,
    defStats,
    winChance: Math.round(winChance * 100),
    defender: getPlayerRow(defenderId),
  };
}

function scheduleBotRetaliation(botId, targetId) {
  const executeAt = new Date(Date.now() + randomInt(30, 120) * 1000).toISOString();
  db.prepare('INSERT INTO bot_retaliation_queue (bot_id, target_id, execute_at) VALUES (?, ?, ?)')
    .run(botId, targetId, executeAt);
}

export function processBotRetaliations() {
  const pending = db.prepare(`
    SELECT * FROM bot_retaliation_queue WHERE processed = 0 AND execute_at <= datetime('now')
  `).all();

  for (const entry of pending) {
    try {
      const bot = getPlayerRow(entry.bot_id);
      const target = getPlayerRow(entry.target_id);
      if (bot && target && bot.stamina >= FIGHT_STAMINA_COST && bot.health > 0 && target.health > 0) {
        resolveFight(entry.bot_id, entry.target_id);
      }
    } catch {
      /* skip failed retaliation */
    }
    db.prepare('UPDATE bot_retaliation_queue SET processed = 1 WHERE id = ?').run(entry.id);
  }
}

export function buyItem(userId, itemId, category) {
  const lists = { weapon: WEAPONS, armor: ARMOR, vehicle: VEHICLES, property: PROPERTIES };
  const item = lists[category]?.find((i) => i.id === itemId);
  if (!item) throw new Error('Invalid item');

  const player = getPlayerRow(userId);
  if (player.level < item.minLevel) throw new Error('Level too low');
  if (player.money < item.price) throw new Error('Not enough money');

  if (category === 'property') {
    const owned = db.prepare('SELECT 1 FROM inventory WHERE user_id=? AND item_id=?').get(userId, itemId);
    if (owned) throw new Error('Already owned');
  }

  db.prepare('UPDATE players SET money = money - ? WHERE user_id = ?').run(item.price, userId);
  db.prepare(`
    INSERT INTO inventory (user_id, item_id, category, quantity) VALUES (?, ?, ?, 1)
    ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + 1
  `).run(userId, itemId, category);

  return item;
}

export function equipItem(userId, itemId, category) {
  const owned = db.prepare('SELECT 1 FROM inventory WHERE user_id=? AND item_id=? AND category=?').get(userId, itemId, category);
  if (!owned) throw new Error('Item not owned');

  const col = { weapon: 'equipped_weapon', armor: 'equipped_armor', vehicle: 'equipped_vehicle' }[category];
  if (!col) throw new Error('Cannot equip this item type');

  db.prepare(`UPDATE players SET ${col} = ? WHERE user_id = ?`).run(itemId, userId);
}

export function collectPropertyIncome(userId) {
  const player = getPlayerRow(userId);
  const owned = db.prepare('SELECT item_id FROM inventory WHERE user_id=? AND category=?').all(userId, 'property');
  let totalIncome = 0;
  for (const row of owned) {
    const prop = PROPERTIES.find((p) => p.id === row.item_id);
    if (prop) totalIncome += prop.income;
  }

  if (totalIncome <= 0) return { collected: 0 };

  const hoursSince = (Date.now() - parseTime(player.last_income_collect)) / (3600 * 1000);
  if (hoursSince < 1) throw new Error('Income available once per hour');

  const collected = Math.floor(totalIncome * Math.min(hoursSince, 24));
  db.prepare('UPDATE players SET money = money + ?, last_income_collect = ? WHERE user_id = ?')
    .run(collected, nowISO(), userId);

  return { collected, hours: Math.floor(hoursSince) };
}

export function healAtHospital(userId) {
  const player = getPlayerRow(userId);
  const missing = player.max_health - player.health;
  if (missing <= 0) throw new Error('Already at full health');

  const cost = missing * HOSPITAL_COST_PER_HP;
  if (player.money < cost) throw new Error('Not enough money');

  db.prepare('UPDATE players SET money = money - ?, health = max_health WHERE user_id = ?').run(cost, userId);
  return { cost, healed: missing };
}

export function bankDeposit(userId, amount) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Invalid amount');
  const player = getPlayerRow(userId);
  if (player.money < amount) throw new Error('Not enough cash');

  const fee = Math.floor(amount * BANK_FEE_PERCENT);
  db.prepare('UPDATE players SET money = money - ?, bank_balance = bank_balance + ? WHERE user_id = ?')
    .run(amount, amount - fee, userId);
  return { deposited: amount - fee, fee };
}

export function bankWithdraw(userId, amount) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Invalid amount');
  const player = getPlayerRow(userId);
  if (player.bank_balance < amount) throw new Error('Insufficient bank balance');

  db.prepare('UPDATE players SET money = money + ?, bank_balance = bank_balance - ? WHERE user_id = ?')
    .run(amount, amount, userId);
  return { withdrawn: amount };
}

export function addToHitlist(userId, targetId, bounty) {
  if (!Number.isInteger(bounty) || bounty < HITLIST_MIN_BOUNTY) throw new Error(`Minimum bounty is $${HITLIST_MIN_BOUNTY}`);
  if (userId === targetId) throw new Error('Cannot hitlist yourself');

  const player = getPlayerRow(userId);
  const fee = Math.floor(bounty * HITLIST_FEE_PERCENT);
  const total = bounty + fee;
  if (player.money < total) throw new Error('Not enough money');

  db.prepare('UPDATE players SET money = money - ? WHERE user_id = ?').run(total, userId);
  db.prepare('INSERT INTO hitlist (target_id, placed_by, bounty) VALUES (?, ?, ?)').run(targetId, userId, bounty);

  return { bounty, fee, total };
}

export function allocateSkill(userId, stat) {
  const valid = ['attack_skill', 'defense_skill', 'energy_skill', 'stamina_skill', 'health_skill'];
  if (!valid.includes(stat)) throw new Error('Invalid stat');

  const player = getPlayerRow(userId);
  if (player.skill_points < 1) throw new Error('No skill points');

  const updates = { [stat]: player[stat] + 1, skill_points: player.skill_points - 1 };
  if (stat === 'energy_skill') updates.max_energy = player.max_energy + 2;
  if (stat === 'stamina_skill') updates.max_stamina = player.max_stamina + 1;
  if (stat === 'health_skill') updates.max_health = player.max_health + 10;

  const sets = Object.keys(updates).map((k) => `${k}=@${k}`).join(', ');
  db.prepare(`UPDATE players SET ${sets} WHERE user_id=@user_id`).run({ ...updates, user_id: userId });
}

export function buildPlayerState(userId) {
  const player = getPlayerRow(userId);
  if (!player) return null;

  const inventory = db.prepare('SELECT * FROM inventory WHERE user_id = ?').all(userId);
  const crew = player.crew_id
    ? db.prepare('SELECT * FROM crews WHERE id = ?').get(player.crew_id)
    : null;
  const crewMembers = player.crew_id
    ? db.prepare(`
        SELECT p.display_name, p.level, p.respect, p.user_id
        FROM players p WHERE p.crew_id = ? ORDER BY p.respect DESC LIMIT 50
      `).all(player.crew_id)
    : [];

  const atkCrew = getCrewMemberCount(player.crew_id);
  const combat = getCombatStats(player, atkCrew);

  const xpNeeded = LEVEL_XP(player.level);

  return {
    ...player,
    is_bot: !!player.is_bot,
    inventory,
    crew,
    crewMembers,
    combat,
    xpNeeded,
    regen: REGEN,
  };
}

export function getFightList(userId, limit = 20) {
  return db.prepare(`
    SELECT p.user_id, p.display_name, p.level, p.respect, u.is_bot,
      p.wins, p.losses, p.health, p.max_health
    FROM players p JOIN users u ON u.id = p.user_id
    WHERE p.user_id != ? AND p.health > 0
    ORDER BY p.level DESC, p.respect DESC
    LIMIT ?
  `).all(userId, limit);
}

export function getHitlist() {
  return db.prepare(`
    SELECT h.*, p.display_name as target_name, p.level as target_level,
      placer.display_name as placed_by_name
    FROM hitlist h
    JOIN players p ON p.user_id = h.target_id
    JOIN players placer ON placer.user_id = h.placed_by
    WHERE h.claimed = 0
    ORDER BY h.bounty DESC
    LIMIT 50
  `).all();
}

export function getLeaderboard(limit = 50) {
  return db.prepare(`
    SELECT display_name, level, respect, wins, losses, user_id
    FROM players ORDER BY respect DESC, level DESC LIMIT ?
  `).all(limit);
}

export function createCrew(userId, name, description = '') {
  const player = getPlayerRow(userId);
  if (player.crew_id) throw new Error('Already in a crew');
  if (name.length < 3 || name.length > 24) throw new Error('Crew name must be 3-24 characters');

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO crews (id, name, leader_id, description) VALUES (?, ?, ?, ?)').run(id, name, userId, description);
  db.prepare('UPDATE players SET crew_id = ?, crew_role = ? WHERE user_id = ?').run(id, 'leader', userId);
  return { id, name };
}

export function joinCrew(userId, crewId) {
  const player = getPlayerRow(userId);
  if (player.crew_id) throw new Error('Already in a crew');
  const crew = db.prepare('SELECT * FROM crews WHERE id = ?').get(crewId);
  if (!crew) throw new Error('Crew not found');

  const count = getCrewMemberCount(crewId);
  if (count >= 50) throw new Error('Crew is full');

  db.prepare('UPDATE players SET crew_id = ?, crew_role = ? WHERE user_id = ?').run(crewId, 'member', userId);
}

export function leaveCrew(userId) {
  const player = getPlayerRow(userId);
  if (!player.crew_id) throw new Error('Not in a crew');
  if (player.crew_role === 'leader') throw new Error('Leaders must transfer leadership before leaving');
  db.prepare('UPDATE players SET crew_id = NULL, crew_role = NULL WHERE user_id = ?').run(userId);
}

export function listCrews(limit = 30) {
  return db.prepare(`
    SELECT c.*, COUNT(p.user_id) as member_count,
      leader.display_name as leader_name
    FROM crews c
    LEFT JOIN players p ON p.crew_id = c.id
    JOIN players leader ON leader.user_id = c.leader_id
    GROUP BY c.id ORDER BY member_count DESC LIMIT ?
  `).all(limit);
}

export function getCombatHistory(userId, limit = 20) {
  return db.prepare(`
    SELECT cl.*,
      atk.display_name as attacker_name,
      def.display_name as defender_name
    FROM combat_log cl
    JOIN players atk ON atk.user_id = cl.attacker_id
    JOIN players def ON def.user_id = cl.defender_id
    WHERE cl.attacker_id = ? OR cl.defender_id = ?
    ORDER BY cl.created_at DESC LIMIT ?
  `).all(userId, userId, limit);
}
