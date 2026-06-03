import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import { uiAsset } from '../utils/assets';

const GODFATHER_MENU = [
  { to: '/jobs', asset: 'nav-jobs', label: 'Jobs', desc: 'Missions & cash' },
  { to: '/fight', asset: 'nav-fight', label: 'Fight', desc: 'Slap · Fight · Execute' },
  { to: '/shop', asset: 'nav-shop', label: 'Shop', desc: 'Weapons & gear' },
  { to: '/shop?tab=property', asset: 'nav-estate', label: 'Real Estate', desc: 'Hourly income' },
  { to: '/mob', asset: 'nav-mob', label: 'Mob', desc: 'Recruit allies' },
  { to: '/hitlist', asset: 'nav-hitlist', label: 'Hitlist', desc: 'Bounties' },
  { to: '/hospital', asset: 'hospital', label: 'Hospital', desc: 'Heal for cash' },
  { to: '/chat', asset: 'chat-world', label: 'Chat', desc: 'World & mob' },
  { to: '/crew', asset: 'nav-crew', label: 'Crew', desc: 'Your family' },
  { to: '/profile', asset: 'nav-profile', label: 'Profile', desc: 'Stats & bank' },
  { to: '/daily', asset: 'nav-daily', label: 'Daily', desc: 'Login rewards' },
  { to: '/boss', asset: 'nav-boss', label: 'Bosses', desc: 'Big scores' },
];

export default function HomePage() {
  const { state, action, gameGet } = useGame();
  const [daily, setDaily] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    gameGet('/meta/daily').then(setDaily).catch(() => {});
  }, [state, gameGet]);

  if (!state) return null;

  const copyCode = () => {
    if (state.referralCode) {
      navigator.clipboard.writeText(state.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const claimDaily = async () => {
    await action('/meta/daily/claim', {}, 'Daily reward claimed!');
    gameGet('/meta/daily').then(setDaily);
  };

  const canClaimDaily = daily && daily.canClaim && !daily.claimed;
  const eco = state.economy || {};

  return (
    <div className="space-y-4">
      <div className="card-premium overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-transparent pointer-events-none" />
        <div className="flex gap-4 items-start relative">
          <img
            src={uiAsset('godfather')}
            alt="The Godfather"
            className="w-24 h-24 rounded-xl border-2 border-mob-gold object-cover bg-mob-bg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-mob-gold/80">The Godfather</p>
            <h2 className="font-display text-xl text-mob-gold truncate">{state.display_name}</h2>
            <p className="text-xs text-gray-400">{state.respect.toLocaleString()} Respect · Mob {state.effective_mob_size || state.mob_size}</p>
            <p className="text-lg font-bold text-green-400 tabular-nums mt-1">{formatMoney(state.money)}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-mob-bg/60 rounded-xl border border-mob-border/50 relative">
          <div className="flex justify-between items-center gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Mob Invite Code</p>
              <p className="font-mono text-mob-gold font-bold tracking-widest">{state.referralCode || '—'}</p>
            </div>
            <button type="button" className="btn-secondary text-xs px-3" onClick={copyCode}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {canClaimDaily && (
        <div className="card border-mob-gold/40 bg-gradient-to-r from-amber-900/20 to-transparent">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-mob-gold">Daily Reward Ready!</h3>
              <p className="text-xs text-gray-400">Streak: {daily.streak || daily.daily_streak || 0} days</p>
            </div>
            <button type="button" className="btn-primary text-sm" onClick={claimDaily}>Claim</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-sm text-mob-gold mb-3">Hourly Economy</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase">Gross Income</p>
            <p className="text-green-400 font-bold">{formatMoney(eco.grossIncome || 0)}/hr</p>
          </div>
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase">Upkeep</p>
            <p className="text-red-400 font-bold">-{formatMoney(eco.upkeep || 0)}/hr</p>
          </div>
          <div className="col-span-2 p-2 bg-mob-bg rounded-lg border border-mob-gold/20">
            <p className="text-[10px] text-gray-500 uppercase">Net Income (auto every hour)</p>
            <p className={`font-bold text-lg ${(eco.netIncome || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(eco.netIncome || 0) >= 0 ? '+' : ''}{formatMoney(eco.netIncome || 0)}/hr
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Next tick in {eco.minutesToTick ?? 60}m · Income & upkeep apply automatically
            </p>
          </div>
        </div>
      </div>

      {state.health < state.max_health && (
        <Link to="/hospital" className="card flex items-center gap-3 border-red-800/40 hover:border-red-600/50">
          <img src={uiAsset('hospital')} alt="" className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-red-300">You need medical attention</p>
            <p className="text-xs text-gray-400">HP {state.health}/{state.max_health} · Tap to open Hospital</p>
          </div>
          <span className="text-mob-gold text-sm">→</span>
        </Link>
      )}

      <h3 className="font-display text-mob-gold text-sm tracking-wide">The Godfather&apos;s Menu</h3>
      <div className="grid grid-cols-3 gap-2">
        {GODFATHER_MENU.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="card flex flex-col items-center py-3 px-1 hover:border-mob-gold/40 hover:shadow-glow transition-all text-center min-h-[96px]"
          >
            <img src={uiAsset(item.asset)} alt="" className="w-10 h-10 object-contain mb-1" />
            <span className="text-[11px] font-semibold text-gray-100">{item.label}</span>
            <span className="text-[9px] text-gray-500 leading-tight mt-0.5">{item.desc}</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2 text-sm">Equipped</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Weapon</p>
            <p className="text-mob-gold truncate">{state.equipped_weapon?.replace(/^w_/, '').replace(/_/g, ' ') || 'None'}</p>
          </div>
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Armor</p>
            <p className="text-mob-gold truncate">{state.equipped_armor?.replace(/^a_/, '').replace(/_/g, ' ') || 'None'}</p>
          </div>
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Vehicle</p>
            <p className="text-mob-gold truncate">{state.equipped_vehicle?.replace(/^v_/, '').replace(/_/g, ' ') || 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
