package com.verified.dto.squad;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SquadApiResponse {
    private String status;
    private String message;

    @JsonProperty("transaction_ref")
    private String transactionRef;

    private Object data;
}
