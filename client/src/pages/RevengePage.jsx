import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PlayerLink from '../components/PlayerLink';

export default function RevengePage() {
  const { gameGet } = useGame();
  const [targets, setTargets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    gameGet('/revenge').then((d) => setTargets(d.players || d || [])).catch(() => {});
  }, [gameGet]);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Revenge List</h2>
      <p className="text-xs text-gray-400">Players who recently attacked you</p>

      <div className="space-y-2">
        {targets.map((t) => (
          <div key={t.user_id} className="card flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src={t.avatar_url || '/assets/avatars/default_01.svg'} alt="" className="w-10 h-10 rounded-full object-cover border border-mob-border bg-mob-bg flex-shrink-0" />
              <div className="min-w-0">
              <PlayerLink userId={t.user_id} name={t.display_name} className="font-semibold text-sm" />
              <p className="text-xs text-gray-400">Lv.{t.level} · Last attack: {t.last_attack && new Date(t.last_attack).toLocaleString()}</p>
              </div>
            </div>
            <button className="btn-danger text-xs" onClick={() => navigate('/fight', { state: { targetId: t.user_id } })}>
              Fight Back
            </button>
          </div>
        ))}
        {targets.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No one to revenge... yet.</p>}
      </div>
    </div>
  );
}
