/** True Mobsters — VisionIt Studio — shared game definitions (server is source of truth) */

export const STUDIO = 'VisionIt';
export const GAME_NAME = 'True Mobsters';

export const REGEN = {
  energySeconds: 300,
  staminaSeconds: 180,
  healthSeconds: 600,
};

export const LEVEL_XP = (level) => Math.floor(100 * Math.pow(level, 1.85));

export const BASE_STATS = {
  maxEnergy: 10,
  maxStamina: 5,
  maxHealth: 100,
  attack: 1,
  defense: 1,
};

export const STAT_GROWTH_PER_LEVEL = {
  maxEnergy: 2,
  maxStamina: 1,
  maxHealth: 10,
};

export const SKILL_COST = 1;

export const LOCATIONS = [
  { id: 'downtown', name: 'Downtown', minLevel: 1, color: '#6366f1' },
  { id: 'industrial', name: 'Industrial District', minLevel: 5, color: '#78716c' },
  { id: 'waterfront', name: 'Waterfront', minLevel: 10, color: '#0ea5e9' },
  { id: 'uptown', name: 'Uptown', minLevel: 20, color: '#a855f7' },
  { id: 'casino_row', name: 'Casino Row', minLevel: 35, color: '#eab308' },
  { id: 'skyline', name: 'Skyline Heights', minLevel: 50, color: '#f97316' },
];

export const JOBS = [
  { id: 'pickpocket', location: 'downtown', name: 'Pickpocket Tourists', energy: 1, money: [25, 75], xp: 5, failRate: 0.05, jailMinutes: 2 },
  { id: 'mug_alley', location: 'downtown', name: 'Mug Alley Runners', energy: 2, money: [50, 120], xp: 10, failRate: 0.08, jailMinutes: 3 },
  { id: 'fence_goods', location: 'downtown', name: 'Fence Stolen Goods', energy: 3, money: [80, 180], xp: 15, failRate: 0.1, jailMinutes: 5 },
  { id: 'warehouse_heist', location: 'industrial', name: 'Warehouse Heist', energy: 4, money: [150, 350], xp: 25, failRate: 0.12, jailMinutes: 8 },
  { id: 'dock_smuggle', location: 'waterfront', name: 'Dock Smuggling', energy: 5, money: [300, 600], xp: 40, failRate: 0.15, jailMinutes: 10 },
  { id: 'nightclub_shakedown', location: 'uptown', name: 'Nightclub Shakedown', energy: 6, money: [500, 900], xp: 55, failRate: 0.18, jailMinutes: 12 },
  { id: 'casino_scam', location: 'casino_row', name: 'Casino Scam Ring', energy: 7, money: [800, 1400], xp: 75, failRate: 0.2, jailMinutes: 15 },
  { id: 'penthouse_job', location: 'skyline', name: 'Penthouse Score', energy: 8, money: [1200, 2200], xp: 100, failRate: 0.22, jailMinutes: 20 },
];

export const WEAPONS = [
  { id: 'rusty_knife', name: 'Rusty Knife', price: 500, attack: 2, minLevel: 1, tier: 1, color: '#94a3b8' },
  { id: 'baseball_bat', name: 'Baseball Bat', price: 1500, attack: 5, minLevel: 3, tier: 1, color: '#b45309' },
  { id: 'switchblade', name: 'Switchblade', price: 3500, attack: 8, minLevel: 5, tier: 2, color: '#64748b' },
  { id: 'revolver', name: 'Street Revolver', price: 8000, attack: 12, minLevel: 8, tier: 2, color: '#475569' },
  { id: 'shotgun', name: 'Sawed-Off Shotgun', price: 18000, attack: 18, minLevel: 12, tier: 3, color: '#78350f' },
  { id: 'smg', name: 'Compact SMG', price: 35000, attack: 25, minLevel: 18, tier: 3, color: '#1e293b' },
  { id: 'assault_rifle', name: 'Assault Rifle', price: 75000, attack: 35, minLevel: 25, tier: 4, color: '#14532d' },
  { id: 'sniper', name: 'Long-Range Sniper', price: 150000, attack: 48, minLevel: 35, tier: 4, color: '#312e81' },
  { id: 'golden_pistol', name: 'Golden Pistol', price: 300000, attack: 65, minLevel: 45, tier: 5, color: '#ca8a04' },
  { id: 'boss_cannon', name: 'Boss Cannon', price: 600000, attack: 90, minLevel: 60, tier: 5, color: '#7f1d1d' },
];

export const ARMOR = [
  { id: 'leather_jacket', name: 'Leather Jacket', price: 800, defense: 2, minLevel: 1, tier: 1, color: '#44403c' },
  { id: 'kevlar_vest', name: 'Kevlar Vest', price: 2500, defense: 5, minLevel: 4, tier: 1, color: '#57534e' },
  { id: 'street_helmet', name: 'Street Helmet', price: 6000, defense: 9, minLevel: 7, tier: 2, color: '#334155' },
  { id: 'tactical_vest', name: 'Tactical Vest', price: 14000, defense: 14, minLevel: 11, tier: 2, color: '#166534' },
  { id: 'riot_gear', name: 'Riot Gear', price: 30000, defense: 20, minLevel: 16, tier: 3, color: '#1e3a8a' },
  { id: 'ballistic_suit', name: 'Ballistic Suit', price: 65000, defense: 28, minLevel: 22, tier: 3, color: '#374151' },
  { id: 'elite_armor', name: 'Elite Body Armor', price: 120000, defense: 38, minLevel: 30, tier: 4, color: '#581c87' },
  { id: 'warlord_plate', name: 'Warlord Plate', price: 250000, defense: 52, minLevel: 40, tier: 4, color: '#713f12' },
  { id: 'phantom_suit', name: 'Phantom Suit', price: 450000, defense: 70, minLevel: 52, tier: 5, color: '#0f172a' },
  { id: 'empire_guard', name: 'Empire Guard Set', price: 800000, defense: 95, minLevel: 65, tier: 5, color: '#991b1b' },
];

export const VEHICLES = [
  { id: 'beaten_sedan', name: 'Beaten Sedan', price: 2000, defense: 1, minLevel: 2, tier: 1, color: '#71717a' },
  { id: 'muscle_car', name: 'Muscle Car', price: 12000, defense: 3, minLevel: 8, tier: 2, color: '#dc2626' },
  { id: 'armored_suv', name: 'Armored SUV', price: 45000, defense: 6, minLevel: 15, tier: 3, color: '#1f2937' },
  { id: 'speedboat', name: 'Speedboat', price: 90000, defense: 8, minLevel: 22, tier: 3, color: '#0284c7' },
  { id: 'limousine', name: 'Executive Limo', price: 180000, defense: 12, minLevel: 30, tier: 4, color: '#18181b' },
  { id: 'helicopter', name: 'Private Helicopter', price: 400000, defense: 18, minLevel: 42, tier: 4, color: '#0369a1' },
  { id: 'yacht', name: 'Luxury Yacht', price: 750000, defense: 25, minLevel: 55, tier: 5, color: '#f5f5f4' },
  { id: 'jet', name: 'Private Jet', price: 1500000, defense: 35, minLevel: 70, tier: 5, color: '#e2e8f0' },
];

export const PROPERTIES = [
  { id: 'corner_store', name: 'Corner Store', price: 5000, income: 50, minLevel: 3, tier: 1, color: '#84cc16' },
  { id: 'laundromat', name: 'Laundromat Front', price: 15000, income: 120, minLevel: 6, tier: 1, color: '#22d3ee' },
  { id: 'pool_hall', name: 'Pool Hall', price: 35000, income: 250, minLevel: 10, tier: 2, color: '#a3e635' },
  { id: 'nightclub', name: 'Underground Club', price: 80000, income: 500, minLevel: 15, tier: 2, color: '#c026d3' },
  { id: 'warehouse', name: 'Storage Warehouse', price: 180000, income: 900, minLevel: 22, tier: 3, color: '#78716c' },
  { id: 'casino_floor', name: 'Casino Floor', price: 400000, income: 1800, minLevel: 30, tier: 3, color: '#eab308' },
  { id: 'hotel_tower', name: 'Hotel Tower', price: 850000, income: 3500, minLevel: 40, tier: 4, color: '#6366f1' },
  { id: 'shipping_port', name: 'Shipping Port', price: 1800000, income: 7000, minLevel: 52, tier: 4, color: '#0ea5e9' },
  { id: 'skyscraper', name: 'Skyline Tower', price: 4000000, income: 14000, minLevel: 65, tier: 5, color: '#f97316' },
  { id: 'empire_hq', name: 'Empire Headquarters', price: 10000000, income: 35000, minLevel: 80, tier: 5, color: '#ef4444' },
];

export const HOSPITAL_COST_PER_HP = 10;
export const BANK_FEE_PERCENT = 0;
export const HITLIST_MIN_BOUNTY = 1000;
export const HITLIST_FEE_PERCENT = 0.1;
export const FIGHT_STAMINA_COST = 1;
export const FIGHT_XP_WIN = 15;
export const FIGHT_XP_LOSE = 5;
export const FIGHT_MONEY_WIN = [100, 500];
export const FIGHT_RESPECT_WIN = 2;
export const HITLIST_BONUS_MULTIPLIER = 1.5;
export const CREW_MAX_MEMBERS = 50;
export const CREW_BONUS_PER_MEMBER = 0.02;
export const CREW_MAX_BONUS = 0.5;

export const BOT_NAMES = [
  'ShadowViper', 'IronFist', 'NightCrawler', 'CrimsonKing', 'GhostRunner',
  'SteelWolf', 'BlackLotus', 'ViperStrike', 'DarkMercury', 'RogueHammer',
  'SilentBlade', 'CopperFang', 'NeonReaper', 'StormBreaker', 'ObsidianJack',
  'RapidCobra', 'GrimLedger', 'ChromeBoss', 'ZeroMerc', 'VaultHunter',
];

export const ALL_ITEMS = [
  ...WEAPONS.map((i) => ({ ...i, category: 'weapon' })),
  ...ARMOR.map((i) => ({ ...i, category: 'armor' })),
  ...VEHICLES.map((i) => ({ ...i, category: 'vehicle' })),
  ...PROPERTIES.map((i) => ({ ...i, category: 'property' })),
];

export function getItemById(id) {
  return ALL_ITEMS.find((i) => i.id === id) || JOBS.find((j) => j.id === id) || LOCATIONS.find((l) => l.id === id);
}

export function itemThumbnailPath(category, id) {
  return `/assets/items/${category}_${id}.svg`;
}
