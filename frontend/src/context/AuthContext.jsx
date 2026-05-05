import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('scrutin_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setToken(null);
        localStorage.removeItem('scrutin_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check URL parameters for OAuth token
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('scrutin_token', urlToken);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchUser(urlToken);
    } else {
      fetchUser(token);
    }
  }, [token, fetchUser]);

  const signIn = async (email, password) => {
    const res = await apiFetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    setToken(data.token);
    localStorage.setItem('scrutin_token', data.token);
    setUser(data.user);
  };

  const signUp = async (email, password) => {
    const res = await apiFetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    setToken(data.token);
    localStorage.setItem('scrutin_token', data.token);
    setUser(data.user);
  };

  const signOut = () => {
    setToken(null);
    localStorage.removeItem('scrutin_token');
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
