package com.verified.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private Long totalClaimsToday;
    private Long totalClaimsThisWeek;
    private BigDecimal totalAmountBlocked;
    private BigDecimal totalAmountReleased;
    private Double approvalRate;
    private Long flaggedCount;
    private Long reviewCount;
    private Map<String, Long> tierBreakdown;
}
