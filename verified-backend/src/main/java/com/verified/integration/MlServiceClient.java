package com.verified.integration;

import com.verified.dto.request.MlScoreRequest;
import com.verified.dto.response.ClaimResultResponse;
import com.verified.dto.response.MlScoreResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class MlServiceClient {
    private final WebClient mlWebClient;
    public MlScoreResponse score(MlScoreRequest request) {
        try {
            return mlWebClient.post()
                    .uri("/score")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(MlScoreResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();
        } catch (Exception e) {
            log.error("ML service call failed for claim {}: {}", request.getClaimId(), e.getMessage());
            return null;
        }
    }
}
