import { useGame } from '../context/GameContext';

export default function CollectionsPage() {
  const { state } = useGame();
  if (!state) return null;

  const collections = state.collections || [];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Equipment Collections</h2>
      <p className="text-xs text-gray-400">Own full sets for permanent combat bonuses.</p>

      {collections.map((col) => (
        <div key={col.id} className={`card ${col.complete ? 'border-green-700/40 bg-green-900/10' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-sm">{col.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {col.owned}/{col.total} items
                {col.bonus?.attack ? ` · +${col.bonus.attack} ATK` : ''}
                {col.bonus?.defense ? ` · +${col.bonus.defense} DEF` : ''}
              </p>
            </div>
            {col.complete && <span className="text-xs text-green-400 font-semibold">Complete</span>}
          </div>
          <div className="mt-2 w-full bg-mob-bg rounded-full h-2">
            <div className="bg-mob-gold h-2 rounded-full transition-all" style={{ width: `${(col.owned / col.total) * 100}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {col.items.map((id) => {
              const owned = state.inventory?.some((i) => i.item_id === id);
              return (
                <span key={id} className={`text-[10px] px-2 py-0.5 rounded ${owned ? 'bg-green-900/40 text-green-300' : 'bg-mob-bg text-gray-500'}`}>
                  {id.replace(/^[wav]_/, '').replace(/_/g, ' ').slice(0, 18)}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
