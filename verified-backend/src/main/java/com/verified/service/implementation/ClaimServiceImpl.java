package com.verified.service.implementation;

import com.verified.dto.request.ClaimReviewRequest;
import com.verified.dto.request.ClaimSubmitRequest;
import com.verified.dto.response.*;
import com.verified.model.Claim;
import com.verified.model.ClaimFile;
import com.verified.model.TrustScore;
import com.verified.model.enums.*;
import com.verified.repository.ClaimFileRepository;
import com.verified.repository.ClaimRepository;
import com.verified.repository.SquadTransactionRepository;
import com.verified.repository.TrustScoreRepository;
import com.verified.service.ClaimService;
import com.verified.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {
    private final ClaimRepository claimRepository;
    private final ClaimFileRepository claimFileRepository;
    private final TrustScoreRepository trustScoreRepository;
    private final SquadTransactionRepository squadTransactionRepository;
    private final ScoringService scoringService;
    @Override
    public ClaimSubmitResponse submitClaim(ClaimSubmitRequest request) {
        boolean duplicate = claimRepository.existsByPolicyNumberAndStatusIn(
                request.getPolicyNumber(),
                List.of(ClaimStatus.PROCESSING, ClaimStatus.SCORED)
        );
        if (duplicate){
            throw new RuntimeException("A claim for this policy number is already being processed");
        }

        Claim claim = Claim.builder()
                .claimantName(request.getClaimantName())
                .policyNumber(request.getPolicyNumber())
                .claimType(request.getClaimType())
                .claimedAmount(request.getClaimedAmount())
                .incidentDate(request.getIncidentDate())
                .description(request.getDescription())
                .status(ClaimStatus.PROCESSING)
                .build();

        Claim saved = claimRepository.save(claim);

        if (request.getPhotoUrls() != null) {
            request.getPhotoUrls().forEach(url -> {
                ClaimFile file = ClaimFile.builder()
                        .claim(saved)
                        .fileType(FileType.PHOTO)
                        .fileUrl(url)
                        .build();
                claimFileRepository.save(file);
            });
        }

        if (request.getDocumentUrls() != null) {
            request.getDocumentUrls().forEach(url -> {
                ClaimFile file = ClaimFile.builder()
                        .claim(saved)
                        .fileType(FileType.DOCUMENT)
                        .fileUrl(url)
                        .build();
                claimFileRepository.save(file);
            });
        }

        scoringService.scoreClaim(saved);
        return ClaimSubmitResponse.builder()
                .claimId(saved.getId())
                .status("PROCESSING")
                .message("Claim received. Verified AI is analysing your submission.")
                .build();
    }

    @Override
    public ClaimFileResponse uploadFiles(UUID claimId, List<MultipartFile> files, String fileType) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(()-> new RuntimeException("Claim not found"));

        List<String> urls = new ArrayList<>();

        files.forEach(file ->{
            String url = "https://placeholder.cloudinary.com/" + file.getOriginalFilename();
            ClaimFile claimFile = ClaimFile.builder()
                    .claim(claim)
                    .fileType(FileType.valueOf(fileType.toUpperCase()))
                    .fileUrl(url)
                    .build();
            claimFileRepository.save(claimFile);
            urls.add(url);
        });
        return ClaimFileResponse.builder()
                .fileUrls(urls)
                .message("Files uploaded successfully")
                .build();
    }

    @Override
    public ClaimResultResponse getClaimResult(UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        if (claim.getStatus() == ClaimStatus.PROCESSING) {
            return ClaimResultResponse.builder()
                    .claimId(claim.getId())
                    .status(ClaimStatus.PROCESSING)
                    .flags(List.of())
                    .build();
        }
        TrustScore score = trustScoreRepository.findByClaimId(claimId)
                .orElseThrow(() -> new RuntimeException("Score not found"));

        List<FlagDto> flags = score.getFlags().stream()
                .map(f -> FlagDto.builder()
                        .module(f.getModule())
                        .signal(f.getSignal())
                        .explanation(f.getExplanation())
                        .build())
                .collect(Collectors.toList());

        return ClaimResultResponse.builder()
                .claimId(claim.getId())
                .status(claim.getStatus())
                .trustScore(score.getTrustScore())
                .tier(score.getTier())
                .squadAction(score.getSquadAction())
                .confidence(score.getConfidence())
                .moduleScores(ModuleScoresDto.builder()
                        .photoScore(score.getPhotoScore())
                        .documentScore(score.getDocumentScore())
                        .behavioralScore(score.getBehavioralScore())
                        .identityScore(score.getIdentityScore())
                        .priceScore(score.getPriceScore())
                        .build())
                .flags(flags)
                .scoredAt(score.getScoredAt())
                .build();
    }

    @Override
    public Page<ClaimSummaryResponse> getAllClaims(String tier, String claimType, String status, Pageable pageable) {
        Page<Claim> claims;

        if (tier != null && !tier.equals("ALL")) {
            claims = claimRepository.findByTrustScore_Tier(ScoreTier.valueOf(tier), pageable);
        } else if (status != null) {
            claims = claimRepository.findByStatus(ClaimStatus.valueOf(status), pageable);
        } else if (claimType != null) {
            claims = claimRepository.findByClaimType(ClaimType.valueOf(claimType), pageable);
        } else {
            claims = claimRepository.findAll(pageable);
        }

        return claims.map(claim -> {
            TrustScore score = claim.getTrustScore();
            return ClaimSummaryResponse.builder()
                    .claimId(claim.getId())
                    .claimantName(claim.getClaimantName())
                    .policyNumber(claim.getPolicyNumber())
                    .claimType(claim.getClaimType())
                    .claimedAmount(claim.getClaimedAmount())
                    .status(claim.getStatus())
                    .tier(score != null ? score.getTier() : null)
                    .trustScore(score != null ? score.getTrustScore() : null)
                    .createdAt(claim.getCreatedAt())
                    .build();
        });
    }

    @Override
    public ClaimDetailResponse getClaimDetail(UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        List<ClaimFileDto> fileDtos = claimFileRepository.findByClaimId(claimId).stream()
                .map(f -> ClaimFileDto.builder()
                        .id(f.getId())
                        .fileType(f.getFileType())
                        .fileUrl(f.getFileUrl())
                        .uploadedAt(f.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        List<SquadTxDto> txDtos = squadTransactionRepository.findByClaimId(claimId).stream()
                .map(t -> SquadTxDto.builder()
                        .id(t.getId())
                        .action(t.getAction())
                        .squadReference(t.getSquadReference())
                        .amount(t.getAmount())
                        .status(t.getStatus())
                        .calledAt(t.getCalledAt())
                        .build())
                .collect(Collectors.toList());

        ClaimResultResponse scoreResponse = null;
        if (claim.getTrustScore() != null) {
            scoreResponse = getClaimResult(claimId);
        }

        return ClaimDetailResponse.builder()
                .claimId(claim.getId())
                .claimantName(claim.getClaimantName())
                .policyNumber(claim.getPolicyNumber())
                .claimType(claim.getClaimType())
                .claimedAmount(claim.getClaimedAmount())
                .incidentDate(claim.getIncidentDate())
                .description(claim.getDescription())
                .status(claim.getStatus())
                .files(fileDtos)
                .trustScore(scoreResponse)
                .squadTransactions(txDtos)
                .createdAt(claim.getCreatedAt())
                .updatedAt(claim.getUpdatedAt())
                .build();
    }

    @Override
    public void reviewClaim(UUID claimId, ClaimReviewRequest request) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        if (request.getDecision() == ReviewDecision.APPROVE) {
            claim.setStatus(ClaimStatus.PAID);
        } else {
            claim.setStatus(ClaimStatus.BLOCKED);
        }

        claimRepository.save(claim);
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

        Long totalToday = claimRepository.countClaimsSince(oneDayAgo);
        Long totalThisWeek = claimRepository.countClaimsSince(oneWeekAgo);

        java.math.BigDecimal totalBlocked = claimRepository.sumAmountByStatus(ClaimStatus.BLOCKED);
        java.math.BigDecimal totalReleased = claimRepository.sumAmountByStatus(ClaimStatus.PAID);

        Long verifiedCount = trustScoreRepository.countByTier(ScoreTier.VERIFIED);
        Long reviewCount = trustScoreRepository.countByTier(ScoreTier.REVIEW);
        Long flaggedCount = trustScoreRepository.countByTier(ScoreTier.FLAGGED);
        Long totalScored = verifiedCount + reviewCount + flaggedCount;

        Double approvalRate = totalScored > 0
                ? (verifiedCount.doubleValue() / totalScored.doubleValue()) * 100
                : 0.0;

        return DashboardStatsResponse.builder()
                .totalClaimsToday(totalToday)
                .totalClaimsThisWeek(totalThisWeek)
                .totalAmountBlocked(totalBlocked)
                .totalAmountReleased(totalReleased)
                .approvalRate(approvalRate)
                .flaggedCount(flaggedCount)
                .reviewCount(reviewCount)
                .tierBreakdown(Map.of(
                        "VERIFIED", verifiedCount,
                        "REVIEW", reviewCount,
                        "FLAGGED", flaggedCount
                ))
                .build();
    }
}
