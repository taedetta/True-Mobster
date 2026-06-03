/**
 * Generate AI WebP thumbnails — standard aiImagePrompt template only.
 * Never uses legacy SVG art. Set FORCE=1 to overwrite existing files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import {
  WEAPONS, ARMOR, VEHICLES, CONSUMABLES, PROPERTIES, BOSSES, JOBS, TERRITORIES, LOCATIONS,
} from '../../shared/gameData.js';
import { aiImagePrompt, AI_IMAGE_CONTEXT } from './aiImagePrompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../client/public/assets/items');
fs.mkdirSync(outDir, { recursive: true });

const DELAY = Number(process.env.THUMBNAIL_DELAY_MS || 2500);
const FORCE = process.env.FORCE === '1' || process.env.FORCE === 'true';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map((s) => s.trim()) : null;
const SIZE = Number(process.env.THUMBNAIL_SIZE || 384);
const BG = { r: 10, g: 10, b: 15, alpha: 1 };

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
  const file = `${category}_${id}.webp`;
  const outPath = path.join(outDir, file);
  if (!FORCE && fs.existsSync(outPath)) {
    console.log(`· skip ${file}`);
    return;
  }
  const url = `https://image.pollinations.ai/prompt/${prompt(category, item)}?width=512&height=512&nologo=true&seed=${hashSeed(`${category}_${id}`)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error('too small');
  await sharp(buf)
    .resize(SIZE, SIZE, { fit: 'contain', background: BG })
    .webp({ quality: 86, effort: 5 })
    .toFile(outPath);
  console.log(`✓ ${file} (${Math.round(fs.statSync(outPath).size / 1024)}KB)`);
}

const jobItems = [...new Map(JOBS.map((j) => {
  const id = j.artSlug || j.id;
  return [id, { id, name: j.name.replace(/\([^)]*\)/g, '').trim() }];
})).values()];

const locationItems = LOCATIONS.map((l) => ({ id: l.id, name: l.name }));

const batches = [
  ['weapon', WEAPONS],
  ['armor', ARMOR],
  ['vehicle', VEHICLES],
  ['property', PROPERTIES],
  ['consumable', CONSUMABLES],
  ['boss', BOSSES],
  ['job', jobItems],
  ['territory', TERRITORIES],
  ['location', locationItems],
].filter(([cat]) => !ONLY || ONLY.includes(cat));

console.log(`Generating AI WebP thumbnails (FORCE=${FORCE})...`);
for (const [cat, items] of batches) {
  console.log(`\n[${cat}] ${items.length} items`);
  for (const item of items) {
    try {
      await generate(cat, item);
      await new Promise((r) => setTimeout(r, DELAY));
    } catch (e) {
      console.log(`✗ ${cat}_${item.id}: ${e.message}`);
    }
  }
}
console.log('\nDone — AI WebP only, no SVG fallbacks.');
