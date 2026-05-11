package com.verified.model;

import com.verified.model.enums.ClaimStatus;
import com.verified.model.enums.ClaimType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "claims")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;
    @Column(nullable = false)
    private String claimantName;
    @Column(nullable = false, unique = true)
    private String policyNumber;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimType claimType;
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal claimedAmount;
    private LocalDate incidentDate;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    private ClaimStatus status;
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClaimFile> files = new ArrayList<>();
    @OneToOne(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TrustScore trustScore;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
