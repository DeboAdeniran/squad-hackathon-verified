package com.verified.service.implementation;

import com.verified.dto.request.MlScoreRequest;
import com.verified.dto.response.MlScoreResponse;
import com.verified.integration.MlServiceClient;
import com.verified.model.Claim;
import com.verified.model.ScoreFlag;
import com.verified.model.TrustScore;
import com.verified.model.enums.ClaimStatus;
import com.verified.model.enums.ScoreTier;
import com.verified.model.enums.SquadAction;
import com.verified.repository.ClaimFileRepository;
import com.verified.repository.ClaimRepository;
import com.verified.repository.TrustScoreRepository;
import com.verified.service.ScoringService;
import com.verified.service.SquadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoringServiceImpl implements ScoringService {
    private final MlServiceClient mlServiceClient;
    private final ClaimRepository claimRepository;
    private final ClaimFileRepository claimFileRepository;
    private final TrustScoreRepository trustScoreRepository;
    private final SquadService squadService;

    @Async
    @Override
    public void scoreClaim(Claim claim) {
        log.info("Starting async scoring for claim {}", claim.getId());
        TrustScore existingScore = trustScoreRepository.findByClaimId(claim.getId()).orElse(null);
        if (existingScore != null) {
            log.warn("Trust score already exists for claim {}, skipping duplicate save", claim.getId());
            return;
        }
        try {
            List<String> photoUrls = claimFileRepository.findByClaimId(claim.getId())
                    .stream()
                    .filter(f -> f.getFileType().name().equals("PHOTO"))
                    .map(f -> f.getFileUrl())
                    .collect(Collectors.toList());

            List<String> documentUrls = claimFileRepository.findByClaimId(claim.getId())
                    .stream()
                    .filter(f -> f.getFileType().name().equals("DOCUMENT"))
                    .map(f -> f.getFileUrl())
                    .collect(Collectors.toList());
            MlScoreRequest request = MlScoreRequest.builder()
                    .claimId(claim.getId())
                    .claimType(claim.getClaimType().name())
                    .claimedAmount(claim.getClaimedAmount())
                    .photoUrls(photoUrls)
                    .documentUrls(documentUrls)
                    .claimantPolicyHistory(
                            MlScoreRequest.ClaimantPolicyHistory.builder()
                                    .totalClaims(1)
                                    .monthsOnPolicy(12)
                                    .build()
                    )
                    .build();
            MlScoreResponse mlResponse = mlServiceClient.score(request);

            if (mlResponse == null) {
                log.error("ML service returned null for claim {} — leaving as PROCESSING", claim.getId());
                return;
            }
            TrustScore trustScore = buildTrustScore(claim, mlResponse);
            TrustScore savedScore = trustScoreRepository.save(trustScore);
            if (mlResponse.getFlags() != null) {
                List<ScoreFlag> flags = mlResponse.getFlags().stream()
                        .map(f -> ScoreFlag.builder()
                                .trustScore(savedScore)
                                .module(f.getModule())
                                .signal(f.getSignal())
                                .explanation(f.getExplanation())
                                .build())
                        .collect(Collectors.toList());
                savedScore.setFlags(flags);
                trustScoreRepository.save(savedScore);
            }
            ClaimStatus newStatus = switch (savedScore.getTier()) {
                case VERIFIED -> ClaimStatus.PAID;
                case REVIEW -> ClaimStatus.UNDER_REVIEW;
                case FLAGGED -> ClaimStatus.BLOCKED;
            };
            claim.setStatus(newStatus);
            claimRepository.save(claim);

            squadService.processPayment(claim, savedScore);

            log.info("Scoring complete for claim {} — tier: {}, score: {}",
                    claim.getId(), savedScore.getTier(), savedScore.getTrustScore());
        }catch (Exception e) {
            log.error("Scoring pipeline failed for claim {}: {}", claim.getId(), e.getMessage());
        }
    }

    private TrustScore buildTrustScore(Claim claim, MlScoreResponse ml){
        ScoreTier tier = switch (ml.getTier().toUpperCase()) {
            case "VERIFIED" -> ScoreTier.VERIFIED;
            case "REVIEW" -> ScoreTier.REVIEW;
            default -> ScoreTier.FLAGGED;
        };
        SquadAction squadAction = switch (ml.getSquadAction().toUpperCase()) {
            case "RELEASE_PAYMENT" -> SquadAction.RELEASE_PAYMENT;
            case "HOLD_ESCROW" -> SquadAction.HOLD_ESCROW;
            default -> SquadAction.BLOCK_PAYMENT;
        };
        return TrustScore.builder()
                .claim(claim)
                .trustScore(ml.getTrustScore())
                .tier(tier)
                .squadAction(squadAction)
                .confidence(ml.getConfidence())
                .photoScore(ml.getPhotoScore())
                .documentScore(ml.getDocumentScore())
                .behavioralScore(ml.getBehavioralScore())
                .identityScore(ml.getIdentityScore())
                .priceScore(ml.getPriceScore())
                .flags(new ArrayList<>())
                .build();
    }
}
