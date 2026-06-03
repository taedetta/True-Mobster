import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';

export default function FightPage() {
  const { state, action, showMessage } = useGame();
  const [targets, setTargets] = useState([]);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(null);
  const [tab, setTab] = useState('rivals');

  useEffect(() => {
    if (!state) return;
    api('/game/fight-list').then(setTargets);
    api('/game/combat-history').then(setHistory);
  }, [state]);

  const fight = async (targetId, name) => {
    setBusy(targetId);
    try {
      const result = await action('/fight', { targetId });
      showMessage(
        result?.attackerWon ? `Victory vs ${name}! +${formatMoney(result.moneyStolen)}` : `Defeated by ${name}`,
        result?.attackerWon ? 'success' : 'error',
      );
      api('/game/fight-list').then(setTargets);
      api('/game/combat-history').then(setHistory);
    } catch { /* handled */ }
    setBusy(null);
  };

  if (!state) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`flex-1 py-2 rounded-lg text-sm ${tab === 'rivals' ? 'bg-mob-gold text-black font-semibold' : 'bg-mob-card border border-mob-border'}`} onClick={() => setTab('rivals')}>Rivals</button>
        <button className={`flex-1 py-2 rounded-lg text-sm ${tab === 'history' ? 'bg-mob-gold text-black font-semibold' : 'bg-mob-card border border-mob-border'}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'rivals' && (
        <div className="space-y-2">
          {targets.map((t) => (
            <div key={t.user_id} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mob-crimson to-mob-bg flex items-center justify-center text-lg">
                {t.is_bot ? '🤖' : '👤'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t.display_name} {t.is_bot && <span className="text-xs text-gray-500">(Bot)</span>}</p>
                <p className="text-xs text-gray-400">Lv.{t.level} · {t.respect} respect · {t.wins}W/{t.losses}L</p>
                <p className="text-xs text-red-400">HP {t.health}/{t.max_health}</p>
              </div>
              <button
                className="btn-danger text-xs px-3"
                disabled={state.stamina < 1 || busy === t.user_id || t.health <= 0}
                onClick={() => fight(t.user_id, t.display_name)}
              >
                {busy === t.user_id ? '...' : 'Attack'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 && <p className="text-gray-500 text-sm text-center">No fights yet</p>}
          {history.map((h) => (
            <div key={h.id} className="card text-sm">
              <p>
                {h.attacker_id === state.user_id ? 'You attacked' : 'You were attacked by'} {' '}
                <span className="text-mob-gold">{h.attacker_id === state.user_id ? h.defender_name : h.attacker_name}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {h.attacker_won ? (h.attacker_id === state.user_id ? '✅ Victory' : '❌ Defeat') :
                  (h.attacker_id === state.user_id ? '❌ Defeat' : '✅ Victory')}
                {h.money_stolen > 0 && ` · ${formatMoney(h.money_stolen)}`}
                {h.bounty_claimed > 0 && ` · Bounty ${formatMoney(h.bounty_claimed)}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
