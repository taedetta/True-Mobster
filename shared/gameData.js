/** True Mobsters — VisionIt Studio — complete game definitions */

export const STUDIO = 'VisionIt';
export const GAME_NAME = 'True Mobsters';

export const REGEN = { energySeconds: 300, staminaSeconds: 180, healthSeconds: 600 };
export const LEVEL_XP = (level) => Math.floor(100 * Math.pow(level, 1.85));
export const BASE_STATS = { maxEnergy: 10, maxStamina: 5, maxHealth: 100, attack: 1, defense: 1 };
export const STAT_GROWTH_PER_LEVEL = { maxEnergy: 2, maxStamina: 1, maxHealth: 10 };

export const HOSPITAL_COST_PER_HP = 10;
/** iMobsters-style passive economy tick (minutes) */
export const ECONOMY_TICK_MINUTES = 60;
export const ECONOMY_TICK_MS = ECONOMY_TICK_MINUTES * 60 * 1000;
export const BANK_FEE_PERCENT = 0;
export const HITLIST_MIN_BOUNTY = 1000;
export const HITLIST_FEE_PERCENT = 0.1;
export const HITLIST_BONUS_MULTIPLIER = 1.5;
export const CREW_MAX_MEMBERS = 50;
export const CREW_BONUS_PER_MEMBER = 0.02;
export const CREW_MAX_BONUS = 0.5;
export const MOB_BONUS_PER_MEMBER = 0.015;
export const MOB_MAX_BONUS = 0.45;
export const MOB_RECRUIT_COST = (size) => Math.floor(500 * Math.pow(1.35, size));
export const MOB_MAX_SIZE = 500;
/** iMobsters: max mob usable in fight = 5 × level */
export const MOB_USABLE_PER_LEVEL = 5;
/** Each mob ally code adds +1 to mob size (not their full mob) */
export const MOB_ALLY_CONTRIBUTION = 1;
export const ICE_COST_PER_HOUR = 5000;
export const ICE_MAX_HOURS = 24;
export const BAIL_COST_PER_MINUTE = 50;
export const SELL_BACK_RATIO = 0.5;
export const SCRATCH_CARD_COST = 1000;
export const GOLD_JOB_CHANCE = 0.02;
export const FAVOR_JOB_CHANCE = GOLD_JOB_CHANCE;
export const DAILY_GIFTS_MAX = 10;
export const REFERRAL_BONUS = 5000;

export const FIGHT_TYPES = {
  slap: { stamina: 1, xpWin: 8, xpLose: 3, money: [25, 100], respect: 1, damage: [5, 15], label: 'Slap' },
  fight: { stamina: 1, xpWin: 15, xpLose: 5, money: [100, 500], respect: 2, damage: [10, 30], label: 'Fight' },
  execute: { stamina: 2, xpWin: 30, xpLose: 8, money: [300, 1200], respect: 5, damage: [25, 50], killChance: 0.15, label: 'Execute' },
};

/** iMobsters-style gear loss on fight defeat (% of gear used in that fight) */
export const FIGHT_GEAR_LOSS_RATE = { slap: 0.05, fight: 0.1, execute: 0.2 };

export const LOCATIONS = [
  { id: 'downtown', name: 'Downtown', minLevel: 1, color: '#6366f1', city: 'Metro City' },
  { id: 'industrial', name: 'Industrial District', minLevel: 5, color: '#78716c', city: 'Metro City' },
  { id: 'waterfront', name: 'Waterfront', minLevel: 10, color: '#0ea5e9', city: 'Metro City' },
  { id: 'uptown', name: 'Uptown', minLevel: 20, color: '#a855f7', city: 'Metro City' },
  { id: 'casino_row', name: 'Casino Row', minLevel: 35, color: '#eab308', city: 'Metro City' },
  { id: 'skyline', name: 'Skyline Heights', minLevel: 50, color: '#f97316', city: 'Metro City' },
  { id: 'harbor', name: 'Harbor District', minLevel: 15, color: '#0891b2', city: 'Port Haven' },
  { id: 'old_town', name: 'Old Town', minLevel: 25, color: '#a16207', city: 'Port Haven' },
  { id: 'financial', name: 'Financial Quarter', minLevel: 40, color: '#059669', city: 'Port Haven' },
  { id: 'red_light', name: 'Red Light Zone', minLevel: 55, color: '#be123c', city: 'Sin City' },
  { id: 'desert_outpost', name: 'Desert Outpost', minLevel: 65, color: '#d97706', city: 'Sin City' },
  { id: 'volcano', name: 'Volcano Ridge', minLevel: 80, color: '#dc2626', city: 'Sin City' },
];

const JOB_TEMPLATES = [
  ['pickpocket', 'Pickpocket Tourists', 1, [25, 75], 5, 0.05, 2],
  ['mug_runners', 'Mug Alley Runners', 2, [50, 120], 10, 0.08, 3],
  ['fence_goods', 'Fence Stolen Goods', 3, [80, 180], 15, 0.1, 5],
  ['extortion', 'Corner Extortion', 3, [100, 200], 18, 0.09, 4],
  ['warehouse', 'Warehouse Heist', 4, [150, 350], 25, 0.12, 8],
  ['truck_jack', 'Truck Jacking', 4, [180, 400], 28, 0.13, 9],
  ['dock_smuggle', 'Dock Smuggling', 5, [300, 600], 40, 0.15, 10],
  ['counterfeit', 'Counterfeit Ring', 5, [350, 700], 45, 0.14, 11],
  ['nightclub', 'Nightclub Shakedown', 6, [500, 900], 55, 0.18, 12],
  ['insider_trade', 'Insider Trading', 6, [550, 950], 58, 0.16, 10],
  ['casino_scam', 'Casino Scam Ring', 7, [800, 1400], 75, 0.2, 15],
  ['art_heist', 'Art Gallery Heist', 7, [900, 1600], 80, 0.19, 14],
  ['penthouse', 'Penthouse Score', 8, [1200, 2200], 100, 0.22, 20],
  ['bank_job', 'Bank Job', 8, [1500, 2800], 110, 0.24, 22],
  ['arms_deal', 'Arms Deal', 9, [2000, 3500], 130, 0.25, 25],
  ['hostile_takeover', 'Hostile Takeover', 9, [2500, 4200], 140, 0.26, 28],
  ['diamond_run', 'Diamond Run', 10, [3500, 6000], 170, 0.28, 30],
  ['syndicate_hit', 'Syndicate Hit', 10, [4000, 7000], 190, 0.3, 35],
];

export const JOBS = LOCATIONS.flatMap((loc, li) =>
  JOB_TEMPLATES.slice(0, 3 + Math.min(li, 6)).map(([slug, name, energy, money, xp, failRate, jailMinutes], ji) => ({
    id: `${loc.id}_${slug}`,
    artSlug: slug,
    location: loc.id,
    name: `${name} (${loc.name})`,
    energy,
    money,
    xp: xp + li * 2,
    failRate: Math.min(0.35, failRate + li * 0.01),
    jailMinutes,
  })),
);

function tieredItems(category, names, statKey, baseStat, basePrice, colors, { baseUpkeep = 0 } = {}) {
  return names.map((name, i) => ({
    id: `${category}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name,
    price: Math.floor(basePrice * Math.pow(1.75, i)),
    [statKey]: Math.floor(baseStat * (1 + i * 0.55)),
    minLevel: 1 + i * 4,
    tier: Math.min(5, 1 + Math.floor(i / 4)),
    color: colors[i % colors.length],
    upkeep: baseUpkeep ? Math.floor(baseUpkeep * Math.pow(1.35, i)) : 0,
  }));
}

export const WEAPONS = tieredItems('w', [
  'Rusty Knife', 'Baseball Bat', 'Switchblade', 'Brass Knuckles', 'Street Revolver',
  'Sawed-Off Shotgun', 'Compact SMG', 'Tactical Rifle', 'Assault Rifle', 'Combat Shotgun',
  'Long-Range Sniper', 'Dual Pistols', 'Golden Pistol', 'Plasma Cutter', 'Boss Cannon',
  'War Hammer', 'Shadow Blade', 'Empire Destroyer', 'Annihilator', 'Godfather Special',
], 'attack', 2, 500, ['#94a3b8', '#b45309', '#64748b', '#78716c', '#475569', '#78350f', '#1e293b', '#14532d', '#166534', '#312e81', '#581c87', '#ca8a04', '#eab308', '#7f1d1d', '#450a0a', '#44403c', '#0f172a', '#991b1b', '#701a75', '#fbbf24'], { baseUpkeep: 4 });

export const ARMOR = tieredItems('a', [
  'Leather Jacket', 'Kevlar Vest', 'Street Helmet', 'Tactical Vest', 'Riot Gear',
  'Ballistic Suit', 'Elite Body Armor', 'Warlord Plate', 'Phantom Suit', 'Empire Guard',
  'Dragon Scale', 'Titan Plate', 'Shadow Cloak', 'Invincible Mesh', 'Emperor Mantle',
  'Fortress Shell', 'Aegis Suit', 'Void Armor', 'Immortal Guard', 'Legend Plate',
], 'defense', 2, 800, ['#44403c', '#57534e', '#334155', '#166534', '#1e3a8a', '#374151', '#581c87', '#713f12', '#0f172a', '#991b1b', '#7c2d12', '#1e40af', '#312e81', '#134e4a', '#854d0e', '#44403c', '#0369a1', '#4c1d95', '#881337', '#fbbf24'], { baseUpkeep: 6 });

export const VEHICLES = tieredItems('v', [
  'Beaten Sedan', 'Muscle Car', 'Armored SUV', 'Speedboat', 'Executive Limo',
  'Private Helicopter', 'Luxury Yacht', 'Private Jet', 'Tank Limo', 'Stealth Bike',
  'War Rig', 'Submarine', 'Orbital Shuttle', 'Mobile Fortress', 'Ghost Train',
], 'defense', 1, 2000, ['#71717a', '#dc2626', '#1f2937', '#0284c7', '#18181b', '#0369a1', '#f5f5f4', '#e2e8f0', '#422006', '#09090b', '#7f1d1d', '#164e63', '#6366f1', '#374151', '#78350f'], { baseUpkeep: 20 });

export const PROPERTIES = tieredItems('p', [
  'Corner Store', 'Laundromat Front', 'Pool Hall', 'Underground Club', 'Storage Warehouse',
  'Casino Floor', 'Hotel Tower', 'Shipping Port', 'Skyline Tower', 'Empire HQ',
  'Oil Refinery', 'Media Conglomerate', 'Private Island', 'Satellite Network', 'World Bank Share',
], 'income', 50, 5000, ['#84cc16', '#22d3ee', '#a3e635', '#c026d3', '#78716c', '#eab308', '#6366f1', '#0ea5e9', '#f97316', '#ef4444', '#854d0e', '#a855f7', '#06b6d4', '#8b5cf6', '#fbbf24']).map((p, i) => ({ ...p, income: p.income }));

export const CONSUMABLES = [
  { id: 'energy_pack', name: 'Energy Pack', price: 2500, goldPrice: 5, effect: 'energy', amount: 10, minLevel: 1, tier: 1, color: '#3b82f6' },
  { id: 'stamina_drink', name: 'Stamina Drink', price: 2000, goldPrice: 4, effect: 'stamina', amount: 5, minLevel: 1, tier: 1, color: '#22c55e' },
  { id: 'health_kit', name: 'Health Kit', price: 1500, goldPrice: 3, effect: 'health', amount: 50, minLevel: 1, tier: 1, color: '#ef4444' },
  { id: 'mob_contract', name: 'Mob Contract', price: 10000, goldPrice: 15, effect: 'mob', amount: 5, minLevel: 10, tier: 2, color: '#a855f7' },
  { id: 'ice_pack', name: 'Ice Pack (4hr)', price: 15000, goldPrice: 10, effect: 'ice', amount: 4, minLevel: 5, tier: 2, color: '#06b6d4' },
  { id: 'xp_boost', name: 'XP Boost', price: 8000, goldPrice: 8, effect: 'xp_boost', amount: 2, minLevel: 8, tier: 2, color: '#fbbf24' },
];

export const BOSSES = [
  { id: 'street_boss', name: 'Street Boss Vinnie', minLevel: 5, hp: 500, attack: 15, defense: 10, money: [2000, 5000], xp: 100, respect: 10, stamina: 2, tier: 1, color: '#78716c' },
  { id: 'district_chief', name: 'District Chief Morales', minLevel: 15, hp: 1500, attack: 35, defense: 25, money: [8000, 15000], xp: 250, respect: 25, stamina: 3, tier: 2, color: '#6366f1' },
  { id: 'crime_lord', name: 'Crime Lord Santoro', minLevel: 30, hp: 4000, attack: 70, defense: 50, money: [25000, 50000], xp: 500, respect: 50, stamina: 4, tier: 3, color: '#dc2626' },
  { id: 'syndicate_head', name: 'Syndicate Head Kane', minLevel: 50, hp: 10000, attack: 120, defense: 90, money: [75000, 150000], xp: 1000, respect: 100, stamina: 5, tier: 4, color: '#7c3aed' },
  { id: 'godfather', name: 'The Godfather', minLevel: 75, hp: 25000, attack: 200, defense: 150, money: [200000, 500000], xp: 2500, respect: 250, stamina: 6, tier: 5, color: '#fbbf24' },
];

export const ACHIEVEMENTS = [
  { id: 'first_job', name: 'First Score', desc: 'Complete your first job', reward: 500, gold: 1, check: (p) => p.jobs_done >= 1 },
  { id: 'first_fight', name: 'Blood In', desc: 'Win your first fight', reward: 1000, gold: 2, check: (p) => p.wins >= 1 },
  { id: 'level_10', name: 'Rising Star', desc: 'Reach level 10', reward: 5000, gold: 5, check: (p) => p.level >= 10 },
  { id: 'level_25', name: 'Made Man', desc: 'Reach level 25', reward: 15000, gold: 10, check: (p) => p.level >= 25 },
  { id: 'level_50', name: 'Capo', desc: 'Reach level 50', reward: 50000, gold: 25, check: (p) => p.level >= 50 },
  { id: 'level_100', name: 'Don', desc: 'Reach level 100', reward: 200000, gold: 100, check: (p) => p.level >= 100 },
  { id: 'mob_50', name: 'Small Army', desc: 'Recruit 50 mob members', reward: 10000, gold: 5, check: (p) => p.mob_size >= 50 },
  { id: 'mob_200', name: 'Mob Boss', desc: 'Recruit 200 mob members', reward: 50000, gold: 20, check: (p) => p.mob_size >= 200 },
  { id: 'wins_100', name: 'Enforcer', desc: 'Win 100 fights', reward: 25000, gold: 15, check: (p) => p.wins >= 100 },
  { id: 'kills_10', name: 'Executioner', desc: 'Get 10 kills', reward: 20000, gold: 10, check: (p) => p.kills >= 10 },
  { id: 'property_5', name: 'Landlord', desc: 'Own 5 properties', reward: 30000, gold: 10, check: (p) => (p.propertyCount || 0) >= 5 },
  { id: 'crew_leader', name: 'Family Head', desc: 'Lead a crew', reward: 15000, gold: 8, check: (p) => p.crew_role === 'leader' },
  { id: 'respect_1000', name: 'Respected', desc: 'Earn 1000 respect', reward: 50000, gold: 20, check: (p) => p.respect >= 1000 },
  { id: 'daily_7', name: 'Dedicated', desc: '7-day login streak', reward: 10000, gold: 7, check: (p) => p.daily_streak >= 7 },
  { id: 'daily_30', name: 'Loyal Soldier', desc: '30-day login streak', reward: 100000, gold: 30, check: (p) => p.daily_streak >= 30 },
  { id: 'boss_1', name: 'Boss Slayer', desc: 'Defeat your first boss', reward: 20000, gold: 15, check: (p) => (p.bossKills || 0) >= 1 },
  { id: 'referral_5', name: 'Recruiter', desc: 'Refer 5 players', reward: 50000, gold: 25, check: (p) => (p.referralCount || 0) >= 5 },
  { id: 'bank_100k', name: 'Money Bags', desc: 'Have $100k in bank', reward: 25000, gold: 10, check: (p) => p.bank_balance >= 100000 },
  { id: 'hitlist_5', name: 'Contract Killer', desc: 'Claim 5 hitlist bounties', reward: 30000, gold: 15, check: (p) => (p.bountiesClaimed || 0) >= 5 },
  { id: 'scratch_jackpot', name: 'Lucky Break', desc: 'Win scratch card jackpot', reward: 50000, gold: 20, check: (p) => p.scratchJackpot },
];

export const DAILY_LOGIN_REWARDS = [
  { day: 1, money: 500, gold: 1, energy: 5 },
  { day: 2, money: 750, gold: 1, energy: 5 },
  { day: 3, money: 1000, gold: 2, stamina: 3 },
  { day: 4, money: 1500, gold: 2, energy: 8 },
  { day: 5, money: 2500, gold: 3, stamina: 5 },
  { day: 6, money: 3500, gold: 3, energy: 10 },
  { day: 7, money: 10000, gold: 10, energy: 15, stamina: 10 },
];

export const DAILY_MISSIONS = [
  { id: 'jobs_5', name: 'Complete 5 Jobs', type: 'jobs', target: 5, reward: 3000, gold: 2, xp: 50 },
  { id: 'fights_3', name: 'Win 3 Fights', type: 'wins', target: 3, reward: 5000, gold: 3, xp: 75 },
  { id: 'spend_10k', name: 'Spend $10,000', type: 'spent', target: 10000, reward: 4000, gold: 2, xp: 40 },
  { id: 'recruit_mob', name: 'Recruit 10 Mob', type: 'mob_recruited', target: 10, reward: 2500, gold: 2, xp: 30 },
  { id: 'boss_1', name: 'Fight a Boss', type: 'boss_fights', target: 1, reward: 8000, gold: 5, xp: 100 },
];

export const SCRATCH_PRIZES = [
  { weight: 40, money: [100, 500], label: 'Small Cash' },
  { weight: 25, money: [500, 2000], label: 'Medium Cash' },
  { weight: 15, money: [2000, 5000], label: 'Big Cash' },
  { weight: 10, energy: 5, label: 'Energy Boost' },
  { weight: 5, gold: 3, label: 'Gold Bars' },
  { weight: 4, money: [10000, 25000], label: 'Jackpot', jackpot: true },
  { weight: 1, gold: 25, label: 'MEGA Jackpot', jackpot: true },
];

export const TERRITORIES = [
  { id: 'downtown_block', name: 'Downtown Block', bonus: 0.05, minCrewLevel: 5, color: '#6366f1' },
  { id: 'industrial_yard', name: 'Industrial Yard', bonus: 0.08, minCrewLevel: 10, color: '#78716c' },
  { id: 'waterfront_docks', name: 'Waterfront Docks', bonus: 0.1, minCrewLevel: 15, color: '#0ea5e9' },
  { id: 'casino_strip', name: 'Casino Strip', bonus: 0.15, minCrewLevel: 25, color: '#eab308' },
  { id: 'skyline_crown', name: 'Skyline Crown', bonus: 0.2, minCrewLevel: 40, color: '#f97316' },
  { id: 'empire_throne', name: 'Empire Throne', bonus: 0.3, minCrewLevel: 60, color: '#ef4444' },
];

export const COLLECTIONS = [
  { id: 'street_set', name: 'Street Set', items: ['w_rusty_knife', 'a_leather_jacket', 'v_beaten_sedan'], bonus: { attack: 5 } },
  { id: 'warlord_set', name: 'Warlord Set', items: ['w_assault_rifle', 'a_warlord_plate', 'v_armored_suv'], bonus: { attack: 15, defense: 10 } },
  { id: 'empire_set', name: 'Empire Set', items: ['w_godfather_special', 'a_legend_plate', 'v_mobile_fortress'], bonus: { attack: 50, defense: 40 } },
];

export const BOT_NAMES = [
  'ShadowViper', 'IronFist', 'NightCrawler', 'CrimsonKing', 'GhostRunner',
  'SteelWolf', 'BlackLotus', 'ViperStrike', 'DarkMercury', 'RogueHammer',
  'SilentBlade', 'CopperFang', 'NeonReaper', 'StormBreaker', 'ObsidianJack',
  'RapidCobra', 'GrimLedger', 'ChromeBoss', 'ZeroMerc', 'VaultHunter',
  'BloodRaven', 'SilverTongue', 'DeathDealer', 'PhantomKing', 'RustyChain',
  'ColdTrigger', 'NightBoss', 'ScarletAce', 'ToxicBlade', 'GraveDigger',
];

export const ALL_ITEMS = [
  ...WEAPONS.map((i) => ({ ...i, category: 'weapon' })),
  ...ARMOR.map((i) => ({ ...i, category: 'armor' })),
  ...VEHICLES.map((i) => ({ ...i, category: 'vehicle' })),
  ...PROPERTIES.map((i) => ({ ...i, category: 'property' })),
  ...CONSUMABLES.map((i) => ({ ...i, category: 'consumable' })),
];

export function getItemById(id) {
  return ALL_ITEMS.find((i) => i.id === id) || JOBS.find((j) => j.id === id) || LOCATIONS.find((l) => l.id === id) || BOSSES.find((b) => b.id === id);
}

/** iMobsters-style job loot drops by job type (artSlug) */
export const JOB_LOOT = {
  pickpocket: [{ itemId: 'w_rusty_knife', category: 'weapon', chance: 0.1, qty: [1, 1] }],
  mug_runners: [{ itemId: 'w_baseball_bat', category: 'weapon', chance: 0.08, qty: [1, 1] }],
  fence_goods: [{ itemId: 'a_leather_jacket', category: 'armor', chance: 0.07, qty: [1, 1] }],
  extortion: [{ itemId: 'w_switchblade', category: 'weapon', chance: 0.06, qty: [1, 1] }, { itemId: 'consumable_stamina_drink', category: 'consumable', chance: 0.05, qty: [1, 1] }],
  warehouse: [{ itemId: 'a_kevlar_vest', category: 'armor', chance: 0.06, qty: [1, 1] }],
  truck_jack: [{ itemId: 'v_beaten_sedan', category: 'vehicle', chance: 0.05, qty: [1, 1] }],
  dock_smuggle: [{ itemId: 'v_speedboat', category: 'vehicle', chance: 0.04, qty: [1, 1] }],
  counterfeit: [{ itemId: 'w_street_revolver', category: 'weapon', chance: 0.05, qty: [1, 1] }],
  nightclub: [{ itemId: 'consumable_energy_pack', category: 'consumable', chance: 0.08, qty: [1, 2] }],
  bank_job: [{ itemId: 'w_compact_smg', category: 'weapon', chance: 0.04, qty: [1, 1] }],
  arms_deal: [{ itemId: 'w_tactical_rifle', category: 'weapon', chance: 0.03, qty: [1, 1] }],
  hostile_takeover: [{ itemId: 'a_tactical_vest', category: 'armor', chance: 0.03, qty: [1, 1] }],
  diamond_run: [{ itemId: 'v_executive_limo', category: 'vehicle', chance: 0.02, qty: [1, 1] }],
  syndicate_hit: [{ itemId: 'w_assault_rifle', category: 'weapon', chance: 0.02, qty: [1, 1] }],
  default: [{ itemId: 'consumable_health_kit', category: 'consumable', chance: 0.03, qty: [1, 1] }],
};

export const ASSET_VERSION = '2.5.1';

export function itemThumbnailPath(category, id) {
  return `/assets/items/${category}_${id}.webp?v=${ASSET_VERSION}`;
}

export function uiAssetPath(name) {
  return `/assets/ui/${name}.webp?v=${ASSET_VERSION}`;
}

/** Map shop/inventory category id → catalog API key */
export const CATALOG_KEYS = {
  weapon: 'weapons',
  armor: 'armor',
  vehicle: 'vehicles',
  property: 'properties',
  consumable: 'consumables',
};

export function catalogItems(catalog, category) {
  if (!catalog) return [];
  const key = CATALOG_KEYS[category] || category;
  return catalog[key] || [];
}

export const PROPERTY_MAX_STACK = 999;
/** iMobsters: stack unlimited gear & real estate (practical cap) */
export const ITEM_MAX_STACK = 9999;
export const SHOP_BUY_PRESETS = [1, 2, 3, 4, 5, 10, 20, 50];

export const DEFAULT_AVATARS = [
  { id: 'default_01', name: 'Don', emoji: '🎩', color: '#fbbf24' },
  { id: 'default_02', name: 'Enforcer', emoji: '🕴️', color: '#1f2937' },
  { id: 'default_03', name: 'Gunman', emoji: '🔫', color: '#374151' },
  { id: 'default_04', name: 'Boss', emoji: '👹', color: '#dc2626' },
  { id: 'default_05', name: 'Queen', emoji: '👑', color: '#a855f7' },
  { id: 'default_06', name: 'Shadow', emoji: '🥷', color: '#0f172a' },
  { id: 'default_07', name: 'Hustler', emoji: '💰', color: '#22c55e' },
  { id: 'default_08', name: 'Driver', emoji: '🚗', color: '#6366f1' },
  { id: 'default_09', name: 'Snake', emoji: '🐍', color: '#166534' },
  { id: 'default_10', name: 'Wolf', emoji: '🐺', color: '#78716c' },
  { id: 'default_11', name: 'Skull', emoji: '💀', color: '#44403c' },
  { id: 'default_12', name: 'Viper', emoji: '🦂', color: '#854d0e' },
  { id: 'default_13', name: 'Rose', emoji: '🌹', color: '#be123c' },
  { id: 'default_14', name: 'Ace', emoji: '🃏', color: '#1e40af' },
  { id: 'default_15', name: 'Ghost', emoji: '👻', color: '#64748b' },
];

export function avatarUrl(player) {
  if (player?.avatar_custom) return player.avatar_custom;
  const id = player?.avatar_id || 'default_01';
  return `/assets/avatars/${id}.svg`;
}

export function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/** iMobsters mob brackets: 1-4, 5-9, 10-14, 15-19, ... */
export function getMobBracket(mobSize) {
  const size = Math.max(1, mobSize || 1);
  if (size <= 4) return { min: 1, max: 4 };
  const bracketIndex = Math.floor((size - 5) / 5);
  return { min: 5 + bracketIndex * 5, max: 9 + bracketIndex * 5 };
}

/** The Godfather specialty shop — spend Favor Points (stored in players.gold column) */
export const GODFATHER_STORE = [
  { id: 'energy_refill', name: 'Full Energy Refill', favorCost: 8, effect: 'energy', icon: '⚡' },
  { id: 'stamina_refill', name: 'Full Stamina Refill', favorCost: 6, effect: 'stamina', icon: '💪' },
  { id: 'health_refill', name: 'Full Health Refill', favorCost: 8, effect: 'health', icon: '❤️' },
  { id: 'cash_bundle', name: 'Cash Bundle', favorCost: 15, effect: 'cash', cashPerLevel: 500, icon: '💵' },
  { id: 'hired_gun', name: 'Hired Gun (+1 Mob)', favorCost: 25, effect: 'mob', amount: 1, icon: '🕴️' },
  { id: 'mob_squad', name: 'Mob Squad (+5 Mob)', favorCost: 30, effect: 'mob', amount: 5, icon: '👥' },
  { id: 'xp_boost', name: 'XP Boost (2hr)', favorCost: 12, effect: 'xp_boost', amount: 2, icon: '⭐' },
  { id: 'ice_pack', name: 'Ice Protection (4hr)', favorCost: 10, effect: 'ice', amount: 4, icon: '🧊' },
];

/** @deprecated use GODFATHER_STORE */
export const GOLD_STORE = GODFATHER_STORE;
