package com.scrollshop.repository;

import com.scrollshop.entity.CashbackClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CashbackClaimRepository extends JpaRepository<CashbackClaim, Long> {
    List<CashbackClaim> findByUserId(Long userId);
    Optional<CashbackClaim> findByUserIdAndCampaignId(Long userId, Long campaignId);
    boolean existsByUserIdAndCampaignId(Long userId, Long campaignId);
}
