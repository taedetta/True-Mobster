import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import ItemImage from '../components/ItemImage';

export default function JobsPage() {
  const { catalog, state, action, showMessage } = useGame();
  const [location, setLocation] = useState('downtown');
  const [busy, setBusy] = useState(null);
  const [lastLoot, setLastLoot] = useState(null);

  if (!catalog || !state) return null;

  const jobs = catalog.jobs.filter((j) => j.location === location);
  const loc = catalog.locations.find((l) => l.id === location);

  const runJob = async (job) => {
    setBusy(job.id);
    setLastLoot(null);
    try {
      const result = await action('/job', { jobId: job.id });
      if (result?.success) {
        let msg = `Earned ${formatMoney(result.money)}!`;
        if (result.favorEarned) msg += ` +${result.favorEarned} Favor`;
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
            onClick={() => setLocation(l.id)}
            disabled={state.level < l.minLevel}
            className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap border transition-all ${
              location === l.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' :
              state.level >= l.minLevel ? 'border-mob-border text-gray-300' : 'border-mob-border text-gray-600 opacity-50'
            }`}
          >
            {l.name} (Lv.{l.minLevel})
          </button>
        ))}
      </div>

      <h2 className="font-display text-lg text-mob-gold">{loc?.name} Jobs</h2>
      <p className="text-[10px] text-gray-500">Jobs can drop weapons, armor, vehicles & items — build your collections.</p>

      {lastLoot?.length > 0 && (
        <div className="card border-green-700/40 bg-green-900/10">
          <p className="text-xs text-green-400 font-semibold mb-2">Loot found!</p>
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
        {jobs.map((job) => (
          <div key={job.id} className="card flex gap-3 items-center">
            <ItemImage src={job.thumbnail} alt={job.name} size="list" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{job.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                ⚡{job.energy} · {formatMoney(job.money[0])}-{formatMoney(job.money[1])} · +{job.xp} XP
              </p>
              <p className="text-xs text-red-400/70">{Math.round(job.failRate * 100)}% fail → jail</p>
              <p className="text-[10px] text-purple-400/70">Chance: loot drop</p>
            </div>
            <button
              className="btn-primary text-xs px-3"
              disabled={state.energy < job.energy || busy === job.id || !!state.in_jail_until}
              onClick={() => runJob(job)}
            >
              {busy === job.id ? '...' : 'Do Job'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
