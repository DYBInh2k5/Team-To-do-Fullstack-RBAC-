import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import {
  getProfile,
  login as loginApi,
  register as registerApi,
  type AuthPayload,
  type RegisterPayload,
} from '../lib/api';
import {
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
} from '../lib/storage';
import type { User } from '../types';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: PropsWithChildren) {
  const tokenAtBoot = getToken();
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(tokenAtBoot));

  useEffect(() => {
    if (!tokenAtBoot) {
      return;
    }

    getProfile()
      .then((profile) => {
        setUser(profile);
        saveSession(tokenAtBoot, profile);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, [tokenAtBoot]);

  const login = useCallback(async (payload: AuthPayload) => {
    const response = await loginApi(payload);
    saveSession(response.accessToken, response.user);
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await registerApi(payload);
    saveSession(response.accessToken, response.user);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isBootstrapping, login, register, logout }),
    [isBootstrapping, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
