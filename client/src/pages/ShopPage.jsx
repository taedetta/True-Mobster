import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ItemCard } from '../components/UI';
import { formatMoney } from '../api';

const SHOP_TABS = [
  { id: 'weapon', label: 'Weapons', icon: '⚔️' },
  { id: 'armor', label: 'Armor', icon: '🛡' },
  { id: 'vehicle', label: 'Vehicles', icon: '🚗' },
  { id: 'property', label: 'Properties', icon: '🏢' },
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
  const [tab, setTab] = useState('weapon');
  const [ownedTab, setOwnedTab] = useState(false);

  if (!catalog || !state) return null;

  const isConsumable = tab === 'consumable';
  const listKey = tab === 'property' ? 'properties' : tab === 'consumable' ? 'consumables' : `${tab}s`;
  const shopItems = isConsumable
    ? (catalog.consumables || FALLBACK_CONSUMABLES)
    : (catalog[listKey] || []);

  const inventory = state.inventory || [];
  const ownedIds = new Set(inventory.map((i) => i.item_id));
  const ownedInCategory = inventory.filter((i) => i.category === tab || (isConsumable && i.category === 'consumable'));

  const buy = (item) => action('/buy', { itemId: item.id, category: tab }, `Purchased ${item.name}!`);
  const equip = (item) => action('/equip', { itemId: item.id, category: tab }, `Equipped ${item.name}!`);
  const sell = (item) => action('/shop/sell', { itemId: item.id, category: tab }, `Sold ${item.name}!`);
  const useItem = (item) => action('/shop/use', { itemId: item.id }, `Used ${item.name}!`);

  const equipped = {
    weapon: state.equipped_weapon,
    armor: state.equipped_armor,
    vehicle: state.equipped_vehicle,
  };

  const resolveItem = (inv) => {
    const cat = inv.category || tab;
    const list = cat === 'property' ? catalog.properties : cat === 'consumable' ? (catalog.consumables || FALLBACK_CONSUMABLES) : catalog[`${cat}s`] || [];
    return list.find((i) => i.id === inv.item_id) || { id: inv.item_id, name: inv.item_id.replace(/_/g, ' '), category: cat };
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-1">
        {SHOP_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setOwnedTab(false); }}
            className={`py-2 rounded-lg text-xs text-center border ${tab === t.id && !ownedTab ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
          >
            <span className="block text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <button
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
            const isEquipped = !isConsumable && equipped[tab] === item.id;
            return (
              <div key={inv.item_id} className={`card flex justify-between items-center ${isEquipped ? 'ring-1 ring-mob-gold' : ''}`}>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  {isEquipped && <p className="text-xs text-mob-gold">Equipped</p>}
                  {item.effect && <p className="text-xs text-gray-400">{item.effect} +{item.amount}</p>}
                </div>
                <div className="flex gap-2">
                  {isConsumable ? (
                    <button className="btn-primary text-xs" onClick={() => useItem(item)}>Use</button>
                  ) : tab !== 'property' ? (
                    <button className="btn-secondary text-xs" onClick={() => equip(item)} disabled={isEquipped}>
                      {isEquipped ? 'On' : 'Equip'}
                    </button>
                  ) : null}
                  <button className="btn-secondary text-xs" onClick={() => sell(item)}>
                    Sell {formatMoney(Math.floor((item.price || 0) * 0.5))}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : isConsumable ? (
        <div className="space-y-2">
          {shopItems.map((item) => (
            <div key={item.id} className="card flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-gray-400">{item.effect} +{item.amount} · Lv.{item.minLevel}+</p>
                <p className="text-xs text-mob-gold">{formatMoney(item.price)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  className="btn-primary text-xs"
                  disabled={state.level < item.minLevel || state.money < item.price}
                  onClick={() => buy(item)}
                >
                  Buy
                </button>
                {ownedIds.has(item.id) && (
                  <button className="btn-secondary text-xs" onClick={() => useItem(item)}>Use</button>
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
              owned={ownedIds.has(item.id)}
              equipped={equipped[tab] === item.id}
              onBuy={buy}
              onEquip={tab !== 'property' ? equip : null}
              playerLevel={state.level}
              playerMoney={state.money}
            />
          ))}
        </div>
      )}
    </div>
  );
}
