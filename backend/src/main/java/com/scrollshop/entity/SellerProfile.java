package com.scrollshop.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "seller_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String storeName;

    @Column(nullable = false, unique = true, length = 100)
    private String storeHandle;

    @Column(length = 50)
    private String businessType; // Individual, Sole Proprietorship, LLP, Pvt Ltd, Partnership

    @Column(length = 100)
    private String businessCategory; // Electronics, Apparel, Handmade, Beauty, Lifestyle

    @Column(columnDefinition = "TEXT")
    private String storeDescription;

    @Column(length = 100)
    private String businessEmail;

    @Column(length = 30)
    private String businessPhone;

    @Column(columnDefinition = "TEXT")
    private String businessAddress;

    @Column(columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(length = 100)
    @Builder.Default
    private String operatingRegion = "National";

    @Column(length = 100)
    @Builder.Default
    private String shippingPreference = "Standard / Scroll Logistics";

    @Column(columnDefinition = "TEXT")
    private String returnPolicy;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String verificationStatus = "ACTIVE"; // PENDING_VERIFICATION, ACTIVE, REJECTED, SUSPENDED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
