package com.verified.dto.squad;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import lombok.Data;

@Data
public class SquadApiResponse {
    private String status;
    @JsonSetter("status")
    public void setStatusFromAny(Object raw) {
        this.status = raw != null ? raw.toString() : null;
    }
    private Boolean success;
    private String message;
    @JsonProperty("transaction_ref")
    private String transactionRef;
    private Object data;
}
