import { useState, useEffect } from 'react';

import { useGame } from '../context/GameContext';

import { formatMoney } from '../api';

import ItemImage from '../components/ItemImage';



export default function BossPage() {

  const { state, action, gameGet } = useGame();

  const [bosses, setBosses] = useState([]);

  const [busy, setBusy] = useState(null);



  useEffect(() => {

    gameGet('/meta/bosses').then((data) => setBosses(data.bosses || data || [])).catch(() => {});

  }, [state?.user_id, gameGet]);



  const fightBoss = async (bossId, name) => {

    setBusy(bossId);

    try {

      const result = await action('/meta/boss/fight', { bossId });

      if (result?.won) {

        gameGet('/meta/bosses').then((data) => setBosses(data.bosses || data || []));

      }

    } catch { /* handled */ }

    setBusy(null);

  };



  if (!state) return null;



  return (

    <div className="space-y-4">

      <h2 className="font-display text-lg text-mob-gold">Boss Fights</h2>

      <p className="text-xs text-gray-400">One win per boss per day. High-risk battles for big rewards.</p>



      <div className="space-y-3">

        {bosses.length === 0 && (

          <p className="text-gray-500 text-sm text-center py-8">Loading bosses...</p>

        )}

        {bosses.map((b) => (

          <div key={b.id} className="card" style={{ borderColor: b.color ? `${b.color}40` : undefined }}>

            <div className="flex gap-3 items-start">

              {b.thumbnail && <ItemImage src={b.thumbnail} alt={b.name} size="list" eager />}

              <div className="flex-1">

                <div className="flex justify-between items-start gap-2">

                  <div>

                    <h3 className="font-semibold text-mob-gold">{b.name}</h3>

                    <p className="text-xs text-gray-400 mt-1">Lv.{b.minLevel}+ · Tier {b.tier}</p>

                    <p className="text-xs text-red-400 mt-1">HP {b.hp} · ATK {b.attack} · DEF {b.defense}</p>

                    <p className="text-xs text-green-400 mt-1">

                      {formatMoney(b.money?.[0] || 0)}-{formatMoney(b.money?.[1] || 0)} · +{b.xp} XP · +{b.respect} resp

                    </p>

                  </div>

                  <div className="text-right text-xs text-gray-500">

                    <p>💪 {b.stamina} stamina</p>

                    {b.defeatedToday && <p className="text-green-400">Defeated today</p>}

                  </div>

                </div>

                <button

                  className="btn-danger w-full mt-3 text-sm"

                  disabled={

                    state.level < b.minLevel ||

                    state.stamina < (b.stamina || 1) ||

                    busy === b.id ||

                    b.defeatedToday

                  }

                  onClick={() => fightBoss(b.id, b.name)}

                >

                  {busy === b.id ? 'Fighting...' : state.level < b.minLevel ? `Need Lv.${b.minLevel}` : b.defeatedToday ? 'Come back tomorrow' : 'Fight Boss'}

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}


