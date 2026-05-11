import { useState, useCallback } from 'react';
import { authApi } from '../api';
import type { LoginRequest, RegisterRequest } from '../types';
import { UserRole } from '../types';
import { getApiErrorMessage } from '../api';

export function useAuth() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!role;
  const isAdmin = role === UserRole.ADMIN;
  const isAdjudicator =
    role === UserRole.ADJUDICATOR || role === UserRole.ADMIN;

  const login = useCallback(async (payload: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(payload);
      setRole(response.role);
      setUserId(response.userId);
      return response;
    } catch (err) {
      setError(getApiErrorMessage(err));
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
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setRole(null);
      setUserId(null);
      window.location.href = '/login';
    }
  }, []);

  return {
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
