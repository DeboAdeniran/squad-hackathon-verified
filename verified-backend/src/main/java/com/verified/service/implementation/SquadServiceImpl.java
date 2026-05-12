package com.verified.service.implementation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.verified.dto.squad.SquadApiResponse;
import com.verified.dto.squad.SquadEscrowRequest;
import com.verified.integration.SquadApiClient;
import com.verified.model.Claim;
import com.verified.model.SquadTransaction;
import com.verified.model.TrustScore;
import com.verified.model.enums.SquadAction;
import com.verified.model.enums.TxStatus;
import com.verified.repository.SquadTransactionRepository;
import com.verified.service.SquadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SquadServiceImpl implements SquadService {
    private final SquadApiClient squadApiClient;
    private final SquadTransactionRepository squadTransactionRepository;
    private final ObjectMapper objectMapper;
    @Override
    public void processPayment(Claim claim, TrustScore trustScore) {
        String transactionRef = "VFD-" + claim.getId().toString().substring(0, 8).toUpperCase();

        SquadEscrowRequest escrowRequest = SquadEscrowRequest.builder()
                .transactionRef(transactionRef)
                .amount(claim.getClaimedAmount())
                .currency("NGN")
                .customerEmail("claims@verified.ng")
                .description("Insurance claim escrow - " + claim.getPolicyNumber())
                .build();

        SquadApiResponse escrowResponse = squadApiClient.createEscrow(escrowRequest);
        logTransaction(claim, SquadAction.RELEASE_PAYMENT, transactionRef,
                escrowResponse, "CREATE_ESCROW");

        switch (trustScore.getTier()) {
            case VERIFIED -> {
                SquadApiResponse releaseResponse = squadApiClient.releasePayment(transactionRef);
                logTransaction(claim, SquadAction.RELEASE_PAYMENT, transactionRef,
                        releaseResponse, "RELEASE");
                log.info("Payment RELEASED for claim {} — score: {}",
                        claim.getId(), trustScore.getTrustScore());
            }
            case REVIEW -> {
                SquadApiResponse holdResponse = squadApiClient.holdEscrow(transactionRef);
                logTransaction(claim, SquadAction.HOLD_ESCROW, transactionRef,
                        holdResponse, "HOLD");
                log.info("Payment HELD for claim {} — pending human review",
                        claim.getId());
            }
            case FLAGGED -> {
                SquadApiResponse blockResponse = squadApiClient.blockPayment(transactionRef);
                logTransaction(claim, SquadAction.BLOCK_PAYMENT, transactionRef,
                        blockResponse, "BLOCK");
                log.info("Payment BLOCKED for claim {} — fraud detected, score: {}",
                        claim.getId(), trustScore.getTrustScore());
            }
        }
    }

    private void logTransaction(Claim claim, SquadAction action,
                                String ref, SquadApiResponse response,
                                String actionLabel) {
        TxStatus status = "FAILED".equals(response.getStatus()) ? TxStatus.FAILED : TxStatus.SUCCESS;

        String responseBody;
        try {
            responseBody = objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            responseBody = response.toString();
        }

        SquadTransaction tx = SquadTransaction.builder()
                .claim(claim)
                .action(action)
                .squadReference(ref)
                .amount(claim.getClaimedAmount())
                .status(status)
                .responseBody(responseBody)
                .build();

        squadTransactionRepository.save(tx);
        log.info("Squad transaction logged: {} — {} — {}",
                actionLabel, ref, status);
    }
}
