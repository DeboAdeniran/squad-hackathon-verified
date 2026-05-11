package com.verified.dto.request;

import com.verified.model.enums.ClaimType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
@Data
public class ClaimSubmitRequest {
    @NotBlank(message = "Claimant name is required")
    private String claimantName;
    @NotBlank(message = "Policy number is required")
    private String policyNumber;
    @NotNull(message = "Claim type is required")
    private ClaimType claimType;
    @NotNull(message = "Claimed amount is required")
    @Positive(message = "Claimed amount must be greater than 0")
    private BigDecimal claimedAmount;
    @NotNull(message = "Incident date is required")
    @PastOrPresent(message = "Incident date cannot be in the future")
    private LocalDate incidentDate;
    @NotBlank(message = "Description is required")
    @Size(min = 20, message = "Description must be at least 20 characters")
    private String description;
    private List<String> photoUrls = new ArrayList<>();
    private List<String> documentUrls = new ArrayList<>();
}
