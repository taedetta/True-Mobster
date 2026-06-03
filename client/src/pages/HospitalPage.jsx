import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import { uiAsset } from '../utils/assets';

const COST_PER_HP = 10;

export default function HospitalPage() {
  const { state, action } = useGame();
  const [healAmount, setHealAmount] = useState(null);

  if (!state) return null;

  const missing = state.max_health - state.health;
  const belowThreshold = state.health / state.max_health < 0.6;
  const fullCost = missing * COST_PER_HP;
  const selectedHeal = healAmount ?? missing;
  const selectedCost = selectedHeal * COST_PER_HP;
  const canAfford = state.money >= selectedCost;

  const heal = async (amount) => {
    await action('/heal', { amount }, `Healed ${amount} HP for ${formatMoney(amount * COST_PER_HP)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <img src={uiAsset('hospital')} alt="" className="w-16 h-16 rounded-xl object-cover bg-mob-bg border border-mob-border" />
        <div>
          <h2 className="font-display text-lg text-mob-gold">Hospital</h2>
          <p className="text-xs text-gray-400">ER available below 60% HP — ${COST_PER_HP}/HP · or use Godfather favor</p>
        </div>
      </div>

      <div className="card-premium">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Your Health</p>
            <p className="text-2xl font-bold text-red-400">{state.health} <span className="text-gray-500 text-lg">/ {state.max_health}</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Missing HP</p>
            <p className="text-xl font-bold text-mob-gold">{missing}</p>
          </div>
        </div>

        {missing <= 0 ? (
          <p className="text-center text-green-400 py-6">You&apos;re at full health. Get back out there, boss.</p>
        ) : !belowThreshold ? (
          <p className="text-center text-amber-400 py-6 text-sm">
            Hospital only treats you below 60% HP. Wait for regen or visit <Link to="/godfather" className="text-red-300 underline">The Godfather</Link> for instant heal.
          </p>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              <label className="text-xs text-gray-400">Heal amount</label>
              <input
                type="range"
                min={1}
                max={missing}
                value={Math.min(selectedHeal, missing)}
                onChange={(e) => setHealAmount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>{selectedHeal} HP</span>
                <span className="text-mob-gold">{formatMoney(selectedCost)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={!canAfford || selectedHeal <= 0}
                onClick={() => heal(selectedHeal)}
              >
                Heal {selectedHeal} HP
              </button>
              <button
                type="button"
                className="btn-primary text-sm"
                disabled={!canAfford || missing <= 0}
                onClick={() => heal(missing)}
              >
                Full Heal · {formatMoney(fullCost)}
              </button>
            </div>

            {!canAfford && (
              <p className="text-xs text-red-400 mt-3 text-center">Need {formatMoney(selectedCost)} — you have {formatMoney(state.money)}</p>
            )}
          </>
        )}
      </div>

      <Link to="/safehouse" className="btn-secondary w-full text-sm text-center block">← Safehouse</Link>
    </div>
  );
}
