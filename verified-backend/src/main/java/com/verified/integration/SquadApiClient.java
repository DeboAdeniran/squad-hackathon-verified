package com.verified.integration;

import com.verified.dto.squad.SquadApiResponse;
import com.verified.dto.squad.SquadEscrowRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Slf4j
@Component
public class SquadApiClient {
    private final WebClient webClient;
    public SquadApiClient(
            @Value("${squad.api.base-url}") String baseUrl,
            @Value("${squad.api.key}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
    public SquadApiResponse createEscrow(SquadEscrowRequest request) {
        log.info("Creating Squad escrow for ref: {}", request.getTransactionRef());
        try {
            return webClient.post()
                    .uri("/transaction/initiate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(SquadApiResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();
        } catch (Exception e) {
            log.error("Squad createEscrow failed: {}", e.getMessage());
            return failedResponse(request.getTransactionRef());
        }
    }
    public SquadApiResponse releasePayment(String transactionRef) {
        log.info("Releasing Squad payment for ref: {}", transactionRef);
        try {
            return webClient.post()
                    .uri("/transaction/release")
                    .bodyValue(java.util.Map.of("transaction_ref", transactionRef))
                    .retrieve()
                    .bodyToMono(SquadApiResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();
        } catch (Exception e) {
            log.error("Squad releasePayment failed: {}", e.getMessage());
            return failedResponse(transactionRef);
        }
    }
    public SquadApiResponse holdEscrow(String transactionRef) {
        log.info("Holding Squad escrow for ref: {}", transactionRef);
        try {
            return webClient.post()
                    .uri("/transaction/hold")
                    .bodyValue(java.util.Map.of("transaction_ref", transactionRef))
                    .retrieve()
                    .bodyToMono(SquadApiResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();
        } catch (Exception e) {
            log.error("Squad holdEscrow failed: {}", e.getMessage());
            return failedResponse(transactionRef);
        }
    }
    public SquadApiResponse blockPayment(String transactionRef) {
        log.info("Blocking Squad payment for ref: {}", transactionRef);
        try {
            return webClient.post()
                    .uri("/transaction/block")
                    .bodyValue(java.util.Map.of("transaction_ref", transactionRef))
                    .retrieve()
                    .bodyToMono(SquadApiResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();
        } catch (Exception e) {
            log.error("Squad blockPayment failed: {}", e.getMessage());
            return failedResponse(transactionRef);
        }
    }
    private SquadApiResponse failedResponse(String ref) {
        SquadApiResponse response = new SquadApiResponse();
        response.setStatus("FAILED");
        response.setMessage("Squad API call failed");
        response.setTransactionRef(ref);
        return response;
    }
}
