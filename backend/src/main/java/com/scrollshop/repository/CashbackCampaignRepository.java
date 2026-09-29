package com.scrollshop.repository;

import com.scrollshop.entity.CashbackCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CashbackCampaignRepository extends JpaRepository<CashbackCampaign, Long> {
    List<CashbackCampaign> findByIsActiveTrueOrderByCreatedAtDesc();
    List<CashbackCampaign> findByActivityTypeAndIsActiveTrue(String activityType);
}
