const API = '/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('tm_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
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
