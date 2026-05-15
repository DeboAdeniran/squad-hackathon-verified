import axios, { AxiosError } from 'axios';
import { BASE_URL } from '../constants';
import type { ApiError } from '../types';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // sends the HttpOnly cookie automatically on every request
  timeout: 10000, // 10 second timeout to prevent indefinite hangs
});

// ── Response interceptor — handle 401 globally ───────────────────────────────
// No request interceptor needed — the browser attaches the cookie automatically.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Cookie is HttpOnly so we can't clear it from JS.
      // The backend clears it via the logout endpoint.
      // Just redirect — the login page will handle the rest.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/**
 * Extracts the backend error message from an Axios error.
 * Falls back to the generic Axios message if the response body isn't an ApiError.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message ?? error.message;
  }
  return 'An unexpected error occurred.';
}
