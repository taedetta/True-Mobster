import ItemImage from './ItemImage';
import { formatMoney } from '../api';

function GearSection({ title, icon, items, lostItems = [] }) {
  if (!items?.length) return null;
  const lostMap = Object.fromEntries((lostItems || []).map((i) => [i.id, i.qtyLost]));
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{icon} {title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 bg-mob-bg/50 rounded-lg p-1.5">
            <ItemImage src={item.thumbnail} alt={item.name} size="list" eager />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs truncate">{item.name}</p>
              <p className="text-[10px] text-gray-500">Used ×{item.qtyUsed} · +{item.stat} pts</p>
            </div>
            {lostMap[item.id] > 0 && (
              <span className="text-[10px] text-red-400 font-bold flex-shrink-0">-{lostMap[item.id]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SideReport({ side, label, highlight }) {
  if (!side) return null;
  return (
    <div className={`rounded-xl border p-3 space-y-2 ${highlight ? 'border-mob-gold/40 bg-mob-gold/5' : 'border-mob-border bg-mob-bg/30'}`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold text-sm text-mob-gold">{label}</p>
          <p className="text-[10px] text-gray-500">Lv.{side.level} · Mob used {side.usableMob}/{side.effectiveMob}</p>
        </div>
        <div className="text-right text-[10px]">
          <p className="text-red-400">⚔ {side.attack}</p>
          <p className="text-blue-400">🛡 {side.defense}</p>
        </div>
      </div>
      <GearSection title="Weapons" icon="⚔️" items={side.weapons} lostItems={side.itemsLost?.filter((i) => i.category === 'weapon')} />
      <GearSection title="Armor" icon="🛡" items={side.armor} lostItems={side.itemsLost?.filter((i) => i.category === 'armor')} />
      <GearSection title="Vehicles" icon="🚗" items={side.vehicles} lostItems={side.itemsLost?.filter((i) => i.category === 'vehicle')} />
      {side.itemsLost?.length > 0 && (
        <p className="text-[10px] text-red-400 border-t border-red-900/30 pt-2">
          Lost: {side.itemsLost.map((i) => `${i.qtyLost}× ${i.name}`).join(', ')}
        </p>
      )}
    </div>
  );
}

export default function FightResultModal({ report, perspective = 'attacker', opponentName, onClose }) {
  if (!report) return null;

  const won = perspective === 'attacker' ? report.attackerWon : !report.attackerWon;
  const typeLabel = report.fightType?.charAt(0).toUpperCase() + report.fightType?.slice(1) || 'Fight';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto card-premium rounded-t-2xl sm:rounded-2xl border-mob-gold/30">
        <div className="sticky top-0 bg-mob-card/95 backdrop-blur border-b border-mob-border/50 p-4 flex justify-between items-start gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Fight Result</p>
            <h2 className={`font-display text-xl ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? 'Victory' : 'Defeat'} — {typeLabel}
            </h2>
            {opponentName && <p className="text-xs text-gray-400 mt-1">vs {opponentName}</p>}
          </div>
          <button type="button" className="text-gray-500 hover:text-white text-xl leading-none px-2" onClick={onClose}>×</button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {report.moneyStolen > 0 && perspective === 'attacker' && report.attackerWon && (
              <div className="col-span-2 p-2 rounded-lg bg-green-900/20 text-green-400 text-center font-bold">
                Stole {formatMoney(report.moneyStolen)}
              </div>
            )}
            {report.moneyStolen > 0 && perspective === 'defender' && report.attackerWon && (
              <div className="col-span-2 p-2 rounded-lg bg-red-900/20 text-red-400 text-center font-bold">
                Lost {formatMoney(report.moneyStolen)}
              </div>
            )}
            {report.respectGained > 0 && report.attackerWon && perspective === 'attacker' && (
              <div className="p-2 rounded-lg bg-mob-bg text-mob-gold text-center">+{report.respectGained} Respect</div>
            )}
            {report.killed && (
              <div className="p-2 rounded-lg bg-red-950 text-red-300 text-center col-span-2">☠ Execution kill</div>
            )}
            <div className="p-2 rounded-lg bg-mob-bg text-gray-400 text-center col-span-2">
              Win chance was {report.winChance}%
            </div>
          </div>

          <SideReport side={report.attacker} label={report.attacker?.name || 'Attacker'} highlight={perspective === 'attacker'} />
          <SideReport side={report.defender} label={report.defender?.name || 'Defender'} highlight={perspective === 'defender'} />

          <button type="button" className="btn-primary w-full text-sm" onClick={onClose}>Continue</button>
        </div>
      </div>
    </div>
  );
}
