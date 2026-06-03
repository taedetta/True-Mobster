import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [socket, setSocket] = useState(null);

  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api('/game/state');
      setState(data);
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }, [user, showMessage]);

  const loadCatalog = useCallback(async () => {
    const data = await api('/game/catalog');
    setCatalog(data);
  }, []);

  useEffect(() => {
    if (!user) {
      setState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([refresh(), loadCatalog()])
      .finally(() => setLoading(false));

    const token = localStorage.getItem('tm_token');
    const socketUrl = import.meta.env.DEV ? 'http://localhost:3002' : window.location.origin;
    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    s.on('state', setState);
    s.on('connect', () => s.emit('refresh'));
    setSocket(s);

    const interval = setInterval(refresh, 60000);
    return () => {
      s.disconnect();
      clearInterval(interval);
    };
  }, [user, refresh, loadCatalog]);

  const action = useCallback(async (path, body, successMsg) => {
    try {
      const data = await api(`/game${path}`, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      if (data.state) setState(data.state);
      if (successMsg) showMessage(successMsg, 'success');
      socket?.emit('refresh');
      return data;
    } catch (err) {
      showMessage(err.message, 'error');
      throw err;
    }
  }, [showMessage, socket]);

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
