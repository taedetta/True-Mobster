import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';import { api, formatMoney } from '../api';

const SKILLS = [
  { stat: 'attack_skill', label: 'Attack', icon: '⚔️', cost: 1 },
  { stat: 'defense_skill', label: 'Defense', icon: '🛡', cost: 1 },
  { stat: 'energy_skill', label: 'Energy', icon: '⚡', cost: 1 },
  { stat: 'stamina_skill', label: 'Stamina', icon: '💪', cost: 2 },
  { stat: 'health_skill', label: 'Health', icon: '❤️', cost: 1 },
];

export default function ProfilePage() {
  const { state, action, showMessage } = useGame();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [bankAmount, setBankAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api('/game/leaderboard').then(setLeaderboard);
  }, [state]);

  if (!state) return null;

  const avatars = state.defaultAvatars || catalogAvatars(state);
  const copyCode = () => {
    navigator.clipboard.writeText(state.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showMessage('Invite code copied!', 'success');
  };

  const pickAvatar = (avatarId) => action('/profile/avatar', { avatarId }, 'Avatar updated!');

  const uploadAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 90000) {
      showMessage('Image too large (max 90KB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      action('/profile/avatar', { custom: reader.result }, 'Custom avatar saved!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="card-premium text-center">
        <img src={state.avatar_url} alt="" className="w-24 h-24 rounded-full border-2 border-mob-gold mx-auto object-cover bg-mob-bg" />
        <h2 className="font-display text-mob-gold mt-3">{state.display_name}</h2>
        <p className="text-xs text-gray-400">Level {state.level}</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Invite Code</h3>
        <div className="flex gap-2 items-center">
          <code className="flex-1 text-center text-mob-gold font-bold tracking-widest bg-mob-bg py-2 rounded-lg">{state.referralCode}</code>
          <button type="button" className="btn-primary text-xs" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center">Friends enter this when registering or add it on the Mob page</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-3">Avatar</h3>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {avatars.map((av) => (
            <button
              key={av.id}
              type="button"
              onClick={() => pickAvatar(av.id)}
              className={`rounded-full p-0.5 border-2 ${state.avatar_id === av.id && !state.avatar_custom ? 'border-mob-gold' : 'border-transparent'}`}
              title={av.name}
            >
              <img src={`/assets/avatars/${av.id}.svg`} alt={av.name} className="w-12 h-12 rounded-full" />
            </button>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadAvatar} />
        <button type="button" className="btn-secondary w-full text-sm" onClick={() => fileRef.current?.click()}>Upload Custom Photo</button>
      </div>

      {state.skill_points > 0 && (
        <div className="card border-mob-gold/30">
          <h3 className="font-semibold text-mob-gold mb-2">Skill Points ({state.skill_points})</h3>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS.map((s) => (
              <button key={s.stat} type="button" className="btn-secondary text-xs" disabled={state.skill_points < s.cost} onClick={() => action('/skill', { stat: s.stat }, 'Skill point allocated!')}>
                {s.icon} +1 {s.label} ({s.cost}pt)
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card" id="bank">
        <h3 className="font-semibold mb-3">🏦 Bank</h3>        <p className="text-sm text-gray-400 mb-2">Cash: {formatMoney(state.money)} · Bank: {formatMoney(state.bank_balance)}</p>
        <p className="text-[10px] text-amber-400/80 mb-2">10% deposit fee (iMobsters-style) — protects cash from thieves</p>
        <input type="number" className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm" placeholder="Amount" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-primary text-xs" onClick={() => action('/bank/deposit', { amount: Number(bankAmount) }, 'Deposited!')}>Deposit</button>
          <button type="button" className="btn-secondary text-xs" onClick={() => action('/bank/withdraw', { amount: Number(bankAmount) }, 'Withdrawn!')}>Withdraw</button>
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

      <button
        type="button"
        className="btn-secondary w-full text-sm text-red-400"
        onClick={() => { logout(); navigate('/login'); }}
      >
        Logout
      </button>
    </div>
  );
}
function catalogAvatars(state) {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `default_${String(i + 1).padStart(2, '0')}`,
    name: `Avatar ${i + 1}`,
  }));
}
