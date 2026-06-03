/** Item-specific SVG art for True Mobsters thumbnails (512×512) */

const SIZE = 512;

function wrap(category, name, color, tier, body, accent = '#fbbf24') {
  const stars = '★'.repeat(Math.min(tier || 1, 5));
  const uid = `${category}_${name}`.replace(/\W/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg_${uid}" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#1a1a2e" stop-opacity="1"/>
      <stop offset="100%" stop-color="#0a0a0f" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="shine_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow_${uid}"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="shadow_${uid}"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.55"/></filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" rx="48" fill="url(#bg_${uid})"/>
  <rect x="16" y="16" width="480" height="480" rx="40" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="3"/>
  <ellipse cx="256" cy="420" rx="140" ry="28" fill="#000" opacity="0.35"/>
  <g filter="url(#shadow_${uid})">${body}</g>
  <rect x="24" y="24" width="200" height="80" rx="16" fill="url(#shine_${uid})" opacity="0.12"/>
  <text x="256" y="468" text-anchor="middle" fill="#fef3c7" font-family="Georgia, serif" font-size="28" font-weight="bold" filter="url(#glow_${uid})">${esc(name.length > 22 ? name.slice(0, 20) + '…' : name)}</text>
  <text x="256" y="498" text-anchor="middle" fill="${accent}" font-family="Georgia, serif" font-size="22">${stars}</text>
</svg>`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Weapon art ──
const WEAPON_ART = {
  knife: `<g transform="translate(256,240) rotate(-35)"><rect x="-8" y="-120" width="16" height="140" rx="4" fill="#cbd5e1"/><polygon points="0,-140 -14,-108 14,-108" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="-18" y="20" width="36" height="50" rx="6" fill="#78350f"/><rect x="-22" y="68" width="44" height="12" rx="4" fill="#92400e"/></g>`,
  bat: `<g transform="translate(256,250) rotate(25)"><ellipse cx="0" cy="-80" rx="28" ry="100" fill="#92400e" stroke="#78350f" stroke-width="3"/><rect x="-12" y="20" width="24" height="90" rx="8" fill="#a16207"/><ellipse cx="0" cy="115" rx="18" ry="12" fill="#78350f"/></g>`,
  switchblade: `<g transform="translate(256,250) rotate(-20)"><rect x="-6" y="-30" width="12" height="80" fill="#94a3b8"/><polygon points="0,-110 -10,-30 10,-30" fill="#e2e8f0" stroke="#64748b"/><rect x="-20" y="50" width="40" height="55" rx="4" fill="#1e293b"/><circle cx="0" cy="78" r="8" fill="#475569"/></g>`,
  knuckles: `<g transform="translate(256,250)"><ellipse cx="0" cy="0" rx="90" ry="55" fill="#78716c" stroke="#57534e" stroke-width="4"/><circle cx="-50" cy="-15" r="22" fill="#a8a29e" stroke="#57534e" stroke-width="2"/><circle cx="-15" cy="-25" r="22" fill="#a8a29e" stroke="#57534e" stroke-width="2"/><circle cx="20" cy="-25" r="22" fill="#a8a29e" stroke="#57534e" stroke-width="2"/><circle cx="55" cy="-15" r="22" fill="#a8a29e" stroke="#57534e" stroke-width="2"/></g>`,
  revolver: `<g transform="translate(256,250)"><rect x="-90" y="-15" width="140" height="30" rx="6" fill="#374151"/><rect x="50" y="-25" width="70" height="50" rx="8" fill="#1f2937" stroke="#4b5563"/><circle cx="85" cy="0" r="28" fill="#111827" stroke="#6b7280" stroke-width="3"/><rect x="-110" y="-8" width="30" height="16" rx="4" fill="#78350f"/></g>`,
  shotgun: `<g transform="translate(256,250) rotate(-5)"><rect x="-120" y="-12" width="200" height="24" rx="4" fill="#78350f"/><rect x="80" y="-20" width="100" height="40" rx="6" fill="#1f2937" stroke="#374151"/><rect x="170" y="-8" width="40" height="16" fill="#111827"/></g>`,
  smg: `<g transform="translate(256,250)"><rect x="-100" y="-10" width="160" height="20" rx="3" fill="#1e293b"/><rect x="60" y="-18" width="80" height="36" rx="4" fill="#0f172a"/><rect x="-60" y="10" width="20" height="60" rx="3" fill="#374151"/><rect x="20" y="10" width="50" height="35" rx="4" fill="#78350f"/></g>`,
  rifle: `<g transform="translate(256,250)"><rect x="-130" y="-8" width="220" height="16" rx="2" fill="#14532d"/><rect x="90" y="-14" width="60" height="28" rx="3" fill="#166534"/><rect x="-80" y="8" width="30" height="55" rx="4" fill="#78350f"/><circle cx="30" cy="0" r="12" fill="#052e16" stroke="#22c55e"/></g>`,
  assault: `<g transform="translate(256,250)"><rect x="-120" y="-10" width="200" height="20" rx="2" fill="#166534"/><rect x="80" y="-16" width="70" height="32" rx="3" fill="#14532d"/><rect x="-40" y="10" width="25" height="50" rx="3" fill="#374151"/><rect x="10" y="10" width="60" height="30" rx="3" fill="#78350f"/></g>`,
  sniper: `<g transform="translate(256,250)"><rect x="-160" y="-6" width="280" height="12" rx="2" fill="#312e81"/><circle cx="120" cy="0" r="22" fill="#1e1b4b" stroke="#6366f1" stroke-width="3"/><rect x="-60" y="6" width="20" height="45" rx="2" fill="#374151"/><polygon points="120,-30 130,0 120,30" fill="#4338ca" opacity="0.8"/></g>`,
  pistol: `<g transform="translate(256,260)"><rect x="-60" y="-12" width="80" height="24" rx="4" fill="#374151"/><rect x="20" y="-18" width="50" height="36" rx="5" fill="#1f2937"/><rect x="10" y="12" width="30" height="45" rx="4" fill="#78350f"/></g>`,
  golden: `<g transform="translate(256,260)"><rect x="-60" y="-12" width="80" height="24" rx="4" fill="#fbbf24" stroke="#f59e0b"/><rect x="20" y="-18" width="50" height="36" rx="5" fill="#fcd34d" stroke="#eab308"/><rect x="10" y="12" width="30" height="45" rx="4" fill="#ca8a04"/></g>`,
  plasma: `<g transform="translate(256,250)"><rect x="-80" y="-8" width="120" height="16" rx="2" fill="#7f1d1d"/><ellipse cx="50" cy="0" rx="40" ry="20" fill="#ef4444" opacity="0.9" filter="url(#glow)"/><rect x="-30" y="8" width="40" height="50" rx="4" fill="#450a0a"/></g>`,
  cannon: `<g transform="translate(256,250)"><rect x="-100" y="-25" width="160" height="50" rx="8" fill="#450a0a" stroke="#7f1d1d"/><circle cx="70" cy="0" r="35" fill="#1c1917" stroke="#ef4444"/><rect x="-120" y="-10" width="30" height="20" fill="#374151"/></g>`,
  hammer: `<g transform="translate(256,240) rotate(-15)"><rect x="-8" y="-20" width="16" height="160" rx="4" fill="#78350f"/><rect x="-50" y="-60" width="100" height="45" rx="6" fill="#44403c" stroke="#78716c"/></g>`,
  blade: `<g transform="translate(256,240) rotate(-45)"><polygon points="0,-130 -12,40 0,60 12,40" fill="#0f172a" stroke="#6366f1" stroke-width="2"/><rect x="-8" y="60" width="16" height="50" fill="#312e81"/><circle cx="0" cy="120" r="14" fill="#4338ca"/></g>`,
  destroyer: `<g transform="translate(256,250)"><polygon points="0,-120 -30,80 0,100 30,80" fill="#991b1b" stroke="#ef4444" stroke-width="3"/><rect x="-15" y="80" width="30" height="60" fill="#450a0a"/><circle cx="0" cy="-80" r="20" fill="#fbbf24" opacity="0.8"/></g>`,
  annihilator: `<g transform="translate(256,250)"><circle cx="0" cy="0" r="90" fill="none" stroke="#701a75" stroke-width="8"/><circle cx="0" cy="0" r="60" fill="#4a044e" stroke="#a855f7"/><polygon points="0,-100 -20,20 20,20" fill="#ef4444"/><polygon points="0,100 -20,-20 20,-20" fill="#ef4444"/></g>`,
  godfather: `<g transform="translate(256,250)"><rect x="-70" y="-20" width="140" height="40" rx="6" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/><circle cx="0" cy="-60" r="35" fill="#fcd34d" stroke="#eab308"/><text x="0" y="-50" text-anchor="middle" fill="#78350f" font-size="28" font-weight="bold">GF</text></g>`,
};

function weaponArt(name) {
  const n = name.toLowerCase();
  if (n.includes('knife') || n.includes('rusty')) return WEAPON_ART.knife;
  if (n.includes('bat')) return WEAPON_ART.bat;
  if (n.includes('switchblade')) return WEAPON_ART.switchblade;
  if (n.includes('knuckle')) return WEAPON_ART.knuckles;
  if (n.includes('revolver')) return WEAPON_ART.revolver;
  if (n.includes('shotgun')) return WEAPON_ART.shotgun;
  if (n.includes('smg')) return WEAPON_ART.smg;
  if (n.includes('sniper')) return WEAPON_ART.sniper;
  if (n.includes('assault')) return WEAPON_ART.assault;
  if (n.includes('rifle') || n.includes('tactical')) return WEAPON_ART.rifle;
  if (n.includes('dual') || n.includes('pistol')) return WEAPON_ART.pistol;
  if (n.includes('golden')) return WEAPON_ART.golden;
  if (n.includes('plasma')) return WEAPON_ART.plasma;
  if (n.includes('cannon')) return WEAPON_ART.cannon;
  if (n.includes('hammer')) return WEAPON_ART.hammer;
  if (n.includes('shadow') || n.includes('blade')) return WEAPON_ART.blade;
  if (n.includes('destroyer') || n.includes('empire')) return WEAPON_ART.destroyer;
  if (n.includes('annihilator')) return WEAPON_ART.annihilator;
  if (n.includes('godfather')) return WEAPON_ART.godfather;
  return WEAPON_ART.knife;
}

// ── Armor art ──
function armorArt(name) {
  const n = name.toLowerCase();
  if (n.includes('jacket')) return `<g transform="translate(256,250)"><path d="M-80,-60 L80,-60 L100,80 L60,120 L-60,120 L-100,80 Z" fill="#44403c" stroke="#78716c" stroke-width="3"/><path d="M-30,-60 L30,-60 L30,120 L-30,120 Z" fill="#57534e"/></g>`;
  if (n.includes('kevlar') || n.includes('vest')) return `<g transform="translate(256,250)"><rect x="-90" y="-70" width="180" height="160" rx="12" fill="#334155" stroke="#64748b" stroke-width="3"/><rect x="-60" y="-40" width="120" height="100" rx="8" fill="#475569"/></g>`;
  if (n.includes('helmet')) return `<g transform="translate(256,230)"><ellipse cx="0" cy="20" rx="90" ry="70" fill="#334155" stroke="#64748b" stroke-width="4"/><rect x="-70" y="20" width="140" height="30" fill="#1e293b"/></g>`;
  if (n.includes('riot')) return `<g transform="translate(256,250)"><rect x="-100" y="-80" width="200" height="170" rx="16" fill="#1e3a8a" stroke="#3b82f6"/><circle cx="-60" cy="-20" r="25" fill="#60a5fa" opacity="0.5"/><circle cx="60" cy="-20" r="25" fill="#60a5fa" opacity="0.5"/></g>`;
  if (n.includes('ballistic') || n.includes('body')) return `<g transform="translate(256,250)"><rect x="-95" y="-75" width="190" height="165" rx="14" fill="#166534" stroke="#22c55e" stroke-width="3"/><rect x="-40" y="-30" width="80" height="80" rx="6" fill="#14532d"/></g>`;
  if (n.includes('plate') || n.includes('warlord') || n.includes('titan')) return `<g transform="translate(256,250)"><rect x="-85" y="-90" width="70" height="100" rx="8" fill="#713f12" stroke="#ca8a04"/><rect x="15" y="-90" width="70" height="100" rx="8" fill="#713f12" stroke="#ca8a04"/><rect x="-50" y="10" width="100" height="90" rx="10" fill="#92400e"/></g>`;
  if (n.includes('phantom') || n.includes('shadow') || n.includes('cloak')) return `<g transform="translate(256,250)"><path d="M0,-110 L-100,100 L0,80 L100,100 Z" fill="#0f172a" stroke="#6366f1" stroke-width="2" opacity="0.9"/></g>`;
  if (n.includes('dragon') || n.includes('scale')) return `<g transform="translate(256,250)"><ellipse cx="0" cy="0" rx="100" ry="110" fill="#7c2d12" stroke="#ea580c"/><ellipse cx="-40" cy="-20" rx="30" ry="35" fill="#c2410c" opacity="0.7"/><ellipse cx="40" cy="-20" rx="30" ry="35" fill="#c2410c" opacity="0.7"/></g>`;
  if (n.includes('void') || n.includes('immortal') || n.includes('legend') || n.includes('emperor') || n.includes('aegis') || n.includes('fortress') || n.includes('invincible')) return `<g transform="translate(256,250)"><circle cx="0" cy="0" r="100" fill="#1e1b4b" stroke="#fbbf24" stroke-width="4"/><circle cx="0" cy="0" r="70" fill="none" stroke="#6366f1" stroke-width="3"/><polygon points="0,-60 -35,30 35,30" fill="#fbbf24" opacity="0.9"/></g>`;
  return `<g transform="translate(256,250)"><rect x="-90" y="-70" width="180" height="160" rx="12" fill="#374151" stroke="#6b7280" stroke-width="3"/></g>`;
}

// ── Vehicle art ──
function vehicleArt(name) {
  const n = name.toLowerCase();
  if (n.includes('sedan') || n.includes('limo') || n.includes('muscle')) {
    const c = n.includes('muscle') ? '#dc2626' : n.includes('limo') ? '#18181b' : '#71717a';
    return `<g transform="translate(256,270)"><rect x="-120" y="-30" width="240" height="50" rx="12" fill="${c}"/><rect x="-80" y="-55" width="160" height="30" rx="8" fill="${c}" opacity="0.85"/><circle cx="-70" cy="25" r="28" fill="#111"/><circle cx="70" cy="25" r="28" fill="#111"/><circle cx="-70" cy="25" r="14" fill="#374151"/><circle cx="70" cy="25" r="14" fill="#374151"/></g>`;
  }
  if (n.includes('suv') || n.includes('rig') || n.includes('fortress')) return `<g transform="translate(256,265)"><rect x="-110" y="-45" width="220" height="65" rx="10" fill="#1f2937" stroke="#4b5563"/><rect x="-75" y="-75" width="150" height="35" rx="6" fill="#374151"/><circle cx="-65" cy="25" r="30" fill="#111"/><circle cx="65" cy="25" r="30" fill="#111"/></g>`;
  if (n.includes('boat') || n.includes('yacht')) return `<g transform="translate(256,280)"><path d="M-130,0 Q0,-60 130,0 L110,30 L-110,30 Z" fill="${n.includes('yacht') ? '#f5f5f4' : '#0284c7'}" stroke="#0369a1"/><rect x="-15" y="-80" width="30" height="50" fill="#78350f"/></g>`;
  if (n.includes('helicopter')) return `<g transform="translate(256,250)"><ellipse cx="0" cy="0" rx="80" ry="35" fill="#0369a1"/><rect x="-15" y="-60" width="30" height="60" fill="#374151"/><line x1="-140" y1="-60" x2="140" y2="-60" stroke="#64748b" stroke-width="6"/><ellipse cx="0" cy="-60" rx="140" ry="12" fill="none" stroke="#94a3b8" stroke-width="3" opacity="0.6"/></g>`;
  if (n.includes('jet') || n.includes('shuttle')) return `<g transform="translate(256,260)"><ellipse cx="0" cy="0" rx="120" ry="25" fill="#e2e8f0"/><polygon points="0,-50 -40,0 0,20 40,0" fill="#6366f1"/><polygon points="-120,0 -160,-30 -160,30" fill="#94a3b8"/><polygon points="120,0 160,-40 160,40" fill="#94a3b8"/></g>`;
  if (n.includes('tank')) return `<g transform="translate(256,270)"><rect x="-100" y="-35" width="200" height="55" rx="6" fill="#422006"/><circle cx="0" cy="-10" r="30" fill="#78350f"/><rect x="30" y="-15" width="80" height="12" rx="3" fill="#57534e"/><rect x="-110" y="20" width="220" height="20" rx="4" fill="#292524"/></g>`;
  if (n.includes('bike')) return `<g transform="translate(256,270)"><circle cx="-50" cy="20" r="40" fill="none" stroke="#09090b" stroke-width="10"/><circle cx="50" cy="20" r="40" fill="none" stroke="#09090b" stroke-width="10"/><path d="M-50,-10 L0,-50 L50,-10 L50,20" fill="none" stroke="#dc2626" stroke-width="8"/></g>`;
  if (n.includes('submarine')) return `<g transform="translate(256,260)"><ellipse cx="0" cy="0" rx="120" ry="40" fill="#164e63" stroke="#0891b2"/><rect x="-10" y="-55" width="20" height="40" fill="#374151"/><circle cx="40" cy="-5" r="12" fill="#06b6d4" opacity="0.8"/></g>`;
  if (n.includes('train') || n.includes('ghost')) return `<g transform="translate(256,270)"><rect x="-120" y="-40" width="240" height="60" rx="8" fill="#78350f" stroke="#92400e"/><rect x="-100" y="-60" width="60" height="25" rx="4" fill="#a16207" opacity="0.7"/><circle cx="-70" cy="25" r="18" fill="#111"/><circle cx="70" cy="25" r="18" fill="#111"/></g>`;
  return `<g transform="translate(256,270)"><rect x="-100" y="-25" width="200" height="45" rx="10" fill="#71717a"/><circle cx="-60" cy="22" r="24" fill="#111"/><circle cx="60" cy="22" r="24" fill="#111"/></g>`;
}

// ── Property art ──
function propertyArt(name) {
  const n = name.toLowerCase();
  if (n.includes('store') || n.includes('laundromat')) return `<g transform="translate(256,260)"><rect x="-80" y="-60" width="160" height="110" fill="#84cc16" stroke="#65a30d"/><rect x="-60" y="-30" width="50" height="40" fill="#422006" opacity="0.3"/><rect x="10" y="-30" width="50" height="40" fill="#422006" opacity="0.3"/><rect x="-20" y="10" width="40" height="40" fill="#78350f"/></g>`;
  if (n.includes('pool') || n.includes('club')) return `<g transform="translate(256,260)"><rect x="-90" y="-50" width="180" height="90" fill="#c026d3" stroke="#a21caf"/><circle cx="-40" cy="10" r="15" fill="#fbbf24" opacity="0.8"/><circle cx="40" cy="10" r="15" fill="#fbbf24" opacity="0.8"/></g>`;
  if (n.includes('warehouse') || n.includes('port') || n.includes('refinery')) return `<g transform="translate(256,250)"><rect x="-110" y="-40" width="220" height="90" fill="#78716c"/><polygon points="-110,-40 0,-80 110,-40" fill="#57534e"/><rect x="-30" y="10" width="60" height="40" fill="#422006"/></g>`;
  if (n.includes('casino') || n.includes('hotel') || n.includes('tower') || n.includes('hq') || n.includes('conglomerate')) return `<g transform="translate(256,240)"><rect x="-60" y="-20" width="120" height="140" fill="#6366f1" stroke="#818cf8"/><rect x="-45" y="0" width="30" height="25" fill="#fbbf24" opacity="0.6"/><rect x="15" y="0" width="30" height="25" fill="#fbbf24" opacity="0.6"/><rect x="-45" y="35" width="30" height="25" fill="#fbbf24" opacity="0.6"/><rect x="15" y="35" width="30" height="25" fill="#fbbf24" opacity="0.6"/></g>`;
  if (n.includes('island')) return `<g transform="translate(256,280)"><ellipse cx="0" cy="20" rx="120" ry="40" fill="#06b6d4"/><ellipse cx="0" cy="0" rx="60" ry="50" fill="#22c55e"/><path d="M-20,-30 L0,-70 L20,-30" fill="#78350f"/></g>`;
  if (n.includes('satellite') || n.includes('bank')) return `<g transform="translate(256,250)"><circle cx="0" cy="-30" r="50" fill="#8b5cf6" stroke="#a78bfa"/><rect x="-8" y="20" width="16" height="60" fill="#64748b"/><line x1="-80" y1="-30" x2="80" y2="-30" stroke="#c4b5fd" stroke-width="4"/></g>`;
  return `<g transform="translate(256,260)"><rect x="-70" y="-50" width="140" height="100" fill="#eab308" stroke="#ca8a04"/><rect x="-20" y="10" width="40" height="40" fill="#78350f"/></g>`;
}

// ── Consumable art ──
function consumableArt(name, id) {
  const n = name.toLowerCase();
  if (n.includes('energy')) return `<g transform="translate(256,250)"><rect x="-50" y="-60" width="100" height="120" rx="12" fill="#1d4ed8" stroke="#3b82f6" stroke-width="3"/><path d="M-5,-40 L-5,10 L25,10 L-15,60 L-5,20 L-35,20 Z" fill="#fbbf24"/></g>`;
  if (n.includes('stamina')) return `<g transform="translate(256,250)"><ellipse cx="0" cy="10" rx="55" ry="70" fill="#15803d" stroke="#22c55e" stroke-width="3"/><rect x="-40" y="-50" width="80" height="25" rx="8" fill="#166534"/><text x="0" y="20" text-anchor="middle" fill="#bbf7d0" font-size="36">💪</text></g>`;
  if (n.includes('health')) return `<g transform="translate(256,250)"><rect x="-60" y="-40" width="120" height="90" rx="8" fill="#dc2626" stroke="#ef4444"/><rect x="-40" y="-20" width="80" height="50" rx="4" fill="#fef2f2" opacity="0.9"/><line x1="0" y1="-5" x2="0" y2="25" stroke="#dc2626" stroke-width="8"/><line x1="-15" y1="10" x2="15" y2="10" stroke="#dc2626" stroke-width="8"/></g>`;
  if (n.includes('mob') || n.includes('contract')) return `<g transform="translate(256,250)"><rect x="-70" y="-50" width="140" height="100" rx="6" fill="#f5f5f4" stroke="#a855f7" stroke-width="3"/><line x1="-50" y1="-20" x2="50" y2="-20" stroke="#7c3aed" stroke-width="2"/><line x1="-50" y1="0" x2="30" y2="0" stroke="#7c3aed" stroke-width="2"/><line x1="-50" y1="20" x2="40" y2="20" stroke="#7c3aed" stroke-width="2"/><circle cx="45" cy="-35" r="18" fill="#a855f7"/></g>`;
  if (n.includes('ice')) return `<g transform="translate(256,250)"><rect x="-55" y="-55" width="110" height="110" rx="12" fill="#06b6d4" stroke="#22d3ee" stroke-width="3" opacity="0.85"/><polygon points="0,-35 -20,15 20,15" fill="#ecfeff" opacity="0.9"/><polygon points="0,35 -20,-15 20,-15" fill="#ecfeff" opacity="0.7"/></g>`;
  if (n.includes('xp') || n.includes('boost')) return `<g transform="translate(256,250)"><polygon points="0,-70 20,-20 70,-20 30,10 45,60 0,35 -45,60 -30,10 -70,-20 -20,-20" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/></g>`;
  return `<g transform="translate(256,250)"><circle cx="0" cy="0" r="60" fill="#6366f1" stroke="#818cf8"/></g>`;
}

// ── Boss art ──
function bossArt(name) {
  const n = name.toLowerCase();
  const skin = n.includes('godfather') ? '#fcd34d' : n.includes('syndicate') ? '#7c3aed' : n.includes('crime') ? '#dc2626' : n.includes('district') ? '#6366f1' : '#78716c';
  return `<g transform="translate(256,240)"><ellipse cx="0" cy="30" rx="80" ry="90" fill="#1f2937" stroke="${skin}" stroke-width="3"/><circle cx="0" cy="-40" r="55" fill="${skin}"/><rect x="-50" y="-55" width="100" height="20" rx="4" fill="#111"/><circle cx="-18" cy="-45" r="6" fill="#111"/><circle cx="18" cy="-45" r="6" fill="#111"/><path d="M-20,-25 Q0,-10 20,-25" fill="none" stroke="#111" stroke-width="3"/><polygon points="-60,30 -80,100 -40,100" fill="#111"/><polygon points="60,30 80,100 40,100" fill="#111"/></g>`;
}

// ── Territory art ──
function territoryArt(name, color) {
  return `<g transform="translate(256,260)"><path d="M0,-90 L-100,40 L-40,90 L40,90 L100,40 Z" fill="${color}" stroke="#fbbf24" stroke-width="3" opacity="0.9"/><circle cx="0" cy="10" r="30" fill="#0a0a0f" opacity="0.5"/><text x="0" y="20" text-anchor="middle" fill="#fef3c7" font-size="24">⚑</text></g>`;
}

// ── Job art ──
function jobArt(name) {
  const n = name.toLowerCase();
  if (n.includes('pickpocket') || n.includes('mug')) return `<g transform="translate(256,250)"><ellipse cx="30" cy="20" rx="50" ry="35" fill="#78350f" stroke="#92400e"/><rect x="-70" y="-30" width="60" height="40" rx="4" fill="#22c55e" stroke="#16a34a"/><circle cx="-40" cy="-10" r="15" fill="#fbbf24"/></g>`;
  if (n.includes('fence') || n.includes('counterfeit')) return `<g transform="translate(256,250)"><rect x="-70" y="-40" width="140" height="90" fill="#57534e" stroke="#78716c"/><rect x="-50" y="-20" width="100" height="50" fill="#22c55e" opacity="0.8"/><text x="0" y="15" text-anchor="middle" fill="#052e16" font-size="32" font-weight="bold">$</text></g>`;
  if (n.includes('extortion') || n.includes('shakedown')) return `<g transform="translate(256,250)"><circle cx="0" cy="-20" r="45" fill="#78716c"/><rect x="-60" y="30" width="120" height="50" rx="6" fill="#374151"/><text x="0" y="65" text-anchor="middle" fill="#ef4444" font-size="28">!</text></g>`;
  if (n.includes('heist') || n.includes('warehouse') || n.includes('truck') || n.includes('bank')) return `<g transform="translate(256,250)"><rect x="-60" y="-30" width="120" height="80" rx="6" fill="#422006" stroke="#78350f"/><circle cx="0" cy="10" r="25" fill="#1f2937" stroke="#fbbf24" stroke-width="4"/><rect x="-8" y="-5" width="16" height="30" fill="#fbbf24"/></g>`;
  if (n.includes('smuggle') || n.includes('dock')) return `<g transform="translate(256,280)"><rect x="-80" y="-20" width="160" height="40" fill="#78350f" stroke="#92400e"/><rect x="-30" y="-50" width="60" height="35" fill="#374151"/></g>`;
  if (n.includes('casino') || n.includes('scam')) return `<g transform="translate(256,250)"><rect x="-50" y="-50" width="100" height="100" rx="8" fill="#15803d" stroke="#22c55e"/><circle cx="0" cy="0" r="30" fill="#ef4444"/><circle cx="0" cy="0" r="20" fill="#111"/><text x="0" y="8" text-anchor="middle" fill="#fbbf24" font-size="20">7</text></g>`;
  if (n.includes('diamond') || n.includes('art')) return `<g transform="translate(256,250)"><polygon points="0,-60 -40,20 0,60 40,20" fill="#06b6d4" stroke="#22d3ee" stroke-width="2"/><polygon points="0,-30 -20,10 0,30 20,10" fill="#ecfeff" opacity="0.8"/></g>`;
  if (n.includes('syndicate') || n.includes('takeover') || n.includes('arms')) return `<g transform="translate(256,250)"><circle cx="0" cy="0" r="70" fill="none" stroke="#ef4444" stroke-width="6"/><circle cx="0" cy="0" r="20" fill="#dc2626"/><line x1="0" y1="-70" x2="0" y2="-100" stroke="#ef4444" stroke-width="4"/><line x1="0" y1="70" x2="0" y2="100" stroke="#ef4444" stroke-width="4"/><line x1="-70" y1="0" x2="-100" y2="0" stroke="#ef4444" stroke-width="4"/><line x1="70" y1="0" x2="100" y2="0" stroke="#ef4444" stroke-width="4"/></g>`;
  return `<g transform="translate(256,250)"><rect x="-50" y="-40" width="100" height="70" rx="6" fill="#422006" stroke="#78350f"/><rect x="-35" y="-55" width="70" height="20" rx="4" fill="#57534e"/><circle cx="0" cy="-10" r="18" fill="#fbbf24" opacity="0.8"/></g>`;
}

// ── Location art ──
function locationArt(name, color) {
  return `<g transform="translate(256,260)"><path d="M0,-100 C-60,-100 -90,-40 -90,10 C-90,60 0,110 0,110 C0,110 90,60 90,10 C90,-40 60,-100 0,-100 Z" fill="${color}" stroke="#fbbf24" stroke-width="3" opacity="0.95"/><circle cx="0" cy="5" r="28" fill="#0a0a0f" opacity="0.45"/><circle cx="0" cy="5" r="14" fill="#fef3c7" opacity="0.9"/></g>`;
}

export function renderItemSvg(category, item) {
  const name = item.name || item.id || 'Item';
  const color = item.color || '#6366f1';
  const tier = item.tier || 1;
  let body;

  switch (category) {
    case 'weapon': body = weaponArt(name); break;
    case 'armor': body = armorArt(name); break;
    case 'vehicle': body = vehicleArt(name); break;
    case 'property': body = propertyArt(name); break;
    case 'consumable': body = consumableArt(name, item.id); break;
    case 'boss': body = bossArt(name); break;
    case 'territory': body = territoryArt(name, color); break;
    case 'job': body = jobArt(name); break;
    case 'location': body = locationArt(name, color); break;
    default: body = `<circle cx="256" cy="240" r="70" fill="${color}" stroke="#fbbf24" stroke-width="3"/>`;
  }

  return wrap(category, name, color, tier, body);
}
