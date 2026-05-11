package com.verified.repository;

import com.verified.model.ClaimFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClaimFileRepository extends JpaRepository<ClaimFile, UUID> {
    List<ClaimFile> findByClaimId(UUID claimId);
}
