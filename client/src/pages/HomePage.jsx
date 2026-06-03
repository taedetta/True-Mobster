import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

export default function HomePage() {
  const { state, action } = useGame();
  if (!state) return null;

  const handleCollect = () => action('/collect-income', {}, 'Income collected!');
  const handleHeal = () => action('/heal', {}, 'Fully healed!');

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-display text-lg text-mob-gold mb-3">Empire Dashboard</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-primary text-sm" onClick={handleCollect}>Collect Property Income</button>
          <button className="btn-secondary text-sm" onClick={handleHeal} disabled={state.health >= state.max_health}>
            Hospital ({formatMoney((state.max_health - state.health) * 10)})
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Equipped Gear</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Weapon</p>
            <p className="text-mob-gold">{state.equipped_weapon?.replace(/_/g, ' ') || 'None'}</p>
          </div>
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Armor</p>
            <p className="text-mob-gold">{state.equipped_armor?.replace(/_/g, ' ') || 'None'}</p>
          </div>
          <div className="p-2 bg-mob-bg rounded-lg">
            <p className="text-gray-500">Vehicle</p>
            <p className="text-mob-gold">{state.equipped_vehicle?.replace(/_/g, ' ') || 'None'}</p>
          </div>
        </div>
      </div>

      {state.crew && (
        <div className="card">
          <h3 className="font-semibold mb-1">Crew: {state.crew.name}</h3>
          <p className="text-xs text-gray-400">{state.crewMembers?.length || 0} members · +{Math.round((state.combat?.crewBonus || 0) * 100)}% combat bonus</p>
        </div>
      )}

      <div className="card bg-gradient-to-r from-indigo-900/20 to-transparent">
        <h3 className="font-semibold text-sm mb-2">Quick Tips</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>⚡ Energy regens every 5 minutes — use it on Jobs</li>
          <li>💪 Stamina regens every 3 minutes — use it to Fight</li>
          <li>🤖 Bot rivals fight back when attacked!</li>
          <li>🎯 Place bounties on the Hitlist for bonus rewards</li>
        </ul>
      </div>
    </div>
  );
}
