import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { authApi } from '../api';
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
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!role;
  const isAdmin = role === UserRole.ADMIN;
  const isAdjudicator =
    role === UserRole.ADJUDICATOR || role === UserRole.ADMIN;

  // ── Bootstrap: rehydrate session from cookie on every page load ───────────

  useEffect(() => {
    authApi
      .me()
      .then((res) => {
        setRole(res.role);
        setUserId(res.userId);
      })
      .catch(() => {
        // 401 = no valid cookie, stay logged out.
        // The axiosInstance 401 interceptor redirects to /login globally,
        // but we suppress that here by handling the error ourselves.
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(async (payload: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(payload);
      setRole(response.role);
      setUserId(response.userId);
      setFullName(response.fullName);
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

  return (
    <AuthContext.Provider
      value={{
        role,
        userId,
        fullName,
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
