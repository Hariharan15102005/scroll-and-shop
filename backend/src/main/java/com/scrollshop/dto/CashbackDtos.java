package com.scrollshop.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CashbackDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CashbackOverviewDto {
        private BigDecimal availableBalance;
        private BigDecimal pendingBalance;
        private BigDecimal lifetimeEarned;
        private List<CashbackTransactionDto> recentTransactions;
        private List<CashbackCampaignDto> activeCampaigns;
        private String eligibilitySummary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CashbackTransactionDto {
        private Long id;
        private BigDecimal amount;
        private String type; // PURCHASE_REWARD, SOCIAL_CAMPAIGN, etc.
        private String status; // PENDING, APPROVED, REJECTED, REVERSED
        private String referenceId;
        private String description;
        private String campaignTitle;
        private LocalDateTime availableAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CashbackCampaignDto {
        private Long id;
        private String title;
        private String description;
        private String rewardType;
        private BigDecimal rewardValue;
        private String activityType;
        private BigDecimal minPurchaseAmount;
        private BigDecimal maxCashbackPerUser;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Boolean isActive;
        private String terms;
        private String badgeText;
        private Boolean hasClaimed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClaimCampaignRequest {
        @NotNull(message = "Campaign ID is required")
        private Long campaignId;

        private String claimDetails;
        private String proofUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClaimResponseDto {
        private Long claimId;
        private Long campaignId;
        private String campaignTitle;
        private BigDecimal rewardAmount;
        private String status;
        private String message;
    }
}
