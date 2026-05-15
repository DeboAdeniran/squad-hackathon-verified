package com.verified.integration;

import com.verified.dto.request.SquadAccountLookupRequest;
import com.verified.dto.request.SquadTransferRequest;
import com.verified.dto.squad.SquadApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

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
//    VERIFY ACCOUNT EXISTS
//    POST /payout/account/lookup
    public SquadApiResponse lookupAccount(String bankCode, String accountNumber){
        log.info("Looking up account {} at bank {}", accountNumber, bankCode);
        try {
            return webClient.post()
                    .uri("/payout/account/lookup")
                    .bodyValue(SquadAccountLookupRequest.builder()
                            .bankCode(bankCode)
                            .accountNumber(accountNumber)
                            .build())
                    .retrieve()
                    .bodyToMono(SquadApiResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();
        }catch (Exception e){
            log.error("Account lookup failed for {}: {}", accountNumber, e.getMessage());
            return failedResponse("LOOKUP-" + accountNumber);
        }
    }

//      PAYOUT
//    * POST /payout/transfer
    public SquadApiResponse transferFunds(SquadTransferRequest request){
        log.info("Transferring funds for ref: {}", request.getTransactionReference());
        try {
            return webClient.post()
                    .uri("/payout/transfer")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(SquadApiResponse.class)
                    .timeout(Duration.ofSeconds(20))
                    .block();
        }catch (Exception e){
            log.error("Transfer failed for ref {}: {}", request.getTransactionReference(), e.getMessage());
            return failedResponse(request.getTransactionReference());
        }
    }

//    Retry sequence
//    POST /payout/requery
    public SquadApiResponse requeryTransfer(String transactionReference) {
        log.info("Re-querying transfer ref: {}", transactionReference);
        try {
            return webClient.post()
                    .uri("/payout/requery")
                    .bodyValue(Map.of("transaction_reference", transactionReference))
                    .retrieve()
                    .bodyToMono(SquadApiResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();
        } catch (Exception e) {
            log.error("Requery failed for ref {}: {}", transactionReference, e.getMessage());
            return failedResponse(transactionReference);
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
