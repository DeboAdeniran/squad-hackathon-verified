import { axiosInstance } from './axiosInstance';
import type { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await axiosInstance.get<DashboardStats>(
      '/api/dashboard/stats',
    );
    return data;
  },
};
