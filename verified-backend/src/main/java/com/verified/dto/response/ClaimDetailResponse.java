package com.verified.dto.response;

import com.verified.model.enums.ClaimStatus;
import com.verified.model.enums.ClaimType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ClaimDetailResponse {
    private UUID claimId;
    private String claimantName;
    private String policyNumber;
    private ClaimType claimType;
    private BigDecimal claimedAmount;
    private LocalDate incidentDate;
    private String description;
    private ClaimStatus status;
    private List<ClaimFileDto> files;
    private ClaimResultResponse trustScore;
    private List<SquadTxDto> squadTransactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
