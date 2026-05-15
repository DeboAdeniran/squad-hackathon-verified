import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api';
import type { LoginRequest, RegisterRequest } from '../types';

export { useAuth } from '../context/AuthContext';

/** Mutation hook for user login */
export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
  });
}

/** Mutation hook for user registration */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
  });
}

/** Mutation hook for user logout */
export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
}

/**
 * Query hook for rehydrating the current user session from the HttpOnly cookie.
 * The `enabled` prop can be controlled to defer the query (e.g., until after page load).
 * Throws 401 if the cookie is missing or expired.
 */
export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    enabled,
    retry: false, // Don't retry 401 errors; they mean no valid session
    staleTime: Infinity, // User data doesn't become stale during a session
  });
}
