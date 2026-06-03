/**
 * Compress item PNGs into 256×256 WebP thumbnails (~15–40 KB each).
 * Removes source PNGs after conversion.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const itemsDir = path.join(__dirname, '../../client/public/assets/items');

const SIZE = 256;
const BG = { r: 10, g: 10, b: 15, alpha: 1 };

async function optimizeFile(pngPath) {
  const base = path.basename(pngPath, '.png');
  const webpPath = path.join(itemsDir, `${base}.webp`);
  await sharp(pngPath)
    .resize(SIZE, SIZE, { fit: 'contain', background: BG })
    .webp({ quality: 82, effort: 4 })
    .toFile(webpPath);
  const kb = Math.round(fs.statSync(webpPath).size / 1024);
  fs.unlinkSync(pngPath);
  console.log(`  ✓ ${base}.webp (${kb} KB)`);
  return kb;
}

const pngs = fs.readdirSync(itemsDir).filter((f) => f.endsWith('.png'));
if (!pngs.length) {
  console.log('No PNG files to optimize.');
  process.exit(0);
}

console.log(`Optimizing ${pngs.length} PNG thumbnails → ${SIZE}px WebP...`);
let total = 0;
for (const f of pngs) {
  total += await optimizeFile(path.join(itemsDir, f));
}
console.log(`Done — ${pngs.length} WebP files, ~${total} KB total`);
