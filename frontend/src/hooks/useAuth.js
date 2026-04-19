import { useState, useEffect, useCallback } from 'react';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function useAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check URL for token from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      localStorage.setItem('mg_token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, '', '/');
      return;
    }

    // Check localStorage
    const stored = localStorage.getItem('mg_token');
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      setUser(payload ? { email: payload.sub } : null);
    } else {
      setUser(null);
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem('mg_token');
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, isAuthenticated: !!token, logout };
}