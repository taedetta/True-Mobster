import { normalizeLocale } from '../../../shared/languages.js';

const cache = new Map();
const MAX_CACHE = 5000;
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

function cacheKey(text, from, to) {
  return `${from}|${to}|${text}`;
}

function trimCache() {
  if (cache.size <= MAX_CACHE) return;
  const drop = cache.size - MAX_CACHE;
  const keys = [...cache.keys()].slice(0, drop);
  keys.forEach((k) => cache.delete(k));
}

/**
 * Translate text between locales. Returns original when languages match or API fails.
 */
export async function translateText(text, fromLang, toLang) {
  const original = String(text || '');
  const from = normalizeLocale(fromLang);
  const to = normalizeLocale(toLang);

  if (!original.trim() || from === to) {
    return { text: original, original, translated: false, from, to };
  }

  const key = cacheKey(original, from, to);
  if (cache.has(key)) return cache.get(key);

  try {
    const params = new URLSearchParams({
      q: original.slice(0, 500),
      langpair: `${from}|${to}`,
    });
    const res = await fetch(`${MYMEMORY_URL}?${params}`);
    if (!res.ok) throw new Error(`translate HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText || original;
    const result = {
      text: translated,
      original,
      translated: translated.trim().toLowerCase() !== original.trim().toLowerCase(),
      from,
      to,
    };
    cache.set(key, result);
    trimCache();
    return result;
  } catch {
    const fallback = { text: original, original, translated: false, from, to };
    cache.set(key, fallback);
    return fallback;
  }
}

export async function translateFields(fields, fromLang, toLang) {
  const entries = await Promise.all(
    Object.entries(fields).map(async ([k, v]) => {
      if (!v) return [k, { text: '', original: '', translated: false }];
      const r = await translateText(v, fromLang, toLang);
      return [k, r];
    }),
  );
  return Object.fromEntries(entries);
}
