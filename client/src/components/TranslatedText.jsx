import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { api } from '../api';
import { normalizeLocale } from '../../../shared/languages.js';
import { t } from '../../../shared/uiStrings.js';

/**
 * Shows translated text with a toggle to view the original message.
 */
export default function TranslatedText({
  text,
  original,
  translated = false,
  sourceLocale = 'en',
  className = '',
}) {
  const { state } = useGame();
  const locale = normalizeLocale(state?.locale || 'en');
  const [showOriginal, setShowOriginal] = useState(false);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(false);

  const src = normalizeLocale(sourceLocale);
  const orig = original ?? text;
  const needsFetch = !translated && !!orig && src !== locale;

  useEffect(() => {
    if (!needsFetch) {
      setLive(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    api('/game/translate', {
      method: 'POST',
      body: JSON.stringify({ text: orig, from: src, to: locale }),
    })
      .then((r) => { if (!cancelled) setLive(r); })
      .catch(() => { if (!cancelled) setLive({ text: orig, translated: false }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [needsFetch, orig, src, locale]);

  const isTranslated = translated || live?.translated;
  const display = showOriginal
    ? orig
    : (translated ? text : (live?.text ?? text ?? orig));

  return (
    <span className={className}>
      {loading && !showOriginal && needsFetch ? (
        <span className="text-gray-500 italic text-xs">…</span>
      ) : (
        display
      )}
      {isTranslated && (
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="ml-1.5 text-[10px] text-mob-gold underline align-baseline"
        >
          {showOriginal ? t('showTranslation', locale) : t('showOriginal', locale)}
        </button>
      )}
    </span>
  );
}
