import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useMeQuery,
} from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '../api';
import { UserRole } from '../types';
import type { LoginRequest, RegisterRequest } from '../types';

// ── Shape ─────────────────────────────────────────────────────────────────────

interface AuthState {
  role: UserRole | null;
  userId: string | null;
  fullName: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean; // true while the /me check is in-flight on mount
  isAdmin: boolean;
  isAdjudicator: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<{
    role: UserRole | null;
    userId: string | null;
    fullName: string | null;
  }>({
    role: null,
    userId: null,
    fullName: null,
  });
  const [error, setError] = useState<string | null>(null);

  // ── TanStack Query hooks ──────────────────────────────────────────────────

  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  // ── Bootstrap: rehydrate session from cookie on every page load ───────────

  useEffect(() => {
    if (meQuery.status === 'success' && meQuery.data) {
      setAuth({
        role: meQuery.data.role,
        userId: meQuery.data.userId,
        fullName: meQuery.data.fullName,
      });
    } else if (meQuery.status === 'error') {
      // Query failed (401, 500, etc) — clear auth state
      setAuth({
        role: null,
        userId: null,
        fullName: null,
      });
    }
  }, [
    meQuery.status,
    meQuery.data?.role,
    meQuery.data?.userId,
    meQuery.data?.fullName,
  ]);

  // ── Computed state ────────────────────────────────────────────────────────

  const currentAuth =
    auth.role || meQuery.status !== 'success' || !meQuery.data
      ? auth
      : {
          role: meQuery.data.role,
          userId: meQuery.data.userId,
          fullName: meQuery.data.fullName,
        };

  const isAuthenticated = !!currentAuth.role;
  const isAdmin = currentAuth.role === UserRole.ADMIN;
  const isAdjudicator =
    currentAuth.role === UserRole.ADJUDICATOR ||
    currentAuth.role === UserRole.ADMIN;

  // isBootstrapping: true while the /me check is in-flight on mount
  const isBootstrapping = meQuery.isLoading;
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(
    async (payload: LoginRequest) => {
      setError(null);
      try {
        const response = await loginMutation.mutateAsync(payload);
        setAuth({
          role: response.role,
          userId: response.userId,
          fullName: response.fullName,
        });
        queryClient.setQueryData(['auth', 'me'], response);
      } catch (err) {
        const errorMsg = getApiErrorMessage(err);
        setError(errorMsg);
        throw err;
      }
    },
    [loginMutation, queryClient],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      setError(null);
      try {
        await registerMutation.mutateAsync(payload);
      } catch (err) {
        const errorMsg = getApiErrorMessage(err);
        setError(errorMsg);
        throw err;
      }
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setAuth({
        role: null,
        userId: null,
        fullName: null,
      });
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      window.location.href = '/login';
    }
  }, [logoutMutation, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        role: currentAuth.role,
        userId: currentAuth.userId,
        fullName: currentAuth.fullName,
        isAuthenticated,
        isBootstrapping,
        isAdmin,
        isAdjudicator,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
