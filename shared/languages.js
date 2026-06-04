/** Supported UI / message locales (ISO 639-1). MyMemory supports most pairs. */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
];

const CODE_SET = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));

/** Map browser locale (e.g. es-ES, zh-CN) to a supported code. */
export function normalizeLocale(input) {
  if (!input) return 'en';
  const raw = String(input).trim().toLowerCase().replace('_', '-');
  if (CODE_SET.has(raw)) return raw;
  const base = raw.split('-')[0];
  if (CODE_SET.has(base)) return base;
  const aliases = { nb: 'no', nn: 'no', fil: 'tl', iw: 'he' };
  if (aliases[base] && CODE_SET.has(aliases[base])) return aliases[base];
  return 'en';
}

export function isSupportedLocale(code) {
  return CODE_SET.has(normalizeLocale(code));
}

export function detectBrowserLocale() {
  if (typeof navigator === 'undefined') return 'en';
  return normalizeLocale(navigator.language || navigator.userLanguage || 'en');
}

export function languageLabel(code) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === normalizeLocale(code));
  return lang ? `${lang.nativeName} (${lang.name})` : code;
}
