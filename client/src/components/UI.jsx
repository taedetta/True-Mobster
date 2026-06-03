import { Link } from 'react-router-dom';
import { formatMoney } from '../api';
import ItemImage from './ItemImage';
import { useGame } from '../context/GameContext';
import { useState } from 'react';

function formatIncomeTimer(nextTickAt) {
  if (!nextTickAt) return '--:--';
  const sec = Math.max(0, Math.ceil((new Date(nextTickAt).getTime() - Date.now()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatRegenTimer(isoOrMs) {
  if (!isoOrMs) return null;
  const t = typeof isoOrMs === 'number' ? isoOrMs : new Date(isoOrMs).getTime();
  const sec = Math.max(0, Math.ceil((t - Date.now()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}



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



export function ImobstersHud({ state }) {
  if (!state) return null;
  const { action } = useGame();
  const [bailing, setBailing] = useState(false);
  const eco = state.economy || {};
  const net = eco.netIncome || 0;
  const xpPct = state.xpNeeded > 0 ? Math.min(100, (state.xp / state.xpNeeded) * 100) : 0;
  const inJail = state.in_jail_until && new Date(state.in_jail_until) > new Date();
  const bailMinutes = inJail ? Math.ceil((new Date(state.in_jail_until) - Date.now()) / 60000) : 0;
  const bailCost = bailMinutes * 50;
  const favor = state.favor_points ?? state.gold ?? 0;

  const payBail = async () => {
    setBailing(true);
    try {
      await action('/safehouse/bail', {}, `Bail paid — $${bailCost.toLocaleString()}`);
    } catch { /* */ }
    setBailing(false);
  };

  const cashflowSign = net >= 0 ? '+' : '';
  const cashflowColor = net >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="imob-hud">
      <div className="imob-hud-top">
        <div>
          <p className="imob-cash">{formatMoney(state.money)}</p>
          <p className={`imob-cashflow ${cashflowColor}`}>
            {cashflowSign}{formatMoney(Math.abs(net))} in {formatIncomeTimer(eco.nextTickAt)}
          </p>
        </div>
        <div className="imob-exp-block">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-yellow-400/90">Exp: {state.xp}/{state.xpNeeded}</span>
            <span className="imob-level">{state.level}</span>
          </div>
          <div className="imob-exp-bar mt-1">
            <div className="imob-exp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      <div className="imob-stat-row">
        <div className="imob-stat">
          <span className="imob-stat-icon text-red-400">❤</span>
          <span className="imob-stat-val">{state.health} / {state.max_health}</span>
          <span className="imob-stat-timer">{formatRegenTimer(state.regenAt?.health) || ''}</span>
        </div>
        <div className="imob-stat">
          <span className="imob-stat-icon text-blue-400">⚡</span>
          <span className="imob-stat-val">{state.energy} / {state.max_energy}</span>
          <span className="imob-stat-timer">{formatRegenTimer(state.regenAt?.energy) || ''}</span>
        </div>
        <div className="imob-stat">
          <span className="imob-stat-icon text-amber-600">🔨</span>
          <span className="imob-stat-val">{state.stamina} / {state.max_stamina}</span>
          <span className="imob-stat-timer">{formatRegenTimer(state.regenAt?.stamina) || ''}</span>
        </div>
      </div>

      {net < 0 && (
        <div className="imob-warning">
          <p className="text-red-500 font-bold text-sm">Warning!</p>
          <p className="text-xs text-gray-300 mt-1">
            You currently have a negative cashflow. If you run out of cash, your equipment with upkeep will automatically be sold until you are out of debt.
          </p>
        </div>
      )}

      {(state.unreadMail > 0) && (
        <Link to="/mail" className="block mt-2 p-2 rounded border border-red-800/50 bg-red-950/30 text-center text-xs text-red-300">
          ⚔ {state.unreadMail} unread combat mail
        </Link>
      )}

      {inJail && (
        <div className="mt-2 p-2 bg-red-950/40 border border-red-800/50 rounded text-xs text-red-300 text-center space-y-2">
          <p>🔒 In jail until {new Date(state.in_jail_until).toLocaleTimeString()}</p>
          <button type="button" className="btn-primary text-xs w-full" disabled={bailing || state.money < bailCost} onClick={payBail}>
            {bailing ? 'Paying...' : `Pay Bail $${bailCost.toLocaleString()}`}
          </button>
        </div>
      )}

      {state.iced_until && new Date(state.iced_until) > new Date() && (
        <div className="mt-2 p-2 bg-red-950/30 border border-red-800/40 rounded text-xs text-red-300 text-center">
          Ice protection until {new Date(state.iced_until).toLocaleTimeString()}
        </div>
      )}

      {favor > 0 && (
        <p className="text-[10px] text-center text-red-300/80 mt-1">{favor} Favor Points</p>
      )}
    </div>
  );
}

/** @deprecated alias */
export function PlayerHeader({ state }) {
  return <ImobstersHud state={state} />;
}



export function ShopItemCard({ item, ownedQty = 0, playerLevel, playerMoney, onBuy, onSell, showSell = false }) {
  const [qty, setQty] = useState(1);
  const unitPrice = item.price || 0;
  const maxBuy = unitPrice > 0 ? Math.floor(playerMoney / unitPrice) : 0;
  const maxQty = showSell ? ownedQty : maxBuy;
  const canBuy = playerLevel >= item.minLevel && maxBuy >= 1;
  const statLabel = item.attack ? `+${item.attack} ATK` : item.defense ? `+${item.defense} DEF` : item.income ? `$${item.income}/hr` : '';
  const upkeepLabel = item.upkeep > 0 ? `$${item.upkeep}/hr upkeep` : '';

  const setMax = () => setQty(Math.max(1, maxQty || 1));

  return (
    <div className="group card flex flex-col items-center text-center transition-all duration-200 hover:border-mob-gold/30">
      <div className="relative mb-3 flex items-center justify-center">
        <ItemImage src={item.thumbnail} alt={item.name} size="card" />
        {ownedQty > 0 && (
          <span className="absolute -top-1 -left-1 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Own {ownedQty.toLocaleString()}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-sm text-gray-100 leading-tight px-1">{item.name}</h3>
      <p className="text-xs text-mob-gold mt-1 font-medium">{statLabel}</p>
      {upkeepLabel && <p className="text-xs text-red-400">{upkeepLabel}</p>}
      <p className="text-xs text-gray-500 mt-1">Lv.{item.minLevel}+ · {formatMoney(unitPrice)} each</p>

      <div className="w-full mt-3 space-y-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={Math.max(1, maxQty || 1)}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, maxQty || 9999)))}
            className="w-full px-2 py-1.5 rounded-lg bg-mob-bg border border-mob-border text-xs text-center"
          />
          <button type="button" className="btn-secondary text-[10px] px-2 py-1.5 whitespace-nowrap" onClick={setMax}>Max</button>
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          {[1, 5, 10, 20, 50].map((n) => (
            <button key={n} type="button" className="text-[10px] px-1.5 py-0.5 rounded border border-mob-border hover:border-mob-gold/50" onClick={() => setQty(Math.min(n, maxQty || n))}>{n}</button>
          ))}
        </div>
        {showSell ? (
          <button type="button" className="btn-secondary text-xs w-full" disabled={!ownedQty} onClick={() => onSell?.(item, qty)}>
            Sell {qty} · {formatMoney(Math.floor(unitPrice * 0.5 * qty))}
          </button>
        ) : (
          <button type="button" className="btn-primary text-xs w-full" disabled={!canBuy} onClick={() => onBuy?.(item, qty)}>
            Buy {qty} · {formatMoney(unitPrice * qty)}
          </button>
        )}
      </div>
    </div>
  );
}

/** @deprecated use ShopItemCard */
export function ItemCard({ item, owned, ownedQty = 0, equipped, onBuy, onEquip, playerLevel, playerMoney, useGold = false, stackable = false }) {
  return (
    <ShopItemCard
      item={item}
      ownedQty={ownedQty || (owned ? 1 : 0)}
      playerLevel={playerLevel}
      playerMoney={playerMoney}
      onBuy={(i, q) => onBuy?.(i, q)}
    />
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

      <h2 className="font-display text-3xl text-mob-gold tracking-wider">iMobsters</h2>

      <p className="text-gray-500 text-sm font-medium">VisionIt Studio</p>

      <div className="w-10 h-10 border-2 border-mob-gold border-t-transparent rounded-full animate-spin" />

    </div>

  );

}

