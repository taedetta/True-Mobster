import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

const GODFATHER_MENU = [
  { to: '/jobs', icon: '💼', label: 'Jobs', desc: 'Earn cash & XP' },
  { to: '/fight', icon: '⚔️', label: 'Fight', desc: 'Slap, fight, execute' },
  { to: '/shop', icon: '🛒', label: 'Shop', desc: 'Weapons & gear' },
  { to: '/shop?tab=property', icon: '🏢', label: 'Real Estate', desc: 'Stack properties' },
  { to: '/mob', icon: '👥', label: 'Mob', desc: 'Recruit & allies' },
  { to: '/hitlist', icon: '🎯', label: 'Hitlist', desc: 'Bounties' },
  { to: '/daily', icon: '📅', label: 'Missions', desc: 'Daily rewards' },
  { to: '/boss', icon: '👹', label: 'Bosses', desc: 'Big scores' },
  { to: '/chat', icon: '💬', label: 'Chat', desc: 'World & mob' },
  { to: '/crew', icon: '🔫', label: 'Crew', desc: 'Your family' },
  { to: '/profile', icon: '👤', label: 'Profile', desc: 'Skills & bank' },
  { to: '/more', icon: '☰', label: 'More', desc: 'All features' },
];

export default function HomePage() {
  const { state, action, gameGet } = useGame();
  const [daily, setDaily] = useState(null);
  const [mailUnread, setMailUnread] = useState(0);
  const [newsSnippet, setNewsSnippet] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    gameGet('/meta/daily').then(setDaily).catch(() => {});
    gameGet('/mail').then((d) => {
      const list = d.mail || d || [];
      setMailUnread(list.filter((m) => !m.read_status && !m.read).length);
    }).catch(() => {});
    gameGet('/news').then((d) => {
      const list = d.news || d || [];
      if (list.length > 0) setNewsSnippet(list[0]);
    }).catch(() => {});
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

  const incomeMinsLeft = state.last_income_collect
    ? Math.max(0, Math.ceil((3600000 - (Date.now() - new Date(state.last_income_collect).getTime())) / 60000))
    : 0;

  return (
    <div className="space-y-4">
      {/* Godfather portrait hub */}
      <div className="card-premium overflow-hidden">
        <div className="flex gap-4 items-start">
          <div className="relative flex-shrink-0">
            <img
              src={state.avatar_url || '/assets/avatars/default_01.svg'}
              alt=""
              className="w-20 h-20 rounded-full border-2 border-mob-gold object-cover bg-mob-bg"
            />
            <span className="absolute -bottom-1 -right-1 bg-mob-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">Lv.{state.level}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl text-mob-gold truncate">{state.display_name}</h2>
            <p className="text-xs text-gray-400">{state.respect.toLocaleString()} Respect · Mob {state.effective_mob_size || state.mob_size}</p>
            <p className="text-lg font-bold text-green-400 tabular-nums mt-1">{formatMoney(state.money)}</p>
            {state.gold > 0 && <p className="text-xs text-amber-400">{state.gold} gold</p>}
          </div>
        </div>

        <div className="mt-4 p-3 bg-mob-bg/60 rounded-xl border border-mob-border/50">
          <div className="flex justify-between items-center gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Invite Code</p>
              <p className="font-mono text-mob-gold font-bold tracking-widest">{state.referralCode || '—'}</p>
            </div>
            <button type="button" className="btn-secondary text-xs px-3" onClick={copyCode}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Share your code — friends join your mob for combat bonus</p>
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

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-primary text-sm" onClick={() => action('/collect-income', {}, 'Income collected!')} disabled={!state.incomeReady}>
          {state.incomeReady ? 'Collect Income' : `Income in ${incomeMinsLeft}m`}
        </button>
        <button type="button" className="btn-secondary text-sm" onClick={() => action('/heal', {}, 'Fully healed!')} disabled={state.health >= state.max_health}>
          Hospital
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Link to="/mail" className="card flex flex-col items-center py-3 hover:border-mob-gold/30 text-center">
          <span className="text-xl">📬</span>
          <span className="text-[10px] mt-1">Mail{mailUnread > 0 ? ` (${mailUnread})` : ''}</span>
        </Link>
        <Link to="/news" className="card flex flex-col items-center py-3 hover:border-mob-gold/30 text-center">
          <span className="text-xl">📰</span>
          <span className="text-[10px] mt-1">News</span>
        </Link>
        <Link to="/chat" className="card flex flex-col items-center py-3 hover:border-mob-gold/30 text-center">
          <span className="text-xl">💬</span>
          <span className="text-[10px] mt-1">Chat</span>
        </Link>
      </div>

      {newsSnippet && (
        <Link to="/news" className="card block hover:border-mob-gold/30">
          <p className="text-xs text-mob-gold mb-1">Latest News</p>
          <p className="text-sm font-semibold truncate">{newsSnippet.title || newsSnippet.event_type}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{newsSnippet.body || newsSnippet.message}</p>
        </Link>
      )}

      <h3 className="font-display text-mob-gold text-sm tracking-wide">The Godfather&apos;s Menu</h3>
      <div className="grid grid-cols-3 gap-2">
        {GODFATHER_MENU.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="card flex flex-col items-center py-3 px-1 hover:border-mob-gold/40 hover:shadow-glow transition-all text-center min-h-[88px]"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[11px] font-semibold text-gray-100 mt-1">{item.label}</span>
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
