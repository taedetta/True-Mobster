import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import ItemImage from '../components/ItemImage';

function findCatalogItem(catalog, itemId, category) {
  const key = category === 'weapon' ? 'weapons' : category === 'armor' ? 'armor' : category === 'vehicle' ? 'vehicles' : 'consumables';
  return catalog?.[key]?.find((i) => i.id === itemId);
}

function jobReady(job, state, catalog) {
  if (state.energy < job.energy) return { ok: false, reason: 'Need energy' };
  if ((state.effective_mob_size || state.mob_size) < (job.minMob || 1)) return { ok: false, reason: `Need mob ${job.minMob}` };
  for (const req of job.requiredItems || []) {
    const owned = (state.inventory || []).find((i) => i.item_id === req.itemId && i.category === req.category);
    if ((owned?.quantity || 0) < (req.qty || 1)) {
      const item = findCatalogItem(catalog, req.itemId, req.category);
      return { ok: false, reason: `Need ${req.qty}x ${item?.name || req.itemId}` };
    }
  }
  return { ok: true };
}

export default function JobsPage() {
  const { catalog, state, action, showMessage } = useGame();
  const [location, setLocation] = useState('downtown');
  const [busy, setBusy] = useState(null);
  const [lastLoot, setLastLoot] = useState(null);

  if (!catalog || !state) return null;

  const jobs = catalog.jobs.filter((j) => j.location === location);
  const loc = catalog.locations.find((l) => l.id === location);
  const mastery = state.jobMastery || {};

  useEffect(() => {
    setLastLoot(null);
  }, [location]);

  useEffect(() => {
    if (!lastLoot?.length) return undefined;
    const timer = setTimeout(() => setLastLoot(null), 3500);
    return () => clearTimeout(timer);
  }, [lastLoot]);

  const runJob = async (job) => {
    setBusy(job.id);
    setLastLoot(null);
    try {
      const result = await action('/job', { jobId: job.id });
      if (result?.success) {
        let msg = `Earned ${formatMoney(result.money)}!`;
        if (result.favorEarned) msg += ` +${result.favorEarned} Favor`;
        if (result.levelResult?.leveled) msg += ` · Level ${result.levelResult.level}! Full refill.`;
        if (result.mastery?.leveledUp) msg += ` · Mastery Lv.${result.mastery.masteryLevel}!`;
        if (result.loot?.length) {
          msg += ` · Found ${result.loot.length} item(s)!`;
          setLastLoot(result.loot);
        }
        showMessage(msg, 'success');
      } else if (result) showMessage(`Job failed — sent to jail! (-${job.energy} energy)`, 'error');
    } catch { /* handled */ }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {catalog.locations.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLocation(l.id)}
            disabled={state.level < l.minLevel}
            className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border transition-all ${
              location === l.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold'
                : state.level >= l.minLevel ? 'border-mob-border text-gray-300' : 'border-mob-border text-gray-600 opacity-50'
            }`}
          >
            {l.name} (Lv.{l.minLevel})
          </button>
        ))}
      </div>

      <h2 className="font-display text-lg text-mob-gold">{loc?.name} Missions</h2>
      <p className="text-[10px] text-gray-500">Mastery Lv.1–4 at 10/25/50/100 completions. Jobs need gear (owned, not consumed) & mob — random equipment drops at your level.</p>

      {lastLoot?.length > 0 && (
        <div className="card border-green-700/40 bg-green-900/10 animate-fade-up">
          <p className="text-xs text-green-400 font-semibold mb-2">Loot found! (clears in a few seconds)</p>
          <div className="flex flex-wrap gap-2">
            {lastLoot.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-mob-bg/50 rounded-lg p-2">
                <ItemImage src={item.thumbnail} alt={item.name} size="list" eager />
                <span className="text-xs">{item.name} ×{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => {
          const m = mastery[job.id] || { completions: 0, masteryLevel: 0 };
          const ready = jobReady(job, state, catalog);
          return (
            <div key={job.id} className="card flex gap-3 items-center">
              <ItemImage src={job.thumbnail} alt={job.name} size="list" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{job.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  ⚡{job.energy} · {formatMoney(job.money[0])}-{formatMoney(job.money[1])} · +{job.xp} XP
                </p>
                <p className="text-[10px] text-red-400">Mastery Lv.{m.masteryLevel} · {m.completions} done</p>
                {(job.minMob > 1 || job.requiredItems?.length > 0) && (
                  <p className="text-[10px] text-amber-400/80 mt-0.5">
                    Requires: Mob {job.minMob}
                    {job.requiredItems?.map((r) => {
                      const item = findCatalogItem(catalog, r.itemId, r.category);
                      return ` · ${r.qty}x ${item?.name || r.itemId}`;
                    }).join('')}
                  </p>
                )}
                {job.lootChance > 0 && (
                  <p className="text-[10px] text-green-500/70">Loot chance ~{Math.round(job.lootChance * 100)}%</p>
                )}
                {!ready.ok && <p className="text-[10px] text-red-400">{ready.reason}</p>}
                <p className="text-xs text-red-400/70">{Math.round(job.failRate * 100)}% fail → jail</p>
              </div>
              <button
                type="button"
                className={`text-xs px-3 ${ready.ok ? 'btn-primary' : 'btn-secondary opacity-60'}`}
                disabled={!ready.ok || busy === job.id || !!state.in_jail_until}
                onClick={() => runJob(job)}
              >
                {busy === job.id ? '...' : 'Do Job'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
