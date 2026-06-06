import { Router } from 'express';
import db from '../db/index.js';
import { buildPlayerState } from '../services/gameEngine.js';
import {
  BASE_STATS, STAT_GROWTH_PER_LEVEL, SKILL_POINTS_PER_LEVEL, STAMINA_SKILL_COST,
} from '../../../shared/gameData.js';

function skillPointsSpent(player) {
  return Math.max(0, (player.attack_skill || 1) - 1)
    + Math.max(0, (player.defense_skill || 1) - 1)
    + Math.max(0, player.energy_skill || 0)
    + Math.max(0, player.stamina_skill || 0) * STAMINA_SKILL_COST
    + Math.max(0, player.health_skill || 0);
}

function statsForLevel(player, level) {
  const maxEnergy = BASE_STATS.maxEnergy + (level - 1) * STAT_GROWTH_PER_LEVEL.maxEnergy + (player.energy_skill || 0) * 2;
  const maxStamina = BASE_STATS.maxStamina + (level - 1) * STAT_GROWTH_PER_LEVEL.maxStamina + (player.stamina_skill || 0);
  const maxHealth = BASE_STATS.maxHealth + (level - 1) * STAT_GROWTH_PER_LEVEL.maxHealth + (player.health_skill || 0) * 10;
  return { maxEnergy, maxStamina, maxHealth };
}

const router = Router();
const ADMIN_SECRET = process.env.ADMIN_SECRET;

router.use((req, res, next) => {
  if (!ADMIN_SECRET || req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

router.get('/users', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = await db.all(
      `SELECT u.id, u.username, u.email, p.display_name, p.level, p.money, p.gold, p.health, p.max_health,
        p.skill_points, p.attack_skill, p.defense_skill, p.energy_skill, p.stamina_skill, p.health_skill
       FROM users u JOIN players p ON p.user_id = u.id
       WHERE u.is_bot = 0
       ORDER BY p.level DESC, p.money DESC
       LIMIT ?`,
      [limit],
    );
    res.json({ users: rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/grant', async (req, res) => {
  try {
    const { username, userId, money, health, maxHealth, stamina, energy, gold } = req.body || {};
    if (!username && !userId) throw new Error('Provide username or userId');

    const user = userId
      ? await db.get('SELECT id, username FROM users WHERE id=? AND is_bot=0', [userId])
      : await db.get('SELECT id, username FROM users WHERE username=? AND is_bot=0', [username]);
    if (!user) throw new Error('User not found');

    const sets = [];
    const vals = [];
    if (money != null) { sets.push('money=?'); vals.push(Math.max(0, Math.floor(Number(money)))); }
    if (health != null) { sets.push('health=?'); vals.push(Math.max(0, Math.floor(Number(health)))); }
    if (maxHealth != null) { sets.push('max_health=?'); vals.push(Math.max(1, Math.floor(Number(maxHealth)))); }
    if (stamina != null) { sets.push('stamina=?'); vals.push(Math.max(0, Math.floor(Number(stamina)))); }
    if (energy != null) { sets.push('energy=?'); vals.push(Math.max(0, Math.floor(Number(energy)))); }
    if (gold != null) { sets.push('gold=?'); vals.push(Math.max(0, Math.floor(Number(gold)))); }
    if (sets.length === 0) throw new Error('Nothing to grant — set money, health, stamina, energy, or gold');

    vals.push(user.id);
    await db.run(`UPDATE players SET ${sets.join(', ')} WHERE user_id=?`, vals);

    const state = await buildPlayerState(user.id);
    res.json({ ok: true, username: user.username, userId: user.id, state });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/set-level', async (req, res) => {
  try {
    const { username, userId, level, gold, skillPoints, xp } = req.body || {};
    if (!username && !userId) throw new Error('Provide username or userId');
    const targetLevel = Math.max(1, Math.min(200, Math.floor(Number(level))));
    if (!Number.isFinite(targetLevel)) throw new Error('Invalid level');

    const user = userId
      ? await db.get('SELECT id, username FROM users WHERE id=? AND is_bot=0', [userId])
      : await db.get('SELECT id, username FROM users WHERE username=? AND is_bot=0', [username]);
    if (!user) throw new Error('User not found');

    const player = await db.get('SELECT * FROM players WHERE user_id=?', [user.id]);
    if (!player) throw new Error('Player not found');

    const earned = (targetLevel - 1) * SKILL_POINTS_PER_LEVEL;
    const spent = skillPointsSpent(player);
    const unspent = skillPoints != null
      ? Math.max(0, Math.floor(Number(skillPoints)))
      : Math.max(0, earned - spent);
    const { maxEnergy, maxStamina, maxHealth } = statsForLevel(player, targetLevel);
    const targetXp = xp != null ? Math.max(0, Math.floor(Number(xp))) : 0;

    const sets = [
      'level=?', 'xp=?', 'skill_points=?',
      'max_energy=?', 'max_stamina=?', 'max_health=?',
      'energy=?', 'stamina=?', 'health=?',
    ];
    const vals = [
      targetLevel, targetXp, unspent,
      maxEnergy, maxStamina, maxHealth,
      maxEnergy, maxStamina, maxHealth,
    ];
    if (gold != null) {
      sets.push('gold=?');
      vals.push(Math.max(0, Math.floor(Number(gold))));
    }
    vals.push(user.id);
    await db.run(`UPDATE players SET ${sets.join(', ')} WHERE user_id=?`, vals);

    const state = await buildPlayerState(user.id);
    res.json({
      ok: true,
      username: user.username,
      userId: user.id,
      level: targetLevel,
      skillPoints: unspent,
      skillPointsEarned: earned,
      skillPointsSpent: spent,
      gold: state?.gold,
      state,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
