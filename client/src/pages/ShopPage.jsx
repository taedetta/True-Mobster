import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ShopItemCard } from '../components/UI';
import ItemImage from '../components/ItemImage';
import { formatMoney } from '../api';
import { catalogItems } from '../utils/assets';

const SHOP_TABS = [
  { id: 'weapon', label: 'Weapons', icon: '⚔️' },
  { id: 'armor', label: 'Armor', icon: '🛡' },
  { id: 'vehicle', label: 'Vehicles', icon: '🚗' },
  { id: 'property', label: 'Real Estate', icon: '🏢' },
  { id: 'consumable', label: 'Items', icon: '🧪' },
];

const FALLBACK_CONSUMABLES = [
  { id: 'energy_pack', name: 'Energy Pack', price: 2500, effect: 'energy', amount: 10, minLevel: 1, color: '#3b82f6' },
  { id: 'stamina_drink', name: 'Stamina Drink', price: 2000, effect: 'stamina', amount: 5, minLevel: 1, color: '#22c55e' },
  { id: 'health_kit', name: 'Health Kit', price: 1500, effect: 'health', amount: 50, minLevel: 1, color: '#ef4444' },
  { id: 'mob_contract', name: 'Mob Contract', price: 10000, effect: 'mob', amount: 5, minLevel: 10, color: '#a855f7' },
  { id: 'ice_pack', name: 'Ice Pack (4hr)', price: 15000, effect: 'ice', amount: 4, minLevel: 5, color: '#06b6d4' },
  { id: 'xp_boost', name: 'XP Boost', price: 8000, effect: 'xp_boost', amount: 2, minLevel: 8, color: '#fbbf24' },
];

export default function ShopPage() {
  const { catalog, state, action } = useGame();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'weapon';
  const [tab, setTab] = useState(initialTab);
  const [ownedTab, setOwnedTab] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && SHOP_TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  if (!catalog || !state) return null;

  const isConsumable = tab === 'consumable';
  const shopItems = isConsumable
    ? (catalog.consumables || FALLBACK_CONSUMABLES)
    : catalogItems(catalog, tab);

  const inventory = state.inventory || [];
  const qtyMap = Object.fromEntries(
    inventory.filter((i) => i.category === tab || (isConsumable && i.category === 'consumable')).map((i) => [i.item_id, Number(i.quantity || 1)]),
  );
  const ownedInCategory = inventory.filter((i) => i.category === tab || (isConsumable && i.category === 'consumable'));

  const buy = (item, quantity) =>
    action('/buy', { itemId: item.id, category: tab, quantity }, `Purchased ${quantity}x ${item.name}!`);
  const sell = (item, quantity) =>
    action('/shop/sell', { itemId: item.id, category: tab, quantity }, `Sold ${quantity}x ${item.name}!`);
  const useItem = (item) => action('/shop/use', { itemId: item.id }, `Used ${item.name}!`);

  const resolveItem = (inv) => {
    const cat = inv.category || tab;
    const list = cat === 'consumable' ? (catalog.consumables || FALLBACK_CONSUMABLES) : catalogItems(catalog, cat);
    return list.find((i) => i.id === inv.item_id) || { id: inv.item_id, name: inv.item_id.replace(/_/g, ' '), category: cat, price: 1000, minLevel: 1 };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg text-mob-gold">Equipment</h2>
          <p className="text-[10px] text-gray-500">Buy any quantity while you have cash</p>
        </div>
        <span className="text-xs text-green-400 font-bold">{formatMoney(state.money)}</span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {SHOP_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setOwnedTab(false); }}
            className={`py-2 rounded-lg text-xs text-center border ${tab === t.id && !ownedTab ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
          >
            <span className="block text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`w-full py-2 rounded-lg text-sm border ${ownedTab ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
        onClick={() => setOwnedTab(!ownedTab)}
      >
        {ownedTab ? '← Back to Shop' : `My ${SHOP_TABS.find((t) => t.id === tab)?.label || 'Items'} (${ownedInCategory.reduce((s, i) => s + Number(i.quantity || 1), 0)} owned)`}
      </button>

      {ownedTab ? (
        <div className="item-grid">
          {ownedInCategory.length === 0 && <p className="text-gray-500 text-sm text-center col-span-2">Nothing owned in this category</p>}
          {ownedInCategory.map((inv) => {
            const item = resolveItem(inv);
            const qty = Number(inv.quantity || 1);
            return (
              <div key={inv.item_id} className="space-y-2">
                <ShopItemCard
                  item={{ ...item, category: tab, thumbnail: item.thumbnail }}
                  ownedQty={qty}
                  playerLevel={state.level}
                  playerMoney={state.money}
                  onSell={sell}
                  showSell
                />
                {isConsumable && (
                  <button type="button" className="btn-primary text-xs w-full" onClick={() => useItem(item)}>Use 1</button>
                )}
              </div>
            );
          })}
        </div>
      ) : isConsumable ? (
        <div className="item-grid">
          {shopItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={{ ...item, category: 'consumable', thumbnail: item.thumbnail }}
              ownedQty={qtyMap[item.id] || 0}
              playerLevel={state.level}
              playerMoney={state.money}
              onBuy={buy}
            />
          ))}
        </div>
      ) : (
        <div className="item-grid">
          {shopItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={{ ...item, category: tab }}
              ownedQty={qtyMap[item.id] || 0}
              playerLevel={state.level}
              playerMoney={state.money}
              onBuy={buy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
