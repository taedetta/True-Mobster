import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  buildPlayerState, doJob, resolveFight, buyItem, equipItem, sellItem, useConsumable,
  collectPropertyIncome, healAtHospital, bankDeposit, bankWithdraw,
  addToHitlist, allocateSkill, getFightList, getHitlist, getLeaderboard,
  createCrew, joinCrew, leaveCrew, listCrews, getCombatHistory,
  recruitMob, buyIce, payBail, claimDailyLogin, getDailyMissions, claimMission,
  getAchievements, claimAchievement, scratchCard, fightBoss,
  addFriend, removeFriend, getFriends, sendGift, getGifts, claimGifts,
  getMail, readMail, readAllMail, getNews, getRevengeList, getPlayerProfile,
  getTerritories, declareTerritoryWar, donateToCrew, kickCrewMember, transferLeadership,
} from '../services/gameEngine.js';
import {
  JOBS, LOCATIONS, WEAPONS, ARMOR, VEHICLES, PROPERTIES, CONSUMABLES, BOSSES,
  ACHIEVEMENTS, DAILY_MISSIONS, DAILY_LOGIN_REWARDS, TERRITORIES, FIGHT_TYPES,
  itemThumbnailPath, GAME_NAME, STUDIO, MOB_RECRUIT_COST, MOB_MAX_SIZE,
} from '../../../shared/gameData.js';

const router = Router();

const wrap = (fn) => async (req, res) => {
  try {
    const result = await fn(req, res);
    if (result !== undefined) res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

router.get('/catalog', wrap(async () => {
  const enrich = (items, category) =>
    items.map((i) => ({ ...i, category, thumbnail: itemThumbnailPath(category, i.id) }));
  return {
    game: GAME_NAME, studio: STUDIO, locations: LOCATIONS,
    jobs: JOBS.map((j) => ({ ...j, thumbnail: itemThumbnailPath('job', j.id) })),
    weapons: enrich(WEAPONS, 'weapon'), armor: enrich(ARMOR, 'armor'),
    vehicles: enrich(VEHICLES, 'vehicle'), properties: enrich(PROPERTIES, 'property'),
    consumables: enrich(CONSUMABLES, 'consumable'),
    bosses: BOSSES.map((b) => ({ ...b, thumbnail: itemThumbnailPath('boss', b.id) })),
    territories: TERRITORIES.map((t) => ({ ...t, thumbnail: itemThumbnailPath('territory', t.id) })),
    fightTypes: FIGHT_TYPES, achievements: ACHIEVEMENTS,
    dailyMissions: DAILY_MISSIONS, dailyLoginRewards: DAILY_LOGIN_REWARDS,
  };
}));

router.use(authMiddleware);

router.get('/state', wrap(async (req) => buildPlayerState(req.userId)));

router.post('/job', wrap(async (req) => {
  const result = await doJob(req.userId, req.body.jobId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/fight', wrap(async (req) => {
  const result = await resolveFight(req.userId, req.body.targetId, req.body.fightType || 'fight');
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/fight-list', wrap(async (req) => getFightList(req.userId)));
router.get('/revenge', wrap(async (req) => getRevengeList(req.userId)));

router.post('/buy', wrap(async (req) => {
  const item = await buyItem(req.userId, req.body.itemId, req.body.category, req.body.useGold);
  return { item, state: await buildPlayerState(req.userId) };
}));

router.post('/shop/sell', wrap(async (req) => {
  const result = await sellItem(req.userId, req.body.itemId, req.body.category);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/shop/use', wrap(async (req) => {
  const result = await useConsumable(req.userId, req.body.itemId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/equip', wrap(async (req) => {
  await equipItem(req.userId, req.body.itemId, req.body.category);
  return { state: await buildPlayerState(req.userId) };
}));

router.post('/collect-income', wrap(async (req) => {
  const result = await collectPropertyIncome(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/heal', wrap(async (req) => {
  const result = await healAtHospital(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/bank/deposit', wrap(async (req) => {
  const result = await bankDeposit(req.userId, req.body.amount);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/bank/withdraw', wrap(async (req) => {
  const result = await bankWithdraw(req.userId, req.body.amount);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/hitlist', wrap(async (req) => {
  const result = await addToHitlist(req.userId, req.body.targetId, req.body.bounty);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/hitlist', wrap(async () => getHitlist()));
router.post('/skill', wrap(async (req) => {
  await allocateSkill(req.userId, req.body.stat);
  return { state: await buildPlayerState(req.userId) };
}));

router.get('/leaderboard', wrap(async () => getLeaderboard()));
router.get('/combat-history', wrap(async (req) => getCombatHistory(req.userId)));
router.get('/player/:userId', wrap(async (req) => getPlayerProfile(req.params.userId)));

// Mob
router.get('/mob/info', wrap(async (req) => {
  const p = await buildPlayerState(req.userId);
  return { mob_size: p.mob_size, max_mob: MOB_MAX_SIZE, bonus: p.combat?.mobBonus, nextCost: MOB_RECRUIT_COST(p.mob_size) };
}));

router.post('/mob/recruit', wrap(async (req) => {
  const result = await recruitMob(req.userId, req.body.amount || 1);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

// Safehouse
router.post('/safehouse/ice', wrap(async (req) => {
  const result = await buyIce(req.userId, req.body.hours || 1);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/safehouse/bail', wrap(async (req) => {
  const result = await payBail(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

// Meta
router.get('/meta/daily', wrap(async (req) => {
  const state = await buildPlayerState(req.userId);
  return { canClaim: state.canClaimDaily, streak: state.daily_streak, rewards: DAILY_LOGIN_REWARDS };
}));

router.post('/meta/daily/claim', wrap(async (req) => {
  const result = await claimDailyLogin(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/meta/missions', wrap(async (req) => getDailyMissions(req.userId)));

router.post('/meta/mission/claim', wrap(async (req) => {
  const result = await claimMission(req.userId, req.body.missionId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/meta/achievements', wrap(async (req) => getAchievements(req.userId)));

router.post('/meta/achievement/claim', wrap(async (req) => {
  const result = await claimAchievement(req.userId, req.body.achievementId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/meta/scratch', wrap(async (req) => {
  const result = await scratchCard(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/meta/bosses', wrap(async () => BOSSES));

router.post('/meta/boss/fight', wrap(async (req) => {
  const result = await fightBoss(req.userId, req.body.bossId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

// Social
router.get('/social/friends', wrap(async (req) => getFriends(req.userId)));

router.post('/social/friend/add', wrap(async (req) => {
  const result = await addFriend(req.userId, req.body.friendUsername);
  return { ...result, friends: await getFriends(req.userId) };
}));

router.post('/social/friend/remove', wrap(async (req) => {
  await removeFriend(req.userId, req.body.friendId);
  return { friends: await getFriends(req.userId) };
}));

router.get('/social/gifts', wrap(async (req) => getGifts(req.userId)));

router.post('/social/gift/send', wrap(async (req) => {
  const result = await sendGift(req.userId, req.body.friendId, req.body.giftType, req.body.amount);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/social/gift/claim', wrap(async (req) => {
  const result = await claimGifts(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

// Mail & News
router.get('/mail', wrap(async (req) => getMail(req.userId)));
router.post('/mail/read', wrap(async (req) => { await readMail(req.userId, req.body.mailId); return { ok: true }; }));
router.post('/mail/read-all', wrap(async (req) => { await readAllMail(req.userId); return { ok: true }; }));
router.get('/news', wrap(async () => getNews()));

// Crews
router.get('/crews', wrap(async () => listCrews()));
router.post('/crews/create', wrap(async (req) => {
  const crew = await createCrew(req.userId, req.body.name, req.body.description);
  return { crew, state: await buildPlayerState(req.userId) };
}));
router.post('/crews/join', wrap(async (req) => {
  await joinCrew(req.userId, req.body.crewId);
  return { state: await buildPlayerState(req.userId) };
}));
router.post('/crews/leave', wrap(async (req) => {
  await leaveCrew(req.userId);
  return { state: await buildPlayerState(req.userId) };
}));
router.post('/crews/donate', wrap(async (req) => {
  const result = await donateToCrew(req.userId, req.body.amount);
  return { ...result, state: await buildPlayerState(req.userId) };
}));
router.post('/crews/kick', wrap(async (req) => {
  await kickCrewMember(req.userId, req.body.memberId);
  return { state: await buildPlayerState(req.userId) };
}));
router.post('/crews/transfer', wrap(async (req) => {
  await transferLeadership(req.userId, req.body.memberId);
  return { state: await buildPlayerState(req.userId) };
}));

// Territories
router.get('/territories', wrap(async () => getTerritories()));
router.post('/territories/war', wrap(async (req) => {
  const result = await declareTerritoryWar(req.userId, req.body.territoryId, req.body.targetCrewId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

export default router;
