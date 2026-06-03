const API = '/api';

let authFailureHandler = null;

export function setAuthFailureHandler(handler) {
  authFailureHandler = handler;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('tm_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(`${API}${path}`, { ...options, headers, signal: controller.signal });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && token) {
      authFailureHandler?.();
      throw new Error('Session expired — please log in again');
    }

    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Server is waking up — try again in a moment');
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export function assetUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : path;
}

export function formatMoney(n) {
  return '$' + Number(n || 0).toLocaleString();
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Authenticated GET to /api/game/* */
export function gameGet(path) {
  return api(`/game${path}`);
}
