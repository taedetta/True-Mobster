import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  WEAPONS, ARMOR, VEHICLES, PROPERTIES, JOBS, LOCATIONS, CONSUMABLES, BOSSES, TERRITORIES,
} from '../../shared/gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../client/public/assets/items');
fs.mkdirSync(outDir, { recursive: true });

const ICONS = {
  weapon: '⚔',
  armor: '🛡',
  vehicle: '🚗',
  property: '🏢',
  job: '💼',
  location: '📍',
};

function svg(category, id, name, color, tier = 1) {
  const icon = ICONS[category] || '★';
  const tierStars = '★'.repeat(Math.min(tier, 5));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:#0f0f14;stop-opacity:1"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#bg)" stroke="#fbbf24" stroke-width="2"/>
  <rect x="8" y="8" width="112" height="112" rx="12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <text x="64" y="58" text-anchor="middle" font-size="36" filter="url(#glow)">${icon}</text>
  <text x="64" y="88" text-anchor="middle" fill="#fef3c7" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold">${name.length > 14 ? name.slice(0, 12) + '…' : name}</text>
  <text x="64" y="108" text-anchor="middle" fill="#fbbf24" font-family="Segoe UI, sans-serif" font-size="10">${tierStars}</text>
</svg>`;
}

function write(category, items) {
  for (const item of items) {
    const filename = `${category}_${item.id}.svg`;
    const content = svg(category, item.id, item.name, item.color || '#6366f1', item.tier || 1);
    fs.writeFileSync(path.join(outDir, filename), content);
    console.log(`  ${filename}`);
  }
}

console.log('Generating item thumbnails...');
write('weapon', WEAPONS);
write('armor', ARMOR);
write('vehicle', VEHICLES);
write('property', PROPERTIES);
write('consumable', CONSUMABLES);
write('boss', BOSSES);
write('territory', TERRITORIES);
write('job', JOBS.map((j) => ({ ...j, color: LOCATIONS.find((l) => l.id === j.location)?.color || '#6366f1', tier: 1 })));
write('location', LOCATIONS.map((l) => ({ ...l, tier: 1 })));

const total = WEAPONS.length + ARMOR.length + VEHICLES.length + PROPERTIES.length + CONSUMABLES.length + BOSSES.length + TERRITORIES.length + JOBS.length + LOCATIONS.length;
console.log(`Done — ${total} thumbnails generated.`);
