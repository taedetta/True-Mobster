import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import db from '../db/index.js';
import {
  buildPlayerState, doJob, resolveFight, buyItem, equipItem, sellItem, useConsumable,
  collectPropertyIncome, healAtHospital, bankDeposit, bankWithdraw,
  addToHitlist, allocateSkill, getFightList, getHitlist, getLeaderboard,
  createCrew, joinCrew, leaveCrew, listCrews, getCombatHistory,
  recruitMob, buyIce, payBail, claimDailyLogin, getDailyMissions, claimMission,
  getAchievements, claimAchievement, scratchCard, fightBoss,
  addFriend, removeFriend, getFriends, sendGift, getGifts, claimGifts,
  getMail, readMail, readAllMail, getNews, getRevengeList, getExecuteList, getPlayerProfile,
  getTerritories, declareTerritoryWar, donateToCrew, spendCrewTreasury, kickCrewMember, transferLeadership,
  updateAvatar, updateCustomAvatar, buyGodfatherItem, buyGoldStoreItem, getCollectionProgress, getBossList,
  getJobMastery, broadcastToMob, getProfileComments, addProfileComment,
} from '../services/gameEngine.js';
import {
  sendChatMessage, getChatMessages, sendPrivateMessage, getPrivateMessages,
  readPrivateMessage, addMobAlly, removeMobAlly, getMobAllies,
} from '../services/chatEngine.js';
import {
  JOBS, LOCATIONS, WEAPONS, ARMOR, VEHICLES, PROPERTIES, CONSUMABLES, BOSSES,
  ACHIEVEMENTS, DAILY_MISSIONS, DAILY_LOGIN_REWARDS, TERRITORIES, FIGHT_TYPES,
  itemThumbnailPath, GAME_NAME, STUDIO, MOB_RECRUIT_COST, MOB_MAX_SIZE, DEFAULT_AVATARS,
  COLLECTIONS, GODFATHER_STORE, GOLD_STORE, MOB_USABLE_PER_LEVEL, getMobBracket,
  CREW_SPEND_OPTIONS, MISSION_MASTERY_THRESHOLDS, BANK_FEE_PERCENT,
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
    jobs: JOBS.map((j) => ({ ...j, thumbnail: itemThumbnailPath('job', j.artSlug || j.id) })),
    weapons: enrich(WEAPONS, 'weapon'), armor: enrich(ARMOR, 'armor'),
    vehicles: enrich(VEHICLES, 'vehicle'), properties: enrich(PROPERTIES, 'property'),
    consumables: enrich(CONSUMABLES, 'consumable'),
    bosses: BOSSES.map((b) => ({ ...b, thumbnail: itemThumbnailPath('boss', b.id) })),
    territories: TERRITORIES.map((t) => ({ ...t, thumbnail: itemThumbnailPath('territory', t.id) })),
    fightTypes: FIGHT_TYPES, achievements: ACHIEVEMENTS,
    dailyMissions: DAILY_MISSIONS, dailyLoginRewards: DAILY_LOGIN_REWARDS,
    defaultAvatars: DEFAULT_AVATARS,
    collections: COLLECTIONS,
    goldStore: GODFATHER_STORE,
    godfatherStore: GODFATHER_STORE,
    mobUsablePerLevel: MOB_USABLE_PER_LEVEL,
  };
}));

router.use(authMiddleware);

router.get('/state', wrap(async (req) => buildPlayerState(req.userId)));

router.post('/job', wrap(async (req) => {
  const result = await doJob(req.userId, req.body.jobId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/fight', wrap(async (req) => {
  const result = await resolveFight(req.userId, req.body.targetId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/fight-list', wrap(async (req) => getFightList(req.userId)));
router.get('/execute-list', wrap(async (req) => getExecuteList(req.userId)));
router.get('/revenge', wrap(async (req) => getRevengeList(req.userId)));

router.post('/buy', wrap(async (req) => {
  const result = await buyItem(req.userId, req.body.itemId, req.body.category, req.body.quantity || 1);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/shop/sell', wrap(async (req) => {
  const result = await sellItem(req.userId, req.body.itemId, req.body.category, req.body.quantity || 1);
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
  const result = await healAtHospital(req.userId, req.body.amount);
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
router.get('/player/:userId/comments', wrap(async (req) => ({
  comments: await getProfileComments(req.params.userId),
})));
router.post('/player/:userId/comments', wrap(async (req) => {
  await addProfileComment(req.userId, req.params.userId, req.body.body);
  return { comments: await getProfileComments(req.params.userId) };
}));

router.post('/mob/broadcast', wrap(async (req) => {
  const result = await broadcastToMob(req.userId, req.body.message);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/jobs/mastery', wrap(async (req) => ({ mastery: await getJobMastery(req.userId) }));

// Mob
router.get('/mob/info', wrap(async (req) => {
  const p = await buildPlayerState(req.userId);
  return {
    mob_size: p.mob_size,
    effective_mob_size: p.effective_mob_size,
    allies: p.mobAllies?.length || 0,
    max_mob: MOB_MAX_SIZE,
    bonus: p.combat?.mobBonus,
    nextCost: MOB_RECRUIT_COST(p.mob_size),
    recruitCost: MOB_RECRUIT_COST(p.mob_size),
    dailyRecruited: p.daily_mob_recruited,
    referralCode: p.referralCode,
  };
}));

router.post('/mob/recruit', wrap(async (req) => {
  const result = await recruitMob(req.userId, req.body.amount || 1);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/mob/allies', wrap(async (req) => ({ allies: await getMobAllies(req.userId) })));

router.post('/mob/ally/add', wrap(async (req) => {
  const result = await addMobAlly(req.userId, req.body.referralCode);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/mob/ally/remove', wrap(async (req) => {
  await removeMobAlly(req.userId, req.body.allyId);
  return { state: await buildPlayerState(req.userId) };
}));

// Chat
router.get('/chat/:channel', wrap(async (req) => {
  const state = await buildPlayerState(req.userId);
  const messages = await getChatMessages(req.params.channel, state?.crew?.id, Number(req.query.limit) || 50);
  return { messages: messages.reverse() };
}));

router.post('/chat/send', wrap(async (req) => {
  const msg = await sendChatMessage(req.userId, req.body.channel || 'world', req.body.message);
  return { message: msg };
}));

router.get('/pm', wrap(async (req) => ({
  inbox: await getPrivateMessages(req.userId, 'inbox'),
  sent: await getPrivateMessages(req.userId, 'sent'),
})));

router.post('/pm/send', wrap(async (req) => {
  const result = await sendPrivateMessage(req.userId, req.body.toUsername, req.body.subject, req.body.body);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/pm/read', wrap(async (req) => {
  await readPrivateMessage(req.userId, req.body.messageId);
  return { ok: true };
}));

// Profile / avatar
router.post('/profile/avatar', wrap(async (req) => {
  const result = req.body.custom
    ? await updateCustomAvatar(req.userId, req.body.custom)
    : await updateAvatar(req.userId, req.body.avatarId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/collections', wrap(async (req) => {
  const inventory = await db.all('SELECT * FROM inventory WHERE user_id=?', [req.userId]);
  return { collections: getCollectionProgress(inventory) };
}));

router.post('/godfather/buy', wrap(async (req) => {
  const result = await buyGodfatherItem(req.userId, req.body.packId, req.body.quantity || 1);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/gold/buy', wrap(async (req) => {
  const result = await buyGodfatherItem(req.userId, req.body.packId, req.body.quantity || 1);
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
  const streak = state.daily_streak || 0;
  const nextStreak = state.canClaimDaily ? (streak % 7) + 1 : streak;
  const todayReward = DAILY_LOGIN_REWARDS[(nextStreak || 1) - 1] || DAILY_LOGIN_REWARDS[0];
  return {
    canClaim: state.canClaimDaily,
    claimed: !state.canClaimDaily,
    streak,
    daily_streak: streak,
    todayReward,
    rewards: DAILY_LOGIN_REWARDS,
  };
}));

router.post('/meta/daily/claim', wrap(async (req) => {
  const result = await claimDailyLogin(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/meta/missions', wrap(async (req) => {
  const missions = await getDailyMissions(req.userId);
  return { missions };
}));

router.post('/meta/mission/claim', wrap(async (req) => {
  const result = await claimMission(req.userId, req.body.missionId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/meta/achievements', wrap(async (req) => ({ achievements: await getAchievements(req.userId) })));

router.post('/meta/achievement/claim', wrap(async (req) => {
  const result = await claimAchievement(req.userId, req.body.achievementId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.post('/meta/scratch', wrap(async (req) => {
  const result = await scratchCard(req.userId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));

router.get('/meta/bosses', wrap(async (req) => ({ bosses: await getBossList(req.userId) })));

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
router.get('/news', wrap(async () => ({ news: await getNews() })));

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
router.post('/crews/spend', wrap(async (req) => {
  const result = await spendCrewTreasury(req.userId, req.body.spendId);
  return { ...result, state: await buildPlayerState(req.userId) };
}));
router.get('/crews/spend-options', wrap(async () => ({ options: CREW_SPEND_OPTIONS })));
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
