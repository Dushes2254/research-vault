import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, getToken, setToken } from '../api/client';

type User = { id: string; email: string } | null;

const Ctx = createContext<{
  user: User;
  setUser: (u: User) => void;
  ready: boolean;
}>({ user: null, setUser: () => {}, ready: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setUser(null);
        setReady(true);
        return;
      }
      try {
        const u = (await apiFetch('/auth/me')) as { id: string; email: string };
        setUser(u);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const value = useMemo(() => ({ user, setUser, ready }), [user, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

export function authLogout() {
  setToken(null);
  window.location.href = '/login';
}
