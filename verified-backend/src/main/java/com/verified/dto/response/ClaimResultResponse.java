package com.verified.dto.response;

import com.verified.model.enums.ClaimStatus;
import com.verified.model.enums.ScoreTier;
import com.verified.model.enums.SquadAction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ClaimResultResponse {
    private UUID claimId;
    private ClaimStatus status;
    private Integer trustScore;
    private ScoreTier tier;
    private SquadAction squadAction;
    private BigDecimal confidence;
    private ModuleScoresDto moduleScores;
    private List<FlagDto> flags;
    private LocalDateTime scoredAt;
}
