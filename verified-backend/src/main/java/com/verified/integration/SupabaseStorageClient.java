package com.verified.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Component
public class SupabaseStorageClient {

    private final WebClient webClient;
    private final String bucketName;
    private final String projectUrl;

    public SupabaseStorageClient(
            @Value("${supabase.url}") String projectUrl,
            @Value("${supabase.anon-key}") String anonKey,
            @Value("${supabase.bucket:verified-documents}") String bucketName) {
        this.projectUrl = projectUrl;
        this.bucketName = bucketName;
        this.webClient = WebClient.builder()
                .baseUrl(projectUrl)
                .defaultHeader("Authorization", "Bearer " + anonKey)
                .build();
    }

    public String uploadFile(byte[] fileBytes, String originalFilename,
                             String contentType, UUID claimId) {
        String safeName = originalFilename != null ? originalFilename : "document";
        String path = claimId.toString() + "/" + UUID.randomUUID() + "_" + safeName;
        String uploadUrl = "/storage/v1/object/" + bucketName + "/" + path;

        log.info("Uploading document to Supabase: {}", path);

        try {
            webClient.post()
                    .uri(uploadUrl)
                    .contentType(MediaType.parseMediaType(
                            contentType != null ? contentType : "application/octet-stream"))
                    .bodyValue(fileBytes)
                    .retrieve()
                    .toBodilessEntity()
                    .timeout(Duration.ofSeconds(30))
                    .block();

            // Construct the public URL — Supabase public bucket URL format
            String publicUrl = projectUrl + "/storage/v1/object/public/" + bucketName + "/" + path;
            log.info("Document uploaded successfully: {}", publicUrl);
            return publicUrl;

        } catch (Exception e) {
            log.error("Supabase upload failed for {}: {}", safeName, e.getMessage());
            throw new RuntimeException("Document upload failed: " + e.getMessage());
        }
    }
}