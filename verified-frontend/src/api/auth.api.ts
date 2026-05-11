import { axiosInstance } from './axiosInstance';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>(
      '/api/auth/login',
      payload,
    );

    return data;
  },

  register: async (payload: RegisterRequest): Promise<void> => {
    await axiosInstance.post('/api/auth/register', payload);
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/logout');
  },
};
