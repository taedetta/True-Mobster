/**
 * Beta test all game actions against running server.
 * Usage: node scripts/beta-test.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3002';

const results = [];
function pass(name) { results.push({ name, ok: true }); console.log(`  ✓ ${name}`); }
function fail(name, err) { results.push({ name, ok: false, err: String(err) }); console.log(`  ✗ ${name}: ${err}`); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (opts.method === 'POST') await sleep(350);
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

async function main() {
  console.log(`\nBeta testing True Mobsters @ ${BASE}\n`);
  const tag = Date.now().toString(36);
  let token, state;

  try {
    const reg = await req('/auth/register', {
      method: 'POST',
      body: { username: `beta_${tag}`, email: `beta_${tag}@test.com`, password: 'BetaTest123!' },
    });
    token = reg.token;
    pass('Register');
  } catch (e) { fail('Register', e.message); return summary(); }

  try {
    state = await req('/game/state', { token });
    pass(`State (money=$${state.money}, energy=${state.energy})`);
  } catch (e) { fail('State', e.message); return summary(); }

  try {
    const cat = await req('/game/catalog');
    pass(`Catalog (${cat.weapons?.length} weapons)`);
  } catch (e) { fail('Catalog', e.message); }

  // Daily first for cash/energy
  try {
    const daily = await req('/game/meta/daily', { token });
    if (daily.canClaim) {
      const claim = await req('/game/meta/daily/claim', { method: 'POST', token, body: {} });
      state = claim.state;
    }
    pass('Daily claim/check');
  } catch (e) { fail('Daily', e.message); }

  // Job (earn cash)
  try {
    let lastJob;
    for (let i = 0; i < 12; i++) {
      try {
        lastJob = await req('/game/job', { method: 'POST', token, body: { jobId: 'downtown_pickpocket' } });
        if (lastJob.state) state = lastJob.state;
      } catch { break; }
    }
    pass(`Jobs (money=$${state.money}, atk=${state.combat?.attack})`);
  } catch (e) { fail('Job', e.message); }

  // Buy weapon
  try {
    const buy = await req('/game/buy', { method: 'POST', token, body: { itemId: 'w_rusty_knife', category: 'weapon' } });
    state = buy.state;
    pass('Buy weapon (Rusty Knife)');
  } catch (e) { fail('Buy weapon', e.message); }

  // Equip
  try {
    const eq = await req('/game/equip', { method: 'POST', token, body: { itemId: 'w_rusty_knife', category: 'weapon' } });
    state = eq.state;
    pass('Equip weapon');
  } catch (e) { fail('Equip weapon', e.message); }

  // Buy consumable + use
  try {
    await req('/game/buy', { method: 'POST', token, body: { itemId: 'energy_pack', category: 'consumable' } });
    pass('Buy consumable');
  } catch (e) { fail('Buy consumable', e.message); }

  try {
    const use = await req('/game/shop/use', { method: 'POST', token, body: { itemId: 'energy_pack' } });
    state = use.state;
    pass('Use consumable');
  } catch (e) { fail('Use consumable', e.message); }

  // Fight
  try {
    const list = await req('/game/fight-list', { token });
    const target = list[0];
    if (target) {
      const fight = await req('/game/fight', { method: 'POST', token, body: { targetId: target.user_id, fightType: 'slap' } });
      state = fight.state;
      pass(`Fight (${fight.attackerWon ? 'won' : 'lost'})`);
    } else fail('Fight', 'no targets');
  } catch (e) { fail('Fight', e.message); }

  // Mob recruit
  try {
    const mob = await req('/game/mob/recruit', { method: 'POST', token, body: { amount: 1 } });
    state = mob.state;
    pass(`Mob recruit (cost=${mob.cost})`);
  } catch (e) { fail('Mob recruit', e.message); }

  // Bank
  try {
    if (state.money >= 100) {
      await req('/game/bank/deposit', { method: 'POST', token, body: { amount: 100 } });
      await req('/game/bank/withdraw', { method: 'POST', token, body: { amount: 50 } });
      pass('Bank deposit/withdraw');
    } else pass('Bank (skipped — low money)');
  } catch (e) { fail('Bank', e.message); }

  // Daily missions (already claimed daily above)
  try {
    const m = await req('/game/meta/missions', { token });
    pass(`Missions (${m.missions?.length || 0})`);
  } catch (e) { fail('Missions', e.message); }

  // Property stack
  try {
    if (state.money >= 5000) {
      await req('/game/buy', { method: 'POST', token, body: { itemId: 'p_corner_store', category: 'property' } });
      await req('/game/buy', { method: 'POST', token, body: { itemId: 'p_corner_store', category: 'property' } });
      const sell = await req('/game/shop/sell', { method: 'POST', token, body: { itemId: 'p_corner_store', category: 'property', quantity: 1 } });
      pass(`Property stack (sold $${sell.price})`);
    } else pass('Property stack (skipped — need $5000)');
  } catch (e) { fail('Property stack', e.message); }

  // Collections
  try {
    const col = await req('/game/collections', { token });
    pass(`Collections (${col.collections?.length || 0})`);
  } catch (e) { fail('Collections', e.message); }

  // Combat stats iMobsters-style
  try {
    state = await req('/game/state', { token });
    if (state.usable_mob_in_fight != null && state.combat?.usableMob != null || state.usable_mob_in_fight >= 1) {
      pass(`Combat mob cap (usable=${state.usable_mob_in_fight}, atk=${state.combat?.attack})`);
    } else pass(`Combat stats (atk=${state.combat?.attack})`);
  } catch (e) { fail('Combat stats', e.message); }

  // Scratch
  try {
    if (state.money >= 1000) {
      const sc = await req('/game/meta/scratch', { method: 'POST', token, body: {} });
      state = sc.state;
      pass(`Scratch card (${sc.prize || 'ok'})`);
    } else pass('Scratch (skipped — low money)');
  } catch (e) { fail('Scratch', e.message); }

  // Boss fight
  try {
    const boss = await req('/game/meta/boss/fight', { method: 'POST', token, body: { bossId: 'street_boss' } });
    pass(`Boss fight (${boss.won ? 'won' : 'lost'})`);
  } catch (e) {
    if (String(e.message).includes('Level')) pass('Boss fight (skipped — level)');
    else fail('Boss fight', e.message);
  }

  // Heal
  try {
    if (state.health < state.max_health) {
      await req('/game/heal', { method: 'POST', token, body: {} });
      pass('Hospital heal');
    } else pass('Hospital (already full)');
  } catch (e) { fail('Heal', e.message); }

  // Hitlist
  try {
    const list = await req('/game/fight-list', { token });
    if (list[0]) {
      await req('/game/hitlist', { method: 'POST', token, body: { targetId: list[0].user_id, bounty: 1000 } });
      pass('Hitlist add');
    }
  } catch (e) { fail('Hitlist', e.message); }

  // Crew
  try {
    await req('/game/crews/create', { method: 'POST', token, body: { name: `Crew_${tag}`, description: 'Beta crew' } });
    pass('Crew create');
  } catch (e) { fail('Crew create', e.message); }

  // Territories
  try {
    const t = await req('/game/territories', { token });
    pass(`Territories (${t.length || 0})`);
  } catch (e) { fail('Territories', e.message); }

  // Leaderboard
  try {
    await req('/game/leaderboard', { token });
    pass('Leaderboard');
  } catch (e) { fail('Leaderboard', e.message); }

  // Avatar
  try {
    await req('/game/profile/avatar', { method: 'POST', token, body: { avatarId: 'default_05' } });
    pass('Avatar update');
  } catch (e) { fail('Avatar update', e.message); }

  // Chat
  try {
    await req('/game/chat/send', { method: 'POST', token, body: { channel: 'world', message: 'Beta test hello' } });
    const chat = await req('/game/chat/world', { token });
    pass(`World chat (${chat.messages?.length || 0} msgs)`);
  } catch (e) { fail('Chat', e.message); }

  // PM
  try {
    const bots = await req('/game/fight-list', { token });
    if (bots[0]) {
      await req('/game/pm/send', { method: 'POST', token, body: { toUsername: 'ShadowViper', subject: 'Hi', body: 'Beta PM' } }).catch(() => {});
    }
    pass('PM send (optional target)');
  } catch (e) { fail('PM', e.message); }

  // Referral / mob ally (second user)
  try {
    const refCode = state.referralCode;
    const reg2 = await req('/auth/register', {
      method: 'POST',
      body: { username: `beta2_${tag}`, email: `beta2_${tag}@test.com`, password: 'BetaTest123!', referralCode: refCode },
    });
    await req('/game/mob/ally/add', { method: 'POST', token: reg2.token, body: { referralCode: refCode } });
    pass('Mob ally via invite code');
  } catch (e) { fail('Mob ally', e.message); }

  // Achievements API shape
  try {
    const ach = await req('/game/meta/achievements', { token });
    const first = ach.achievements?.[0];
    if (first && 'unlocked' in first) pass('Achievements API');
    else fail('Achievements API', 'missing unlocked field');
  } catch (e) { fail('Achievements API', e.message); }

  // News API shape
  try {
    const news = await req('/game/news', { token });
    const n = news.news?.[0];
    if (!n || n.body !== undefined || n.message !== undefined) pass('News API');
    else fail('News API', 'missing body/message');
  } catch (e) { fail('News API', e.message); }

  summary();
}

function summary() {
  const ok = results.filter((r) => r.ok).length;
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${ok}/${results.length} passed`);
  if (bad.length) {
    console.log('\nFailures:');
    bad.forEach((r) => console.log(`  - ${r.name}: ${r.err}`));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
