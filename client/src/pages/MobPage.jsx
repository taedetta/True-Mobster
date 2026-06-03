import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

export default function MobPage() {
  const { state, action, gameGet } = useGame();
  const [info, setInfo] = useState(null);
  const [amount, setAmount] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    gameGet('/mob/info').then(setInfo).catch(() => {});
  }, [state, gameGet]);

  if (!state) return null;

  const recruit = async () => {
    setBusy(true);
    try {
      await action('/mob/recruit', { amount: Number(amount) }, `Recruited ${amount} mobsters!`);
      gameGet('/mob/info').then(setInfo);
    } catch { /* handled */ }
    setBusy(false);
  };

  const mobSize = info?.size ?? state.mob_size ?? 0;
  const maxSize = info?.maxSize ?? 500;
  const bonus = info?.bonus ?? state.combat?.mobBonus ?? 0;
  const cost = info?.recruitCost ?? info?.nextCost;

  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-br from-purple-900/20 to-mob-card">
        <h2 className="font-display text-lg text-mob-gold mb-2">Your Mob</h2>
        <p className="text-3xl font-bold">{mobSize} <span className="text-sm text-gray-400 font-normal">/ {maxSize}</span></p>
        <p className="text-sm text-gray-400 mt-2">+{Math.round((bonus || 0) * 100)}% combat bonus from mob size</p>
        {info?.dailyRecruited != null && (
          <p className="text-xs text-gray-500 mt-1">Recruited today: {info.dailyRecruited}</p>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Recruit Mobsters</h3>
        {cost != null && (
          <p className="text-xs text-gray-400 mb-2">Cost per recruit: {formatMoney(cost)}</p>
        )}
        <input
          type="number"
          min={1}
          max={50}
          className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-3 text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="btn-primary w-full" onClick={recruit} disabled={busy || mobSize >= maxSize}>
          {busy ? 'Recruiting...' : `Recruit ${amount}`}
        </button>
      </div>

      <div className="card text-xs text-gray-400">
        <p>Mob members boost your attack and defense in fights. Recruit costs scale with mob size.</p>
      </div>
    </div>
  );
}
