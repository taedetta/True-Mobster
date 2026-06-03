import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';

const FIGHT_TYPES = [
  { id: 'slap', label: 'Slap', icon: '👋', stamina: 1, desc: 'Light hit, low risk' },
  { id: 'fight', label: 'Fight', icon: '⚔️', stamina: 1, desc: 'Standard brawl' },
  { id: 'execute', label: 'Execute', icon: '💀', stamina: 2, desc: 'High stakes, kill chance' },
];

export default function FightPage() {
  const { state, action, showMessage, gameGet } = useGame();
  const location = useLocation();
  const [targets, setTargets] = useState([]);
  const [revenge, setRevenge] = useState([]);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(null);
  const [tab, setTab] = useState('rivals');
  const [fightType, setFightType] = useState('fight');

  useEffect(() => {
    if (!state) return;
    api('/game/fight-list').then(setTargets);
    api('/game/combat-history').then(setHistory);
    gameGet('/revenge').then((d) => setRevenge(d.players || d || [])).catch(() => {});
  }, [state, gameGet]);

  const fight = async (targetId, name) => {
    setBusy(targetId);
    try {
      const result = await action('/fight', { targetId, fightType });
      const typeLabel = FIGHT_TYPES.find((f) => f.id === fightType)?.label || 'Fight';
      showMessage(
        result?.attackerWon ? `${typeLabel} victory vs ${name}! +${formatMoney(result.moneyStolen)}` : `Defeated by ${name}`,
        result?.attackerWon ? 'success' : 'error',
      );
      api('/game/fight-list').then(setTargets);
      api('/game/combat-history').then(setHistory);
      gameGet('/revenge').then((d) => setRevenge(d.players || d || [])).catch(() => {});
    } catch { /* handled */ }
    setBusy(null);
  };

  if (!state) return null;

  const selectedType = FIGHT_TYPES.find((f) => f.id === fightType);
  const staminaCost = selectedType?.stamina || 1;
  const preTarget = location.state?.targetId;

  const renderTarget = (t) => (
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
        disabled={state.stamina < staminaCost || busy === t.user_id || t.health <= 0}
        onClick={() => fight(t.user_id, t.display_name)}
      >
        {busy === t.user_id ? '...' : selectedType?.label || 'Attack'}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Fight Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {FIGHT_TYPES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFightType(f.id)}
              className={`py-2 rounded-lg text-xs text-center border ${fightType === f.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
            >
              <span className="block text-lg">{f.icon}</span>
              {f.label}
              <span className="block text-gray-500">💪{f.stamina}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{selectedType?.desc}</p>
      </div>

      <div className="flex gap-2">
        <button className={`flex-1 py-2 rounded-lg text-sm ${tab === 'rivals' ? 'bg-mob-gold text-black font-semibold' : 'bg-mob-card border border-mob-border'}`} onClick={() => setTab('rivals')}>Rivals</button>
        <button className={`flex-1 py-2 rounded-lg text-sm ${tab === 'revenge' ? 'bg-mob-gold text-black font-semibold' : 'bg-mob-card border border-mob-border'}`} onClick={() => setTab('revenge')}>Revenge ({revenge.length})</button>
        <button className={`flex-1 py-2 rounded-lg text-sm ${tab === 'history' ? 'bg-mob-gold text-black font-semibold' : 'bg-mob-card border border-mob-border'}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'rivals' && (
        <div className="space-y-2">
          {preTarget && targets.find((t) => t.user_id === preTarget) && (
            <p className="text-xs text-mob-gold text-center">Revenge target selected</p>
          )}
          {targets.map(renderTarget)}
        </div>
      )}

      {tab === 'revenge' && (
        <div className="space-y-2">
          {revenge.length === 0 && <p className="text-gray-500 text-sm text-center">No attackers to revenge</p>}
          {revenge.map(renderTarget)}
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
                {h.fight_type && <span className="text-xs text-gray-500 ml-1">({h.fight_type})</span>}
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
