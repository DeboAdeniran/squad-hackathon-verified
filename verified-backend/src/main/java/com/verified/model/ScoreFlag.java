package com.verified.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "score_flags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "score_id", nullable = false)
    private TrustScore trustScore;
    @Column(nullable = false)
    private String module;

    @Column(nullable = false)
    private String signal;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String explanation;
}
