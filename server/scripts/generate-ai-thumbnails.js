/** Generate AI PNG thumbnails for priority items (weapons, consumables, armor, vehicles) */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WEAPONS, ARMOR, VEHICLES, CONSUMABLES, PROPERTIES, BOSSES } from '../../shared/gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../client/public/assets/items');
fs.mkdirSync(outDir, { recursive: true });

const DELAY = Number(process.env.THUMBNAIL_DELAY_MS || 2000);

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 999999;
}

function prompt(category, item) {
  const name = item.name.replace(/\([^)]*\)/g, '').trim();
  const ctx = {
    weapon: 'detailed mafia weapon prop',
    armor: 'tactical armor equipment',
    vehicle: 'crime syndicate vehicle',
    property: 'criminal business property',
    consumable: 'game power-up item',
    boss: 'crime boss character portrait',
  }[category] || 'game item';
  return encodeURIComponent(`${name}, ${ctx}, premium mobile game icon, isolated centered object, dark studio background, cinematic rim light, ultra detailed 3D product render, no text, no logo, no watermark`);
}

async function generate(category, item) {
  const file = `${category}_${item.id}.png`;
  const url = `https://image.pollinations.ai/prompt/${prompt(category, item)}?width=512&height=512&nologo=true&seed=${hashSeed(item.id)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error('too small');
  fs.writeFileSync(path.join(outDir, file), buf);
  console.log(`✓ ${file} (${Math.round(buf.length / 1024)}KB)`);
}

const batches = [
  ['weapon', WEAPONS],
  ['consumable', CONSUMABLES],
  ['armor', ARMOR],
  ['vehicle', VEHICLES],
  ['property', PROPERTIES],
  ['boss', BOSSES],
];

console.log('Generating AI PNG thumbnails...');
for (const [cat, items] of batches) {
  for (const item of items) {
    try {
      await generate(cat, item);
      await new Promise((r) => setTimeout(r, DELAY));
    } catch (e) {
      console.log(`✗ ${cat}_${item.id}: ${e.message}`);
    }
  }
}
console.log('Done.');
