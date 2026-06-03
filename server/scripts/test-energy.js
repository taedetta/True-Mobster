/** Verify energy is deducted when doing jobs */
const BASE = process.argv[2] || 'http://localhost:3002';

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

const tag = Date.now().toString(36);
const reg = await req('/auth/register', {
  method: 'POST',
  body: { username: `energy_${tag}`, email: `energy_${tag}@test.com`, password: 'Test1234!' },
});
const token = reg.token;
let state = await req('/game/state', { token });
const before = state.energy;
console.log(`Energy before: ${before}`);

const job = await req('/game/job', { method: 'POST', token, body: { jobId: 'downtown_pickpocket' } });
state = job.state;
const after = state.energy;
const cost = 5; // downtown_pickpocket energy cost
console.log(`Energy after job: ${after} (expected ~${before - cost})`);

if (after === before) {
  console.error('FAIL: Energy was not deducted!');
  process.exit(1);
}
if (after > before) {
  console.error('FAIL: Energy increased instead of decreasing!');
  process.exit(1);
}
console.log('PASS: Energy correctly deducted');
process.exit(0);
