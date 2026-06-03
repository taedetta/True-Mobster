import { formatMoney } from '../api';
import ItemImage from './ItemImage';



export function StatBar({ label, current, max, type = 'energy', icon }) {

  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  const fillClass = {

    energy: 'stat-fill-energy',

    stamina: 'stat-fill-stamina',

    health: 'stat-fill-health',

    xp: 'stat-fill-xp',

  }[type] || 'stat-fill-energy';



  return (

    <div className="space-y-1.5">

      <div className="flex justify-between text-xs text-gray-400 font-medium">

        <span>{icon} {label}</span>

        <span className="tabular-nums">{current}/{max}</span>

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

    <div className="card-premium mb-5 animate-fade-up">

      <div className="flex items-start justify-between mb-4">

        <div>

          <h1 className="font-display text-2xl text-mob-gold tracking-wide">{state.display_name}</h1>

          <p className="text-sm text-gray-400 mt-0.5">Level {state.level} · {state.respect.toLocaleString()} Respect</p>

        </div>

        <div className="text-right">

          <p className="text-xl font-bold text-green-400 tabular-nums">{formatMoney(state.money)}</p>

          <p className="text-xs text-gray-500 mt-0.5">Bank: {formatMoney(state.bank_balance)}</p>

          {(state.gold || 0) > 0 && <p className="text-xs text-amber-400">{state.gold} gold</p>}

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">

        <StatBar label="Energy" current={state.energy} max={state.max_energy} type="energy" icon="⚡" />

        <StatBar label="Stamina" current={state.stamina} max={state.max_stamina} type="stamina" icon="💪" />

        <StatBar label="Health" current={state.health} max={state.max_health} type="health" icon="❤️" />

        <StatBar label="XP" current={state.xp} max={state.xpNeeded} type="xp" icon="⭐" />

      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-mob-border/50 pt-3">

        <span className="px-2 py-1 rounded-lg bg-mob-bg/50">⚔ ATK {state.combat?.attack || 0}</span>

        <span className="px-2 py-1 rounded-lg bg-mob-bg/50">🛡 DEF {state.combat?.defense || 0}</span>

        <span className="px-2 py-1 rounded-lg bg-mob-bg/50">🏆 {state.wins}W / {state.losses}L</span>

        {state.skill_points > 0 && (

          <span className="text-mob-gold animate-pulse px-2 py-1 rounded-lg bg-mob-gold/10">+{state.skill_points} skill pts</span>

        )}

      </div>

      {state.in_jail_until && new Date(state.in_jail_until) > new Date() && (

        <div className="mt-3 p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-sm text-red-300 text-center">

          🔒 In jail until {new Date(state.in_jail_until).toLocaleTimeString()}

        </div>

      )}

      {state.iced_until && new Date(state.iced_until) > new Date() && (

        <div className="mt-3 p-3 bg-cyan-900/20 border border-cyan-700/50 rounded-xl text-sm text-cyan-300 text-center">

          🧊 Iced (protected) until {new Date(state.iced_until).toLocaleTimeString()}

        </div>

      )}

    </div>

  );

}



export function ItemCard({ item, owned, equipped, onBuy, onEquip, playerLevel, playerMoney }) {

  const canBuy = playerLevel >= item.minLevel && playerMoney >= item.price && !owned;

  const statLabel = item.attack ? `+${item.attack} ATK` : item.defense ? `+${item.defense} DEF` : item.income ? `$${item.income}/hr` : '';



  return (

    <div className={`group card flex flex-col items-center text-center transition-all duration-200 hover:border-mob-gold/30 hover:shadow-glow ${equipped ? 'ring-2 ring-mob-gold shadow-glow' : ''}`}>

      <div className="relative mb-3 flex items-center justify-center">
        <ItemImage src={item.thumbnail} alt={item.name} size="card" />

        {equipped && <span className="absolute -top-1 -right-1 bg-mob-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full">ON</span>}

        {item.tier > 1 && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-mob-gold">{'★'.repeat(Math.min(item.tier, 5))}</span>}

      </div>

      <h3 className="font-semibold text-sm text-gray-100 leading-tight px-1">{item.name}</h3>

      <p className="text-xs text-mob-gold mt-1 font-medium">{statLabel}</p>

      <p className="text-xs text-gray-500 mt-1">Lv.{item.minLevel}+ · {formatMoney(item.price)}</p>

      {owned ? (

        item.category !== 'property' && onEquip && (

          <button className="btn-secondary mt-3 text-xs w-full" onClick={() => onEquip(item)} disabled={equipped}>

            {equipped ? 'Equipped' : 'Equip'}

          </button>

        )

      ) : (

        <button className="btn-primary mt-3 text-xs w-full" onClick={() => onBuy(item)} disabled={!canBuy}>

          Buy

        </button>

      )}

      {owned && item.category === 'property' && (

        <span className="text-xs text-green-400 mt-2 font-medium">Owned</span>

      )}

    </div>

  );

}



export function Toast({ message }) {

  if (!message) return null;

  const colors = {

    success: 'border-green-500/60 bg-green-900/90 backdrop-blur-md',

    error: 'border-red-500/60 bg-red-900/90 backdrop-blur-md',

    info: 'border-mob-gold/60 bg-mob-card/95 backdrop-blur-md',

  };

  return (

    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl border ${colors[message.type]} shadow-card text-sm max-w-sm text-center animate-fade-up font-medium`}>

      {message.text}

    </div>

  );

}



export function LoadingScreen() {

  return (

    <div className="min-h-screen flex flex-col items-center justify-center gap-5">

      <div className="text-6xl animate-pulse drop-shadow-lg">🎩</div>

      <h2 className="font-display text-3xl text-mob-gold tracking-wider">True Mobsters</h2>

      <p className="text-gray-500 text-sm font-medium">VisionIt Studio</p>

      <div className="w-10 h-10 border-2 border-mob-gold border-t-transparent rounded-full animate-spin" />

    </div>

  );

}

