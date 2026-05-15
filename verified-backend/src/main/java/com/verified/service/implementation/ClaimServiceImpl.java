package com.verified.service.implementation;

import com.cloudinary.Cloudinary;
import com.verified.dto.request.ClaimReviewRequest;
import com.verified.dto.request.ClaimSubmitRequest;
import com.verified.dto.response.*;
import com.verified.dto.squad.SquadApiResponse;
import com.verified.exception.BusinessRuleViolationException;
import com.verified.exception.DuplicateResourceException;
import com.verified.exception.ResourceNotFoundException;
import com.verified.integration.SquadApiClient;
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
import com.verified.service.SquadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {
    private final ClaimRepository claimRepository;
    private final ClaimFileRepository claimFileRepository;
    private final TrustScoreRepository trustScoreRepository;
    private final SquadTransactionRepository squadTransactionRepository;
    private final ScoringService scoringService;
    private final SquadService squadService;
    private final SquadApiClient squadApiClient;
    private final Cloudinary cloudinary;
    @Override
    public ClaimSubmitResponse submitClaim(ClaimSubmitRequest request,
                                           List<MultipartFile> photos,
                                           List<MultipartFile> documents) {

        boolean duplicate = claimRepository.existsByPolicyNumber(request.getPolicyNumber());
        if (duplicate){
            throw new DuplicateResourceException("A claim for this policy number already exists");
        }

        Claim claim = Claim.builder()
                .claimantName(request.getClaimantName())
                .policyNumber(request.getPolicyNumber())
                .claimType(request.getClaimType())
                .claimedAmount(request.getClaimedAmount())
                .incidentDate(request.getIncidentDate())
                .description(request.getDescription())
                .accountNumber(request.getAccountNumber())
                .bankCode(request.getBankCode())
                .accountName("")
                .status(ClaimStatus.PROCESSING)
                .totalPreviousClaims(request.getTotalPreviousClaims())
                .monthsOnPolicy(request.getMonthsOnPolicy())
                .build();

        Claim saved = claimRepository.save(claim);

        SquadApiResponse lookup = squadApiClient.lookupAccount(
                request.getBankCode(), request.getAccountNumber());

        if (Boolean.TRUE.equals(lookup.getSuccess()) && lookup.getData() != null){
            saved.setAccountName(extractAccountName(lookup));
            claimRepository.save(saved);
        }

        if (photos != null) {
            photos.forEach(file -> uploadAndSaveFile(saved, file, FileType.PHOTO));
        }

        if (documents != null) {
            documents.forEach(file -> uploadAndSaveFile(saved, file, FileType.DOCUMENT));
        }

        scoringService.scoreClaim(saved);
        return ClaimSubmitResponse.builder()
                .claimId(saved.getId())
                .status("PROCESSING")
                .message("Claim received. Verified AI is analysing your submission.")
                .build();
    }

    @Override
    public AccountLookupResponse lookupBankAccount(String bankCode, String accountNumber) {
        SquadApiResponse response = squadApiClient.lookupAccount(bankCode, accountNumber);

        if (!Boolean.TRUE.equals(response.getSuccess()) || response.getData() == null){
            throw new BusinessRuleViolationException(
                    "Could not verify account. Please check the account number and bank code.");
        }

        String name = extractAccountName(response);
        if (name == null || name.isBlank()) {
            throw new BusinessRuleViolationException(
                    "Account found but name could not be retrieved. Please try again.");
        }

        return AccountLookupResponse.builder()
                .accountName(name)
                .accountNumber(accountNumber)
                .bankCode(bankCode)
                .build();
    }
    private void uploadAndSaveFile(Claim claim, MultipartFile file, FileType fileType){
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of("folder", "verified/claims/" + claim.getId(), "resource_type", "auto")
            );
            String url = (String) uploadResult.get("secure_url");

            ClaimFile claimFile = ClaimFile.builder()
                    .claim(claim)
                    .fileType(fileType)
                    .fileUrl(url)
                    .build();
            claimFileRepository.save(claimFile);
        } catch (Exception e) {
            throw new BusinessRuleViolationException("File upload failed: " + e.getMessage());
        }
    }

    @Override
    public ClaimFileResponse uploadFiles(UUID claimId, List<MultipartFile> files, String fileType) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        FileType parsedFileType;
        try {
            parsedFileType = FileType.valueOf(fileType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleViolationException("Invalid fileType '" + fileType + "'. Must be PHOTO or DOCUMENT.");
        }

        List<String> urls = new ArrayList<>();

        files.forEach(file -> {
            try {
                Map uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        Map.of(
                                "folder", "verified/claims/" + claimId,
                                "resource_type", "auto"
                        )
                );
                String url = (String) uploadResult.get("secure_url");

                ClaimFile claimFile = ClaimFile.builder()
                        .claim(claim)
                        .fileType(parsedFileType)
                        .fileUrl(url)
                        .build();
                claimFileRepository.save(claimFile);
                urls.add(url);

            } catch (Exception e) {
                throw new BusinessRuleViolationException("File upload failed: " + e.getMessage());
            }
        });

        return ClaimFileResponse.builder()
                .fileUrls(urls)
                .message("Files uploaded successfully")
                .build();
    }
    @Override
    public ClaimResultResponse getClaimResult(UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        if (claim.getStatus() == ClaimStatus.PROCESSING) {
            return ClaimResultResponse.builder()
                    .claimId(claim.getId())
                    .status(ClaimStatus.PROCESSING)
                    .flags(List.of())
                    .build();
        }
        TrustScore score = trustScoreRepository.findByClaimId(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Trust score not found for claim: " + claimId));

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
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

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
                .accountName(claim.getAccountName())
                .accountNumber(claim.getAccountNumber())
                .bankCode(claim.getBankCode())
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
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (claim.getStatus() != ClaimStatus.UNDER_REVIEW) {
            throw new BusinessRuleViolationException(
                    "Claim is not under review — current status: " + claim.getStatus());
        }

        TrustScore trustScore = trustScoreRepository.findByClaimId(claimId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Trust score not found for claim: " + claimId));

        if (request.getDecision() == ReviewDecision.APPROVE) {
            claim.setStatus(ClaimStatus.PAID);
            trustScore.setSquadAction(SquadAction.RELEASE_PAYMENT);
            trustScoreRepository.save(trustScore);
            squadService.processPaymentAction(claim, "RELEASE");
        } else {
            claim.setStatus(ClaimStatus.BLOCKED);
            trustScore.setSquadAction(SquadAction.BLOCK_PAYMENT);
            trustScoreRepository.save(trustScore);
            squadService.processPaymentAction(claim, "BLOCK");
        }

        claimRepository.save(claim);
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

        Long totalToday = claimRepository.countClaimsSince(oneDayAgo);
        Long totalThisWeek = claimRepository.countClaimsSince(oneWeekAgo);

        BigDecimal totalBlocked = claimRepository.sumAmountByStatus(ClaimStatus.BLOCKED);
        BigDecimal totalReleased = claimRepository.sumAmountByStatus(ClaimStatus.PAID);

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

    private String extractAccountName(SquadApiResponse lookup){
        try {
            if (lookup.getData() instanceof java.util.Map<?,?> map) {
                Object name = map.get("account_name");
                return name != null ? name.toString() : "";
            }
        } catch (Exception e) {
            log.warn("Could not extract account name from lookup response");
        }
        return "";
    }
}
