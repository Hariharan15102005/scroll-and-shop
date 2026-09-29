package com.scrollshop.service;

import com.scrollshop.dto.CashbackDtos.*;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CashbackService {

    private final CashbackTransactionRepository transactionRepository;
    private final CashbackCampaignRepository campaignRepository;
    private final CashbackClaimRepository claimRepository;

    public CashbackOverviewDto getCashbackOverview(User user) {
        BigDecimal approved = transactionRepository.calculateApprovedBalance(user.getId());
        BigDecimal pending = transactionRepository.calculatePendingBalance(user.getId());
        BigDecimal lifetime = transactionRepository.calculateLifetimeEarned(user.getId());

        List<CashbackTransactionDto> transactions = transactionRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toTransactionDto)
                .collect(Collectors.toList());

        List<CashbackCampaignDto> campaigns = getActiveCampaigns(user);

        return CashbackOverviewDto.builder()
                .availableBalance(approved != null ? approved : BigDecimal.ZERO)
                .pendingBalance(pending != null ? pending : BigDecimal.ZERO)
                .lifetimeEarned(lifetime != null ? lifetime : BigDecimal.ZERO)
                .recentTransactions(transactions)
                .activeCampaigns(campaigns)
                .eligibilitySummary("Cashback from qualifying purchases is credited as PENDING immediately and approved after our 7-day return policy. Social and promotional campaign rewards are verified directly by our automated rules.")
                .build();
    }

    public List<CashbackCampaignDto> getActiveCampaigns(User user) {
        return campaignRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(camp -> {
                    boolean hasClaimed = user != null && claimRepository.existsByUserIdAndCampaignId(user.getId(), camp.getId());
                    return toCampaignDto(camp, hasClaimed);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void recordPurchaseCashback(Order order) {
        if (order == null || order.getUser() == null || order.getTotalAmount() == null) {
            return;
        }

        String refId = "ORDER-" + order.getOrderNumber();
        if (transactionRepository.existsByUserIdAndReferenceId(order.getUser().getId(), refId)) {
            log.info("Purchase cashback for order {} already recorded", order.getOrderNumber());
            return;
        }

        // Calculate 5% standard purchase cashback on subtotal
        BigDecimal rate = BigDecimal.valueOf(0.05);
        BigDecimal cashbackAmount = order.getSubtotalAmount().multiply(rate).setScale(2, RoundingMode.HALF_UP);

        if (cashbackAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        CashbackTransaction tx = CashbackTransaction.builder()
                .user(order.getUser())
                .amount(cashbackAmount)
                .type(CashbackType.PURCHASE_REWARD)
                .status(CashbackStatus.PENDING)
                .referenceId(refId)
                .description("5% Cashback on Order #" + order.getOrderNumber())
                .availableAt(LocalDateTime.now().plusDays(7)) // 7-day return period
                .build();

        transactionRepository.save(tx);
        log.info("Recorded pending cashback of ${} for user {} on order {}", cashbackAmount, order.getUser().getUsername(), order.getOrderNumber());
    }

    @Transactional
    public void reversePurchaseCashback(Order order, String reason) {
        if (order == null || order.getUser() == null) return;

        String refId = "ORDER-" + order.getOrderNumber();
        transactionRepository.findByUserIdAndReferenceId(order.getUser().getId(), refId).ifPresent(tx -> {
            tx.setStatus(CashbackStatus.REVERSED);
            tx.setDescription(tx.getDescription() + " (Reversed: " + reason + ")");
            transactionRepository.save(tx);
            log.info("Reversed cashback for order {} due to {}", order.getOrderNumber(), reason);
        });
    }

    @Transactional
    public void processSocialConnectReward(User user, String provider) {
        String refId = "SOC-CONNECT-" + provider.toUpperCase();
        if (transactionRepository.existsByUserIdAndReferenceId(user.getId(), refId)) {
            return;
        }

        List<CashbackCampaign> campaigns = campaignRepository.findByActivityTypeAndIsActiveTrue("SOCIAL_CONNECT");
        if (campaigns.isEmpty()) {
            return;
        }

        CashbackCampaign campaign = campaigns.get(0);
        BigDecimal reward = campaign.getRewardValue() != null ? campaign.getRewardValue() : BigDecimal.valueOf(5.00);

        CashbackTransaction tx = CashbackTransaction.builder()
                .user(user)
                .amount(reward)
                .type(CashbackType.SOCIAL_CAMPAIGN)
                .status(CashbackStatus.APPROVED) // Instant approval for verified social connect
                .campaign(campaign)
                .referenceId(refId)
                .description("Welcome Reward: Connected " + provider + " account")
                .availableAt(LocalDateTime.now())
                .build();

        transactionRepository.save(tx);

        if (!claimRepository.existsByUserIdAndCampaignId(user.getId(), campaign.getId())) {
            claimRepository.save(CashbackClaim.builder()
                    .user(user)
                    .campaign(campaign)
                    .status("APPROVED")
                    .claimDetails("Connected " + provider + " account successfully")
                    .build());
        }
    }

    @Transactional
    public ClaimResponseDto claimCampaign(User user, ClaimCampaignRequest request) {
        CashbackCampaign campaign = campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new ResourceNotFoundException("CashbackCampaign", "id", request.getCampaignId()));

        if (!Boolean.TRUE.equals(campaign.getIsActive())) {
            throw new BadRequestException("This cashback campaign is currently inactive or expired.");
        }

        if (claimRepository.existsByUserIdAndCampaignId(user.getId(), campaign.getId())) {
            throw new BadRequestException("You have already claimed this campaign reward.");
        }

        String refId = "CLAIM-" + campaign.getId() + "-" + user.getId();
        if (transactionRepository.existsByUserIdAndReferenceId(user.getId(), refId)) {
            throw new BadRequestException("Reward transaction for this campaign already exists.");
        }

        BigDecimal reward = campaign.getRewardValue();

        CashbackClaim claim = CashbackClaim.builder()
                .user(user)
                .campaign(campaign)
                .status("APPROVED")
                .claimDetails(request.getClaimDetails())
                .proofUrl(request.getProofUrl())
                .build();

        CashbackClaim savedClaim = claimRepository.save(claim);

        CashbackTransaction tx = CashbackTransaction.builder()
                .user(user)
                .amount(reward)
                .type(CashbackType.SOCIAL_CAMPAIGN)
                .status(CashbackStatus.APPROVED)
                .campaign(campaign)
                .referenceId(refId)
                .description("Reward: " + campaign.getTitle())
                .availableAt(LocalDateTime.now())
                .build();

        transactionRepository.save(tx);

        return ClaimResponseDto.builder()
                .claimId(savedClaim.getId())
                .campaignId(campaign.getId())
                .campaignTitle(campaign.getTitle())
                .rewardAmount(reward)
                .status("APPROVED")
                .message("Congratulations! $" + reward + " cashback has been added to your account.")
                .build();
    }

    private CashbackTransactionDto toTransactionDto(CashbackTransaction tx) {
        return CashbackTransactionDto.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .type(tx.getType().name())
                .status(tx.getStatus().name())
                .referenceId(tx.getReferenceId())
                .description(tx.getDescription())
                .campaignTitle(tx.getCampaign() != null ? tx.getCampaign().getTitle() : null)
                .availableAt(tx.getAvailableAt())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private CashbackCampaignDto toCampaignDto(CashbackCampaign c, boolean hasClaimed) {
        return CashbackCampaignDto.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .rewardType(c.getRewardType())
                .rewardValue(c.getRewardValue())
                .activityType(c.getActivityType())
                .minPurchaseAmount(c.getMinPurchaseAmount())
                .maxCashbackPerUser(c.getMaxCashbackPerUser())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .isActive(c.getIsActive())
                .terms(c.getTerms())
                .badgeText(c.getBadgeText())
                .hasClaimed(hasClaimed)
                .build();
    }
}
