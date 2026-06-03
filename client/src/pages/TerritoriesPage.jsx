import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function TerritoriesPage() {
  const { state, action, gameGet } = useGame();
  const [territories, setTerritories] = useState([]);
  const [crews, setCrews] = useState([]);
  const [warForm, setWarForm] = useState({ territoryId: '', targetCrewId: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    gameGet('/territories').then((d) => setTerritories(d.territories || d || [])).catch(() => {});
    if (state?.crew) gameGet('/crews').then((d) => setCrews(Array.isArray(d) ? d : d.crews || [])).catch(() => {});
  }, [state, gameGet]);

  const declareWar = async () => {
    setBusy(true);
    try {
      await action('/territories/war', warForm, 'Territory war declared!');
      gameGet('/territories').then((d) => setTerritories(d.territories || d || []));
    } catch { /* handled */ }
    setBusy(false);
  };

  if (!state) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Territories</h2>
      {!state.crew ? (
        <div className="card text-sm text-gray-400 text-center py-6">Join a crew to fight for territory control</div>
      ) : (
        <>
          <div className="card">
            <h3 className="font-semibold mb-2 text-sm">Declare War</h3>
            <select className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm" value={warForm.territoryId} onChange={(e) => setWarForm({ ...warForm, territoryId: e.target.value })}>
              <option value="">Select territory</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm" value={warForm.targetCrewId} onChange={(e) => setWarForm({ ...warForm, targetCrewId: e.target.value })}>
              <option value="">Target crew</option>
              {crews.filter((c) => c.id !== state.crew?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button className="btn-danger w-full text-sm" onClick={declareWar} disabled={busy || !warForm.territoryId || !warForm.targetCrewId}>
              {busy ? 'Declaring...' : 'Declare War'}
            </button>
          </div>
        </>
      )}

      <div className="space-y-2">
        {territories.map((t) => (
          <div key={t.id} className="card" style={{ borderLeftColor: t.color, borderLeftWidth: 3 }}>
            <div className="flex justify-between">
              <h3 className="font-semibold text-sm">{t.name}</h3>
              <span className="text-xs text-mob-gold">+{Math.round((t.bonus || 0) * 100)}% bonus</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Controlled by: <span className="text-gray-200">{t.crew_name || t.owner_name || 'Unclaimed'}</span>
            </p>
            {t.at_war && <p className="text-xs text-red-400 mt-1">⚔ At war</p>}
            <p className="text-xs text-gray-500">Min crew level: {t.minCrewLevel || t.min_crew_level}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
