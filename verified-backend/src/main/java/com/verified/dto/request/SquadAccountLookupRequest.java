package com.verified.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SquadAccountLookupRequest {
    @JsonProperty("bank_code")
    private String bankCode;
    @JsonProperty("account_number")
    private String accountNumber;
}
