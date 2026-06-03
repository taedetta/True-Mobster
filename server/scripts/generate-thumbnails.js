import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  WEAPONS, ARMOR, VEHICLES, PROPERTIES, JOBS, LOCATIONS, CONSUMABLES, BOSSES, TERRITORIES,
} from '../../shared/gameData.js';
import { renderItemSvg } from './itemArt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../client/public/assets/items');
fs.mkdirSync(outDir, { recursive: true });

function write(category, items) {
  for (const item of items) {
    const filename = `${category}_${item.id}.svg`;
    fs.writeFileSync(path.join(outDir, filename), renderItemSvg(category, item));
    console.log(`  ${filename}`);
  }
}

console.log('Generating premium SVG item thumbnails (1024×1024)...');
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
console.log(`Done — ${total} SVG thumbnails.`);
