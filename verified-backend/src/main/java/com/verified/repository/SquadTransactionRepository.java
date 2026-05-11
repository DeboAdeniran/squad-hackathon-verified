package com.verified.repository;

import com.verified.model.SquadTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SquadTransactionRepository extends JpaRepository<SquadTransaction, UUID> {
    List<SquadTransaction> findByClaimId(UUID claimId);
}
