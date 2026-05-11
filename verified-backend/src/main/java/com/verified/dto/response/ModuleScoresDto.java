package com.verified.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModuleScoresDto {
    private Integer photoScore;
    private Integer documentScore;
    private Integer behavioralScore;
    private Integer identityScore;
    private Integer priceScore;
}
