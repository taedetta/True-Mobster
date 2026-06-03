import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  buildPlayerState, doJob, resolveFight, buyItem, equipItem,
  collectPropertyIncome, healAtHospital, bankDeposit, bankWithdraw,
  addToHitlist, allocateSkill, getFightList, getHitlist, getLeaderboard,
  createCrew, joinCrew, leaveCrew, listCrews, getCombatHistory,
} from '../services/gameEngine.js';
import {
  JOBS, LOCATIONS, WEAPONS, ARMOR, VEHICLES, PROPERTIES, ALL_ITEMS,
  itemThumbnailPath, GAME_NAME, STUDIO,
} from '../../../shared/gameData.js';

const router = Router();

router.use(authMiddleware);

router.get('/state', (req, res) => {
  try {
    const state = buildPlayerState(req.userId);
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/catalog', (_req, res) => {
  const enrich = (items, category) =>
    items.map((i) => ({ ...i, category, thumbnail: itemThumbnailPath(category, i.id) }));

  res.json({
    game: GAME_NAME,
    studio: STUDIO,
    locations: LOCATIONS,
    jobs: JOBS.map((j) => ({ ...j, thumbnail: itemThumbnailPath('job', j.id) })),
    weapons: enrich(WEAPONS, 'weapon'),
    armor: enrich(ARMOR, 'armor'),
    vehicles: enrich(VEHICLES, 'vehicle'),
    properties: enrich(PROPERTIES, 'property'),
  });
});

router.post('/job', (req, res) => {
  try {
    const result = doJob(req.userId, req.body.jobId);
    res.json({ ...result, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/fight', (req, res) => {
  try {
    const result = resolveFight(req.userId, req.body.targetId);
    res.json({ ...result, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/fight-list', (req, res) => {
  res.json(getFightList(req.userId));
});

router.post('/buy', (req, res) => {
  try {
    const item = buyItem(req.userId, req.body.itemId, req.body.category);
    res.json({ item, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/equip', (req, res) => {
  try {
    equipItem(req.userId, req.body.itemId, req.body.category);
    res.json({ state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/collect-income', (req, res) => {
  try {
    const result = collectPropertyIncome(req.userId);
    res.json({ ...result, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/heal', (req, res) => {
  try {
    const result = healAtHospital(req.userId);
    res.json({ ...result, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/bank/deposit', (req, res) => {
  try {
    const result = bankDeposit(req.userId, req.body.amount);
    res.json({ ...result, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/bank/withdraw', (req, res) => {
  try {
    const result = bankWithdraw(req.userId, req.body.amount);
    res.json({ ...result, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/hitlist', (req, res) => {
  try {
    const result = addToHitlist(req.userId, req.body.targetId, req.body.bounty);
    res.json({ ...result, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/hitlist', (_req, res) => {
  res.json(getHitlist());
});

router.post('/skill', (req, res) => {
  try {
    allocateSkill(req.userId, req.body.stat);
    res.json({ state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/leaderboard', (_req, res) => {
  res.json(getLeaderboard());
});

router.get('/combat-history', (req, res) => {
  res.json(getCombatHistory(req.userId));
});

router.get('/crews', (_req, res) => {
  res.json(listCrews());
});

router.post('/crews/create', (req, res) => {
  try {
    const crew = createCrew(req.userId, req.body.name, req.body.description);
    res.json({ crew, state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/crews/join', (req, res) => {
  try {
    joinCrew(req.userId, req.body.crewId);
    res.json({ state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/crews/leave', (req, res) => {
  try {
    leaveCrew(req.userId);
    res.json({ state: buildPlayerState(req.userId) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
