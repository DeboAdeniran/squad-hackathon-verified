package com.verified.dto.request;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class MlScoreRequest {
    private UUID claimId;
    private String claimType;
    private BigDecimal claimedAmount;
    private List<String> photoUrls;
    private List<String> documentUrls;
    private ClaimantPolicyHistory claimantPolicyHistory;

    @Data
    @Builder
    public static class ClaimantPolicyHistory {
        private int totalClaims;
        private int monthsOnPolicy;
    }
}
