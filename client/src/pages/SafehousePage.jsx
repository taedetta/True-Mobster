import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import { uiAsset } from '../utils/assets';

export default function SafehousePage() {
  const { state, action } = useGame();
  const [iceHours, setIceHours] = useState(4);
  const [busy, setBusy] = useState(false);

  if (!state) return null;

  const inJail = state.in_jail_until && new Date(state.in_jail_until) > new Date();
  const bailMinutes = inJail ? Math.ceil((new Date(state.in_jail_until) - Date.now()) / 60000) : 0;
  const bailCost = bailMinutes * 50;
  const iced = state.iced_until && new Date(state.iced_until) > new Date();
  const iceCost = iceHours * 5000;

  const payBail = async () => {
    setBusy(true);
    try {
      await action('/safehouse/bail', {}, `Bail paid — ${formatMoney(bailCost)}`);
    } catch { /* */ }
    setBusy(false);
  };

  const buyIce = async () => {
    setBusy(true);
    try {
      await action('/safehouse/ice', { hours: Number(iceHours) }, `Iced for ${iceHours} hours`);
    } catch { /* */ }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="card-premium flex gap-4 items-start">
        <img src={uiAsset('hospital')} alt="" className="w-16 h-16 rounded-xl object-cover border border-mob-gold/30" />
        <div>
          <h2 className="font-display text-xl text-mob-gold">Safehouse</h2>
          <p className="text-xs text-gray-400 mt-1">Jail bail, ice protection, and hospital — iMobsters style</p>
        </div>
      </div>

      {inJail && (
        <div className="card border-red-800/50 bg-red-900/20">
          <h3 className="font-semibold text-red-300 mb-2">🔒 In Jail</h3>
          <p className="text-sm text-gray-400">Release: {new Date(state.in_jail_until).toLocaleTimeString()}</p>
          <p className="text-lg font-bold text-mob-gold mt-2">Bail: {formatMoney(bailCost)}</p>
          <button type="button" className="btn-primary w-full mt-3" disabled={busy || state.money < bailCost} onClick={payBail}>
            Pay Bail
          </button>
        </div>
      )}

      <div className="card border-red-900/40">
        <h3 className="font-semibold text-red-300 mb-2">Ice Protection</h3>
        <p className="text-xs text-gray-400 mb-3">While iced, rivals cannot attack you. Max 24 hours.</p>
        {iced && (
          <p className="text-sm text-red-400 mb-2">Protected until {new Date(state.iced_until).toLocaleString()}</p>
        )}
        <div className="flex gap-2 items-center mb-3">
          <input
            type="number"
            min={1}
            max={24}
            value={iceHours}
            onChange={(e) => setIceHours(e.target.value)}
            className="w-20 px-2 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm text-center"
          />
          <span className="text-sm text-gray-400">hours · {formatMoney(iceCost)}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {[1, 4, 8, 12, 24].map((h) => (
            <button key={h} type="button" className="text-[10px] px-2 py-1 rounded border border-mob-border" onClick={() => setIceHours(h)}>{h}h</button>
          ))}
        </div>
        <button type="button" className="btn-primary w-full" disabled={busy || state.money < iceCost} onClick={buyIce}>
          Buy Ice Protection
        </button>
        <Link to="/godfather" className="block text-center text-xs text-red-400 mt-2">Or buy with Favor Points →</Link>
      </div>

      <Link to="/hospital" className="card flex items-center gap-3 hover:border-red-600/40">
        <img src={uiAsset('hospital')} alt="" className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Hospital / ER</p>
          <p className="text-xs text-gray-400">HP {state.health}/{state.max_health} · Heal below 60% with cash</p>
        </div>
        <span className="text-mob-gold">→</span>
      </Link>
    </div>
  );
}
