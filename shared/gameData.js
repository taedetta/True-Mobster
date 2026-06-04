/** True Mobsters — VisionIt Studio — complete game definitions */

export const STUDIO = 'VisionIt';
export const GAME_NAME = 'True Mobsters';

export const REGEN = { energySeconds: 165, staminaSeconds: 165, healthSeconds: 165 };
/** Slightly easier than default curve (~12% less XP per level). */
export const LEVEL_XP = (level) => Math.floor(88 * Math.pow(level, 1.78));
export const BASE_STATS = { maxEnergy: 10, maxStamina: 5, maxHealth: 100, attack: 1, defense: 1 };
export const STAT_GROWTH_PER_LEVEL = { maxEnergy: 2, maxStamina: 1, maxHealth: 10 };
export const SKILL_POINTS_PER_LEVEL = 6;

export const HOSPITAL_COST_PER_HP = 10;
export const HOSPITAL_HEAL_THRESHOLD = 0.6;
/** iMobsters: property income auto-deposits every ~60 minutes */
export const ECONOMY_TICK_MINUTES = 60;
export const ECONOMY_TICK_MS = ECONOMY_TICK_MINUTES * 60 * 1000;
/** Property hourly income multiplier (base tier curve × this) */
export const PROPERTY_INCOME_MULTIPLIER = 5;
export const BANK_FEE_PERCENT = 0.10;
export const MISSION_MASTERY_THRESHOLDS = [10, 25, 50, 100];
export const MISSION_MASTERY_MAX = 4;
export const BOSS_FIGHT_HOURS = 2;
export const BOSS_MASTERY_KILLS = 10;
export const EXECUTE_BASE_SUCCESS = 0.7;
export const STAMINA_SKILL_COST = 2;
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

/** Original iMobsters — single Attack action (no slap/fight/execute menu) */
export const DEFAULT_FIGHT_TYPE = 'attack';
export const FIGHT_TYPES = {
  attack: {
    stamina: 1,
    /** Base templates — actual rewards scale with level via rollFightXp / rollFightDamage */
    xpWinBase: [5, 35],
    xpLoseBase: [2, 14],
    moneyBase: [50, 500],
    respectBase: [1, 6],
    damageBase: [8, 24],
    label: 'Attack',
  },
};

/** iMobsters: winner = higher equipped power (attacker ATK vs defender DEF) */
export const FIGHT_BASE_POWER = 1;
export const FIGHT_LEVEL_BONUS_EVERY = 20;
export const FIGHT_MONEY_STEAL_MIN = 0.02;
export const FIGHT_MONEY_STEAL_MAX = 0.12;
export const FIGHT_MONEY_LOST_MIN = 0.01;
export const FIGHT_MONEY_LOST_MAX = 0.06;
export const FIGHT_GEAR_LOSS_RATE = 0.1;

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

/** iMobsters: many missions require specific gear you own (not consumed). */
export const JOB_REQUIREMENTS = {
  pickpocket: { minMob: 1, items: [] },
  mug_runners: { minMob: 2, items: [{ itemId: 'w_rusty_knife', category: 'weapon', qty: 1 }] },
  fence_goods: { minMob: 3, items: [{ itemId: 'w_baseball_bat', category: 'weapon', qty: 1 }] },
  extortion: { minMob: 4, items: [{ itemId: 'w_switchblade', category: 'weapon', qty: 1 }, { itemId: 'a_leather_jacket', category: 'armor', qty: 1 }] },
  warehouse: { minMob: 5, items: [{ itemId: 'a_leather_jacket', category: 'armor', qty: 1 }, { itemId: 'w_brass_knuckles', category: 'weapon', qty: 1 }] },
  truck_jack: { minMob: 6, items: [{ itemId: 'v_beaten_sedan', category: 'vehicle', qty: 1 }, { itemId: 'w_street_revolver', category: 'weapon', qty: 1 }] },
  dock_smuggle: { minMob: 8, items: [{ itemId: 'w_street_revolver', category: 'weapon', qty: 1 }, { itemId: 'v_muscle_car', category: 'vehicle', qty: 1 }] },
  counterfeit: { minMob: 10, items: [{ itemId: 'a_kevlar_vest', category: 'armor', qty: 1 }, { itemId: 'w_sawed_off_shotgun', category: 'weapon', qty: 1 }] },
  nightclub: { minMob: 12, items: [{ itemId: 'v_muscle_car', category: 'vehicle', qty: 1 }, { itemId: 'a_street_helmet', category: 'armor', qty: 1 }] },
  insider_trade: { minMob: 15, items: [{ itemId: 'w_compact_smg', category: 'weapon', qty: 1 }, { itemId: 'a_tactical_vest', category: 'armor', qty: 1 }] },
  casino_scam: { minMob: 18, items: [{ itemId: 'w_compact_smg', category: 'weapon', qty: 1 }, { itemId: 'v_speedboat', category: 'vehicle', qty: 1 }] },
  art_heist: { minMob: 20, items: [{ itemId: 'a_tactical_vest', category: 'armor', qty: 1 }, { itemId: 'w_tactical_rifle', category: 'weapon', qty: 1 }] },
  penthouse: { minMob: 25, items: [{ itemId: 'v_armored_suv', category: 'vehicle', qty: 1 }, { itemId: 'w_assault_rifle', category: 'weapon', qty: 1 }, { itemId: 'a_riot_gear', category: 'armor', qty: 1 }] },
  bank_job: { minMob: 30, items: [{ itemId: 'w_tactical_rifle', category: 'weapon', qty: 1 }, { itemId: 'a_ballistic_suit', category: 'armor', qty: 1 }] },
  arms_deal: { minMob: 35, items: [{ itemId: 'w_assault_rifle', category: 'weapon', qty: 1 }, { itemId: 'v_armored_suv', category: 'vehicle', qty: 1 }] },
  hostile_takeover: { minMob: 40, items: [{ itemId: 'a_elite_body_armor', category: 'armor', qty: 1 }, { itemId: 'w_combat_shotgun', category: 'weapon', qty: 1 }] },
  diamond_run: { minMob: 45, items: [{ itemId: 'v_executive_limo', category: 'vehicle', qty: 1 }, { itemId: 'w_long_range_sniper', category: 'weapon', qty: 1 }] },
  syndicate_hit: { minMob: 50, items: [{ itemId: 'w_long_range_sniper', category: 'weapon', qty: 1 }, { itemId: 'a_warlord_plate', category: 'armor', qty: 1 }, { itemId: 'v_private_helicopter', category: 'vehicle', qty: 1 }] },
};

export const JOBS = LOCATIONS.flatMap((loc, li) =>
  JOB_TEMPLATES.map(([slug, name, energy, money, xp, failRate, jailMinutes]) => {
    const req = JOB_REQUIREMENTS[slug] || { minMob: 1, items: [] };
    return {
      id: `${loc.id}_${slug}`,
      artSlug: slug,
      location: loc.id,
      name: `${name} (${loc.name})`,
      energy,
      money,
      xp: xp + li * 2,
      failRate: Math.min(0.35, failRate + li * 0.01),
      jailMinutes,
      minMob: req.minMob + Math.floor(li / 2),
      requiredItems: req.items,
      lootChance: Math.min(0.35, 0.05 + energy * 0.02),
    };
  }),
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

/** iMobsters-style gear: weapons & vehicles can have ATK+DEF; armor always DEF > ATK. */
function imobTieredGear(prefix, names, type, baseAtk, baseDef, basePrice, colors, { baseUpkeep = 0 } = {}) {
  return names.map((name, i) => {
    const scale = 1 + i * 0.55;
    let attack = Math.floor(baseAtk * scale);
    let defense = Math.floor(baseDef * scale);
    if (type === 'weapon') {
      const defMult = [0, 0.5, 0, 0.2, 0.15, 0.67, 0.18, 0.28, 0.22, 0.42, 0.35, 0.2, 0.12, 0.1, 0.28, 0.22, 0.18, 0.15, 0.12, 0.2][i] ?? 0.15;
      if (baseDef <= 0) defense = Math.max(0, Math.floor(attack * defMult));
      if (i === 1) attack = Math.max(attack, defense);
    } else if (type === 'armor') {
      defense = Math.max(defense, Math.floor(baseDef * scale) || 2);
      attack = Math.max(0, Math.floor(defense * 0.32));
      if (defense <= attack) defense = attack + Math.max(1, Math.floor(attack * 0.55));
    } else if (type === 'vehicle') {
      attack = Math.max(1, attack);
      defense = Math.max(defense, Math.floor(attack * 1.12) + (i > 2 ? 1 : 0));
    }
    return {
      id: `${prefix}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name,
      attack,
      defense,
      price: Math.floor(basePrice * Math.pow(1.75, i)),
      minLevel: 1 + i * 4,
      tier: Math.min(5, 1 + Math.floor(i / 4)),
      color: colors[i % colors.length],
      upkeep: baseUpkeep ? Math.floor(baseUpkeep * Math.pow(1.35, i)) : 0,
    };
  });
}

export const WEAPONS = imobTieredGear('w', [
  'Rusty Knife', 'Baseball Bat', 'Switchblade', 'Brass Knuckles', 'Street Revolver',
  'Sawed-Off Shotgun', 'Compact SMG', 'Tactical Rifle', 'Assault Rifle', 'Combat Shotgun',
  'Long-Range Sniper', 'Dual Pistols', 'Golden Pistol', 'Plasma Cutter', 'Boss Cannon',
  'War Hammer', 'Shadow Blade', 'Empire Destroyer', 'Annihilator', 'Godfather Special',
], 'weapon', 2, 0, 500, ['#94a3b8', '#b45309', '#64748b', '#78716c', '#475569', '#78350f', '#1e293b', '#14532d', '#166534', '#312e81', '#581c87', '#ca8a04', '#eab308', '#7f1d1d', '#450a0a', '#44403c', '#0f172a', '#991b1b', '#701a75', '#fbbf24'], { baseUpkeep: 4 });

export const ARMOR = imobTieredGear('a', [
  'Leather Jacket', 'Kevlar Vest', 'Street Helmet', 'Tactical Vest', 'Riot Gear',
  'Ballistic Suit', 'Elite Body Armor', 'Warlord Plate', 'Phantom Suit', 'Empire Guard',
  'Dragon Scale', 'Titan Plate', 'Shadow Cloak', 'Invincible Mesh', 'Emperor Mantle',
  'Fortress Shell', 'Aegis Suit', 'Void Armor', 'Immortal Guard', 'Legend Plate',
], 'armor', 0, 2, 800, ['#44403c', '#57534e', '#334155', '#166534', '#1e3a8a', '#374151', '#581c87', '#713f12', '#0f172a', '#991b1b', '#7c2d12', '#1e40af', '#312e81', '#134e4a', '#854d0e', '#44403c', '#0369a1', '#4c1d95', '#881337', '#fbbf24'], { baseUpkeep: 6 });

export const VEHICLES = imobTieredGear('v', [
  'Beaten Sedan', 'Muscle Car', 'Armored SUV', 'Speedboat', 'Executive Limo',
  'Private Helicopter', 'Luxury Yacht', 'Private Jet', 'Tank Limo', 'Stealth Bike',
  'War Rig', 'Submarine', 'Orbital Shuttle', 'Mobile Fortress', 'Ghost Train',
], 'vehicle', 1, 1, 2000, ['#71717a', '#dc2626', '#1f2937', '#0284c7', '#18181b', '#0369a1', '#f5f5f4', '#e2e8f0', '#422006', '#09090b', '#7f1d1d', '#164e63', '#6366f1', '#374151', '#78350f'], { baseUpkeep: 20 });

export const PROPERTIES = tieredItems('p', [
  'Corner Store', 'Laundromat Front', 'Pool Hall', 'Underground Club', 'Storage Warehouse',
  'Casino Floor', 'Hotel Tower', 'Shipping Port', 'Skyline Tower', 'Empire HQ',
  'Oil Refinery', 'Media Conglomerate', 'Private Island', 'Satellite Network', 'World Bank Share',
], 'income', 50, 5000, ['#84cc16', '#22d3ee', '#a3e635', '#c026d3', '#78716c', '#eab308', '#6366f1', '#0ea5e9', '#f97316', '#ef4444', '#854d0e', '#a855f7', '#06b6d4', '#8b5cf6', '#fbbf24']).map((p) => ({
  ...p,
  income: Math.floor(p.income * PROPERTY_INCOME_MULTIPLIER),
}));

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
  { id: 'street_set', name: 'Street Set', items: ['w_rusty_knife', 'a_leather_jacket', 'v_beaten_sedan', 'w_baseball_bat', 'w_switchblade'], bonus: { attack: 5 } },
  { id: 'enforcer_set', name: 'Enforcer Set', items: ['w_brass_knuckles', 'a_kevlar_vest', 'v_muscle_car', 'w_street_revolver', 'a_street_helmet'], bonus: { attack: 8, defense: 5 } },
  { id: 'smuggler_set', name: 'Smuggler Set', items: ['w_compact_smg', 'a_tactical_vest', 'v_speedboat', 'w_sawed_off_shotgun', 'v_armored_suv'], bonus: { attack: 12, defense: 8 } },
  { id: 'warlord_set', name: 'Warlord Set', items: ['w_assault_rifle', 'a_warlord_plate', 'v_armored_suv', 'w_tactical_rifle', 'a_riot_gear'], bonus: { attack: 15, defense: 10 } },
  { id: 'syndicate_set', name: 'Syndicate Set', items: ['w_combat_shotgun', 'a_ballistic_suit', 'v_executive_limo', 'w_dual_pistols', 'a_elite_body_armor'], bonus: { attack: 20, defense: 15 } },
  { id: 'elite_set', name: 'Elite Set', items: ['w_long_range_sniper', 'a_phantom_suit', 'v_private_helicopter', 'w_golden_pistol', 'a_empire_guard'], bonus: { attack: 30, defense: 20 } },
  { id: 'property_set', name: 'Property Mogul', items: ['p_corner_store', 'p_laundromat_front', 'p_pool_hall', 'p_underground_club', 'p_storage_warehouse'], bonus: { attack: 5, defense: 5 } },
  { id: 'casino_set', name: 'Casino King', items: ['p_casino_floor', 'p_hotel_tower', 'p_shipping_port', 'p_skyline_tower', 'p_empire_hq'], bonus: { attack: 10, defense: 10 } },
  { id: 'empire_set', name: 'Empire Set', items: ['w_godfather_special', 'a_legend_plate', 'v_mobile_fortress', 'w_annihilator', 'a_immortal_guard'], bonus: { attack: 50, defense: 40 } },
  { id: 'don_set', name: 'Don Collection', items: ['w_empire_destroyer', 'a_void_armor', 'v_orbital_shuttle', 'p_world_bank_share', 'p_satellite_network'], bonus: { attack: 75, defense: 60 } },
];

export const CREW_SPEND_OPTIONS = [
  { id: 'crew_level', name: 'Upgrade Crew Level', cost: 50000, effect: 'level', amount: 1, minLevel: 1 },
  { id: 'crew_bonus', name: 'Combat Bonus (+2%)', cost: 25000, effect: 'bonus', amount: 0.02, minLevel: 3 },
  { id: 'crew_income', name: 'Income Boost (+5%)', cost: 75000, effect: 'income', amount: 0.05, minLevel: 5 },
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

/** iMobsters-style job loot — fixed drops + random gear only at/below player level. */
export const JOB_LOOT = {
  pickpocket: [
    { itemId: 'w_rusty_knife', category: 'weapon', chance: 0.12, qty: [1, 1] },
    { itemId: 'stamina_drink', category: 'consumable', chance: 0.06, qty: [1, 1] },
  ],
  mug_runners: [
    { itemId: 'w_baseball_bat', category: 'weapon', chance: 0.1, qty: [1, 1] },
    { itemId: 'w_switchblade', category: 'weapon', chance: 0.05, qty: [1, 1] },
  ],
  fence_goods: [
    { itemId: 'a_leather_jacket', category: 'armor', chance: 0.09, qty: [1, 1] },
    { itemId: 'w_brass_knuckles', category: 'weapon', chance: 0.06, qty: [1, 1] },
  ],
  extortion: [
    { itemId: 'w_switchblade', category: 'weapon', chance: 0.08, qty: [1, 1] },
    { itemId: 'stamina_drink', category: 'consumable', chance: 0.07, qty: [1, 1] },
  ],
  warehouse: [
    { itemId: 'a_kevlar_vest', category: 'armor', chance: 0.08, qty: [1, 1] },
    { itemId: 'a_street_helmet', category: 'armor', chance: 0.05, qty: [1, 1] },
  ],
  truck_jack: [
    { itemId: 'v_beaten_sedan', category: 'vehicle', chance: 0.07, qty: [1, 1] },
    { itemId: 'w_street_revolver', category: 'weapon', chance: 0.05, qty: [1, 1] },
  ],
  dock_smuggle: [
    { itemId: 'v_speedboat', category: 'vehicle', chance: 0.06, qty: [1, 1] },
    { itemId: 'v_muscle_car', category: 'vehicle', chance: 0.04, qty: [1, 1] },
  ],
  counterfeit: [
    { itemId: 'w_street_revolver', category: 'weapon', chance: 0.07, qty: [1, 1] },
    { itemId: 'w_sawed_off_shotgun', category: 'weapon', chance: 0.04, qty: [1, 1] },
  ],
  nightclub: [
    { itemId: 'energy_pack', category: 'consumable', chance: 0.1, qty: [1, 2] },
    { itemId: 'v_muscle_car', category: 'vehicle', chance: 0.04, qty: [1, 1] },
  ],
  insider_trade: [
    { itemId: 'w_compact_smg', category: 'weapon', chance: 0.06, qty: [1, 1] },
    { itemId: 'a_tactical_vest', category: 'armor', chance: 0.05, qty: [1, 1] },
  ],
  casino_scam: [
    { itemId: 'w_compact_smg', category: 'weapon', chance: 0.05, qty: [1, 1] },
    { itemId: 'health_kit', category: 'consumable', chance: 0.06, qty: [1, 1] },
  ],
  art_heist: [
    { itemId: 'a_tactical_vest', category: 'armor', chance: 0.05, qty: [1, 1] },
    { itemId: 'w_tactical_rifle', category: 'weapon', chance: 0.04, qty: [1, 1] },
  ],
  penthouse: [
    { itemId: 'v_armored_suv', category: 'vehicle', chance: 0.04, qty: [1, 1] },
    { itemId: 'w_assault_rifle', category: 'weapon', chance: 0.03, qty: [1, 1] },
  ],
  bank_job: [
    { itemId: 'w_compact_smg', category: 'weapon', chance: 0.05, qty: [1, 1] },
    { itemId: 'a_ballistic_suit', category: 'armor', chance: 0.03, qty: [1, 1] },
  ],
  arms_deal: [
    { itemId: 'w_tactical_rifle', category: 'weapon', chance: 0.04, qty: [1, 1] },
    { itemId: 'w_assault_rifle', category: 'weapon', chance: 0.03, qty: [1, 1] },
  ],
  hostile_takeover: [
    { itemId: 'a_tactical_vest', category: 'armor', chance: 0.04, qty: [1, 1] },
    { itemId: 'a_elite_body_armor', category: 'armor', chance: 0.02, qty: [1, 1] },
  ],
  diamond_run: [
    { itemId: 'v_executive_limo', category: 'vehicle', chance: 0.03, qty: [1, 1] },
    { itemId: 'w_long_range_sniper', category: 'weapon', chance: 0.02, qty: [1, 1] },
  ],
  syndicate_hit: [
    { itemId: 'w_assault_rifle', category: 'weapon', chance: 0.03, qty: [1, 1] },
    { itemId: 'w_combat_shotgun', category: 'weapon', chance: 0.02, qty: [1, 1] },
  ],
  default: [{ itemId: 'health_kit', category: 'consumable', chance: 0.04, qty: [1, 1] }],
};

/** Bonus chance to find random weapon/armor/vehicle unlocked at player level. */
export const JOB_RANDOM_GEAR_CHANCE = 0.08;

export function gearUnlockedAtLevel(playerLevel) {
  const lvl = Math.max(1, Number(playerLevel) || 1);
  return ALL_ITEMS.filter(
    (i) => ['weapon', 'armor', 'vehicle'].includes(i.category) && (i.minLevel || 1) <= lvl,
  );
}

export function pickRandomJobGearDrop(playerLevel, rng = Math.random) {
  const pool = gearUnlockedAtLevel(playerLevel);
  if (!pool.length) return null;
  const item = pool[Math.floor(rng() * pool.length)];
  return { itemId: item.id, category: item.category, qty: 1 };
}

export const ASSET_VERSION = '2.8.0';

export function getMissionMasteryLevel(completions) {
  let level = 0;
  for (let i = 0; i < MISSION_MASTERY_THRESHOLDS.length; i++) {
    if (completions >= MISSION_MASTERY_THRESHOLDS[i]) level = i + 1;
  }
  return Math.min(MISSION_MASTERY_MAX, level);
}

export function getMissionMasteryBonus(masteryLevel) {
  if (masteryLevel <= 0) return { moneyMult: 1, xpMult: 1, favorBonus: 0 };
  return {
    moneyMult: 1 + masteryLevel * 0.1,
    xpMult: 1 + masteryLevel * 0.08,
    favorBonus: masteryLevel >= 4 ? 2 : masteryLevel >= 2 ? 1 : 0,
  };
}

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

/**
 * iMobsters fight power — gear × usable mob is primary; skills/collections add small bonuses.
 * Attacker compares fightAttack vs defender fightDefense.
 */
export function calcFightAttackPower({ gearAttack = 0, level = 1, skillPoints = 0, colBonus = 0, crewBonus = 0, territoryBonus = 0 } = {}) {
  const levelBonus = Math.floor(level / FIGHT_LEVEL_BONUS_EVERY);
  const raw = FIGHT_BASE_POWER + levelBonus + gearAttack + skillPoints + colBonus;
  return Math.max(1, Math.floor(raw * (1 + crewBonus + territoryBonus)));
}

export function calcFightDefensePower({ gearDefense = 0, level = 1, skillPoints = 0, colBonus = 0, crewBonus = 0, territoryBonus = 0 } = {}) {
  const levelBonus = Math.floor(level / FIGHT_LEVEL_BONUS_EVERY);
  const raw = FIGHT_BASE_POWER + levelBonus + gearDefense + skillPoints + colBonus;
  return Math.max(1, Math.floor(raw * (1 + crewBonus + territoryBonus)));
}

/** Win chance from power ratio — strong gear advantage should almost always win (classic iMobsters). */
export function calcFightWinChance(attackPower, defensePower) {
  const atk = Math.max(1, attackPower);
  const def = Math.max(1, defensePower);
  const ratio = atk / def;
  if (ratio >= 1.5) return Math.min(0.98, 0.85 + (ratio - 1.5) * 0.05);
  if (ratio >= 1.15) return 0.78 + (ratio - 1.15) * 0.47;
  if (ratio >= 1.0) return 0.55 + (ratio - 1.0) * 1.53;
  if (ratio >= 0.85) return 0.35 + (ratio - 0.85) * 1.33;
  if (ratio >= 0.67) return 0.12 + (ratio - 0.67) * 1.35;
  return Math.max(0.02, ratio * 0.15);
}

/** Level-scaled min/max — rewards and damage ranges grow as you level (iMobsters-style). */
export function levelScaleRange(level, baseMin, baseMax, perLevelGrowth = 0.1) {
  const lvl = Math.max(1, Number(level) || 1);
  const mult = 1 + (lvl - 1) * perLevelGrowth;
  const min = Math.max(1, Math.floor(baseMin * mult));
  const max = Math.max(min, Math.floor(baseMax * mult));
  return [min, max];
}

function rollInRange(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function rollScaledByLevel(level, baseMin, baseMax, perLevelGrowth = 0.1, rng = Math.random) {
  const [min, max] = levelScaleRange(level, baseMin, baseMax, perLevelGrowth);
  return rollInRange(min, max, rng);
}

export function resolveFightRoll(attackPower, defensePower, rng = Math.random) {
  const baseChance = calcFightWinChance(attackPower, defensePower);
  const jitter = (rng() - 0.5) * 0.06;
  const rollChance = Math.min(0.98, Math.max(0.02, baseChance + jitter));
  return { attackerWon: rng() < rollChance, winChance: Math.round(baseChance * 100) };
}

export function rollFightXp(attackerLevel, won, rng = Math.random) {
  if (won) return rollScaledByLevel(attackerLevel, 5, 35, 0.12, rng);
  return rollScaledByLevel(attackerLevel, 2, 14, 0.08, rng);
}

export function rollFightRespect(attackerLevel, defenderLevel, rng = Math.random) {
  const avg = Math.floor((attackerLevel + defenderLevel) / 2);
  return rollScaledByLevel(avg, 1, 6, 0.05, rng);
}

export function rollFightMoneySteal(defenderMoney, attackerLevel, defenderLevel, rng = Math.random) {
  const avg = Math.floor((attackerLevel + defenderLevel) / 2);
  const pct = FIGHT_MONEY_STEAL_MIN + rng() * (FIGHT_MONEY_STEAL_MAX - FIGHT_MONEY_STEAL_MIN);
  const fromPct = Math.floor(defenderMoney * pct);
  const [flatMin, flatMax] = levelScaleRange(avg, 50, 500, 0.08);
  const fromFlat = rollInRange(flatMin, flatMax, rng);
  return Math.min(defenderMoney, Math.max(fromPct, fromFlat));
}

export function rollFightMoneyLost(attackerMoney, attackerLevel, defenderLevel, rng = Math.random) {
  const avg = Math.floor((attackerLevel + defenderLevel) / 2);
  const pct = FIGHT_MONEY_LOST_MIN + rng() * (FIGHT_MONEY_LOST_MAX - FIGHT_MONEY_LOST_MIN);
  let lost = Math.floor(attackerMoney * pct);
  const [flatMin, flatMax] = levelScaleRange(avg, 10, 80, 0.06);
  if (lost < flatMin && attackerMoney > 0) {
    lost = Math.min(attackerMoney, rollInRange(flatMin, Math.max(flatMin, flatMax), rng));
  }
  return Math.min(Math.max(0, lost), attackerMoney);
}

/** Damage scales with average level + winner's combat power (iMobsters: stronger side hits harder). */
export function rollFightDamage({
  attackerWon, attackerLevel, defenderLevel, attackerPower, defenderPower, rng = Math.random,
}) {
  const avgLevel = Math.max(1, Math.floor((attackerLevel + defenderLevel) / 2));
  const winnerPower = attackerWon ? attackerPower : defenderPower;
  const loserPower = attackerWon ? defenderPower : attackerPower;
  const ratio = winnerPower / Math.max(1, loserPower);
  const [baseMin, baseMax] = levelScaleRange(avgLevel, 8, 24, 0.09);
  const powerBoost = Math.floor(winnerPower * 0.05 * Math.min(2.5, ratio));
  const loserMin = baseMin + powerBoost;
  const loserMax = baseMax + powerBoost + Math.floor(avgLevel * 0.4);
  const loserDamage = rollInRange(loserMin, Math.max(loserMin, loserMax), rng);
  const winnerRatio = attackerWon ? 0.08 + rng() * 0.17 : 0.14 + rng() * 0.22;
  const winnerDamage = Math.max(1, Math.floor(loserDamage * winnerRatio));
  if (attackerWon) {
    return { attackerDamageTaken: winnerDamage, defenderDamageTaken: loserDamage };
  }
  return { attackerDamageTaken: loserDamage, defenderDamageTaken: winnerDamage };
}

export function rollMissionXp(playerLevel, jobBaseXp, masteryMult = 1, rng = Math.random) {
  const [min, max] = levelScaleRange(playerLevel, Math.floor(jobBaseXp * 0.7), Math.floor(jobBaseXp * 1.4), 0.05);
  return Math.floor(rollInRange(min, max, rng) * masteryMult);
}

export function rollMissionMoney(playerLevel, moneyRange, masteryMult = 1, rng = Math.random) {
  const [min, max] = levelScaleRange(playerLevel, moneyRange[0], moneyRange[1], 0.04);
  return Math.floor(rollInRange(min, max, rng) * masteryMult);
}

export function hitlistMinBounty(targetLevel) {
  return Math.max(HITLIST_MIN_BOUNTY, Math.floor(HITLIST_MIN_BOUNTY * (1 + (Math.max(1, targetLevel) - 1) * 0.08)));
}

export function hitlistKillerBonus(bounty, attackerLevel, targetLevel) {
  return Math.floor(bounty * HITLIST_BONUS_MULTIPLIER) + Math.floor((targetLevel + attackerLevel) * 2.5);
}

/** The Godfather specialty shop — Favor Points (players.gold): refills + exclusive gear. */
export const GODFATHER_STORE = [
  { id: 'energy_refill', name: 'Full Energy Refill', favorCost: 8, effect: 'energy', icon: '⚡' },
  { id: 'stamina_refill', name: 'Full Stamina Refill', favorCost: 6, effect: 'stamina', icon: '💪' },
  { id: 'health_refill', name: 'Full Health Refill', favorCost: 8, effect: 'health', icon: '❤️' },
  { id: 'cash_bundle', name: 'Cash Bundle', favorCost: 15, effect: 'cash', cashPerLevel: 500, icon: '💵' },
  { id: 'hired_gun', name: 'Hired Gun (+1 Mob)', favorCost: 25, effect: 'mob', amount: 1, icon: '🕴️' },
  { id: 'mob_squad', name: 'Mob Squad (+5 Mob)', favorCost: 30, effect: 'mob', amount: 5, icon: '👥' },
  { id: 'xp_boost', name: 'XP Boost (2hr)', favorCost: 12, effect: 'xp_boost', amount: 2, icon: '⭐' },
  { id: 'ice_pack', name: 'Ice Protection (4hr)', favorCost: 10, effect: 'ice', amount: 4, icon: '🧊' },
  { id: 'gf_rusty_knife', name: 'Rusty Knife', favorCost: 5, effect: 'gear', itemId: 'w_rusty_knife', category: 'weapon', qty: 1, icon: '🔪' },
  { id: 'gf_street_revolver', name: 'Street Revolver', favorCost: 14, effect: 'gear', itemId: 'w_street_revolver', category: 'weapon', qty: 1, icon: '🔫' },
  { id: 'gf_kevlar', name: 'Kevlar Vest', favorCost: 12, effect: 'gear', itemId: 'a_kevlar_vest', category: 'armor', qty: 1, icon: '🛡' },
  { id: 'gf_muscle_car', name: 'Muscle Car', favorCost: 22, effect: 'gear', itemId: 'v_muscle_car', category: 'vehicle', qty: 1, icon: '🚗' },
  { id: 'gf_compact_smg', name: 'Compact SMG', favorCost: 28, effect: 'gear', itemId: 'w_compact_smg', category: 'weapon', qty: 1, icon: '🔫' },
  { id: 'gf_tactical_vest', name: 'Tactical Vest', favorCost: 32, effect: 'gear', itemId: 'a_tactical_vest', category: 'armor', qty: 1, icon: '🛡' },
  { id: 'gf_armored_suv', name: 'Armored SUV', favorCost: 45, effect: 'gear', itemId: 'v_armored_suv', category: 'vehicle', qty: 1, icon: '🚙' },
  { id: 'gf_assault_rifle', name: 'Assault Rifle', favorCost: 55, effect: 'gear', itemId: 'w_assault_rifle', category: 'weapon', qty: 1, icon: '🔫' },
  { id: 'gf_energy_pack', name: 'Energy Pack ×3', favorCost: 10, effect: 'gear', itemId: 'energy_pack', category: 'consumable', qty: 3, icon: '⚡' },
  { id: 'gf_mob_contract', name: 'Mob Contract (+5)', favorCost: 35, effect: 'gear', itemId: 'mob_contract', category: 'consumable', qty: 1, icon: '👥' },
];

/** @deprecated use GODFATHER_STORE */
export const GOLD_STORE = GODFATHER_STORE;
