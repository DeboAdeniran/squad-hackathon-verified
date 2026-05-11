package com.verified.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FlagDto {
    private String module;
    private String signal;
    private String explanation;
}
