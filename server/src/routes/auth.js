import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { BASE_STATS, generateReferralCode } from '../../../shared/gameData.js';
import { isSupportedLocale, normalizeLocale } from '../../../shared/languages.js';
import { processReferral } from '../services/gameEngine.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName, referralCode, locale: rawLocale } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Username, email, and password required' });
    if (!rawLocale || !isSupportedLocale(rawLocale)) return res.status(400).json({ error: 'Please select your language' });
    if (username.length < 3 || username.length > 20) return res.status(400).json({ error: 'Username must be 3-20 characters' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const locale = normalizeLocale(rawLocale);

    const existing = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email.toLowerCase()]);
    if (existing) return res.status(409).json({ error: 'Username or email already taken' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 12);
    const refCode = generateReferralCode();

    await db.run('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)', [id, username, email.toLowerCase(), hash]);
    await db.run(`INSERT INTO players (user_id, display_name, energy, max_energy, stamina, max_stamina, health, max_health, referral_code, locale)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, displayName || username, BASE_STATS.maxEnergy, BASE_STATS.maxEnergy, BASE_STATS.maxStamina, BASE_STATS.maxStamina, BASE_STATS.maxHealth, BASE_STATS.maxHealth, refCode, locale]);

    await processReferral(id, referralCode);

    const token = signToken(id);
    res.status(201).json({ token, userId: id, username, displayName: displayName || username, referralCode: refCode, locale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || user.is_bot) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    const player = await db.get('SELECT display_name, locale FROM players WHERE user_id = ?', [user.id]);
    const token = signToken(user.id);
    res.json({
      token,
      userId: user.id,
      username: user.username,
      displayName: player.display_name,
      locale: normalizeLocale(player?.locale || 'en'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await db.get('SELECT id, username, email, is_bot FROM users WHERE id = ?', [req.userId]);
  res.json(user);
});

export default router;
