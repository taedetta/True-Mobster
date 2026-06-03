import { useGame } from '../context/GameContext';

export default function GoldStorePage() {
  const { state, action, catalog } = useGame();
  if (!state) return null;

  const packs = catalog?.goldStore || state.goldStore || [];

  const buy = (pack) => action('/gold/buy', { packId: pack.id }, `Purchased ${pack.name}!`);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Gold Store</h2>
      <p className="text-xs text-gray-400">
        Spend respect for gold and refills — iMobsters-style favor points shop (respect = street cred).
      </p>
      <div className="card flex justify-between items-center">
        <span className="text-sm">Your Respect</span>
        <span className="text-mob-gold font-bold">{state.respect.toLocaleString()}</span>
      </div>
      <div className="card flex justify-between items-center">
        <span className="text-sm">Your Gold</span>
        <span className="text-amber-400 font-bold">{state.gold || 0}</span>
      </div>

      <div className="space-y-2">
        {packs.map((pack) => (
          <div key={pack.id} className="card flex justify-between items-center gap-3">
            <div>
              <p className="font-semibold text-sm">{pack.icon} {pack.name}</p>
              <p className="text-xs text-gray-400">{pack.respectCost} respect</p>
            </div>
            <button
              type="button"
              className="btn-primary text-xs flex-shrink-0"
              disabled={state.respect < pack.respectCost}
              onClick={() => buy(pack)}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
