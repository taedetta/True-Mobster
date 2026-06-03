import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';

export default function CrewPage() {
  const { state, action } = useGame();
  const [crews, setCrews] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

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

  if (!state) return null;

  return (
    <div className="space-y-4">
      {state.crew ? (
        <div className="card">
          <h2 className="font-display text-lg text-mob-gold">{state.crew.name}</h2>
          <p className="text-sm text-gray-400 mt-1">{state.crew.description || 'No description'}</p>
          <p className="text-xs text-gray-500 mt-2">{state.crewMembers?.length} members · Role: {state.crew_role}</p>
          <h3 className="font-semibold mt-4 mb-2 text-sm">Members</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {state.crewMembers?.map((m) => (
              <div key={m.user_id} className="flex justify-between text-xs py-1 border-b border-mob-border">
                <span>{m.display_name}</span>
                <span className="text-gray-500">Lv.{m.level} · {m.respect} resp</span>
              </div>
            ))}
          </div>
          {state.crew_role !== 'leader' && (
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
