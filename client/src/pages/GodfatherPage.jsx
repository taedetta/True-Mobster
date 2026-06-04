import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import { uiAsset } from '../utils/assets';

export default function GodfatherPage() {
  const { state, action, catalog } = useGame();
  const [quantities, setQuantities] = useState({});

  if (!state) return null;

  const packs = catalog?.godfatherStore || catalog?.goldStore || state.godfatherStore || [];
  const favor = state.favor_points ?? state.gold ?? 0;

  const getQty = (id) => quantities[id] ?? 1;
  const setQty = (id, v) => setQuantities((q) => ({ ...q, [id]: Math.max(1, v) }));

  const maxQty = (pack) => Math.max(1, Math.floor(favor / pack.favorCost));

  const gearItem = (pack) => {
    if (pack.effect !== 'gear' || !pack.itemId) return null;
    const key = pack.category === 'weapon' ? 'weapons' : pack.category === 'armor' ? 'armor' : pack.category === 'vehicle' ? 'vehicles' : 'consumables';
    return catalog?.[key]?.find((i) => i.id === pack.itemId);
  };

  const buy = (pack) => {
    const qty = getQty(pack.id);
    action('/godfather/buy', { packId: pack.id, quantity: qty }, `Traded ${qty}x ${pack.name} with the Godfather!`);
  };

  return (
    <div className="space-y-4">
      <div className="card-premium flex gap-4 items-start">
        <img src={uiAsset('godfather')} alt="The Godfather" className="w-24 h-24 rounded-xl border-2 border-mob-gold object-cover bg-mob-bg flex-shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-mob-gold/80">Specialty Shop</p>
          <h2 className="font-display text-xl text-mob-gold">The Godfather</h2>
          <p className="text-xs text-gray-400 mt-1">
            Trade Favor Points for refills, hired guns, cash, and exclusive equipment.
          </p>
          <p className="text-lg font-bold text-red-300 mt-2">{favor} Favor Points</p>
          <p className="text-[10px] text-gray-500">Earn favor from jobs, daily login & achievements</p>
        </div>
      </div>

      <div className="space-y-3">
        {packs.map((pack) => {
          const qty = getQty(pack.id);
          const cost = pack.favorCost * qty;
          const max = maxQty(pack);
          const gear = gearItem(pack);
          const statParts = [];
          if (gear?.attack > 0) statParts.push(`+${gear.attack} ATK`);
          if (gear?.defense > 0) statParts.push(`+${gear.defense} DEF`);
          return (
            <div key={pack.id} className="card space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-sm">{pack.icon} {pack.name}</p>
                  <p className="text-xs text-gray-400">{pack.favorCost} favor each · qty {(pack.qty || 1) * qty}</p>
                  {pack.effect === 'cash' && <p className="text-xs text-green-400">≈ {formatMoney((pack.cashPerLevel || 500) * state.level * qty)}</p>}
                  {pack.effect === 'mob' && <p className="text-xs text-red-300">+{(pack.amount || 1) * qty} mob</p>}
                  {pack.effect === 'gear' && statParts.length > 0 && (
                    <p className="text-xs text-mob-gold">{statParts.join(' · ')}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={max}
                  value={qty}
                  onChange={(e) => setQty(pack.id, Math.min(Number(e.target.value) || 1, max))}
                  className="w-20 px-2 py-1.5 rounded-lg bg-mob-bg border border-mob-border text-xs text-center"
                />
                <button type="button" className="btn-secondary text-[10px] px-2" onClick={() => setQty(pack.id, max)}>Max</button>
                <div className="flex gap-1">
                  {[1, 5, 10, 50].map((n) => (
                    <button key={n} type="button" className="text-[10px] px-1.5 py-0.5 rounded border border-mob-border" onClick={() => setQty(pack.id, Math.min(n, max))}>{n}</button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary text-xs ml-auto flex-shrink-0"
                  disabled={favor < cost}
                  onClick={() => buy(pack)}
                >
                  Trade {cost} favor
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Link to="/" className="btn-secondary w-full text-sm text-center block">← Back Home</Link>
    </div>
  );
}
