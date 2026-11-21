import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService, { AUTH_MODE } from '../services/authService';
import { clearAllCache } from '../services/citizenStore';

// The UI only talks to authService. Demo mode = browser-only fake accounts (NOT secure).
// API mode (VITE_API_BASE_URL set) = real server session via httpOnly cookie.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const peeked = authService.peekUser ? authService.peekUser() : undefined;
  const [user, setUser] = useState(peeked ?? null);
  const [status, setStatus] = useState(peeked !== undefined ? 'ready' : 'loading');

  useEffect(() => {
    if (status !== 'loading') return undefined;
    let cancelled = false;
    authService.getCurrentUser().then((u) => { if (!cancelled) setUser(u); }).catch(() => {}).finally(() => { if (!cancelled) setStatus('ready'); });
    return () => { cancelled = true; };
  }, [status]);

  const login = useCallback(async (creds) => { const u = await authService.login(creds); setUser(u); return u; }, []);
  const register = useCallback(async (data) => { const u = await authService.register(data); setUser(u); return u; }, []);
  const quickLogin = useCallback(async (role) => { const u = await authService.quickLogin(role); setUser(u); return u; }, []);
  const logout = useCallback(async () => { try { await authService.logout(); } finally { setUser(null); } }, []);
  const requestPasswordReset = useCallback((email) => authService.requestPasswordReset(email), []);
  const deleteAccount = useCallback(async () => { await authService.deleteAccount(user?.id); clearAllCache(); setUser(null); }, [user]);

  const value = useMemo(() => ({
    user, status, authMode: AUTH_MODE, isDemoAuth: AUTH_MODE === 'demo', canQuickLogin: Boolean(authService.quickLogin),
    isAuthenticated: Boolean(user), isAdmin: user?.role === 'admin',
    login, register, quickLogin, logout, requestPasswordReset, deleteAccount,
  }), [user, status, login, register, quickLogin, logout, requestPasswordReset, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
