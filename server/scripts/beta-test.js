/**
 * Beta test all game actions against running server.
 * Usage: node scripts/beta-test.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3002';

const results = [];
function pass(name) { results.push({ name, ok: true }); console.log(`  ✓ ${name}`); }
function fail(name, err) { results.push({ name, ok: false, err: String(err) }); console.log(`  ✗ ${name}: ${err}`); }

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
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

  // Job (run multiple times to earn cash for later tests)
  try {
    let lastJob;
    for (let i = 0; i < 8; i++) {
      lastJob = await req('/game/job', { method: 'POST', token, body: { jobId: 'downtown_pickpocket' } });
      if (lastJob.state) state = lastJob.state;
    }
    pass(`Job x8 (last: ${lastJob.success ? 'success' : 'fail'}, money=$${state.money})`);
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

  // Daily
  try {
    const daily = await req('/game/meta/daily', { token });
    if (daily.canClaim) {
      const claim = await req('/game/meta/daily/claim', { method: 'POST', token, body: {} });
      state = claim.state;
      pass('Daily claim');
    } else pass('Daily (already claimed)');
  } catch (e) { fail('Daily', e.message); }

  // Missions
  try {
    const m = await req('/game/meta/missions', { token });
    pass(`Missions (${m.missions?.length || 0})`);
  } catch (e) { fail('Missions', e.message); }

  // Scratch
  try {
    const sc = await req('/game/meta/scratch', { method: 'POST', token, body: {} });
    state = sc.state;
    pass(`Scratch card (${sc.prize?.label || 'ok'})`);
  } catch (e) { fail('Scratch', e.message); }

  // Boss fight
  try {
    const boss = await req('/game/meta/boss/fight', { method: 'POST', token, body: { bossId: 'street_boss' } });
    pass(`Boss fight (${boss.won ? 'won' : 'lost'})`);
  } catch (e) { fail('Boss fight', e.message); }

  // Heal
  try {
    await req('/game/heal', { method: 'POST', token, body: {} });
    pass('Hospital heal');
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
