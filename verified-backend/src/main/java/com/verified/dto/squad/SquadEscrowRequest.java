package com.verified.dto.squad;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SquadEscrowRequest {
    @JsonProperty("transaction_ref")
    private String transactionRef;
    @JsonProperty("amount")
    private BigDecimal amount;
    @JsonProperty("currency")
    private String currency;
    @JsonProperty("customer_email")
    private String customerEmail;
    @JsonProperty("description")
    private String description;
}
