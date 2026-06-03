import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthFailureHandler } from '../api';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const saved = localStorage.getItem('tm_user');
    const token = localStorage.getItem('tm_token');
    if (!saved || !token) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    setUser(null);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(logout);
    return () => setAuthFailureHandler(null);
  }, [logout]);

  useEffect(() => {
    const stored = readStoredUser();
    if (!stored) {
      setAuthReady(true);
      return;
    }

    api('/auth/me')
      .then(() => setUser(stored))
      .catch(() => logout())
      .finally(() => setAuthReady(true));
  }, [logout]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('tm_token', data.token);
      localStorage.setItem('tm_user', JSON.stringify(data));
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, displayName, referralCode) => {
    setLoading(true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, displayName, referralCode }),
      });
      localStorage.setItem('tm_token', data.token);
      localStorage.setItem('tm_user', JSON.stringify(data));
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
