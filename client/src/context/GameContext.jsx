import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { user, authReady } = useAuth();
  const [state, setState] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const socketRef = useRef(null);
  const refreshRef = useRef(null);
  const lastOverdueRefreshRef = useRef(0);

  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return null;
    try {
      const data = await api('/game/state');
      setState(data);
      return data;
    } catch (err) {
      showMessage(err.message, 'error');
      return null;
    }
  }, [user, showMessage]);

  refreshRef.current = refresh;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state) return undefined;
    const toMs = (v) => (v == null ? null : typeof v === 'number' ? v : new Date(v).getTime());
    const deadlines = [];

    if (state.energy < state.max_energy) {
      const t = toMs(state.regenAt?.energy);
      if (t != null) deadlines.push(t);
    }
    if (state.stamina < state.max_stamina) {
      const t = toMs(state.regenAt?.stamina);
      if (t != null) deadlines.push(t);
    }
    if (state.health < state.max_health) {
      const t = toMs(state.regenAt?.health);
      if (t != null) deadlines.push(t);
    }
    if (state.economy?.nextTickAt) deadlines.push(toMs(state.economy.nextTickAt));
    if (state.in_jail_until) deadlines.push(toMs(state.in_jail_until));
    if (state.iced_until) deadlines.push(toMs(state.iced_until));

    const valid = deadlines.filter((t) => t != null && !Number.isNaN(t));
    const overdue = valid.some((t) => t <= now);
    if (overdue) {
      if (Date.now() - lastOverdueRefreshRef.current > 1500) {
        lastOverdueRefreshRef.current = Date.now();
        refreshRef.current?.();
      }
      return undefined;
    }
    const upcoming = valid.filter((t) => t > now).sort((a, b) => a - b)[0];
    if (upcoming == null) return undefined;
    const delay = Math.min(upcoming - now + 400, 86400000);
    const timeout = setTimeout(() => refreshRef.current?.(), delay);
    return () => clearTimeout(timeout);
  }, [state, now]);

  const loadCatalog = useCallback(async () => {
    const cached = sessionStorage.getItem('tm_catalog');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCatalog(parsed);
      } catch { /* refresh below */ }
    }
    try {
      const data = await api('/game/catalog');
      setCatalog(data);
      sessionStorage.setItem('tm_catalog', JSON.stringify(data));
      return data;
    } catch (err) {
      showMessage(err.message, 'error');
      return null;
    }
  }, [showMessage]);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setState(null);
      setCatalog(null);
      setLoading(false);
      sessionStorage.removeItem('tm_catalog');
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([refresh(), loadCatalog()])
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const token = localStorage.getItem('tm_token');
    const s = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    s.on('state', setState);
    s.on('connect', () => s.emit('refresh'));
    s.on('connect_error', () => { /* non-fatal */ });
    socketRef.current = s;

    const interval = setInterval(refresh, 60000);
    return () => {
      cancelled = true;
      s.disconnect();
      clearInterval(interval);
      socketRef.current = null;
    };
  }, [user, authReady, refresh, loadCatalog]);

  const action = useCallback(async (path, body, successMsg) => {
    try {
      const data = await api(`/game${path}`, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      if (data.state) setState(data.state);
      if (successMsg) showMessage(successMsg, 'success');
      socketRef.current?.emit('refresh');
      return data;
    } catch (err) {
      showMessage(err.message, 'error');
      throw err;
    }
  }, [showMessage]);

  const gameGet = useCallback(async (path) => {
    try {
      return await api(`/game${path}`);
    } catch (err) {
      showMessage(err.message, 'error');
      throw err;
    }
  }, [showMessage]);

  return (
    <GameContext.Provider value={{
      state, catalog, loading, message, now, refresh, action, gameGet, showMessage,
      setState, socketRef,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
