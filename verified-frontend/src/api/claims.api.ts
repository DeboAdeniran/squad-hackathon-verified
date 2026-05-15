import { axiosInstance } from './axiosInstance';
import type {
  ClaimSubmitRequest,
  ClaimResult,
  ClaimDetail,
  PaginatedClaims,
  ClaimsQueryParams,
  ReviewRequest,
  verifyAccountRequest,
} from '../types';

export const claimsApi = {
  /**
   * Submit a claim with optional files in one multipart request.
   * Form shape the backend expects:
   *   data       — JSON blob (ClaimSubmitRequest fields, no file URLs)
   *   photos     — File(s), key repeated per file
   *   documents  — File(s), key repeated per file
   */
  submitClaim: async (
    payload: ClaimSubmitRequest,
    photos: File[] = [],
    documents: File[] = [],
  ): Promise<{ claimId: string; status: string }> => {
    const form = new FormData();

    // Attach the claim fields as a JSON blob under the "data" key
    form.append(
      'data',
      new Blob([JSON.stringify(payload)], { type: 'application/json' }),
    );

    // Attach each file under its respective key (repeated entries are fine)
    photos.forEach((f) => form.append('photos', f));
    documents.forEach((f) => form.append('documents', f));

    const { data } = await axiosInstance.post<{
      claimId: string;
      status: string;
    }>(
      '/api/claims/submit',
      form,
      // Let axios set the Content-Type with the correct boundary automatically
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return data;
  },

  /** Polled every 2 seconds until status !== PROCESSING */
  getClaimResult: async (claimId: string): Promise<ClaimResult> => {
    const { data } = await axiosInstance.get<ClaimResult>(
      `/api/claims/${claimId}/result`,
    );
    return data;
  },

  /** Full detail — includes files and squad transaction history */
  getClaimDetail: async (claimId: string): Promise<ClaimDetail> => {
    const { data } = await axiosInstance.get<ClaimDetail>(
      `/api/claims/${claimId}`,
    );
    return data;
  },

  /** Paginated list with optional filters */
  getClaims: async (
    params: ClaimsQueryParams = {},
  ): Promise<PaginatedClaims> => {
    const { data } = await axiosInstance.get<PaginatedClaims>('/api/claims', {
      params,
    });
    return data;
  },

  /** Adjudicator / Admin only — only callable when status === UNDER_REVIEW */
  reviewClaim: async (
    claimId: string,
    payload: ReviewRequest,
  ): Promise<void> => {
    await axiosInstance.post(`/api/claims/${claimId}/review`, payload);
  },

  verifyAccount: async (
    payload: verifyAccountRequest,
  ): Promise<{
    accountName: string;
    accountNumber: string;
    bankCode: string;
  }> => {
    const { data } = await axiosInstance.get<{
      accountName: string;
      accountNumber: string;
      bankCode: string;
    }>(`/api/claims/verify-account`, {
      params: payload,
    });
    return data;
  },
};
