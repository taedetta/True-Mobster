import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ItemCard } from '../components/UI';

const SHOP_TABS = [
  { id: 'weapon', label: 'Weapons', icon: '⚔️' },
  { id: 'armor', label: 'Armor', icon: '🛡' },
  { id: 'vehicle', label: 'Vehicles', icon: '🚗' },
  { id: 'property', label: 'Properties', icon: '🏢' },
];

export default function ShopPage() {
  const { catalog, state, action } = useGame();
  const [tab, setTab] = useState('weapon');

  if (!catalog || !state) return null;

  const listKey = tab === 'property' ? 'properties' : `${tab}s`;
  const shopItems = catalog[listKey] || [];

  const ownedIds = new Set(state.inventory?.map((i) => i.item_id) || []);

  const buy = (item) => action('/buy', { itemId: item.id, category: tab }, `Purchased ${item.name}!`);
  const equip = (item) => action('/equip', { itemId: item.id, category: tab }, `Equipped ${item.name}!`);

  const equipped = {
    weapon: state.equipped_weapon,
    armor: state.equipped_armor,
    vehicle: state.equipped_vehicle,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {SHOP_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-2 rounded-lg text-xs text-center border ${tab === t.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
          >
            <span className="block text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

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
    </div>
  );
}
