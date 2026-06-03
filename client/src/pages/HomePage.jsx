import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

export default function HomePage() {
  const { state, action, gameGet } = useGame();
  const [daily, setDaily] = useState(null);
  const [mailUnread, setMailUnread] = useState(0);
  const [newsSnippet, setNewsSnippet] = useState(null);

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

  const handleCollect = () => action('/collect-income', {}, 'Income collected!');
  const handleHeal = () => action('/heal', {}, 'Fully healed!');
  const claimDaily = async () => {
    await action('/meta/daily/claim', {}, 'Daily reward claimed!');
    gameGet('/meta/daily').then(setDaily);
  };

  const canClaimDaily = daily && daily.canClaim && !daily.claimed;

  return (
    <div className="space-y-4">
      {canClaimDaily && (
        <div className="card border-mob-gold/40 bg-gradient-to-r from-amber-900/20 to-transparent">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-mob-gold">Daily Reward Ready!</h3>
              <p className="text-xs text-gray-400">Streak: {daily.streak || daily.daily_streak || 0} days</p>
            </div>
            <button className="btn-primary text-sm" onClick={claimDaily}>Claim</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Link to="/mail" className="card flex items-center gap-2 hover:border-mob-gold/30">
          <span className="text-xl">📬</span>
          <div>
            <p className="text-sm font-semibold">Mail</p>
            <p className="text-xs text-gray-400">{mailUnread > 0 ? `${mailUnread} unread` : 'All read'}</p>
          </div>
          {mailUnread > 0 && (
            <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{mailUnread}</span>
          )}
        </Link>
        <Link to="/news" className="card flex items-center gap-2 hover:border-mob-gold/30">
          <span className="text-xl">📰</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">News</p>
            <p className="text-xs text-gray-400 truncate">{newsSnippet?.title || 'Latest updates'}</p>
          </div>
        </Link>
      </div>

      {newsSnippet && (
        <Link to="/news" className="card block hover:border-mob-gold/30">
          <p className="text-xs text-mob-gold mb-1">Latest News</p>
          <p className="text-sm font-semibold truncate">{newsSnippet.title}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{newsSnippet.body || newsSnippet.content}</p>
        </Link>
      )}

      <div className="card">
        <h2 className="font-display text-lg text-mob-gold mb-3">Empire Dashboard</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-primary text-sm" onClick={handleCollect}>Collect Property Income</button>
          <button className="btn-secondary text-sm" onClick={handleHeal} disabled={state.health >= state.max_health}>
            Hospital ({formatMoney((state.max_health - state.health) * 10)})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Link to="/daily" className="btn-secondary text-xs text-center py-3">📅 Daily</Link>
        <Link to="/mob" className="btn-secondary text-xs text-center py-3">👥 Mob</Link>
        <Link to="/boss" className="btn-secondary text-xs text-center py-3">👹 Boss</Link>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Equipped Gear</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Weapon</p>
            <p className="text-mob-gold">{state.equipped_weapon?.replace(/_/g, ' ') || 'None'}</p>
          </div>
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Armor</p>
            <p className="text-mob-gold">{state.equipped_armor?.replace(/_/g, ' ') || 'None'}</p>
          </div>
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Vehicle</p>
            <p className="text-mob-gold">{state.equipped_vehicle?.replace(/_/g, ' ') || 'None'}</p>
          </div>
        </div>
      </div>

      {state.crew && (
        <div className="card">
          <h3 className="font-semibold mb-1">Crew: {state.crew.name}</h3>
          <p className="text-xs text-gray-400">{state.crewMembers?.length || 0} members · +{Math.round((state.combat?.crewBonus || 0) * 100)}% combat bonus</p>
        </div>
      )}

      <div className="card bg-gradient-to-r from-indigo-900/20 to-transparent">
        <h3 className="font-semibold text-sm mb-2">Quick Tips</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>⚡ Energy regens every 5 minutes — use it on Jobs</li>
          <li>💪 Stamina regens every 3 minutes — use it to Fight</li>
          <li>👋 Slap / ⚔️ Fight / 💀 Execute — pick your fight style</li>
          <li>📅 Claim daily rewards and complete missions</li>
        </ul>
      </div>
    </div>
  );
}
