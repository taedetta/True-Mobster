import { formatMoney } from '../api';

export function StatBar({ label, current, max, type = 'energy', icon }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const fillClass = {
    energy: 'stat-fill-energy',
    stamina: 'stat-fill-stamina',
    health: 'stat-fill-health',
    xp: 'stat-fill-xp',
  }[type] || 'stat-fill-energy';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{icon} {label}</span>
        <span>{current}/{max}</span>
      </div>
      <div className="stat-bar">
        <div className={fillClass} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function PlayerHeader({ state }) {
  if (!state) return null;
  const xpPct = state.xpNeeded > 0 ? (state.xp / state.xpNeeded) * 100 : 0;

  return (
    <div className="card mb-4 bg-gradient-to-br from-mob-card to-mob-bg border-mob-gold/20">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="font-display text-xl text-mob-gold">{state.display_name}</h1>
          <p className="text-sm text-gray-400">Level {state.level} · {state.respect} Respect</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-400">{formatMoney(state.money)}</p>
          <p className="text-xs text-gray-500">Bank: {formatMoney(state.bank_balance)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatBar label="Energy" current={state.energy} max={state.max_energy} type="energy" icon="⚡" />
        <StatBar label="Stamina" current={state.stamina} max={state.max_stamina} type="stamina" icon="💪" />
        <StatBar label="Health" current={state.health} max={state.max_health} type="health" icon="❤️" />
        <StatBar label="XP" current={state.xp} max={state.xpNeeded} type="xp" icon="⭐" />
      </div>
      <div className="flex gap-4 text-xs text-gray-400 border-t border-mob-border pt-2">
        <span>⚔ ATK {state.combat?.attack || 0}</span>
        <span>🛡 DEF {state.combat?.defense || 0}</span>
        <span>🏆 {state.wins}W / {state.losses}L</span>
        {state.skill_points > 0 && (
          <span className="text-mob-gold animate-pulse">+{state.skill_points} skill pts</span>
        )}
      </div>
      {state.in_jail_until && new Date(state.in_jail_until) > new Date() && (
        <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300 text-center">
          🔒 In jail until {new Date(state.in_jail_until).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export function ItemCard({ item, owned, equipped, onBuy, onEquip, playerLevel, playerMoney }) {
  const canBuy = playerLevel >= item.minLevel && playerMoney >= item.price && !owned;
  const statLabel = item.attack ? `+${item.attack} ATK` : item.defense ? `+${item.defense} DEF` : item.income ? `$${item.income}/hr` : '';

  return (
    <div className={`card flex flex-col items-center text-center transition-all hover:border-mob-gold/30 ${equipped ? 'ring-2 ring-mob-gold' : ''}`}>
      <img src={item.thumbnail} alt={item.name} className="w-20 h-20 rounded-lg mb-2" />
      <h3 className="font-semibold text-sm text-gray-100">{item.name}</h3>
      <p className="text-xs text-mob-gold mt-0.5">{statLabel}</p>
      <p className="text-xs text-gray-500 mt-1">Lv.{item.minLevel}+ · {formatMoney(item.price)}</p>
      {owned ? (
        item.category !== 'property' && onEquip && (
          <button className="btn-secondary mt-2 text-xs w-full" onClick={() => onEquip(item)} disabled={equipped}>
            {equipped ? 'Equipped' : 'Equip'}
          </button>
        )
      ) : (
        <button className="btn-primary mt-2 text-xs w-full" onClick={() => onBuy(item)} disabled={!canBuy}>
          Buy
        </button>
      )}
      {owned && item.category === 'property' && (
        <span className="text-xs text-green-400 mt-2">Owned</span>
      )}
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  const colors = {
    success: 'border-green-500 bg-green-900/80',
    error: 'border-red-500 bg-red-900/80',
    info: 'border-mob-gold bg-mob-card',
  };
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border ${colors[message.type]} shadow-lg text-sm max-w-sm text-center animate-bounce`}>
      {message.text}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-pulse">🎩</div>
      <h2 className="font-display text-2xl text-mob-gold">True Mobsters</h2>
      <p className="text-gray-500 text-sm">VisionIt Studio</p>
      <div className="w-8 h-8 border-2 border-mob-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
