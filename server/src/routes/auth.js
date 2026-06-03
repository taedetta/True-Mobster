import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { BASE_STATS } from '../../../shared/gameData.js';

const router = Router();

router.post('/register', (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) return res.status(409).json({ error: 'Username or email already taken' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 12);
    db.prepare('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)')
      .run(id, username, email.toLowerCase(), hash);

    db.prepare(`
      INSERT INTO players (user_id, display_name, energy, max_energy, stamina, max_stamina, health, max_health)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, displayName || username,
      BASE_STATS.maxEnergy, BASE_STATS.maxEnergy,
      BASE_STATS.maxStamina, BASE_STATS.maxStamina,
      BASE_STATS.maxHealth, BASE_STATS.maxHealth,
    );

    const token = signToken(id);
    res.status(201).json({ token, userId: id, username, displayName: displayName || username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || user.is_bot) return res.status(401).json({ error: 'Invalid credentials' });

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const player = db.prepare('SELECT display_name FROM players WHERE user_id = ?').get(user.id);
    const token = signToken(user.id);
    res.json({ token, userId: user.id, username: user.username, displayName: player.display_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, is_bot FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});

export default router;
