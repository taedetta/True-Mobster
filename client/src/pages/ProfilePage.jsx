import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';

const SKILLS = [
  { stat: 'attack_skill', label: 'Attack', icon: '⚔️' },
  { stat: 'defense_skill', label: 'Defense', icon: '🛡' },
  { stat: 'energy_skill', label: 'Energy', icon: '⚡' },
  { stat: 'stamina_skill', label: 'Stamina', icon: '💪' },
  { stat: 'health_skill', label: 'Health', icon: '❤️' },
];

export default function ProfilePage() {
  const { state, action } = useGame();
  const [leaderboard, setLeaderboard] = useState([]);
  const [bankAmount, setBankAmount] = useState('');

  useEffect(() => {
    api('/game/leaderboard').then(setLeaderboard);
  }, [state]);

  if (!state) return null;

  const addSkill = (stat) => action('/skill', { stat }, 'Skill point allocated!');

  return (
    <div className="space-y-4">
      {state.skill_points > 0 && (
        <div className="card border-mob-gold/30">
          <h3 className="font-semibold text-mob-gold mb-2">Allocate Skill Points ({state.skill_points})</h3>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS.map((s) => (
              <button key={s.stat} className="btn-secondary text-xs" onClick={() => addSkill(s.stat)}>
                {s.icon} +1 {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-3">🏦 Bank</h3>
        <p className="text-sm text-gray-400 mb-2">Cash: {formatMoney(state.money)} · Bank: {formatMoney(state.bank_balance)}</p>
        <input type="number" className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm" placeholder="Amount" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-primary text-xs" onClick={() => action('/bank/deposit', { amount: Number(bankAmount) }, 'Deposited!')}>Deposit</button>
          <button className="btn-secondary text-xs" onClick={() => action('/bank/withdraw', { amount: Number(bankAmount) }, 'Withdrawn!')}>Withdraw</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">🏆 Leaderboard</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {leaderboard.map((p, i) => (
            <div key={p.user_id} className={`flex justify-between text-xs py-1.5 border-b border-mob-border ${p.user_id === state.user_id ? 'text-mob-gold' : ''}`}>
              <span>#{i + 1} {p.display_name}</span>
              <span className="text-gray-500">Lv.{p.level} · {p.respect} resp</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card text-xs text-gray-500 text-center">
        True Mobsters v1.0 · VisionIt Studio<br />
        Server-authoritative · All actions validated server-side
      </div>
    </div>
  );
}
