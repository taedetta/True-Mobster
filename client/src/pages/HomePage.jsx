import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import { uiAsset } from '../utils/assets';

const QUICK_LINKS = [
  { to: '/jobs', asset: 'nav-jobs', label: 'Jobs' },
  { to: '/fight', asset: 'nav-fight', label: 'Fight' },
  { to: '/shop', asset: 'nav-shop', label: 'Shop' },
  { to: '/shop?tab=property', asset: 'nav-estate', label: 'Real Estate' },
  { to: '/godfather', asset: 'godfather', label: 'The Godfather' },
  { to: '/mob', asset: 'nav-mob', label: 'Mob' },
  { to: '/hitlist', asset: 'nav-hitlist', label: 'Hitlist' },
  { to: '/hospital', asset: 'hospital', label: 'Hospital' },
  { to: '/mail', asset: 'chat-messages', label: 'Mail' },
  { to: '/chat', asset: 'chat-world', label: 'Chat' },
  { to: '/crew', asset: 'nav-crew', label: 'Crew' },
  { to: '/profile', asset: 'nav-profile', label: 'Profile' },
  { to: '/daily', asset: 'nav-daily', label: 'Daily' },
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
  const favor = state.favor_points ?? state.gold ?? 0;

  return (
    <div className="space-y-4">
      <div className="card-premium">
        <div className="flex gap-4 items-start">
          <img
            src={state.avatar_url || '/assets/avatars/default_01.svg'}
            alt=""
            className="w-20 h-20 rounded-full border-2 border-mob-gold object-cover bg-mob-bg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl text-mob-gold truncate">{state.display_name}</h2>
            <p className="text-xs text-gray-400">Lv.{state.level} · {state.respect.toLocaleString()} Respect · Mob {state.effective_mob_size || state.mob_size}</p>
            <p className="text-lg font-bold text-green-400 tabular-nums mt-1">{formatMoney(state.money)}</p>
            <p className="text-xs text-purple-300">{favor} Favor Points</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-mob-bg/60 rounded-xl border border-mob-border/50">
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

      <Link to="/godfather" className="card flex items-center gap-3 border-purple-800/40 hover:border-purple-500/50 bg-gradient-to-r from-purple-950/30 to-transparent">
        <img src={uiAsset('godfather')} alt="" className="w-14 h-14 rounded-lg object-cover border border-mob-gold/30" />
        <div className="flex-1">
          <p className="font-semibold text-mob-gold">The Godfather&apos;s Shop</p>
          <p className="text-xs text-gray-400">Spend Favor Points on refills, hired guns & bonuses</p>
        </div>
        <span className="text-purple-300 text-sm">{favor} FP →</span>
      </Link>

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
            <p className="text-[10px] text-gray-500 uppercase">Net (auto every hour)</p>
            <p className={`font-bold text-lg ${(eco.netIncome || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(eco.netIncome || 0) >= 0 ? '+' : ''}{formatMoney(eco.netIncome || 0)}/hr
            </p>
          </div>
        </div>
      </div>

      {state.health < state.max_health && (
        <Link to="/hospital" className="card flex items-center gap-3 border-red-800/40 hover:border-red-600/50">
          <img src={uiAsset('hospital')} alt="" className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-red-300">Visit the Hospital</p>
            <p className="text-xs text-gray-400">HP {state.health}/{state.max_health}</p>
          </div>
          <span className="text-mob-gold text-sm">→</span>
        </Link>
      )}

      <h3 className="font-display text-mob-gold text-sm tracking-wide">Quick Menu</h3>
      <div className="grid grid-cols-3 gap-2">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="card flex flex-col items-center py-3 px-1 hover:border-mob-gold/40 transition-all text-center min-h-[88px]"
          >
            <img src={uiAsset(item.asset)} alt="" className="w-9 h-9 object-contain mb-1" />
            <span className="text-[11px] font-semibold text-gray-100">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2 text-sm">Combat Gear (auto from owned qty)</h3>
        <p className="text-xs text-gray-400 mb-2">ATK {state.combat?.attack || 0} · DEF {state.combat?.defense || 0} · Usable mob {state.usable_mob_in_fight || 0}</p>
        <p className="text-[10px] text-gray-500">Buy weapons, armor & vehicles in bulk — your mob uses the best gear you own.</p>
      </div>
    </div>
  );
}
