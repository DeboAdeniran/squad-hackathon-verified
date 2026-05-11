package com.verified.model;

import com.verified.model.enums.ScoreTier;
import com.verified.model.enums.SquadAction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trust_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustScore {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false, unique = true)
    private Claim claim;

    @Column(nullable = false)
    private Integer trustScore;

    @Enumerated(EnumType.STRING)
    private ScoreTier tier;

    @Enumerated(EnumType.STRING)
    private SquadAction squadAction;

    @Column(precision = 3, scale = 2)
    private BigDecimal confidence;

    private Integer photoScore;
    private Integer documentScore;
    private Integer behavioralScore;
    private Integer identityScore;
    private Integer priceScore;

    @OneToMany(mappedBy = "trustScore", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ScoreFlag> flags = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime scoredAt;
}
