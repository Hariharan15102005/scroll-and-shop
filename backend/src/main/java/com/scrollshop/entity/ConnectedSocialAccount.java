package com.scrollshop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "connected_social_accounts", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_provider", columnNames = {"user_id", "provider"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectedSocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 30)
    private String provider; // INSTAGRAM, TIKTOK, YOUTUBE, TWITTER

    @Column(length = 100)
    private String providerUserId;

    @Column(length = 100)
    private String providerUsername;

    @Column(length = 255)
    private String providerDisplayName;

    @Column(length = 500)
    private String profilePictureUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "CONNECTED"; // CONNECTED, PENDING_VERIFICATION, REVOKED, DISCONNECTED

    @Column(length = 200)
    private String permissionsGranted; // e.g. "public_profile,content_read"

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = true;

    @Column(name = "reward_claimed", nullable = false)
    @Builder.Default
    private Boolean rewardClaimed = false;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @CreationTimestamp
    @Column(name = "connected_at", nullable = false, updatable = false)
    private LocalDateTime connectedAt;

    @UpdateTimestamp
    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;
}
