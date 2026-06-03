/** Premium SVG item art (1024×1024) — cinematic game icon style */

const SIZE = 1024;

function uid(category, id) {
  return `${category}_${String(id).replace(/\W/g, '')}`;
}

function wrap(category, id, color, tier, body) {
  const u = uid(category, id);
  const accent = tier >= 4 ? '#fbbf24' : tier >= 2 ? '#c4b5fd' : '#94a3b8';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg_${u}" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#12121c"/>
      <stop offset="100%" stop-color="#06060a"/>
    </radialGradient>
    <radialGradient id="spot_${u}" cx="35%" cy="28%" r="45%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor_${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow_${u}"><feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000" flood-opacity="0.65"/></filter>
    <filter id="glow_${u}"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg_${u})"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#spot_${u})"/>
  <ellipse cx="512" cy="860" rx="320" ry="48" fill="url(#floor_${u})"/>
  <ellipse cx="512" cy="870" rx="220" ry="28" fill="#000" opacity="0.45"/>
  <g filter="url(#shadow_${u})">${body}</g>
  <rect x="48" y="48" width="${SIZE - 96}" height="${SIZE - 96}" rx="56" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="4"/>
</svg>`;
}

function metal(id, c1, c2, c3) {
  const u = id.replace(/\W/g, '');
  return `<linearGradient id="m_${u}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="50%" stop-color="${c2}"/><stop offset="100%" stop-color="${c3}"/></linearGradient>`;
}

function gloss(id, c1, c2) {
  const u = id.replace(/\W/g, '');
  return `<linearGradient id="g_${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>`;
}

const ITEM_ART = {
  w_rusty_knife: (u) => `<defs>${metal(u, '#e8edf4', '#9ca3af', '#4b5563')}</defs><g transform="translate(512,480) rotate(-38)"><path d="M0,-320 L-28,-120 L28,-120 Z" fill="url(#m_${u.replace(/\W/g, '')})" stroke="#6b7280" stroke-width="3"/><rect x="-22" y="-120" width="44" height="180" rx="8" fill="url(#m_${u.replace(/\W/g, '')})"/><rect x="-36" y="60" width="72" height="110" rx="10" fill="#5c3d2e" stroke="#3f2d20"/><rect x="-44" y="165" width="88" height="24" rx="6" fill="#78350f"/></g>`,
  w_baseball_bat: (u) => `<g transform="translate(512,500) rotate(28)"><defs><linearGradient id="w_${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d4a574"/><stop offset="40%" stop-color="#92400e"/><stop offset="100%" stop-color="#5c2e0a"/></linearGradient></defs><ellipse cx="0" cy="-200" rx="56" ry="210" fill="url(#w_${u})" stroke="#78350f" stroke-width="5"/><rect x="-28" y="10" width="56" height="200" rx="14" fill="url(#w_${u})"/><ellipse cx="0" cy="230" rx="42" ry="28" fill="#5c2e0a"/></g>`,
  w_switchblade: (u) => `<g transform="translate(512,490) rotate(-25)"><polygon points="0,-280 -24,-80 24,-80" fill="#d1d5db" stroke="#6b7280" stroke-width="3"/><rect x="-14" y="-80" width="28" height="120" fill="#9ca3af"/><rect x="-40" y="40" width="80" height="120" rx="8" fill="#1f2937" stroke="#374151"/><circle cx="0" cy="100" r="16" fill="#4b5563"/></g>`,
  w_brass_knuckles: (u) => `<g transform="translate(512,500)"><ellipse cx="0" cy="0" rx="200" ry="120" fill="#78716c" stroke="#44403c" stroke-width="8"/><circle cx="-110" cy="-30" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/><circle cx="-35" cy="-55" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/><circle cx="35" cy="-55" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/><circle cx="110" cy="-30" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/></g>`,
  w_street_revolver: (u) => `<g transform="translate(512,500)"><rect x="-200" y="-30" width="280" height="60" rx="12" fill="#374151" stroke="#1f2937"/><rect x="80" y="-50" width="140" height="100" rx="16" fill="#111827" stroke="#4b5563"/><circle cx="150" cy="0" r="56" fill="#0f172a" stroke="#6b7280" stroke-width="6"/><rect x="-240" y="-16" width="60" height="32" rx="6" fill="#78350f"/></g>`,
  energy_pack: () => `<g transform="translate(512,490)"><rect x="-120" y="-160" width="240" height="300" rx="28" fill="#1d4ed8" stroke="#60a5fa" stroke-width="6"/><path d="M-20,-80 L-20,40 L60,40 L-40,160 L-20,20 L-100,20 Z" fill="#fde047" stroke="#fbbf24" stroke-width="4" filter="url(#glow_${uid('consumable', 'energy')})"/></g>`,
  stamina_drink: () => `<g transform="translate(512,500)"><rect x="-80" y="-180" width="160" height="60" rx="20" fill="#166534"/><ellipse cx="0" cy="40" rx="100" ry="140" fill="#15803d" stroke="#4ade80" stroke-width="6"/><ellipse cx="0" cy="60" rx="60" ry="90" fill="#22c55e" opacity="0.5"/></g>`,
  health_kit: () => `<g transform="translate(512,500)"><rect x="-160" y="-100" width="320" height="220" rx="20" fill="#dc2626" stroke="#fca5a5" stroke-width="6"/><rect x="-120" y="-60" width="240" height="140" rx="12" fill="#fef2f2"/><rect x="-20" y="-20" width="40" height="100" rx="6" fill="#ef4444"/><rect x="-60" y="20" width="120" height="40" rx="6" fill="#ef4444"/></g>`,
};

function weaponArt(n, key) {
  if (n.includes('bat')) return ITEM_ART.w_baseball_bat(key);
  if (n.includes('knife') || n.includes('blade')) return ITEM_ART.w_rusty_knife(key);
  if (n.includes('knuckle')) return ITEM_ART.w_brass_knuckles(key);
  if (n.includes('revolver') || n.includes('pistol')) return ITEM_ART.w_street_revolver(key);
  if (n.includes('shotgun'))
    return `<g transform="translate(512,500)"><rect x="-300" y="-20" width="360" height="40" rx="8" fill="#78350f"/><rect x="60" y="-50" width="180" height="100" rx="12" fill="#111827" stroke="#6b7280" stroke-width="5"/><rect x="240" y="-30" width="80" height="60" rx="8" fill="#374151"/></g>`;
  if (n.includes('smg') || n.includes('rifle') || n.includes('sniper'))
    return `<g transform="translate(512,500)"><rect x="-280" y="-24" width="440" height="48" rx="8" fill="#374151"/><rect x="160" y="-40" width="140" height="80" rx="10" fill="#111827" stroke="#6b7280" stroke-width="4"/><rect x="-120" y="24" width="50" height="100" rx="8" fill="#78350f"/><circle cx="-90" cy="74" r="20" fill="#1f2937"/></g>`;
  if (n.includes('cannon') || n.includes('destroyer') || n.includes('annihilator'))
    return `<g transform="translate(512,500)"><rect x="-320" y="-40" width="420" height="80" rx="16" fill="#450a0a" stroke="#fbbf24" stroke-width="6"/><circle cx="120" cy="0" r="70" fill="#111827" stroke="#ef4444" stroke-width="8"/><rect x="-360" y="-20" width="60" height="40" rx="6" fill="#78350f"/></g>`;
  if (n.includes('hammer'))
    return `<g transform="translate(512,480) rotate(-20)"><rect x="-30" y="-60" width="60" height="280" rx="12" fill="#78350f"/><rect x="-120" y="-160" width="240" height="100" rx="20" fill="#44403c" stroke="#78716c" stroke-width="6"/></g>`;
  if (n.includes('golden') || n.includes('godfather'))
    return `<g transform="translate(512,500)"><rect x="-180" y="-30" width="260" height="60" rx="14" fill="#eab308" stroke="#fbbf24" stroke-width="5"/><rect x="80" y="-50" width="120" height="100" rx="14" fill="#ca8a04" stroke="#fde047"/><circle cx="140" cy="0" r="50" fill="#422006" stroke="#fbbf24" stroke-width="5"/></g>`;
  if (n.includes('plasma'))
    return `<g transform="translate(512,490) rotate(-15)"><rect x="-240" y="-18" width="360" height="36" rx="6" fill="#1e293b" stroke="#06b6d4" stroke-width="4"/><circle cx="140" cy="0" r="40" fill="#0891b2" filter="url(#glow_${uid('weapon', 'plasma')})"/><path d="M-280,-80 L-200,80 L-160,-60 Z" fill="#22d3ee" opacity="0.8"/></g>`;
  return `<g transform="translate(512,500)"><rect x="-280" y="-24" width="440" height="48" rx="8" fill="#374151"/><rect x="160" y="-40" width="140" height="80" rx="10" fill="#111827" stroke="#6b7280" stroke-width="4"/><rect x="-120" y="24" width="50" height="100" rx="8" fill="#78350f"/></g>`;
}

function armorArt(n, key, tier) {
  const u = key.replace(/\W/g, '');
  const gold = tier >= 4;
  if (n.includes('leather'))
    return `<defs>${gloss(u, '#57534e', '#292524')}</defs><g transform="translate(512,500)"><path d="M-200,-180 L200,-180 L240,80 L140,220 L-140,220 L-240,80 Z" fill="url(#g_${u})" stroke="#78350f" stroke-width="8"/><path d="M-70,-180 L70,-180 L70,220 L-70,220 Z" fill="#44403c" opacity="0.6"/><rect x="-180" y="-120" width="360" height="24" rx="8" fill="#292524"/></g>`;
  if (n.includes('kevlar') || n.includes('tactical') || n.includes('ballistic'))
    return `<g transform="translate(512,500)"><path d="M-190,-170 L190,-170 L230,100 L130,210 L-130,210 L-230,100 Z" fill="#334155" stroke="#64748b" stroke-width="6"/><rect x="-160" y="-80" width="320" height="180" rx="8" fill="#166534" opacity="0.35"/><rect x="-140" y="-40" width="80" height="100" rx="4" fill="#475569"/><rect x="60" y="-40" width="80" height="100" rx="4" fill="#475569"/></g>`;
  if (n.includes('helmet') || n.includes('riot'))
    return `<g transform="translate(512,470)"><ellipse cx="0" cy="40" rx="180" ry="200" fill="${n.includes('riot') ? '#1e3a8a' : '#374151'}" stroke="#64748b" stroke-width="8"/><rect x="-160" y="80" width="320" height="80" rx="20" fill="#1f2937"/><rect x="-120" y="-60" width="240" height="40" rx="8" fill="#111827" opacity="0.8"/></g>`;
  if (n.includes('dragon') || n.includes('scale'))
    return `<g transform="translate(512,500)"><path d="M-200,-160 L200,-160 L220,120 L120,210 L-120,210 L-220,120 Z" fill="#7c2d12" stroke="#fbbf24" stroke-width="6"/><g fill="#dc2626" opacity="0.85">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${-140 + i * 40}" cy="${-80 + (i % 2) * 40}" rx="28" ry="20"/>`).join('')}</g></g>`;
  if (n.includes('phantom') || n.includes('shadow') || n.includes('void'))
    return `<g transform="translate(512,500)"><path d="M-180,-200 L180,-200 L200,100 L100,240 L-100,240 L-200,100 Z" fill="#0f172a" stroke="#6366f1" stroke-width="6" opacity="0.95"/><path d="M-60,-200 L60,-200 L40,240 L-40,240 Z" fill="#312e81" opacity="0.5"/></g>`;
  if (n.includes('titan') || n.includes('fortress') || n.includes('aegis'))
    return `<g transform="translate(512,500)"><path d="M-220,-140 L220,-140 L260,80 L160,230 L-160,230 L-260,80 Z" fill="#44403c" stroke="${gold ? '#fbbf24' : '#94a3b8'}" stroke-width="10"/><rect x="-180" y="-80" width="360" height="120" rx="12" fill="#57534e"/><circle cx="0" cy="-20" r="50" fill="${gold ? '#eab308' : '#64748b'}"/></g>`;
  if (n.includes('legend') || n.includes('emperor') || n.includes('immortal'))
    return `<g transform="translate(512,500)"><path d="M-200,-170 L200,-170 L240,90 L140,220 L-140,220 L-240,90 Z" fill="#854d0e" stroke="#fbbf24" stroke-width="8"/><path d="M0,-170 L80,220 L-80,220 Z" fill="#fde047" opacity="0.35"/><circle cx="0" cy="20" r="70" fill="#ca8a04" stroke="#fef3c7" stroke-width="6"/></g>`;
  return `<g transform="translate(512,500)"><path d="M-180,-160 L180,-160 L220,120 L120,200 L-120,200 L-220,120 Z" fill="#334155" stroke="#64748b" stroke-width="6"/><path d="M-60,-160 L60,-160 L60,200 L-60,200 Z" fill="#475569" opacity="0.8"/><rect x="-100" y="-40" width="200" height="80" rx="8" fill="#1e293b" opacity="0.5"/></g>`;
}

function vehicleArt(n, key) {
  if (n.includes('sedan') || n.includes('limo'))
    return `<g transform="translate(512,560)"><rect x="-260" y="-50" width="520" height="90" rx="20" fill="${n.includes('limo') ? '#18181b' : '#71717a'}" stroke="#111"/><rect x="-180" y="-130" width="360" height="80" rx="18" fill="${n.includes('limo') ? '#27272a' : '#52525b'}"/><circle cx="-150" cy="45" r="58" fill="#111" stroke="#333" stroke-width="8"/><circle cx="150" cy="45" r="58" fill="#111" stroke="#333" stroke-width="8"/></g>`;
  if (n.includes('muscle'))
    return `<g transform="translate(512,560)"><rect x="-270" y="-40" width="540" height="85" rx="18" fill="#dc2626" stroke="#7f1d1d"/><rect x="-160" y="-120" width="320" height="75" rx="14" fill="#ef4444"/><circle cx="-140" cy="50" r="60" fill="#111" stroke="#450a0a" stroke-width="8"/><circle cx="140" cy="50" r="60" fill="#111" stroke="#450a0a" stroke-width="8"/><rect x="-80" y="-110" width="160" height="20" rx="4" fill="#fde047" opacity="0.6"/></g>`;
  if (n.includes('suv') || n.includes('rig') || n.includes('fortress'))
    return `<g transform="translate(512,550)"><rect x="-280" y="-80" width="560" height="140" rx="24" fill="#1f2937" stroke="#64748b" stroke-width="6"/><rect x="-200" y="-160" width="400" height="90" rx="16" fill="#374151"/><circle cx="-160" cy="70" r="64" fill="#111" stroke="#444" stroke-width="10"/><circle cx="160" cy="70" r="64" fill="#111" stroke="#444" stroke-width="10"/></g>`;
  if (n.includes('boat') || n.includes('yacht'))
    return `<g transform="translate(512,540)"><path d="M-280,40 Q0,-120 280,40 L240,120 L-240,120 Z" fill="${n.includes('yacht') ? '#f5f5f4' : '#0284c7'}" stroke="#0c4a6e" stroke-width="6"/><rect x="-60" y="-80" width="120" height="100" rx="8" fill="#e2e8f0" opacity="0.9"/><path d="M0,-180 L0,-80" stroke="#94a3b8" stroke-width="8"/></g>`;
  if (n.includes('helicopter') || n.includes('jet') || n.includes('shuttle'))
    return `<g transform="translate(512,500)"><ellipse cx="0" cy="40" rx="220" ry="50" fill="${n.includes('jet') ? '#e2e8f0' : '#0369a1'}" stroke="#64748b" stroke-width="5"/><rect x="-180" y="-20" width="360" height="60" rx="12" fill="#374151"/><path d="M-280,20 L280,20" stroke="#94a3b8" stroke-width="10"/><circle cx="0" cy="-80" r="80" fill="#0891b2" opacity="0.5"/></g>`;
  if (n.includes('bike') || n.includes('train'))
    return `<g transform="translate(512,540)"><circle cx="-120" cy="60" r="70" fill="#111" stroke="#444" stroke-width="10"/><circle cx="120" cy="60" r="70" fill="#111" stroke="#444" stroke-width="10"/><path d="M-120,60 L0,-80 L120,60" stroke="${n.includes('train') ? '#78350f' : '#09090b'}" stroke-width="24" fill="none" stroke-linecap="round"/></g>`;
  if (n.includes('submarine'))
    return `<g transform="translate(512,520)"><ellipse cx="0" cy="20" rx="260" ry="90" fill="#164e63" stroke="#06b6d4" stroke-width="6"/><rect x="-40" y="-120" width="80" height="140" rx="20" fill="#0e7490"/><circle cx="180" cy="20" r="24" fill="#22d3ee"/></g>`;
  if (n.includes('tank'))
    return `<g transform="translate(512,550)"><rect x="-280" y="-20" width="560" height="100" rx="16" fill="#422006" stroke="#78350f" stroke-width="6"/><rect x="80" y="-40" width="220" height="50" rx="8" fill="#57534e"/><circle cx="-160" cy="90" r="55" fill="#111" stroke="#444" stroke-width="8"/><circle cx="80" cy="90" r="55" fill="#111" stroke="#444" stroke-width="8"/><circle cx="220" cy="90" r="55" fill="#111" stroke="#444" stroke-width="8"/></g>`;
  return `<g transform="translate(512,560)"><rect x="-240" y="-60" width="480" height="100" rx="24" fill="#374151" stroke="#111"/><rect x="-160" y="-120" width="320" height="70" rx="16" fill="#4b5563"/><circle cx="-140" cy="50" r="56" fill="#111" stroke="#333" stroke-width="8"/><circle cx="140" cy="50" r="56" fill="#111" stroke="#333" stroke-width="8"/></g>`;
}

function propertyArt(n, key, tier) {
  const accent = tier >= 4 ? '#fbbf24' : '#818cf8';
  if (n.includes('corner') || n.includes('store'))
    return `<g transform="translate(512,520)"><rect x="-150" y="-120" width="300" height="240" rx="8" fill="#84cc16" stroke="${accent}" stroke-width="5"/><rect x="-110" y="-60" width="70" height="50" rx="4" fill="#fef3c7"/><rect x="40" y="-60" width="70" height="50" rx="4" fill="#fef3c7"/><rect x="-50" y="40" width="100" height="80" fill="#365314"/><rect x="-130" y="-140" width="260" height="30" rx="6" fill="#ef4444"/></g>`;
  if (n.includes('laundromat') || n.includes('pool'))
    return `<g transform="translate(512,520)"><rect x="-160" y="-100" width="320" height="220" rx="10" fill="#22d3ee" stroke="${accent}" stroke-width="5"/><circle cx="-60" cy="20" r="50" fill="#e0f2fe" stroke="#0891b2" stroke-width="4"/><circle cx="80" cy="20" r="50" fill="#e0f2fe" stroke="#0891b2" stroke-width="4"/></g>`;
  if (n.includes('club') || n.includes('casino'))
    return `<g transform="translate(512,500)"><rect x="-180" y="-80" width="360" height="260" rx="12" fill="${n.includes('casino') ? '#eab308' : '#c026d3'}" stroke="${accent}" stroke-width="6"/><circle cx="0" cy="40" r="80" fill="#fde047" opacity="0.8"/><text x="0" y="55" text-anchor="middle" font-size="72" fill="#422006" font-family="serif">7</text></g>`;
  if (n.includes('warehouse') || n.includes('port') || n.includes('refinery'))
    return `<g transform="translate(512,510)"><rect x="-200" y="-60" width="400" height="200" rx="8" fill="#78716c" stroke="${accent}" stroke-width="5"/><polygon points="-200,-60 0,-180 200,-60" fill="#57534e"/><rect x="-160" y="20" width="80" height="100" fill="#1f2937"/><rect x="80" y="20" width="80" height="100" fill="#1f2937"/></g>`;
  if (n.includes('hotel') || n.includes('tower') || n.includes('skyline') || n.includes('hq'))
    return `<g transform="translate(512,480)"><rect x="-120" y="-200" width="240" height="380" rx="8" fill="#6366f1" stroke="${accent}" stroke-width="6"/><rect x="-90" y="-160" width="50" height="40" rx="4" fill="#fde047" opacity="0.7"/><rect x="40" y="-120" width="50" height="40" rx="4" fill="#fde047" opacity="0.7"/><rect x="-90" y="-40" width="50" height="40" rx="4" fill="#fde047" opacity="0.7"/><rect x="40" y="0" width="50" height="40" rx="4" fill="#fde047" opacity="0.7"/></g>`;
  if (n.includes('island') || n.includes('satellite') || n.includes('bank'))
    return `<g transform="translate(512,520)"><ellipse cx="0" cy="80" rx="220" ry="80" fill="${n.includes('island') ? '#06b6d4' : '#8b5cf6'}" opacity="0.6"/><rect x="-100" y="-100" width="200" height="180" rx="16" fill="${n.includes('bank') ? '#fbbf24' : '#f5f5f4'}" stroke="${accent}" stroke-width="6"/><polygon points="0,-140 30,-80 -30,-80" fill="#ef4444" opacity="0.8"/></g>`;
  if (n.includes('media'))
    return `<g transform="translate(512,500)"><rect x="-180" y="-100" width="360" height="240" rx="12" fill="#a855f7" stroke="${accent}" stroke-width="5"/><rect x="-140" y="-60" width="280" height="160" rx="8" fill="#1e1b4b"/><circle cx="0" cy="20" r="50" fill="#fde047"/></g>`;
  return `<g transform="translate(512,520)"><rect x="-160" y="-140" width="320" height="260" rx="12" fill="#6366f1" stroke="${accent}" stroke-width="5"/><rect x="-120" y="-80" width="80" height="60" rx="4" fill="#fbbf24" opacity="0.7"/><rect x="40" y="-80" width="80" height="60" rx="4" fill="#fbbf24" opacity="0.7"/><rect x="-40" y="40" width="80" height="80" fill="#312e81"/></g>`;
}

function jobArt(id, name) {
  const slug = id.includes('_') ? id.slice(id.indexOf('_') + 1) : id;
  const n = name.toLowerCase();
  if (slug.includes('pickpocket') || n.includes('pickpocket'))
    return `<g transform="translate(512,500)"><ellipse cx="80" cy="40" rx="100" ry="60" fill="#fde047" opacity="0.9"/><rect x="-60" y="-20" width="120" height="80" rx="8" fill="#422006" stroke="#fbbf24" stroke-width="4"/><path d="M-120,60 Q-40,0 40,60" stroke="#fbbf24" stroke-width="12" fill="none" stroke-linecap="round"/></g>`;
  if (slug.includes('mug') || n.includes('mug'))
    return `<g transform="translate(512,500)"><circle cx="-60" cy="-40" r="50" fill="#78716c"/><rect x="-100" y="20" width="200" height="140" rx="20" fill="#1f2937" stroke="#ef4444" stroke-width="5"/><rect x="60" y="-80" width="80" height="100" rx="8" fill="#422006" stroke="#fbbf24" stroke-width="4"/></g>`;
  if (slug.includes('fence') || n.includes('fence'))
    return `<g transform="translate(512,500)"><rect x="-140" y="-60" width="280" height="180" rx="12" fill="#57534e" stroke="#fbbf24" stroke-width="4"/><circle cx="-60" cy="30" r="40" fill="#fde047"/><rect x="20" y="-20" width="80" height="100" rx="8" fill="#78350f"/></g>`;
  if (slug.includes('extortion') || n.includes('extortion'))
    return `<g transform="translate(512,500)"><rect x="-120" y="-80" width="240" height="160" rx="12" fill="#422006" stroke="#ef4444" stroke-width="5"/><text x="0" y="20" text-anchor="middle" font-size="100" fill="#fde047" font-family="serif">$</text></g>`;
  if (slug.includes('warehouse') || slug.includes('heist') || n.includes('heist'))
    return `<g transform="translate(512,500)"><rect x="-160" y="-80" width="320" height="200" rx="8" fill="#78716c" stroke="#fbbf24" stroke-width="5"/><rect x="-100" y="-20" width="200" height="120" rx="8" fill="#1f2937" stroke="#22c55e" stroke-width="4"/><circle cx="0" cy="40" r="40" fill="#fde047" opacity="0.8"/></g>`;
  if (slug.includes('truck') || slug.includes('jack') || n.includes('truck'))
    return `<g transform="translate(512,540)"><rect x="-200" y="-40" width="400" height="90" rx="12" fill="#dc2626"/><rect x="-120" y="-100" width="240" height="60" rx="8" fill="#991b1b"/><circle cx="-100" cy="60" r="45" fill="#111" stroke="#444" stroke-width="8"/><circle cx="100" cy="60" r="45" fill="#111" stroke="#444" stroke-width="8"/></g>`;
  if (slug.includes('smuggle') || slug.includes('dock') || n.includes('smuggl'))
    return `<g transform="translate(512,520)"><rect x="-120" y="-40" width="240" height="160" rx="8" fill="#422006" stroke="#0ea5e9" stroke-width="5"/><path d="M-140,120 Q0,20 140,120" fill="none" stroke="#0284c7" stroke-width="8"/><ellipse cx="0" cy="-80" rx="80" ry="50" fill="#0891b2" opacity="0.7"/></g>`;
  if (slug.includes('counterfeit') || n.includes('counterfeit'))
    return `<g transform="translate(512,500)"><rect x="-160" y="-80" width="320" height="200" rx="8" fill="#166534" stroke="#fbbf24" stroke-width="5"/><rect x="-100" y="-30" width="200" height="100" rx="6" fill="#fde047" opacity="0.85"/><text x="0" y="40" text-anchor="middle" font-size="64" fill="#166534" font-family="serif">$100</text></g>`;
  if (slug.includes('nightclub') || n.includes('nightclub'))
    return `<g transform="translate(512,500)"><rect x="-140" y="-60" width="280" height="180" rx="12" fill="#581c87" stroke="#fbbf24" stroke-width="5"/><circle cx="-60" cy="20" r="30" fill="#fde047" opacity="0.8"/><circle cx="60" cy="20" r="30" fill="#ec4899" opacity="0.8"/><rect x="-20" y="-100" width="40" height="40" fill="#fde047"/></g>`;
  if (slug.includes('insider') || slug.includes('trade') || n.includes('insider'))
    return `<g transform="translate(512,500)"><rect x="-140" y="-100" width="280" height="220" rx="8" fill="#fafafa" stroke="#059669" stroke-width="5"/><polyline points="-80,60 -20,0 20,40 80,-40" fill="none" stroke="#22c55e" stroke-width="8"/><circle cx="80" cy="-40" r="16" fill="#ef4444"/></g>`;
  if (slug.includes('casino') || slug.includes('scam') || n.includes('casino'))
    return `<g transform="translate(512,500)"><rect x="-120" y="-80" width="240" height="160" rx="16" fill="#eab308" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="0" r="50" fill="#fde047"/><text x="0" y="18" text-anchor="middle" font-size="56" fill="#422006" font-family="serif">7</text></g>`;
  if (slug.includes('art') || n.includes('gallery'))
    return `<g transform="translate(512,500)"><rect x="-140" y="-100" width="280" height="200" rx="8" fill="#1f2937" stroke="#fbbf24" stroke-width="5"/><rect x="-80" y="-60" width="160" height="120" rx="4" fill="#6366f1" stroke="#fde047" stroke-width="4"/><circle cx="0" cy="0" r="40" fill="#fde047" opacity="0.6"/></g>`;
  if (slug.includes('penthouse') || n.includes('penthouse'))
    return `<g transform="translate(512,480)"><rect x="-100" y="-160" width="200" height="320" rx="8" fill="#18181b" stroke="#fbbf24" stroke-width="6"/><rect x="-70" y="-120" width="60" height="50" rx="4" fill="#fde047" opacity="0.7"/><rect x="10" y="-60" width="60" height="50" rx="4" fill="#fde047" opacity="0.7"/><polygon points="0,-200 40,-160 -40,-160" fill="#ef4444"/></g>`;
  if (slug.includes('bank') || n.includes('bank job'))
    return `<g transform="translate(512,500)"><rect x="-160" y="-80" width="320" height="180" rx="12" fill="#fbbf24" stroke="#854d0e" stroke-width="6"/><rect x="-100" y="-20" width="200" height="100" rx="8" fill="#422006"/><circle cx="0" cy="30" r="35" fill="#fde047"/><rect x="-30" y="10" width="60" height="40" rx="4" fill="#854d0e"/></g>`;
  if (slug.includes('arms') || n.includes('arms deal'))
    return `<g transform="translate(512,500)"><rect x="-160" y="-40" width="320" height="120" rx="8" fill="#422006" stroke="#ef4444" stroke-width="5"/><rect x="-120" y="-20" width="240" height="30" rx="4" fill="#374151"/><rect x="-80" y="20" width="160" height="50" rx="6" fill="#1f2937" stroke="#64748b"/></g>`;
  if (slug.includes('takeover') || slug.includes('hostile') || n.includes('takeover'))
    return `<g transform="translate(512,500)"><rect x="-140" y="-100" width="280" height="220" rx="8" fill="#991b1b" stroke="#fbbf24" stroke-width="6"/><path d="M-80,-60 L80,60 M80,-60 L-80,60" stroke="#fde047" stroke-width="12"/></g>`;
  if (slug.includes('diamond') || n.includes('diamond'))
    return `<g transform="translate(512,500)"><polygon points="0,-140 100,0 0,140 -100,0" fill="#22d3ee" stroke="#fde047" stroke-width="6"/><polygon points="0,-80 50,0 0,80 -50,0" fill="#ecfeff" opacity="0.6"/></g>`;
  if (slug.includes('syndicate') || slug.includes('hit') || n.includes('syndicate'))
    return `<g transform="translate(512,500)"><circle cx="0" cy="-40" r="70" fill="#78716c" stroke="#ef4444" stroke-width="6"/><rect x="-120" y="40" width="240" height="120" rx="20" fill="#1f2937" stroke="#fbbf24" stroke-width="5"/><path d="M-60,80 L60,80" stroke="#ef4444" stroke-width="8"/></g>`;
  return `<g transform="translate(512,500)"><rect x="-120" y="-80" width="240" height="160" rx="16" fill="#422006" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="0" r="50" fill="#fde047" opacity="0.85"/><text x="0" y="18" text-anchor="middle" font-size="48" fill="#422006" font-family="serif">$</text></g>`;
}

function bossArt(n, tier) {
  const suit = tier >= 4 ? '#854d0e' : tier >= 3 ? '#7f1d1d' : '#1f2937';
  const tie = tier >= 4 ? '#fbbf24' : '#ef4444';
  if (n.includes('godfather'))
    return `<g transform="translate(512,480)"><ellipse cx="0" cy="80" rx="170" ry="190" fill="${suit}" stroke="#fbbf24" stroke-width="6"/><circle cx="0" cy="-70" r="115" fill="#78716c"/><rect x="-110" y="-100" width="220" height="50" rx="10" fill="#111"/><circle cx="-40" cy="-75" r="14" fill="#111"/><circle cx="40" cy="-75" r="14" fill="#111"/><path d="M-30,120 L30,120 L20,200 L-20,200 Z" fill="${tie}"/></g>`;
  if (n.includes('syndicate') || n.includes('crime'))
    return `<g transform="translate(512,480)"><ellipse cx="0" cy="70" rx="160" ry="180" fill="${suit}" stroke="#7c3aed" stroke-width="5"/><circle cx="0" cy="-80" r="105" fill="#57534e"/><rect x="-90" y="-110" width="180" height="35" rx="8" fill="#111"/><rect x="-60" y="40" width="120" height="80" rx="8" fill="${tie}" opacity="0.8"/></g>`;
  if (n.includes('district') || n.includes('street'))
    return `<g transform="translate(512,480)"><ellipse cx="0" cy="60" rx="150" ry="170" fill="${suit}" stroke="#6366f1" stroke-width="5"/><circle cx="0" cy="-85" r="100" fill="#78716c"/><rect x="-95" y="-105" width="190" height="38" rx="8" fill="#422006"/><circle cx="-32" cy="-82" r="12" fill="#111"/><circle cx="32" cy="-82" r="12" fill="#111"/></g>`;
  return `<g transform="translate(512,480)"><ellipse cx="0" cy="60" rx="160" ry="180" fill="#1f2937" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="-80" r="110" fill="#78716c"/><rect x="-100" y="-110" width="200" height="40" rx="8" fill="#111"/><circle cx="-35" cy="-85" r="12" fill="#111"/><circle cx="35" cy="-85" r="12" fill="#111"/></g>`;
}

function locationArt(n, id) {
  if (id.includes('casino') || n.includes('casino'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#eab308" stroke="#fbbf24" stroke-width="5"/><text x="0" y="40" text-anchor="middle" font-size="80" fill="#422006" font-family="serif">7</text></g>`;
  if (id.includes('water') || id.includes('harbor') || n.includes('water') || n.includes('harbor'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#0ea5e9" stroke="#fde047" stroke-width="5"/><path d="M-80,20 Q0,-20 80,20" fill="none" stroke="#ecfeff" stroke-width="8"/></g>`;
  if (id.includes('industrial') || n.includes('industrial'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#78716c" stroke="#fbbf24" stroke-width="5"/><rect x="-40" y="-40" width="80" height="100" fill="#57534e"/><polygon points="-40,-40 0,-90 40,-40" fill="#44403c"/></g>`;
  if (id.includes('volcano') || n.includes('volcano'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#dc2626" stroke="#fbbf24" stroke-width="5"/><polygon points="0,-80 -60,40 60,40" fill="#450a0a"/><circle cx="0" cy="-20" r="20" fill="#fde047" opacity="0.8"/></g>`;
  if (id.includes('financial') || n.includes('financial'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#059669" stroke="#fbbf24" stroke-width="5"/><rect x="-30" y="-30" width="60" height="100" fill="#fde047" opacity="0.8"/></g>`;
  if (id.includes('red_light') || n.includes('red light'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#be123c" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="20" r="50" fill="#fda4af"/></g>`;
  if (id.includes('desert') || n.includes('desert'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#d97706" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="-20" r="45" fill="#fde047"/></g>`;
  if (id.includes('skyline') || n.includes('skyline') || id.includes('uptown'))
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#f97316" stroke="#fbbf24" stroke-width="5"/><rect x="-50" y="-20" width="30" height="80" fill="#fde047" opacity="0.7"/><rect x="-10" y="-50" width="30" height="110" fill="#fde047" opacity="0.7"/><rect x="30" y="-10" width="30" height="70" fill="#fde047" opacity="0.7"/></g>`;
  return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#6366f1" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="20" r="56" fill="#fef3c7" opacity="0.9"/></g>`;
}

function territoryArt(n, id) {
  if (id.includes('empire') || n.includes('empire'))
    return `<g transform="translate(512,500)"><path d="M-200,-120 L200,-120 L240,80 L0,200 L-240,80 Z" fill="#ef4444" stroke="#fbbf24" stroke-width="8"/><circle cx="0" cy="20" r="60" fill="#fde047"/><path d="M0,-40 L20,20 L-20,20 Z" fill="#854d0e"/></g>`;
  if (id.includes('casino') || n.includes('casino'))
    return `<g transform="translate(512,500)"><path d="M-200,-120 L200,-120 L240,80 L0,200 L-240,80 Z" fill="#eab308" stroke="#fbbf24" stroke-width="6"/><text x="0" y="50" text-anchor="middle" font-size="90" fill="#422006" font-family="serif">7</text></g>`;
  if (id.includes('waterfront') || id.includes('docks') || n.includes('dock'))
    return `<g transform="translate(512,500)"><path d="M-200,-120 L200,-120 L240,80 L0,200 L-240,80 Z" fill="#0ea5e9" stroke="#fde047" stroke-width="6"/><rect x="-80" y="0" width="160" height="60" rx="8" fill="#422006"/></g>`;
  if (id.includes('industrial') || n.includes('industrial'))
    return `<g transform="translate(512,500)"><path d="M-200,-120 L200,-120 L240,80 L0,200 L-240,80 Z" fill="#78716c" stroke="#fbbf24" stroke-width="6"/><rect x="-40" y="-20" width="80" height="90" fill="#57534e"/></g>`;
  if (id.includes('skyline') || n.includes('skyline'))
    return `<g transform="translate(512,500)"><path d="M-200,-120 L200,-120 L240,80 L0,200 L-240,80 Z" fill="#f97316" stroke="#fbbf24" stroke-width="6"/><rect x="-60" y="0" width="40" height="70" fill="#fde047"/><rect x="-10" y="-20" width="40" height="90" fill="#fde047"/><rect x="40" y="10" width="40" height="60" fill="#fde047"/></g>`;
  return `<g transform="translate(512,500)"><path d="M-200,-120 L200,-120 L240,80 L0,200 L-240,80 Z" fill="#6366f1" stroke="#fbbf24" stroke-width="6"/><circle cx="0" cy="30" r="50" fill="#fef3c7"/></g>`;
}

function consumableArt(n) {
  if (n.includes('energy')) return ITEM_ART.energy_pack();
  if (n.includes('stamina')) return ITEM_ART.stamina_drink();
  if (n.includes('health')) return ITEM_ART.health_kit();
  if (n.includes('mob') || n.includes('contract'))
    return `<g transform="translate(512,500)"><rect x="-180" y="-120" width="360" height="240" rx="12" fill="#fafafa" stroke="#a855f7" stroke-width="6"/><line x1="-140" y1="-40" x2="140" y2="-40" stroke="#7c3aed" stroke-width="4"/><line x1="-140" y1="20" x2="80" y2="20" stroke="#7c3aed" stroke-width="4"/><circle cx="120" cy="-80" r="40" fill="#9333ea"/></g>`;
  if (n.includes('ice'))
    return `<g transform="translate(512,500)"><rect x="-130" y="-130" width="260" height="260" rx="24" fill="#06b6d4" stroke="#a5f3fc" stroke-width="6" opacity="0.9"/><polygon points="0,-60 -40,30 40,30" fill="#ecfeff"/></g>`;
  if (n.includes('xp') || n.includes('boost'))
    return `<g transform="translate(512,480)"><polygon points="0,-140 36,-44 140,-44 56,18 92,120 0,68 -92,120 -56,18 -140,-44 -36,-44" fill="#fbbf24" stroke="#f59e0b" stroke-width="4"/></g>`;
  return `<g transform="translate(512,500)"><circle cx="0" cy="0" r="120" fill="#6366f1" stroke="#fbbf24" stroke-width="6"/></g>`;
}

function byKeyword(category, id, name, tier = 1) {
  const n = (name || '').toLowerCase();
  const key = id || '';
  if (ITEM_ART[key]) return ITEM_ART[key](key);

  switch (category) {
    case 'weapon': return weaponArt(n, key);
    case 'armor': return armorArt(n, key, tier);
    case 'vehicle': return vehicleArt(n, key);
    case 'property': return propertyArt(n, key, tier);
    case 'job': return jobArt(key, name);
    case 'boss': return bossArt(n, tier);
    case 'location': return locationArt(n, key);
    case 'territory': return territoryArt(n, key);
    case 'consumable': return consumableArt(n);
    default:
      return `<g transform="translate(512,500)"><circle cx="0" cy="0" r="160" fill="#6366f1" stroke="#fbbf24" stroke-width="6" opacity="0.85"/></g>`;
  }
}

export function renderItemSvg(category, item) {
  const id = item.id || 'item';
  const color = item.color || '#6366f1';
  const tier = item.tier || 1;
  const body = byKeyword(category, id, item.name || id, tier);
  return wrap(category, id, color, tier, body);
}
