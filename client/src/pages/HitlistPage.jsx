import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';

export default function HitlistPage() {
  const { state, action } = useGame();
  const [hitlist, setHitlist] = useState([]);
  const [targets, setTargets] = useState([]);
  const [targetId, setTargetId] = useState('');
  const [bounty, setBounty] = useState(5000);

  useEffect(() => {
    api('/game/hitlist').then(setHitlist);
    if (state) api('/game/fight-list').then(setTargets);
  }, [state]);

  const placeHit = async () => {
    await action('/hitlist', { targetId, bounty: Number(bounty) }, 'Bounty placed!');
    api('/game/hitlist').then(setHitlist);
  };

  if (!state) return null;

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-display text-lg text-mob-gold mb-3">🎯 Place a Hit</h2>
        <select
          className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        >
          <option value="">Select target...</option>
          {targets.filter((t) => t.user_id !== state.user_id).map((t) => (
            <option key={t.user_id} value={t.user_id}>{t.display_name} (Lv.{t.level})</option>
          ))}
        </select>
        <input
          type="number"
          min={1000}
          step={500}
          className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-3 text-sm"
          value={bounty}
          onChange={(e) => setBounty(e.target.value)}
          placeholder="Bounty amount"
        />
        <button className="btn-danger w-full" onClick={placeHit} disabled={!targetId || bounty < 1000}>
          Place Hit — {formatMoney(Number(bounty))} + 10% fee
        </button>
      </div>

      <h3 className="font-semibold">Active Hitlist</h3>
      <div className="space-y-2">
        {hitlist.length === 0 && <p className="text-gray-500 text-sm">No active bounties</p>}
        {hitlist.map((h) => (
          <div key={h.id} className="card flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm text-red-400">{h.target_name}</p>
              <p className="text-xs text-gray-400">Lv.{h.target_level} · by {h.placed_by_name}</p>
            </div>
            <p className="text-mob-gold font-bold">{formatMoney(h.bounty)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
