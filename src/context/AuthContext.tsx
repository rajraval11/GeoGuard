import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { authApi } from '../api/services';
import { AuthContext } from './useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial state starts as unauthenticated (user = null, isAuthenticated = false)
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on application startup
  useEffect(() => {
    const initAuthSession = async () => {
      const storedToken = localStorage.getItem('geoguard_auth_token');
      const storedUser = localStorage.getItem('geoguard_user');

      // If no valid session exists: user remains unauthenticated
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      // Check stored user cache or verify with backend
      try {
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        }
        // Verify token validity with backend
        try {
          const verifiedUser = await authApi.getCurrentUser();
          setUser(verifiedUser);
          setToken(storedToken);
          localStorage.setItem('geoguard_user', JSON.stringify(verifiedUser));
        } catch (err: any) {
          // If backend reports token invalid (401 Unauthorized / 403 Forbidden)
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            localStorage.removeItem('geoguard_auth_token');
            localStorage.removeItem('geoguard_user');
            setUser(null);
            setToken(null);
          }
          // Network errors keep local cache intact for offline resilience
        }
      } catch {
        // Corrupted session in local storage
        localStorage.removeItem('geoguard_auth_token');
        localStorage.removeItem('geoguard_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuthSession();
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password, role });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('geoguard_auth_token', res.token);
      localStorage.setItem('geoguard_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Clear session even if network logout fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('geoguard_auth_token');
      localStorage.removeItem('geoguard_user');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
