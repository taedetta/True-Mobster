/** Format seconds remaining as M:SS (uses explicit `now` for live countdowns). */
export function formatCountdown(isoOrMs, now = Date.now()) {
  if (!isoOrMs) return null;
  const t = typeof isoOrMs === 'number' ? isoOrMs : new Date(isoOrMs).getTime();
  const sec = Math.max(0, Math.ceil((t - now) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function msUntil(isoOrMs, now = Date.now()) {
  if (!isoOrMs) return null;
  const t = typeof isoOrMs === 'number' ? isoOrMs : new Date(isoOrMs).getTime();
  return t - now;
}
