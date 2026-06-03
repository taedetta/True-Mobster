/** Generate AI PNG thumbnails — uses standard aiImagePrompt template (v2.3+) */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WEAPONS, ARMOR, VEHICLES, CONSUMABLES, PROPERTIES, BOSSES, JOBS } from '../../shared/gameData.js';
import { aiImagePrompt, AI_IMAGE_CONTEXT } from './aiImagePrompt.js';

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
  const ctx = AI_IMAGE_CONTEXT[category] || 'game item';
  return encodeURIComponent(aiImagePrompt(item.name, ctx));
}

async function generate(category, item, idOverride) {
  const id = idOverride || item.id;
  const file = `${category}_${id}.png`;
  const url = `https://image.pollinations.ai/prompt/${prompt(category, item)}?width=512&height=512&nologo=true&seed=${hashSeed(id)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error('too small');
  fs.writeFileSync(path.join(outDir, file), buf);
  console.log(`✓ ${file} (${Math.round(buf.length / 1024)}KB)`);
}

const jobItems = [...new Map(JOBS.map((j) => {
  const id = j.artSlug || j.id;
  return [id, { id, name: j.name }];
})).values()];

const batches = [
  ['weapon', WEAPONS],
  ['consumable', CONSUMABLES],
  ['armor', ARMOR],
  ['vehicle', VEHICLES],
  ['property', PROPERTIES],
  ['boss', BOSSES],
  ['job', jobItems],
];

console.log('Generating AI PNG thumbnails (standard aiImagePrompt)...');
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
console.log('Done. Run optimize-thumbnails.js to convert PNG → WebP.');
