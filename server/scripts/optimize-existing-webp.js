/** Recompress large AI WebP thumbnails for fast loading while keeping quality */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const itemsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../client/public/assets/items');
const SIZE = Number(process.env.THUMBNAIL_SIZE || 384);
const MIN_KB = Number(process.env.MIN_KB || 80);
const BG = { r: 10, g: 10, b: 15, alpha: 1 };

const files = fs.readdirSync(itemsDir).filter((f) => f.endsWith('.webp'));
let done = 0;
for (const f of files) {
  const p = path.join(itemsDir, f);
  const kb = fs.statSync(p).size / 1024;
  if (kb < MIN_KB) continue;
  const tmp = p + '.tmp';
  await sharp(p)
    .resize(SIZE, SIZE, { fit: 'contain', background: BG })
    .webp({ quality: 86, effort: 5 })
    .toFile(tmp);
  fs.renameSync(tmp, p);
  const newKb = Math.round(fs.statSync(p).size / 1024);
  console.log(`✓ ${f} ${Math.round(kb)}KB → ${newKb}KB`);
  done++;
}
console.log(`Optimized ${done} large WebP files`);
