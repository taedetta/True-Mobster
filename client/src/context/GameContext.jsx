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
  const socketRef = useRef(null);

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

  const loadCatalog = useCallback(async () => {
    try {
      const data = await api('/game/catalog');
      setCatalog(data);
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
      state, catalog, loading, message, refresh, action, gameGet, showMessage,
      setState,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
