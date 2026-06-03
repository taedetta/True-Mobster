/** Generate AI WebP UI icons — same style as item art */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { aiImagePrompt, AI_IMAGE_CONTEXT } from './aiImagePrompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../../client/public/assets/ui');
fs.mkdirSync(outDir, { recursive: true });

const DELAY = Number(process.env.THUMBNAIL_DELAY_MS || 2500);
const FORCE = process.env.FORCE === '1';

const UI_ICONS = [
  { id: 'nav-home', name: 'Home base icon' },
  { id: 'nav-jobs', name: 'Crime jobs briefcase icon' },
  { id: 'nav-fight', name: 'Street fight fists icon' },
  { id: 'nav-shop', name: 'Black market shop icon' },
  { id: 'nav-mob', name: 'Mob crew gang icon' },
  { id: 'nav-estate', name: 'Real estate buildings icon' },
  { id: 'nav-hitlist', name: 'Hitlist target icon' },
  { id: 'nav-boss', name: 'Crime boss battle icon' },
  { id: 'nav-crew', name: 'Crew syndicate icon' },
  { id: 'nav-daily', name: 'Daily reward gift icon' },
  { id: 'nav-profile', name: 'Mobster profile icon' },
  { id: 'fight-slap', name: 'Slap attack hand icon' },
  { id: 'fight-fight', name: 'Brawl fight icon' },
  { id: 'fight-execute', name: 'Execute skull icon' },
  { id: 'godfather', name: 'The Godfather don portrait icon' },
  { id: 'hospital', name: 'Hospital medical cross icon' },
  { id: 'chat-world', name: 'World chat megaphone icon' },
  { id: 'chat-mob', name: 'Mob chat icon' },
  { id: 'chat-messages', name: 'Mail messages envelope icon' },
];

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 999999;
}

async function generate(icon) {
  const outPath = path.join(outDir, `${icon.id}.webp`);
  if (!FORCE && fs.existsSync(outPath)) {
    console.log(`· skip ${icon.id}.webp`);
    return;
  }
  const p = encodeURIComponent(aiImagePrompt(icon.name, AI_IMAGE_CONTEXT.ui));
  const url = `https://image.pollinations.ai/prompt/${p}?width=512&height=512&nologo=true&seed=${hashSeed(icon.id)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(256, 256, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 0 } })
    .webp({ quality: 88, effort: 5 })
    .toFile(outPath);
  console.log(`✓ ${icon.id}.webp (${Math.round(fs.statSync(outPath).size / 1024)}KB)`);
}

console.log('Generating AI UI icons...');
for (const icon of UI_ICONS) {
  try {
    await generate(icon);
    await new Promise((r) => setTimeout(r, DELAY));
  } catch (e) {
    console.log(`✗ ${icon.id}: ${e.message}`);
  }
}
console.log('Done.');
