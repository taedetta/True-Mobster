/** Remove legacy SVG item art — game uses AI WebP only */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const itemsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../client/public/assets/items');
let removed = 0;
for (const f of fs.readdirSync(itemsDir)) {
  if (f.endsWith('.svg')) {
    fs.unlinkSync(path.join(itemsDir, f));
    removed++;
  }
}
console.log(`Removed ${removed} legacy SVG files from assets/items`);
