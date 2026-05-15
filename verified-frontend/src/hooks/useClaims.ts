import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimsApi } from '../api';
import type {
  ClaimsQueryParams,
  ClaimSubmitRequest,
  ReviewRequest,
  verifyAccountRequest,
} from '../types';

export function useClaims(params: ClaimsQueryParams = {}) {
  return useQuery({
    queryKey: ['claims', params],
    queryFn: () => claimsApi.getClaims(params),
    staleTime: 300_000, // 5 minutes
    refetchInterval: 300_000,
  });
}

/**
 * Mutation hook for submitting a new claim with optional files.
 * Automatically invalidates the 'claims' query cache on success.
 */
export function useSubmitClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      data: ClaimSubmitRequest;
      photos: File[];
      documents: File[];
    }) =>
      claimsApi.submitClaim(payload.data, payload.photos, payload.documents),
    onSuccess: () => {
      // Invalidate only the claims list queries (not specific claim details)
      queryClient.invalidateQueries({
        queryKey: ['claims'],
      });
    },
  });
}

/**
 * Mutation hook for reviewing a claim (adjudicator/admin only).
 * Automatically invalidates the claim detail and claims list queries on success.
 */
export function useReviewClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { claimId: string; reviewData: ReviewRequest }) =>
      claimsApi.reviewClaim(payload.claimId, payload.reviewData),
    onSuccess: (_, { claimId }) => {
      // Invalidate only the specific claim detail that was reviewed (granular cache control)
      queryClient.invalidateQueries({ queryKey: ['claim-detail', claimId] });
      // Also refresh the claims list but only if it's already cached
      queryClient.invalidateQueries({
        queryKey: ['claims'],
        exact: false,
      });
    },
  });
}

export function useVerifyAccountMutation() {
  return useMutation({
    mutationFn: (payload: verifyAccountRequest) =>
      claimsApi.verifyAccount(payload),
  });
}
