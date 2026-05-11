package com.verified.model;

import com.verified.model.enums.SquadAction;
import com.verified.model.enums.TxStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "squad_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SquadTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;
    @Enumerated(EnumType.STRING)
    private SquadAction action;
    private String squadReference;
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    private TxStatus status;
    @Column(columnDefinition = "TEXT")
    private String responseBody;
    @CreationTimestamp
    private LocalDateTime calledAt;
}
