package com.verified.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthMeResponse {
    private UUID userId;
    private String fullName;
    private String role;
}
