package com.verified.dto.response;

import com.verified.model.enums.SquadAction;
import com.verified.model.enums.TxStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SquadTxDto {
    private UUID id;
    private SquadAction action;
    private String squadReference;
    private BigDecimal amount;
    private TxStatus status;
    private LocalDateTime calledAt;
}
