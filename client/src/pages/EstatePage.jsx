import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ShopItemCard } from '../components/UI';
import { formatMoney } from '../api';
import { catalogItems } from '../utils/assets';

export default function EstatePage() {
  const { catalog, state, action } = useGame();

  if (!catalog || !state) return null;

  const properties = catalogItems(catalog, 'property');
  const inventory = state.inventory || [];
  const qtyMap = Object.fromEntries(
    inventory.filter((i) => i.category === 'property').map((i) => [i.item_id, Number(i.quantity || 1)]),
  );
  const eco = state.economy || {};

  const buy = (item, quantity) =>
    action('/buy', { itemId: item.id, category: 'property', quantity }, `Purchased ${quantity}x ${item.name}!`);
  const sell = (item, quantity) =>
    action('/shop/sell', { itemId: item.id, category: 'property', quantity }, `Sold ${quantity}x ${item.name}!`);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg text-mob-gold">Real Estate</h2>
        <p className="text-[10px] text-gray-500">Income auto-deposits every hour — no collect button</p>
      </div>

      <div className="card border-red-900/40">
        <p className="text-[10px] uppercase text-gray-500 tracking-wider">Hourly Income (automatic)</p>
        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
          <div>
            <p className="text-[10px] text-gray-600">Gross</p>
            <p className="text-green-400 font-bold">{formatMoney(eco.grossIncome || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-600">Upkeep</p>
            <p className="text-red-400 font-bold">-{formatMoney(eco.upkeep || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-600">Net/hr</p>
            <p className="text-mob-gold font-bold">{formatMoney(eco.netIncome || 0)}</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 mt-3">Next auto deposit in ~{eco.minutesToTick ?? 60} min</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {properties.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            ownedQty={qtyMap[item.id] || 0}
            playerLevel={state.level}
            playerMoney={state.money}
            onBuy={buy}
            onSell={sell}
          />
        ))}
      </div>

      <Link to="/shop?tab=weapon" className="btn-secondary w-full text-sm text-center block">Weapons & Gear →</Link>
    </div>
  );
}
