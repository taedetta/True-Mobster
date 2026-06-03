/** Premium SVG fallback art (1024×1024) — used when AI PNG unavailable */

const SIZE = 1024;

function uid(category, id) {
  return `${category}_${String(id).replace(/\W/g, '')}`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

// Detailed metallic gradients helper
function metal(id, c1, c2, c3) {
  const u = id.replace(/\W/g, '');
  return `<linearGradient id="m_${u}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="50%" stop-color="${c2}"/><stop offset="100%" stop-color="${c3}"/></linearGradient>`;
}

const ITEM_ART = {
  w_rusty_knife: (u) => `<defs>${metal(u,'#e8edf4','#9ca3af','#4b5563')}</defs><g transform="translate(512,480) rotate(-38)"><path d="M0,-320 L-28,-120 L28,-120 Z" fill="url(#m_${u.replace(/\W/g,'')})" stroke="#6b7280" stroke-width="3"/><rect x="-22" y="-120" width="44" height="180" rx="8" fill="url(#m_${u.replace(/\W/g,'')})"/><rect x="-36" y="60" width="72" height="110" rx="10" fill="#5c3d2e" stroke="#3f2d20"/><rect x="-44" y="165" width="88" height="24" rx="6" fill="#78350f"/></g>`,
  w_baseball_bat: (u) => `<g transform="translate(512,500) rotate(28)"><defs><linearGradient id="w_${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d4a574"/><stop offset="40%" stop-color="#92400e"/><stop offset="100%" stop-color="#5c2e0a"/></linearGradient></defs><ellipse cx="0" cy="-200" rx="56" ry="210" fill="url(#w_${u})" stroke="#78350f" stroke-width="5"/><rect x="-28" y="10" width="56" height="200" rx="14" fill="url(#w_${u})"/><ellipse cx="0" cy="230" rx="42" ry="28" fill="#5c2e0a"/></g>`,
  w_switchblade: (u) => `<g transform="translate(512,490) rotate(-25)"><polygon points="0,-280 -24,-80 24,-80" fill="#d1d5db" stroke="#6b7280" stroke-width="3"/><rect x="-14" y="-80" width="28" height="120" fill="#9ca3af"/><rect x="-40" y="40" width="80" height="120" rx="8" fill="#1f2937" stroke="#374151"/><circle cx="0" cy="100" r="16" fill="#4b5563"/></g>`,
  w_brass_knuckles: (u) => `<g transform="translate(512,500)"><ellipse cx="0" cy="0" rx="200" ry="120" fill="#78716c" stroke="#44403c" stroke-width="8"/><circle cx="-110" cy="-30" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/><circle cx="-35" cy="-55" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/><circle cx="35" cy="-55" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/><circle cx="110" cy="-30" r="48" fill="#a8a29e" stroke="#57534e" stroke-width="4"/></g>`,
  w_street_revolver: (u) => `<g transform="translate(512,500)"><rect x="-200" y="-30" width="280" height="60" rx="12" fill="#374151" stroke="#1f2937"/><rect x="80" y="-50" width="140" height="100" rx="16" fill="#111827" stroke="#4b5563"/><circle cx="150" cy="0" r="56" fill="#0f172a" stroke="#6b7280" stroke-width="6"/><rect x="-240" y="-16" width="60" height="32" rx="6" fill="#78350f"/></g>`,
  energy_pack: () => `<g transform="translate(512,490)"><rect x="-120" y="-160" width="240" height="300" rx="28" fill="#1d4ed8" stroke="#60a5fa" stroke-width="6"/><path d="M-20,-80 L-20,40 L60,40 L-40,160 L-20,20 L-100,20 Z" fill="#fde047" stroke="#fbbf24" stroke-width="4" filter="url(#glow_${uid('consumable','energy')})"/></g>`,
  stamina_drink: () => `<g transform="translate(512,500)"><rect x="-80" y="-180" width="160" height="60" rx="20" fill="#166534"/><ellipse cx="0" cy="40" rx="100" ry="140" fill="#15803d" stroke="#4ade80" stroke-width="6"/><ellipse cx="0" cy="60" rx="60" ry="90" fill="#22c55e" opacity="0.5"/></g>`,
  health_kit: () => `<g transform="translate(512,500)"><rect x="-160" y="-100" width="320" height="220" rx="20" fill="#dc2626" stroke="#fca5a5" stroke-width="6"/><rect x="-120" y="-60" width="240" height="140" rx="12" fill="#fef2f2"/><rect x="-20" y="-20" width="40" height="100" rx="6" fill="#ef4444"/><rect x="-60" y="20" width="120" height="40" rx="6" fill="#ef4444"/></g>`,
};

function byKeyword(category, id, name) {
  const n = name.toLowerCase();
  const key = id || '';
  if (ITEM_ART[key]) return ITEM_ART[key](key);

  if (category === 'weapon') {
    if (n.includes('bat')) return ITEM_ART.w_baseball_bat(key);
    if (n.includes('knife') || n.includes('blade')) return ITEM_ART.w_rusty_knife(key);
    if (n.includes('knuckle')) return ITEM_ART.w_brass_knuckles(key);
    if (n.includes('revolver') || n.includes('pistol')) return ITEM_ART.w_street_revolver(key);
    if (n.includes('shotgun') || n.includes('rifle') || n.includes('smg') || n.includes('sniper') || n.includes('cannon'))
      return `<g transform="translate(512,500)"><rect x="-280" y="-24" width="440" height="48" rx="8" fill="#374151"/><rect x="160" y="-40" width="140" height="80" rx="10" fill="#111827" stroke="#6b7280" stroke-width="4"/><rect x="-120" y="24" width="50" height="100" rx="8" fill="#78350f"/></g>`;
  }
  if (category === 'consumable') {
    if (n.includes('energy')) return ITEM_ART.energy_pack();
    if (n.includes('stamina')) return ITEM_ART.stamina_drink();
    if (n.includes('health')) return ITEM_ART.health_kit();
    if (n.includes('mob') || n.includes('contract'))
      return `<g transform="translate(512,500)"><rect x="-180" y="-120" width="360" height="240" rx="12" fill="#fafafa" stroke="#a855f7" stroke-width="6"/><line x1="-140" y1="-40" x2="140" y2="-40" stroke="#7c3aed" stroke-width="4"/><line x1="-140" y1="20" x2="80" y2="20" stroke="#7c3aed" stroke-width="4"/><circle cx="120" cy="-80" r="40" fill="#9333ea"/></g>`;
    if (n.includes('ice'))
      return `<g transform="translate(512,500)"><rect x="-130" y="-130" width="260" height="260" rx="24" fill="#06b6d4" stroke="#a5f3fc" stroke-width="6" opacity="0.9"/><polygon points="0,-60 -40,30 40,30" fill="#ecfeff"/></g>`;
    if (n.includes('xp') || n.includes('boost'))
      return `<g transform="translate(512,480)"><polygon points="0,-140 36,-44 140,-44 56,18 92,120 0,68 -92,120 -56,18 -140,-44 -36,-44" fill="#fbbf24" stroke="#f59e0b" stroke-width="4"/></g>`;
  }
  if (category === 'vehicle')
    return `<g transform="translate(512,560)"><rect x="-240" y="-60" width="480" height="100" rx="24" fill="${n.includes('muscle') ? '#dc2626' : '#374151'}" stroke="#111"/><rect x="-160" y="-120" width="320" height="70" rx="16" fill="${n.includes('muscle') ? '#ef4444' : '#4b5563'}"/><circle cx="-140" cy="50" r="56" fill="#111" stroke="#333" stroke-width="8"/><circle cx="140" cy="50" r="56" fill="#111" stroke="#333" stroke-width="8"/></g>`;
  if (category === 'armor')
    return `<g transform="translate(512,500)"><path d="M-180,-160 L180,-160 L220,120 L120,200 L-120,200 L-220,120 Z" fill="#334155" stroke="#64748b" stroke-width="6"/><path d="M-60,-160 L60,-160 L60,200 L-60,200 Z" fill="#475569" opacity="0.8"/></g>`;
  if (category === 'property')
    return `<g transform="translate(512,520)"><rect x="-160" y="-140" width="320" height="260" rx="12" fill="#6366f1" stroke="#818cf8" stroke-width="5"/><rect x="-120" y="-80" width="80" height="60" rx="4" fill="#fbbf24" opacity="0.7"/><rect x="40" y="-80" width="80" height="60" rx="4" fill="#fbbf24" opacity="0.7"/><rect x="-40" y="40" width="80" height="80" fill="#312e81"/></g>`;
  if (category === 'boss')
    return `<g transform="translate(512,480)"><ellipse cx="0" cy="60" rx="160" ry="180" fill="#1f2937" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="-80" r="110" fill="#78716c"/><rect x="-100" y="-110" width="200" height="40" rx="8" fill="#111"/><circle cx="-35" cy="-85" r="12" fill="#111"/><circle cx="35" cy="-85" r="12" fill="#111"/></g>`;
  if (category === 'territory' || category === 'location')
    return `<g transform="translate(512,520)"><path d="M0,-200 C-120,-200 -180,-80 -180,20 C-180,120 0,220 0,220 C0,220 180,120 180,20 C180,-80 120,-200 0,-200 Z" fill="#6366f1" stroke="#fbbf24" stroke-width="5"/><circle cx="0" cy="20" r="56" fill="#fef3c7" opacity="0.9"/></g>`;
  if (category === 'job')
    return `<g transform="translate(512,500)"><rect x="-100" y="-80" width="200" height="140" rx="12" fill="#422006" stroke="#fbbf24" stroke-width="4"/><circle cx="0" cy="-10" r="40" fill="#fbbf24" opacity="0.85"/></g>`;
  return `<g transform="translate(512,500)"><circle cx="0" cy="0" r="160" fill="#6366f1" stroke="#fbbf24" stroke-width="6" opacity="0.85"/></g>`;
}

export function renderItemSvg(category, item) {
  const id = item.id || 'item';
  const color = item.color || '#6366f1';
  const tier = item.tier || 1;
  const body = byKeyword(category, id, item.name || id);
  return wrap(category, id, color, tier, body);
}
