package com.verified.dto.response;

import com.verified.model.enums.ClaimStatus;
import com.verified.model.enums.ClaimType;
import com.verified.model.enums.ScoreTier;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ClaimSummaryResponse {
    private UUID claimId;
    private String claimantName;
    private String policyNumber;
    private ClaimType claimType;
    private BigDecimal claimedAmount;
    private ClaimStatus status;
    private ScoreTier tier;
    private Integer trustScore;
    private LocalDateTime createdAt;
}
