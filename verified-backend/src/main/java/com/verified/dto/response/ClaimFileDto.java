package com.verified.dto.response;

import com.verified.model.enums.FileType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ClaimFileDto {
    private UUID id;
    private FileType fileType;
    private String fileUrl;
    private LocalDateTime uploadedAt;
}
