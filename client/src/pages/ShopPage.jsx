import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ItemCard } from '../components/UI';
import ItemImage from '../components/ItemImage';
import { formatMoney } from '../api';
import { catalogItems } from '../utils/assets';

const SHOP_TABS = [
  { id: 'weapon', label: 'Weapons', icon: '⚔️' },
  { id: 'armor', label: 'Armor', icon: '🛡' },
  { id: 'vehicle', label: 'Vehicles', icon: '🚗' },
  { id: 'property', label: 'Properties', icon: '🏢' },
  { id: 'consumable', label: 'Items', icon: '🧪' },
];

const FALLBACK_CONSUMABLES = [
  { id: 'energy_pack', name: 'Energy Pack', price: 2500, goldPrice: 5, effect: 'energy', amount: 10, minLevel: 1, color: '#3b82f6' },
  { id: 'stamina_drink', name: 'Stamina Drink', price: 2000, goldPrice: 4, effect: 'stamina', amount: 5, minLevel: 1, color: '#22c55e' },
  { id: 'health_kit', name: 'Health Kit', price: 1500, goldPrice: 3, effect: 'health', amount: 50, minLevel: 1, color: '#ef4444' },
  { id: 'mob_contract', name: 'Mob Contract', price: 10000, goldPrice: 15, effect: 'mob', amount: 5, minLevel: 10, color: '#a855f7' },
  { id: 'ice_pack', name: 'Ice Pack (4hr)', price: 15000, goldPrice: 10, effect: 'ice', amount: 4, minLevel: 5, color: '#06b6d4' },
  { id: 'xp_boost', name: 'XP Boost', price: 8000, goldPrice: 8, effect: 'xp_boost', amount: 2, minLevel: 8, color: '#fbbf24' },
];

export default function ShopPage() {
  const { catalog, state, action } = useGame();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'weapon';
  const [tab, setTab] = useState(initialTab);
  const [ownedTab, setOwnedTab] = useState(false);
  const [useGold, setUseGold] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && SHOP_TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  if (!catalog || !state) return null;

  const isConsumable = tab === 'consumable';
  const isProperty = tab === 'property';
  const shopItems = isConsumable
    ? (catalog.consumables || FALLBACK_CONSUMABLES)
    : catalogItems(catalog, tab);

  const inventory = state.inventory || [];
  const qtyMap = Object.fromEntries(inventory.map((i) => [i.item_id, Number(i.quantity || 1)]));
  const ownedInCategory = inventory.filter((i) => i.category === tab || (isConsumable && i.category === 'consumable'));

  const buy = (item) => action('/buy', { itemId: item.id, category: tab, useGold: useGold && !!item.goldPrice }, `Purchased ${item.name}!`);
  const equip = (item) => action('/equip', { itemId: item.id, category: tab }, `Equipped ${item.name}!`);
  const sell = (item, quantity = 1) => action('/shop/sell', { itemId: item.id, category: tab, quantity }, `Sold ${quantity}x ${item.name}!`);
  const useItem = (item) => action('/shop/use', { itemId: item.id }, `Used ${item.name}!`);

  const equipped = {
    weapon: state.equipped_weapon,
    armor: state.equipped_armor,
    vehicle: state.equipped_vehicle,
  };

  const resolveItem = (inv) => {
    const cat = inv.category || tab;
    const list = cat === 'consumable' ? (catalog.consumables || FALLBACK_CONSUMABLES) : catalogItems(catalog, cat);
    return list.find((i) => i.id === inv.item_id) || { id: inv.item_id, name: inv.item_id.replace(/_/g, ' '), category: cat, price: 1000 };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg text-mob-gold">Shop</h2>
        {(state.gold > 0 || isConsumable) && (
          <button
            type="button"
            className={`text-xs px-3 py-1.5 rounded-lg border ${useGold ? 'border-amber-400 bg-amber-400/10 text-amber-400' : 'border-mob-border text-gray-400'}`}
            onClick={() => setUseGold(!useGold)}
          >
            {useGold ? '🪙 Gold' : '💵 Cash'} · {useGold ? `${state.gold} gold` : formatMoney(state.money)}
          </button>
        )}
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
        {ownedTab ? '← Back to Shop' : `My ${SHOP_TABS.find((t) => t.id === tab)?.label || 'Items'} (${ownedInCategory.length})`}
      </button>

      {ownedTab ? (
        <div className="space-y-2">
          {ownedInCategory.length === 0 && <p className="text-gray-500 text-sm text-center">Nothing owned in this category</p>}
          {ownedInCategory.map((inv) => {
            const item = resolveItem(inv);
            const qty = Number(inv.quantity || 1);
            const isEquipped = !isConsumable && !isProperty && equipped[tab] === item.id;
            return (
              <div key={inv.item_id} className={`card flex justify-between items-center gap-2 ${isEquipped ? 'ring-1 ring-mob-gold' : ''}`}>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{item.name}{qty > 1 ? ` ×${qty}` : ''}</p>
                  {isEquipped && <p className="text-xs text-mob-gold">Equipped</p>}
                  {item.effect && <p className="text-xs text-gray-400">{item.effect} +{item.amount}</p>}
                  {isProperty && item.income && <p className="text-xs text-green-400">${item.income}/hr each</p>}
                  {item.upkeep > 0 && <p className="text-xs text-red-400">${item.upkeep}/hr upkeep</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {isConsumable ? (
                    <button type="button" className="btn-primary text-xs" onClick={() => useItem(item)}>Use</button>
                  ) : !isProperty ? (
                    <button type="button" className="btn-secondary text-xs" onClick={() => equip(item)} disabled={isEquipped}>
                      {isEquipped ? 'On' : 'Equip'}
                    </button>
                  ) : null}
                  <button type="button" className="btn-secondary text-xs" onClick={() => sell(item, 1)}>
                    Sell {formatMoney(Math.floor((item.price || 0) * 0.5))}
                  </button>
                  {qty > 1 && isProperty && (
                    <button type="button" className="btn-secondary text-xs text-red-400" onClick={() => sell(item, qty)}>
                      Sell All
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : isConsumable ? (
        <div className="space-y-2">
          {shopItems.map((item) => (
            <div key={item.id} className="card flex gap-3 items-center">
              <ItemImage src={item.thumbnail || `/assets/items/consumable_${item.id}.webp?v=2.3.0`} alt={item.name} size="list" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-gray-400">{item.effect} +{item.amount} · Lv.{item.minLevel}+</p>
                <p className="text-xs text-mob-gold">
                  {useGold && item.goldPrice ? `${item.goldPrice} gold` : formatMoney(item.price)}
                </p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  type="button"
                  className="btn-primary text-xs"
                  disabled={state.level < item.minLevel || (useGold ? (state.gold || 0) < (item.goldPrice || 999) : state.money < item.price)}
                  onClick={() => buy(item)}
                >
                  Buy
                </button>
                {(qtyMap[item.id] || 0) > 0 && (
                  <button type="button" className="btn-secondary text-xs" onClick={() => useItem(item)}>Use ({qtyMap[item.id]})</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="item-grid">
          {shopItems.map((item) => (
            <ItemCard
              key={item.id}
              item={{ ...item, category: tab }}
              owned={!isProperty && !!qtyMap[item.id]}
              ownedQty={qtyMap[item.id] || 0}
              equipped={equipped[tab] === item.id}
              onBuy={buy}
              onEquip={!isProperty ? equip : null}
              playerLevel={state.level}
              playerMoney={useGold ? (state.gold || 0) : state.money}
              useGold={useGold}
              stackable={isProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
}
