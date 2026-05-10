import { useQuery } from '@tanstack/react-query';
import { claimsApi } from '../api';

export function useClaimDetail(claimId: string | undefined) {
  return useQuery({
    queryKey: ['claim-detail', claimId],
    queryFn: () => claimsApi.getClaimDetail(claimId!),
    enabled: !!claimId,
    staleTime: 30_000,
  });
}
