import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 300_000, // 5 minutes — stats don't need to be real-time
    refetchInterval: 300_000,
  });
}
