import { useState, useCallback } from 'react';
import { authApi } from '../api';
import { TOKEN_KEY, ROLE_KEY, USER_ID_KEY } from '../constants';
import type { LoginRequest, RegisterRequest } from '../types';
import { UserRole } from '../types';

function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

function getStoredRole(): UserRole | null {
  const role = sessionStorage.getItem(ROLE_KEY);
  return role ? (role as UserRole) : null;
}

function getStoredUserId(): string | null {
  return sessionStorage.getItem(USER_ID_KEY);
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [role, setRole] = useState<UserRole | null>(getStoredRole);
  const [userId, setUserId] = useState<string | null>(getStoredUserId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;
  const isAdmin = role === UserRole.ADMIN;
  const isAdjudicator =
    role === UserRole.ADJUDICATOR || role === UserRole.ADMIN;

  const login = useCallback(async (payload: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(payload);
      sessionStorage.setItem(TOKEN_KEY, response.accessToken);
      sessionStorage.setItem(ROLE_KEY, response.role);
      sessionStorage.setItem(USER_ID_KEY, response.userId);
      setToken(response.accessToken);
      setRole(response.role);
      setUserId(response.userId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setToken(null);
    setRole(null);
    setUserId(null);
    window.location.href = '/login';
  }, []);

  return {
    token,
    role,
    userId,
    isAuthenticated,
    isAdmin,
    isAdjudicator,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
