import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

export default function AchievementsPage() {
  const { action, gameGet } = useGame();
  const [achievements, setAchievements] = useState([]);

  const load = () => gameGet('/meta/achievements').then((d) => setAchievements(d.achievements || d || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const claim = async (achievementId) => {
    await action('/meta/achievement/claim', { achievementId }, 'Achievement claimed!');
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Achievements</h2>
      <div className="space-y-2">
        {achievements.map((a) => (
          <div key={a.id} className={`card ${a.unlocked ? 'border-green-800/40' : ''}`}>
            <div className="flex justify-between">
              <h3 className="font-semibold text-sm">{a.name}</h3>
              {a.claimed && <span className="text-xs text-green-400">Claimed</span>}
            </div>
            <p className="text-xs text-gray-400 mt-1">{a.desc || a.description}</p>
            <p className="text-xs text-mob-gold mt-1">Reward: {formatMoney(a.reward)} {a.gold ? `· ${a.gold} gold` : ''}</p>
            {a.unlocked && !a.claimed && (
              <button type="button" className="btn-primary text-xs w-full mt-2" onClick={() => claim(a.id)}>Claim</button>
            )}
            {!a.unlocked && <p className="text-xs text-gray-600 mt-1">Not yet unlocked</p>}
          </div>
        ))}
        {achievements.length === 0 && <p className="text-gray-500 text-sm text-center">Loading achievements...</p>}
      </div>
    </div>
  );
}
