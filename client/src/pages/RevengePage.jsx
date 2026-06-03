import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

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
          <div key={t.user_id} className="card flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{t.display_name}</p>
              <p className="text-xs text-gray-400">Lv.{t.level} · Last attack: {t.last_attack && new Date(t.last_attack).toLocaleString()}</p>
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
