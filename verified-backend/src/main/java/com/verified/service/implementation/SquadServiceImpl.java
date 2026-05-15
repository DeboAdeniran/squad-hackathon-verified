package com.verified.service.implementation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.verified.dto.request.SquadTransferRequest;
import com.verified.dto.squad.SquadApiResponse;
import com.verified.exception.BusinessRuleViolationException;
import com.verified.exception.ResourceNotFoundException;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class SquadServiceImpl implements SquadService {
    private final SquadApiClient squadApiClient;
    private final SquadTransactionRepository squadTransactionRepository;
    private final ObjectMapper objectMapper;
    @Value("${squad.merchant.id}")
    private String merchantId;
    @Override
    public void processPayment(Claim claim, TrustScore trustScore) {
        switch (trustScore.getTier()){
            case VERIFIED -> {
                executeTransfer(claim);
            }
            case REVIEW -> {
                log.info("Claim {} is UNDER_REVIEW — no Squad call made, awaiting human decision",
                        claim.getId());
                logInternalTransaction(claim, SquadAction.HOLD_ESCROW, TxStatus.PENDING,
                        "Held pending human review — no Squad call");
            }case FLAGGED -> {
                // No Squad call — fraud suspected, money blocked internally
                log.info("Claim {} is FLAGGED — payment blocked internally, no Squad call",
                        claim.getId());
                logInternalTransaction(claim, SquadAction.BLOCK_PAYMENT, TxStatus.PENDING,
                        "Blocked due to fraud flag — no Squad call");
            }
        }
    }

    @Override
    public void processPaymentAction(Claim claim, String action) {
        if (claim == null) {
            throw new ResourceNotFoundException("Claim not found for Squad payment action");
        }
        switch (action) {
            case "RELEASE" -> executeTransfer(claim);
            case "BLOCK" -> {
                log.info("Claim {} manually BLOCKED by adjudicator", claim.getId());
                logInternalTransaction(claim, SquadAction.BLOCK_PAYMENT, TxStatus.SUCCESS,
                        "Manually blocked by adjudicator");
            }
            default -> throw new BusinessRuleViolationException("Unknown Squad action: " + action);
        }
    }

    private void executeTransfer(Claim claim) {
        String ref = merchantId + "-VFD-" + claim.getId().toString().replace("-", "").substring(0, 8).toUpperCase();
        log.debug("Transfer reference: {}", ref);
        SquadApiResponse lookup = squadApiClient.lookupAccount(
                claim.getBankCode(), claim.getAccountNumber());

        if (!Boolean.TRUE.equals(lookup.getSuccess())) {
            log.error("Account lookup failed for claim {} — account: {}",
                    claim.getId(), claim.getAccountNumber());
            logInternalTransaction(claim, SquadAction.RELEASE_PAYMENT, TxStatus.FAILED,
                    "Account lookup failed: " + lookup.getMessage());
            return;
        }

        String amountInKobo = claim.getClaimedAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .toBigInteger()
                .toString();

        SquadTransferRequest transferRequest = SquadTransferRequest.builder()
                .transactionReference(ref)
                .amount(amountInKobo)
                .bankCode(claim.getBankCode())
                .accountNumber(claim.getAccountNumber())
                .accountName(claim.getAccountName())
                .currencyId("NGN")
                .remark("Insurance claim payout - " + claim.getPolicyNumber())
                .build();

        SquadApiResponse transferResponse = squadApiClient.transferFunds(transferRequest);

        if (transferResponse.getSuccess() == null || !transferResponse.getSuccess()) {

            String msg = transferResponse.getMessage();
            if (msg != null && msg.toLowerCase().contains("insufficient")) {
                log.error("LEDGER INSUFFICIENT BALANCE for claim {} — amount: {}",
                        claim.getId(), claim.getClaimedAmount());
            }
            logSquadTransaction(claim, SquadAction.RELEASE_PAYMENT, ref, transferResponse, TxStatus.FAILED);
            return;
        }

        TxStatus status = Boolean.TRUE.equals(transferResponse.getSuccess())
                ? TxStatus.SUCCESS : TxStatus.FAILED;

        logSquadTransaction(claim, SquadAction.RELEASE_PAYMENT, ref, transferResponse, status);

        log.info("Transfer {} for claim {} — ref: {}, status: {}",
                status, claim.getId(), ref, transferResponse.getMessage());
    }
    private void logSquadTransaction(Claim claim, SquadAction action,
                                     String ref, SquadApiResponse response,
                                     TxStatus status) {
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
    }

    private void logInternalTransaction(Claim claim, SquadAction action,
                                        TxStatus status, String note) {
        SquadTransaction tx = SquadTransaction.builder()
                .claim(claim)
                .action(action)
                .squadReference("INTERNAL-" + claim.getId().toString().substring(0, 8).toUpperCase())
                .amount(claim.getClaimedAmount())
                .status(status)
                .responseBody(note)
                .build();
        squadTransactionRepository.save(tx);
    }
}
