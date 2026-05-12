package com.verified.repository;

import com.verified.model.Claim;
import com.verified.model.enums.ClaimStatus;
import com.verified.model.enums.ClaimType;
import com.verified.model.enums.ScoreTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ClaimRepository extends JpaRepository<Claim, UUID> {
    boolean existsByPolicyNumberAndStatusIn(String policyNumber, List<ClaimStatus> statuses);
    boolean existsByPolicyNumber(String policyNumber);
    Page<Claim> findAll(Pageable pageable);
    Page<Claim> findByStatus(ClaimStatus status, Pageable pageable);
    Page<Claim> findByClaimType(ClaimType claimType, Pageable pageable);
    Page<Claim> findByTrustScore_Tier(ScoreTier tier, Pageable pageable);
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.createdAt >= :since")
    Long countClaimsSince(LocalDateTime since);
    @Query("SELECT COALESCE(SUM(c.claimedAmount), 0) FROM Claim c WHERE c.status = :status")
    BigDecimal sumAmountByStatus(ClaimStatus status);
}
