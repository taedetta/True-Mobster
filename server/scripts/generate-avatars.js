/** Generate 15 default avatar SVGs for profile picker */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_AVATARS } from '../../shared/gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../client/public/assets/avatars');
fs.mkdirSync(outDir, { recursive: true });

for (const av of DEFAULT_AVATARS) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${av.color}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="64" fill="url(#bg)"/>
  <circle cx="64" cy="64" r="58" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.5"/>
  <text x="64" y="78" text-anchor="middle" font-size="52">${av.emoji}</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `${av.id}.svg`), svg);
  console.log(`  ✓ ${av.id}.svg (${av.name})`);
}
console.log(`Done — ${DEFAULT_AVATARS.length} avatars`);
