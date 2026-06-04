import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import ItemImage from '../components/ItemImage';

function formatCountdown(iso) {
  if (!iso) return '';
  const sec = Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${sec % 60}s`;
}

export default function BossPage() {
  const { state, action, gameGet } = useGame();
  const [bosses, setBosses] = useState([]);
  const [busy, setBusy] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    gameGet('/meta/bosses').then((data) => setBosses(data.bosses || data || [])).catch(() => {});
  }, [state?.user_id, gameGet]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fightBoss = async (bossId) => {
    setBusy(bossId);
    try {
      await action('/meta/boss/fight', { bossId });
      gameGet('/meta/bosses').then((data) => setBosses(data.bosses || data || []));
    } catch { /* handled */ }
    setBusy(null);
  };

  if (!state) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Boss Fights</h2>
      <p className="text-xs text-gray-400">Attack bosses with stamina until their HP hits zero.</p>

      <div className="space-y-3">
        {bosses.map((b) => {
          const prog = b.progress;
          const hpPct = prog ? Math.round((prog.currentHp / prog.maxHp) * 100) : 100;
          return (
            <div key={b.id} className="card border-red-900/40">
              <div className="flex gap-3 items-start">
                {b.thumbnail && <ItemImage src={b.thumbnail} alt={b.name} size="list" eager />}
                <div className="flex-1">
                  <h3 className="font-semibold text-mob-gold">{b.name}</h3>
                  <p className="text-xs text-gray-400">Lv.{b.minLevel}+ · Mastery {b.masteryKills || 0}/{10}</p>
                  {inFight(prog) && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>HP {prog.currentHp}/{prog.maxHp}</span>
                        <span>⏱ {formatCountdown(prog.expiresAt)}</span>
                      </div>
                      <div className="stat-bar h-2">
                        <div className="stat-fill-health h-2" style={{ width: `${hpPct}%` }} />
                      </div>
                    </div>
                  )}
                  {!prog && !b.defeatedToday && (
                    <p className="text-xs text-red-400 mt-2">HP {b.hp} · 💪 {b.stamina} per attack</p>
                  )}
                  {b.defeatedToday && <p className="text-xs text-green-500 mt-2">Defeated today</p>}
                  {!b.defeatedToday && (
                    <button
                      type="button"
                      className="btn-danger w-full mt-3 text-sm"
                      disabled={state.level < b.minLevel || state.stamina < (b.stamina || 1) || busy === b.id}
                      onClick={() => fightBoss(b.id)}
                    >
                      {busy === b.id ? 'Attacking...' : `Attack Boss (${b.stamina} stamina)`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function inFight(prog) {
  return prog && new Date(prog.expiresAt).getTime() > Date.now();
}
