package com.verified.dto.request;

import com.verified.model.enums.ReviewDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClaimReviewRequest {
    @NotNull(message = "Decision is required")
    private ReviewDecision decision;

    private String notes;
}
