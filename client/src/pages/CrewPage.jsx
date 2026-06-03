import { useState, useEffect } from 'react';

import { useGame } from '../context/GameContext';

import { api, formatMoney } from '../api';



export default function CrewPage() {

  const { state, action } = useGame();

  const [crews, setCrews] = useState([]);

  const [name, setName] = useState('');

  const [desc, setDesc] = useState('');

  const [donateAmount, setDonateAmount] = useState('');

  useEffect(() => {
    api('/game/crews').then(setCrews);
  }, [state]);



  const create = async () => {

    await action('/crews/create', { name, description: desc }, `Crew "${name}" created!`);

    api('/game/crews').then(setCrews);

    setName('');

  };



  const join = async (crewId) => {

    await action('/crews/join', { crewId }, 'Joined crew!');

    api('/game/crews').then(setCrews);

  };



  const leave = async () => {

    await action('/crews/leave', {}, 'Left crew');

    api('/game/crews').then(setCrews);

  };



  const donate = async () => {
    await action('/crews/donate', { amount: Number(donateAmount) }, 'Donated to crew treasury!');
    setDonateAmount('');
  };

  const kick = async (memberId, memberName) => {

    if (!confirm(`Kick ${memberName} from the crew?`)) return;

    await action('/crews/kick', { memberId }, `Kicked ${memberName}`);

  };



  const transfer = async (memberId, memberName) => {

    if (!confirm(`Transfer leadership to ${memberName}?`)) return;

    await action('/crews/transfer', { memberId }, `Leadership transferred to ${memberName}`);

  };



  if (!state) return null;



  const isLeader = state.crew_role === 'leader';



  return (

    <div className="space-y-4">

      {state.crew ? (

        <div className="card">

          <h2 className="font-display text-lg text-mob-gold">{state.crew.name}</h2>

          <p className="text-sm text-gray-400 mt-1">{state.crew.description || 'No description'}</p>

          <p className="text-xs text-gray-500 mt-2">{state.crewMembers?.length} members · Role: {state.crew_role}</p>

          {(state.crew.bank_balance != null || state.crew.treasury != null) && (

            <p className="text-xs text-green-400 mt-1">Treasury: {formatMoney(state.crew.bank_balance ?? state.crew.treasury)}</p>

          )}



          <div className="mt-4 p-3 bg-mob-bg rounded-lg">

            <h3 className="font-semibold text-sm mb-2">Donate to Treasury</h3>

            <div className="flex gap-2">

              <input type="number" className="flex-1 px-3 py-2 rounded-lg bg-mob-card border border-mob-border text-sm" placeholder="Amount" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} />

              <button className="btn-primary text-xs" onClick={donate} disabled={!donateAmount || Number(donateAmount) <= 0}>Donate</button>

            </div>

          </div>

          <h3 className="font-semibold mt-4 mb-2 text-sm">Members</h3>

          <div className="space-y-1 max-h-48 overflow-y-auto">

            {state.crewMembers?.map((m) => (

              <div key={m.user_id} className="flex justify-between items-center text-xs py-2 border-b border-mob-border">

                <div>

                  <span className={(m.crew_role || m.role) === 'leader' ? 'text-mob-gold' : ''}>{m.display_name}</span>

                  {(m.crew_role || m.role) === 'leader' && <span className="text-mob-gold ml-1">👑</span>}

                  <span className="text-gray-500 block">Lv.{m.level} · {m.respect} resp</span>

                </div>

                {isLeader && m.user_id !== state.user_id && (

                  <div className="flex gap-1">

                    <button className="btn-secondary text-xs px-2" onClick={() => transfer(m.user_id, m.display_name)} title="Transfer leadership">👑</button>

                    <button className="btn-secondary text-xs px-2 text-red-400" onClick={() => kick(m.user_id, m.display_name)}>Kick</button>

                  </div>

                )}

              </div>

            ))}

          </div>

          {!isLeader && (

            <button className="btn-secondary w-full mt-3 text-sm" onClick={leave}>Leave Crew</button>

          )}

        </div>

      ) : (

        <>

          <div className="card">

            <h2 className="font-display text-lg text-mob-gold mb-3">Create Crew</h2>

            <input className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm" placeholder="Crew name" value={name} onChange={(e) => setName(e.target.value)} />

            <input className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-3 text-sm" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />

            <button className="btn-primary w-full" onClick={create} disabled={name.length < 3}>Create Crew</button>

          </div>



          <h3 className="font-semibold">Join a Crew</h3>

          <div className="space-y-2">

            {crews.map((c) => (

              <div key={c.id} className="card flex justify-between items-center">

                <div>

                  <p className="font-semibold text-sm">{c.name}</p>

                  <p className="text-xs text-gray-400">{c.member_count} members · Leader: {c.leader_name}</p>

                </div>

                <button className="btn-secondary text-xs" onClick={() => join(c.id)}>Join</button>

              </div>

            ))}

          </div>

        </>

      )}

    </div>

  );

}

