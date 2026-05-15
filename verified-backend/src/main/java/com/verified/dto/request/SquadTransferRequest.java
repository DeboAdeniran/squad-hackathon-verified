package com.verified.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SquadTransferRequest {
    @JsonProperty("transaction_reference")
    private String transactionReference;
    @JsonProperty("amount")
    private String amount;  //KOBO
    @JsonProperty("bank_code")
    private String bankCode;
    @JsonProperty("account_number")
    private String accountNumber;
    @JsonProperty("account_name")
    private String accountName;
    @JsonProperty("currency_id")
    private String currencyId;
    @JsonProperty("remark")
    private String remark;
}
