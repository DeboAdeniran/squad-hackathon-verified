import { useQuery } from '@tanstack/react-query';
import { claimsApi } from '../api';
import { ClaimStatus } from '../types';
import { POLL_INTERVAL_MS } from '../constants';

/**
 * Polls GET /api/claims/:id/result every 2 seconds.
 * Stops automatically when status moves out of PROCESSING.
 */
export function useClaimResult(claimId: string | undefined) {
  return useQuery({
    queryKey: ['claim-result', claimId],
    queryFn: () => claimsApi.getClaimResult(claimId!),
    enabled: !!claimId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      return status === ClaimStatus.PROCESSING ||
        status === ClaimStatus.SUBMITTED
        ? POLL_INTERVAL_MS
        : false;
    },
    staleTime: 0,
  });
}
