/**
 * Convert item SVG fallbacks to optimized WebP thumbnails (skip existing WebP).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const itemsDir = path.join(__dirname, '../../client/public/assets/items');
const SIZE = 256;
const BG = { r: 10, g: 10, b: 15, alpha: 1 };

const prefixes = ['armor_', 'vehicle_', 'property_', 'job_', 'boss_', 'territory_', 'location_'];
const svgs = fs.readdirSync(itemsDir).filter((f) => {
  if (!f.endsWith('.svg')) return false;
  const base = f.replace('.svg', '');
  if (fs.existsSync(path.join(itemsDir, `${base}.webp`))) return false;
  return prefixes.some((p) => f.startsWith(p)) || f.startsWith('a_') || f.startsWith('v_') || f.startsWith('p_');
});

if (!svgs.length) {
  console.log('No SVG files need conversion.');
  process.exit(0);
}

console.log(`Converting ${svgs.length} SVG → ${SIZE}px WebP...`);
let total = 0;
for (const f of svgs) {
  const base = f.replace('.svg', '');
  const webpPath = path.join(itemsDir, `${base}.webp`);
  await sharp(path.join(itemsDir, f))
    .resize(SIZE, SIZE, { fit: 'contain', background: BG })
    .webp({ quality: 82, effort: 4 })
    .toFile(webpPath);
  const kb = Math.round(fs.statSync(webpPath).size / 1024);
  total += kb;
  console.log(`  ✓ ${base}.webp (${kb} KB)`);
}
console.log(`Done — ${svgs.length} files, ~${total} KB total`);
