import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getToken, setToken as persistToken, clearToken } from '../api/client';
import { signIn as apiSignIn, signUp as apiSignUp, oauthLogin as apiOauthLogin } from '../api/auth';

const AuthContext = createContext(null);

const USER_KEY = 'hades_auth_user';

function loadPersistedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn('[HADES] Could not persist user', e);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadPersistedUser);
  const [token, setTokenState] = useState(getToken);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = Boolean(token && user);

  // Shared handler for auth responses { token, user }
  const handleAuthResponse = useCallback((data) => {
    persistToken(data.token);
    setTokenState(data.token);
    const u = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar,
      hasGeneratedRoadmap: data.user.has_generated_roadmap,
    };
    setUser(u);
    persistUser(u);
    setAuthError(null);
    return u;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiSignIn({ email, password });
      const u = handleAuthResponse(data);
      return u;
    } catch (err) {
      const msg = err.body?.message || err.body?.error || 'Sign in failed. Check your credentials.';
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [handleAuthResponse]);

  const register = useCallback(async ({ name, email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiSignUp({ name, email, password });
      const u = handleAuthResponse(data);
      return u;
    } catch (err) {
      const msg = err.body?.message || err.body?.error || 'Registration failed.';
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [handleAuthResponse]);

  const googleLogin = useCallback(async ({ providerToken, email, name }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiOauthLogin({ provider: 'google', providerToken, email, name });
      const u = handleAuthResponse(data);
      return u;
    } catch (err) {
      const msg = err.body?.message || err.body?.error || 'Google login failed.';
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    persistUser(null);
    setAuthError(null);
    // Also clear roadmap flag
    try { localStorage.removeItem('hades_has_generated_roadmap'); } catch {}
  }, []);

  // Listen for 401 events from the API client to auto-logout
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('hades:auth:unauthorized', handler);
    return () => window.removeEventListener('hades:auth:unauthorized', handler);
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      authLoading,
      authError,
      setAuthError,
      login,
      register,
      googleLogin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
