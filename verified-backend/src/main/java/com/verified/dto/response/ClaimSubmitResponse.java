package com.verified.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ClaimSubmitResponse {
    private UUID claimId;
    private String status;
    private String message;
}
