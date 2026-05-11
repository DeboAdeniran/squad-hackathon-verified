package com.verified.service;

import com.verified.dto.request.ClaimReviewRequest;
import com.verified.dto.request.ClaimSubmitRequest;
import com.verified.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ClaimService {
    ClaimSubmitResponse submitClaim(ClaimSubmitRequest request);
    ClaimFileResponse uploadFiles(UUID claimId, List<MultipartFile> files, String fileType);
    ClaimResultResponse getClaimResult(UUID claimId);
    Page<ClaimSummaryResponse> getAllClaims(String tier, String claimType, String status, Pageable pageable);
    ClaimDetailResponse getClaimDetail(UUID claimId);
    void reviewClaim(UUID claimId, ClaimReviewRequest request);
    DashboardStatsResponse getDashboardStats();
}
