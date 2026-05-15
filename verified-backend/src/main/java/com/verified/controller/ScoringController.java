package com.verified.controller;

import com.verified.dto.response.MlScoreResponse;
import com.verified.exception.ResourceNotFoundException;
import com.verified.model.Claim;
import com.verified.model.ScoreFlag;
import com.verified.model.TrustScore;
import com.verified.model.enums.ClaimStatus;
import com.verified.model.enums.ScoreTier;
import com.verified.model.enums.SquadAction;
import com.verified.repository.ClaimRepository;
import com.verified.repository.TrustScoreRepository;
import com.verified.service.SquadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/internal/scoring")
@RequiredArgsConstructor
@Tag(name = "Scoring", description = "Internal scoring callback from ML service")
public class ScoringController {
    private final ClaimRepository claimRepository;
    private final TrustScoreRepository trustScoreRepository;
    private final SquadService squadService;

    @Operation(summary = "Callback webhook for ML service to push completed scores")
    @PostMapping("/callback")
    public ResponseEntity<Void> scoringCallback(@RequestBody MlScoreResponse mlResponse){
        log.info("Scoring callback received for claim {}", mlResponse.getClaimId());
        Claim claim = claimRepository.findById(mlResponse.getClaimId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Claim not found with id: " + mlResponse.getClaimId()));
        if (trustScoreRepository.findByClaimId(mlResponse.getClaimId()).isPresent()) {
            log.warn("Trust score already exists for claim {} — callback ignored", mlResponse.getClaimId());
            return ResponseEntity.ok().build();
        }
        ScoreTier tier = switch (mlResponse.getTier() != null ? mlResponse.getTier().toUpperCase() : "FLAGGED") {
            case "VERIFIED" -> ScoreTier.VERIFIED;
            case "REVIEW" -> ScoreTier.REVIEW;
            default -> ScoreTier.FLAGGED;
        };
        SquadAction squadAction = switch (mlResponse.getSquadAction() != null ? mlResponse.getSquadAction().toUpperCase() : "BLOCK_PAYMENT") {
            case "RELEASE_PAYMENT" -> SquadAction.RELEASE_PAYMENT;
            case "HOLD_ESCROW" -> SquadAction.HOLD_ESCROW;
            default -> SquadAction.BLOCK_PAYMENT;
        };
        TrustScore trustScore = TrustScore.builder()
                .claim(claim)
                .trustScore(mlResponse.getTrustScore())
                .tier(tier)
                .squadAction(squadAction)
                .confidence(mlResponse.getConfidence())
                .photoScore(mlResponse.getPhotoScore())
                .documentScore(mlResponse.getDocumentScore())
                .behavioralScore(mlResponse.getBehavioralScore())
                .identityScore(mlResponse.getIdentityScore())
                .priceScore(mlResponse.getPriceScore())
                .flags(new ArrayList<>())
                .build();
        TrustScore saved = trustScoreRepository.save(trustScore);
        if (mlResponse.getFlags() != null) {
            List<ScoreFlag> flags = mlResponse.getFlags().stream()
                    .map(f -> ScoreFlag.builder()
                            .trustScore(saved)
                            .module(f.getModule())
                            .signal(f.getSignal())
                            .explanation(f.getExplanation())
                            .build())
                    .collect(Collectors.toList());
            saved.setFlags(flags);
            trustScoreRepository.save(saved);
        }
        ClaimStatus newStatus = switch (tier) {
            case VERIFIED -> ClaimStatus.PAID;
            case REVIEW -> ClaimStatus.UNDER_REVIEW;
            case FLAGGED -> ClaimStatus.BLOCKED;
        };
        claim.setStatus(newStatus);
        claimRepository.save(claim);
        squadService.processPayment(claim, saved);

        return ResponseEntity.ok().build();
    }
}
