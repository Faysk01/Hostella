import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, setUnauthorizedHandler } from '../services/api';
import type { Admin } from '../services/types';

type AuthState = {
  admin: Admin | null;
  checking: boolean;
  signIn: (email: string, password: string) => Promise<Admin>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setAdmin(null));
    api
      .get<Admin>('/auth/me')
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const a = await api.post<Admin>('/auth/login', { email, password });
    setAdmin(a);
    return a;
  }, []);
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setAdmin(await api.post<Admin>('/auth/password', { currentPassword, newPassword }));
  }, []);
  const signOut = useCallback(async () => {
    await api.post('/auth/logout').catch(() => undefined);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, checking, signIn, changePassword, signOut }), [admin, checking, signIn, changePassword, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
