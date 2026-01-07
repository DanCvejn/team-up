import { authAPI } from '@/lib/api';
import type { User } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        if (currentUser) {
          try {
            const refreshedUser = await authAPI.refresh();
            setUser(refreshedUser || currentUser);
          } catch (refreshErr) {
            console.warn('Token refresh failed, clearing auth:', refreshErr);
            authAPI.logout();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await authAPI.register(email, password, name);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      const errorMsg = err?.message || 'Registrace se nezdařila';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await authAPI.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (err: any) {
      const errorMsg = err?.message || 'Přihlášení se nezdařilo';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    register,
    login,
    logout,
  };
}