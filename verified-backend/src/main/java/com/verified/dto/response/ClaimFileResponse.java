package com.verified.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClaimFileResponse {
    private List<String> fileUrls;
    private String message;
}
