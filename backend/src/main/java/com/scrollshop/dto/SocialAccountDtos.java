package com.scrollshop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class SocialAccountDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConnectSocialAccountRequest {
        @NotBlank(message = "Provider is required (e.g. INSTAGRAM, TIKTOK, YOUTUBE, TWITTER)")
        private String provider;

        private String providerUsername;
        private String providerDisplayName;
        private String authorizationCode; // OAuth authorization code from official provider
        private String permissionsGranted;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConnectedSocialAccountDto {
        private Long id;
        private String provider;
        private String providerUserId;
        private String providerUsername;
        private String providerDisplayName;
        private String profilePictureUrl;
        private String status; // CONNECTED, PENDING_VERIFICATION, REVOKED
        private String permissionsGranted;
        private Boolean isVerified;
        private Boolean rewardClaimed;
        private LocalDateTime connectedAt;
        private LocalDateTime lastSyncAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SocialProviderConfigDto {
        private String provider;
        private String displayName;
        private String icon;
        private String status; // LIVE, SANDBOX_AVAILABLE, PENDING_APPROVAL
        private String description;
        private String requiredPermissions;
        private String permissionsExplanation;
        private Boolean isEligibleForCashback;
        private String cashbackRewardNote;
    }
}
