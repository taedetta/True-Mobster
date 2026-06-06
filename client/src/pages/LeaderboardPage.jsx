import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api('/game/leaderboard').then(setRows).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Leaderboard</h2>
      <p className="text-xs text-gray-400">Top players by respect</p>
      <div className="space-y-2">
        {rows.map((p, i) => (
          <Link key={p.user_id} to={`/player/${p.user_id}`} className="card flex items-center gap-3 hover:border-mob-gold/30">
            <span className={`w-8 text-center font-bold ${i < 3 ? 'text-mob-gold' : 'text-gray-500'}`}>#{i + 1}</span>
            <img src={p.avatar_url || '/assets/avatars/default_01.svg'} alt="" className="w-10 h-10 rounded-full object-cover border border-mob-border bg-mob-bg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{p.display_name}</p>
              <p className="text-xs text-gray-400">Lv.{p.level} · {p.respect?.toLocaleString()} respect · {p.wins}W/{p.losses}L</p>
            </div>
          </Link>
        ))}
        {rows.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No rankings yet</p>}
      </div>
    </div>
  );
}
