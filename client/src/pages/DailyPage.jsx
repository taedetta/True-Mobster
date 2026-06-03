import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

export default function DailyPage() {
  const { state, action, gameGet } = useGame();
  const [daily, setDaily] = useState(null);
  const [missions, setMissions] = useState([]);

  const load = () => {
    gameGet('/meta/daily').then(setDaily).catch(() => {});
    gameGet('/meta/missions').then((data) => setMissions(data.missions || data || [])).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [state, gameGet]);

  const claimDaily = async () => {
    await action('/meta/daily/claim', {}, 'Daily reward claimed!');
    load();
  };

  const claimMission = async (missionId) => {
    await action('/meta/mission/claim', { missionId }, 'Mission reward claimed!');
    load();
  };

  if (!state) return null;

  return (
    <div className="space-y-4">
      <div className="card border-mob-gold/30">
        <h2 className="font-display text-lg text-mob-gold mb-2">Daily Login</h2>
        {daily ? (
          <>
            <p className="text-sm text-gray-300">Streak: <span className="text-mob-gold font-bold">{daily.streak || daily.daily_streak || 0}</span> days</p>
            {daily.todayReward && (
              <p className="text-xs text-gray-400 mt-2">
                Today: {formatMoney(daily.todayReward.money || 0)}
                {daily.todayReward.gold ? ` · ${daily.todayReward.gold} gold` : ''}
                {daily.todayReward.energy ? ` · +${daily.todayReward.energy} energy` : ''}
              </p>
            )}
            <button
              className="btn-primary w-full mt-3"
              onClick={claimDaily}
              disabled={daily.claimed || !daily.canClaim}
            >
              {daily.claimed ? 'Already Claimed' : 'Claim Daily Reward'}
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-mob-gold mb-3">Daily Missions</h3>
        <div className="space-y-2">
          {missions.map((m) => {
            const progress = m.progress ?? 0;
            const target = m.target ?? 1;
            const pct = Math.min(100, (progress / target) * 100);
            const complete = progress >= target;
            return (
              <div key={m.id} className="p-3 bg-mob-bg rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="text-gray-500">{progress}/{target}</span>
                </div>
                <div className="stat-bar mt-2">
                  <div className="stat-fill-xp" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Reward: {formatMoney(m.reward)} {m.gold ? `· ${m.gold} gold` : ''}
                </p>
                {complete && !m.claimed && (
                  <button className="btn-primary text-xs w-full mt-2" onClick={() => claimMission(m.id)}>
                    Claim
                  </button>
                )}
                {m.claimed && <p className="text-xs text-green-400 mt-1">Claimed</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
