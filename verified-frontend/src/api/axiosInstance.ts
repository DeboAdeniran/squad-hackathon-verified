import axios, { AxiosError } from 'axios';
import { BASE_URL, TOKEN_KEY } from '../constants';
import type { ApiError } from '../types';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach Bearer token ─────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 globally ───────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
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
