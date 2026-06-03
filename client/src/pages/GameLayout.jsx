import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { PlayerHeader } from '../components/UI';
import { uiAsset } from '../utils/assets';

const tabs = [
  { to: '/', asset: 'nav-home', label: 'Home' },
  { to: '/jobs', asset: 'nav-jobs', label: 'Jobs' },
  { to: '/fight', asset: 'nav-fight', label: 'Fight' },
  { to: '/shop', asset: 'nav-shop', label: 'Shop' },
  { to: '/more', asset: 'nav-profile', label: 'More' },
];

export default function GameLayout() {
  const { logout } = useAuth();
  const { state } = useGame();
  const navigate = useNavigate();
  const unread = (state?.unreadMail || 0) + (state?.unreadPm || 0);

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      <header className="glass-header px-4 py-3 flex justify-between items-center">
        <div>
          <span className="font-display text-mob-gold text-xl tracking-wide">True Mobsters</span>
          <span className="text-[10px] text-gray-600 ml-2 uppercase tracking-widest">VisionIt</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/20"
        >
          Logout
        </button>
      </header>

      <main className="p-4 animate-fade-up">
        <PlayerHeader state={state} />
        <Outlet />
      </main>

      <nav className="glass-nav">
        <div className="max-w-lg mx-auto nav-scroll">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''} relative`}
            >
              <img src={uiAsset(tab.asset)} alt="" className="w-7 h-7 object-contain" loading="eager" decoding="async" />
              <span className="font-medium text-[10px]">{tab.label}</span>
              {tab.to === '/more' && unread > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
