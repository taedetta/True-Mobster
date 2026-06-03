import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import { uiAsset } from '../utils/assets';

const LINKS = [
  { to: '/godfather', asset: 'godfather', label: 'The Godfather' },
  { to: '/hitlist', asset: 'nav-hitlist', label: 'Hitlist' },
  { to: '/boss', asset: 'nav-boss', label: 'Boss Fights' },
  { to: '/crew', asset: 'nav-crew', label: 'Crew' },
  { to: '/hospital', asset: 'hospital', label: 'Hospital' },
  { to: '/mail', asset: 'chat-messages', label: 'Mail' },
  { to: '/profile', asset: 'nav-profile', label: 'Profile' },
  { to: '/daily', asset: 'nav-daily', label: 'Daily Rewards' },
  { to: '/revenge', asset: 'fight-execute', label: 'Revenge List' },
];

export default function MorePage() {
  const { state } = useGame();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">More</h2>
      <p className="text-xs text-gray-500">Core iMobsters features — extras removed for authentic gameplay.</p>

      <div className="grid grid-cols-2 gap-2">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="card flex flex-col items-center py-4 hover:border-mob-gold/40 transition-colors">
            <img src={uiAsset(l.asset)} alt="" className="w-10 h-10 object-contain" />
            <span className="text-xs mt-2 text-gray-300">{l.label}</span>
          </Link>
        ))}
      </div>

      {state?.economy && (
        <div className="card text-sm">
          <p className="text-mob-gold font-semibold mb-2">Economy Summary</p>
          <p className="text-green-400">Income: {formatMoney(state.economy.grossIncome || 0)}/hr</p>
          <p className="text-red-400">Upkeep: {formatMoney(state.economy.upkeep || 0)}/hr</p>
          <p className="text-gray-300 mt-1">Net: {formatMoney(state.economy.netIncome || 0)}/hr (automatic)</p>
        </div>
      )}

      <div className="card text-xs text-gray-500 text-center">
        True Mobsters v2.3.1 · iMobsters-style by VisionIt
      </div>
    </div>
  );
}
