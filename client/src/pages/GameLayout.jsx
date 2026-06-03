import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { PlayerHeader } from '../components/UI';

const tabs = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/jobs', icon: '💼', label: 'Jobs' },
  { to: '/fight', icon: '⚔️', label: 'Fight' },
  { to: '/shop', icon: '🛒', label: 'Shop' },
  { to: '/hitlist', icon: '🎯', label: 'Hits' },
  { to: '/crew', icon: '👥', label: 'Crew' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function GameLayout() {
  const { logout } = useAuth();
  const { state } = useGame();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-mob-bg/95 backdrop-blur border-b border-mob-border px-4 py-2 flex justify-between items-center">
        <div>
          <span className="font-display text-mob-gold text-lg">True Mobsters</span>
          <span className="text-xs text-gray-600 ml-2">VisionIt</span>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-xs text-gray-500 hover:text-red-400">Logout</button>
      </header>

      <main className="p-4">
        <PlayerHeader state={state} />
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-mob-card/95 backdrop-blur border-t border-mob-border z-40">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
