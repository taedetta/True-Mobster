import { Link } from 'react-router-dom';

import { useGame } from '../context/GameContext';

import { formatMoney } from '../api';

import { uiAsset } from '../utils/assets';



const LINKS = [

  { to: '/godfather', asset: 'godfather', label: 'The Godfather' },

  { to: '/mail', asset: 'chat-messages', label: 'Mail' },

  { to: '/chat', asset: 'chat-world', label: 'Chat' },

  { to: '/mob', asset: 'nav-mob', label: 'Mob' },

  { to: '/news', asset: 'nav-daily', label: 'City News' },

  { to: '/collections', asset: 'nav-shop', label: 'Collections' },

  { to: '/scratch', asset: 'nav-daily', label: 'Scratch Cards' },

  { to: '/territories', asset: 'nav-estate', label: 'Territories' },

  { to: '/achievements', asset: 'nav-profile', label: 'Achievements' },

  { to: '/social', asset: 'nav-crew', label: 'Friends & Gifts' },

  { to: '/leaderboard', asset: 'nav-hitlist', label: 'Leaderboard' },

  { to: '/hitlist', asset: 'nav-hitlist', label: 'Hitlist' },

  { to: '/boss', asset: 'nav-boss', label: 'Boss Fights' },

  { to: '/crew', asset: 'nav-crew', label: 'Crew' },

  { to: '/hospital', asset: 'hospital', label: 'Hospital' },

  { to: '/profile', asset: 'nav-profile', label: 'Profile' },

  { to: '/daily', asset: 'nav-daily', label: 'Daily Rewards' },

  { to: '/revenge', asset: 'fight-execute', label: 'Revenge List' },

];



export default function MorePage() {

  const { state } = useGame();



  return (

    <div className="space-y-4">

      <h2 className="font-display text-lg text-mob-gold">More</h2>

      <p className="text-xs text-gray-500">iMobsters menu — news, collections, scratch cards, territories, and more.</p>



      <div className="grid grid-cols-3 gap-2">

        {LINKS.map((l) => (

          <Link key={l.label} to={l.to} className="card flex flex-col items-center py-3 px-1 hover:border-mob-gold/40 transition-colors text-center min-h-[88px]">

            <img src={uiAsset(l.asset)} alt="" className="w-9 h-9 object-contain" loading="lazy" decoding="async" />

            <span className="text-[10px] mt-2 text-gray-300 leading-tight">{l.label}</span>

            {l.to === '/mail' && state?.unreadMail > 0 && (

              <span className="text-[9px] text-red-400 mt-0.5">{state.unreadMail} new</span>

            )}

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

        True Mobsters v2.5.1 · iMobsters-style by VisionIt

      </div>

    </div>

  );

}


