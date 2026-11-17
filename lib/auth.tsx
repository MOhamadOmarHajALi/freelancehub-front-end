'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getSession, setSession, User } from './api';

type RegisterData = { name: string; email: string; password: string; role: 'OWNER' | 'FREELANCER' };
type Ctx = {
  user: User | null; ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (d: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getSession()?.user ?? null);
    setReady(true);
    const h = () => setUser(null);
    window.addEventListener('fh:logout', h);
    return () => window.removeEventListener('fh:logout', h);
  }, []);

  const finish = (r: any) => {
    setSession({ accessToken: r.accessToken, refreshToken: r.refreshToken, user: r.user });
    setUser(r.user);
    return r.user as User;
  };
  const login = useCallback(async (email: string, password: string) =>
    finish(await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })), []);
  const register = useCallback(async (d: RegisterData) =>
    finish(await api('/auth/register', { method: 'POST', body: d, auth: false })), []);
  const end = async (path: string) => { try { await api(path, { method: 'POST' }); } catch { /* الجلسة منتهية أصلاً */ } setSession(null); setUser(null); };
  const logout = useCallback(() => end('/auth/logout'), []);
  const logoutAll = useCallback(() => end('/auth/logout-all'), []);

  return <AuthCtx.Provider value={{ user, ready, login, register, logout, logoutAll }}>{children}</AuthCtx.Provider>;
}
