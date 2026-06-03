import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

const LINKS = [
  { to: '/boss', icon: '👹', label: 'Boss Fights' },
  { to: '/chat', icon: '💬', label: 'Chat' },
  { to: '/gold', icon: '🪙', label: 'Gold Store' },
  { to: '/collections', icon: '📦', label: 'Collections' },
  { to: '/social', icon: '👥', label: 'Social' },
  { to: '/mail', icon: '📬', label: 'Mail' },
  { to: '/news', icon: '📰', label: 'News' },
  { to: '/territories', icon: '🗺️', label: 'Territories' },
  { to: '/achievements', icon: '🏅', label: 'Achievements' },
  { to: '/scratch', icon: '🎫', label: 'Scratch Cards' },
  { to: '/hitlist', icon: '🎯', label: 'Hitlist' },
  { to: '/crew', icon: '🔫', label: 'Crew' },
  { to: '/profile', icon: '👤', label: 'Profile' },
  { to: '/revenge', icon: '💀', label: 'Revenge List' },
];

export default function MorePage() {
  const { state, action } = useGame();

  const inJail = state?.in_jail_until && new Date(state.in_jail_until) > new Date();
  const iced = state?.iced_until && new Date(state.iced_until) > new Date();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">More</h2>

      <div className="card border-cyan-800/30">
        <h3 className="font-semibold text-sm mb-2">🛡 Safehouse</h3>
        {inJail && (
          <>
            <p className="text-xs text-red-300 mb-2">In jail until {new Date(state.in_jail_until).toLocaleTimeString()}</p>
            <button type="button" className="btn-primary w-full text-sm mb-2" onClick={() => action('/safehouse/bail', {}, 'Bailed out!')}>
              Post Bail
            </button>
          </>
        )}
        {iced && (
          <p className="text-xs text-cyan-300 mb-2">Iced until {new Date(state.iced_until).toLocaleTimeString()}</p>
        )}
        {!inJail && !iced && <p className="text-xs text-gray-400 mb-2">Buy protection or heal at hospital from Home.</p>}
        <div className="flex gap-2 flex-wrap">
          {[1, 4, 8, 24].map((h) => (
            <button key={h} type="button" className="btn-secondary text-xs flex-1 min-w-[60px]" onClick={() => action('/safehouse/ice', { hours: h }, `Iced for ${h}h`)}>
              Ice {h}h
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="card flex flex-col items-center py-4 hover:border-mob-gold/40 transition-colors">
            <span className="text-2xl">{l.icon}</span>
            <span className="text-xs mt-1 text-gray-300">{l.label}</span>
          </Link>
        ))}
      </div>

      <div className="card text-xs text-gray-500 text-center">
        True Mobsters v2.2 · {formatMoney(state?.money || 0)} on hand
      </div>
    </div>
  );
}
