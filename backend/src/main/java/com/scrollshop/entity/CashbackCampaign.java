package com.scrollshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cashback_campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashbackCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String rewardType; // PERCENTAGE, FIXED

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rewardValue; // e.g. 5.00 for 5% or 10.00 for $10

    @Column(nullable = false, length = 50)
    private String activityType; // PURCHASE, SOCIAL_CONNECT, PRODUCT_REVIEW, REFERRAL

    @Column(precision = 10, scale = 2)
    private BigDecimal minPurchaseAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxCashbackPerUser;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalBudget;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Column(length = 100)
    private String badgeText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
