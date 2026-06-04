import { Router } from 'express';
import db from '../db/index.js';
import { buildPlayerState } from '../services/gameEngine.js';

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
      `SELECT u.id, u.username, u.email, p.display_name, p.level, p.money, p.health, p.max_health
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

export default router;
