package com.verified.repository;

import com.verified.model.TrustScore;
import com.verified.model.enums.ScoreTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TrustScoreRepository extends JpaRepository<TrustScore, UUID> {
    Optional<TrustScore> findByClaimId(UUID claimId);
    Long countByTier(ScoreTier tier);
}
