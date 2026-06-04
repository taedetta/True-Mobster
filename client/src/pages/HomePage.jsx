import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import ItemImage from '../components/ItemImage';

const PRIMARY = [
  { to: '/jobs', label: 'Missions' },
  { to: '/fight', label: 'Attack' },
  { to: '/shop', label: 'Equipment' },
  { to: '/estate', label: 'Real Estate' },
];

const SECONDARY = [
  { to: '/profile#bank', label: 'Bank' },
  { to: '/hospital', label: 'Hospital' },
  { to: '/godfather', label: 'Godfather', badge: 'favor' },
  { to: '/profile', label: 'My Profile' },
  { to: '/mob', label: 'My Mob' },
  { to: '/profile', label: 'Settings', icon: '⚙' },
  { to: '/more', label: 'Help', icon: '?' },
];

export default function HomePage() {
  const { state, action, gameGet } = useGame();
  const [daily, setDaily] = useState(null);
  const [news, setNews] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    gameGet('/meta/daily').then(setDaily).catch(() => {});
    gameGet('/news').then((d) => setNews((d.news || d || []).slice(0, 5))).catch(() => {});
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
  const favor = state.favor_points ?? state.gold ?? 0;
  const weapon = state.equippedWeapon;
  const mobCount = state.effective_mob_size || state.mob_size || 0;

  return (
    <div className="space-y-3 -mt-1">
      {canClaimDaily && (
        <div className="imob-warning border-yellow-800/50">
          <p className="text-yellow-400 font-bold text-sm">Daily Reward Ready!</p>
          <button type="button" className="btn-primary text-xs mt-2 w-full" onClick={claimDaily}>
            Claim Day {(daily.streak || daily.daily_streak || 0) + 1}
          </button>
        </div>
      )}

      <div className="imob-banner">
        <div className="imob-banner-inner">
          <div className="imob-banner-weapon">
            {weapon ? (
              <>
                <ItemImage src={weapon.thumbnail} alt={weapon.name} size="banner" eager />
                <p className="text-[9px] text-gray-400 mt-1 leading-tight text-center max-w-[76px] line-clamp-2">{weapon.name}</p>
              </>
            ) : (
              <p className="text-[10px] text-gray-500 text-center">No weapon</p>
            )}
          </div>

          <div className="imob-banner-center">
            <img
              src={state.avatar_url || '/assets/avatars/default_01.svg'}
              alt=""
              className="banner-portrait"
            />
            <div className="imob-code-banner mt-2">
              <button type="button" onClick={copyCode} className="font-mono text-sm font-bold text-white tracking-widest">
                {state.referralCode || '------'}
              </button>
              {copied && <span className="text-[9px] text-green-400 block">Copied!</span>}
            </div>
          </div>

          <div className="imob-banner-right text-right">
            <p className="text-white font-semibold text-sm truncate max-w-[90px]">{state.display_name}</p>
            <div className="mt-4 flex flex-col items-end">
              <span className="text-[10px] text-gray-400">My Mob</span>
              <span className="text-2xl font-bold text-white">{mobCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRIMARY.map((btn) => (
          <Link key={btn.label} to={btn.to} className="imob-btn-primary">
            {btn.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {SECONDARY.map((btn) => (
          <Link key={btn.label} to={btn.to} className="imob-btn-secondary relative">
            {btn.icon ? (
              <span className="text-lg">{btn.icon}</span>
            ) : (
              <span className="text-[10px] leading-tight text-center">{btn.label}</span>
            )}
            {btn.badge === 'favor' && favor > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {favor > 99 ? '99' : favor}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="imob-news-footer">
        <p className="imob-news-title">NEWS FEED</p>
        <div className="imob-news-body">
          {news.length === 0 && (
            <p className="text-xs text-gray-500 py-2 text-center">No news yet — fight rivals to make headlines!</p>
          )}
          {news.map((n) => (
            <div key={n.id} className="py-2 border-b border-yellow-950/40 last:border-0">
              <p className="text-xs text-gray-200">{n.body || n.content || n.message || n.title}</p>
              {n.created_at && (
                <p className="text-[9px] text-gray-600 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
              )}
            </div>
          ))}
          {news.length > 0 && (
            <Link to="/news" className="block text-center text-[10px] text-yellow-400 pt-2">View all news →</Link>
          )}
        </div>
      </div>

      <p className="text-[9px] text-center text-gray-600 pb-2">
        True Mobsters v2.6.5 · VisionIt Studio
      </p>
    </div>
  );
}
