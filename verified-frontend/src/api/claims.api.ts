import { axiosInstance } from './axiosInstance';
import type {
  ClaimSubmitRequest,
  ClaimResult,
  ClaimDetail,
  PaginatedClaims,
  ClaimsQueryParams,
  ReviewRequest,
} from '../types';

export const claimsApi = {
  /** Step 1 of submission — upload files, get back URLs */
  uploadFiles: async (
    claimId: string,
    files: File[],
    fileType: 'PHOTO' | 'DOCUMENT',
  ): Promise<string[]> => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    form.append('fileType', fileType);

    const { data } = await axiosInstance.post<string[]>(
      `/api/claims/${claimId}/files`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** Step 2 of submission — submit the claim payload */
  submitClaim: async (
    payload: ClaimSubmitRequest,
  ): Promise<{ id: string; status: string }> => {
    const { data } = await axiosInstance.post<{ id: string; status: string }>(
      '/api/claims/submit',
      payload,
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
};
