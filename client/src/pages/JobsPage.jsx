import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

export default function JobsPage() {
  const { catalog, state, action, showMessage } = useGame();
  const [location, setLocation] = useState('downtown');
  const [busy, setBusy] = useState(null);

  if (!catalog || !state) return null;

  const jobs = catalog.jobs.filter((j) => j.location === location);
  const loc = catalog.locations.find((l) => l.id === location);

  const runJob = async (job) => {
    setBusy(job.id);
    try {
      const result = await action('/job', { jobId: job.id });
      if (result?.success) showMessage(`Earned ${formatMoney(result.money)}! (-${job.energy} energy)`, 'success');
      else if (result) showMessage(`Job failed — sent to jail! (-${job.energy} energy)`, 'error');
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

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="card flex gap-3 items-center">
            <img
              src={job.thumbnail}
              alt={job.name}
              className="item-img w-24 h-24 flex-shrink-0"
              loading="lazy"
              onError={(e) => { if (e.currentTarget.src.endsWith('.png')) e.currentTarget.src = job.thumbnail.replace('.png', '.svg'); }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{job.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                ⚡{job.energy} · {formatMoney(job.money[0])}-{formatMoney(job.money[1])} · +{job.xp} XP
              </p>
              <p className="text-xs text-red-400/70">{Math.round(job.failRate * 100)}% fail → jail</p>
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
