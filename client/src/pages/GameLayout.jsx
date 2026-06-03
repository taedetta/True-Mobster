import { Outlet, Link, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ImobstersHud } from '../components/UI';

const PAGE_TITLES = {
  '/jobs': 'Missions',
  '/fight': 'Attack',
  '/shop': 'Equipment',
  '/estate': 'Real Estate',
  '/mob': 'My Mob',
  '/godfather': 'Godfather',
  '/hospital': 'Hospital',
  '/safehouse': 'Safehouse',
  '/hitlist': 'Hitlist',
  '/boss': 'Boss Fights',
  '/mail': 'Mail',
  '/chat': 'Chat',
  '/news': 'News',
  '/collections': 'Collections',
  '/leaderboard': 'Leaderboard',
  '/profile': 'My Profile',
  '/daily': 'Daily Login',
  '/more': 'Help',
};

export default function GameLayout() {
  const { state } = useGame();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const pageTitle = PAGE_TITLES[location.pathname] || null;

  return (
    <div className="min-h-screen max-w-lg mx-auto imob-app">
      <ImobstersHud state={state} />

      {!isHome && (
        <div className="px-3 py-2 flex items-center justify-between border-b border-red-950/60 bg-black/90">
          <Link to="/" className="text-xs text-red-400 font-semibold hover:text-red-300">← Home</Link>
          {pageTitle && <span className="text-xs text-gray-400 uppercase tracking-wider">{pageTitle}</span>}
          <span className="w-10" />
        </div>
      )}

      <main className={`px-3 ${isHome ? 'pt-2 pb-4' : 'py-3 pb-6'} animate-fade-up`}>
        <Outlet />
      </main>
    </div>
  );
}
