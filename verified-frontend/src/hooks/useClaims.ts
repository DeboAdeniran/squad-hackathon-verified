import { useQuery } from '@tanstack/react-query';
import { claimsApi } from '../api';
import type { ClaimsQueryParams } from '../types';

export function useClaims(params: ClaimsQueryParams = {}) {
  return useQuery({
    queryKey: ['claims', params],
    queryFn: () => claimsApi.getClaims(params),
    staleTime: 30_000, // 30 seconds
  });
}
