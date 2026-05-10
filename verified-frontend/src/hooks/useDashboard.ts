import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 60_000, // 1 minute — stats don't need to be real-time
    refetchInterval: 60_000,
  });
}
