/**
 * Convert item SVG thumbnails to optimized WebP.
 * Set FORCE=1 to overwrite existing WebP (skips weapon_* to preserve AI art).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const itemsDir = path.join(__dirname, '../../client/public/assets/items');
const SIZE = Number(process.env.THUMBNAIL_SIZE || 384);
const BG = { r: 10, g: 10, b: 15, alpha: 1 };
const FORCE = process.env.FORCE === '1' || process.env.FORCE === 'true';
const SKIP_PREFIXES = (process.env.SKIP_PREFIXES || 'weapon_').split(',').filter(Boolean);

const prefixes = ['armor_', 'vehicle_', 'property_', 'job_', 'boss_', 'territory_', 'location_', 'consumable_'];

function shouldConvert(filename) {
  if (!filename.endsWith('.svg')) return false;
  const base = filename.replace('.svg', '');
  if (SKIP_PREFIXES.some((p) => base.startsWith(p))) return false;
  if (!prefixes.some((p) => base.startsWith(p))) return false;
  const webpPath = path.join(itemsDir, `${base}.webp`);
  if (!FORCE && fs.existsSync(webpPath)) return false;
  return true;
}

const svgs = fs.readdirSync(itemsDir).filter(shouldConvert);

if (!svgs.length) {
  console.log('No SVG files need conversion.');
  process.exit(0);
}

console.log(`Converting ${svgs.length} SVG → ${SIZE}px WebP${FORCE ? ' (force)' : ''}...`);
let total = 0;
for (const f of svgs) {
  const base = f.replace('.svg', '');
  const webpPath = path.join(itemsDir, `${base}.webp`);
  await sharp(path.join(itemsDir, f))
    .resize(SIZE, SIZE, { fit: 'contain', background: BG })
    .webp({ quality: 88, effort: 5 })
    .toFile(webpPath);
  const kb = Math.round(fs.statSync(webpPath).size / 1024);
  total += kb;
  console.log(`  ✓ ${base}.webp (${kb} KB)`);
}
console.log(`Done — ${svgs.length} files, ~${total} KB total`);
