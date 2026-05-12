package com.verified.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class MlScoreResponse {
    private UUID claimId;
    private Integer trustScore;
    private String tier;
    private String squadAction;
    private BigDecimal confidence;
    private Integer photoScore;
    private Integer documentScore;
    private Integer behavioralScore;
    private Integer identityScore;
    private Integer priceScore;
    private List<MlFlag> flags;
    @Data
    public static class MlFlag {
        private String module;
        private String signal;
        private String explanation;
    }
}
