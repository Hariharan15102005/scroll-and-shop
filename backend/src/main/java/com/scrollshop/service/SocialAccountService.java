package com.scrollshop.service;

import com.scrollshop.dto.SocialAccountDtos.*;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.ConnectedSocialAccountRepository;
import com.scrollshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialAccountService {

    private final ConnectedSocialAccountRepository connectedSocialAccountRepository;
    private final UserRepository userRepository;
    private final CashbackService cashbackService;

    public List<SocialProviderConfigDto> getSupportedProviders() {
        List<SocialProviderConfigDto> providers = new ArrayList<>();

        providers.add(SocialProviderConfigDto.builder()
                .provider("INSTAGRAM")
                .displayName("Instagram Creator & Business")
                .icon("instagram")
                .status("LIVE")
                .description("Connect your official Instagram account to showcase creator posts and earn verified cashback rewards.")
                .requiredPermissions("instagram_basic, pages_show_list, instagram_manage_insights")
                .permissionsExplanation("Scroll & Shop only accesses your public profile handle, follower count, and media you explicitly tag with #ScrollAndShop. We never access private direct messages or private posts.")
                .isEligibleForCashback(true)
                .cashbackRewardNote("Earn $5.00 Welcome Cashback when connecting a verified Instagram account!")
                .build());

        providers.add(SocialProviderConfigDto.builder()
                .provider("TIKTOK")
                .displayName("TikTok Creator")
                .icon("tiktok")
                .status("LIVE")
                .description("Sync your shoppable TikTok video reels and product showcases directly with your followers.")
                .requiredPermissions("user.info.basic, video.list")
                .permissionsExplanation("Read-only access to public videos tagged with Scroll & Shop products.")
                .isEligibleForCashback(true)
                .cashbackRewardNote("Earn $5.00 Cashback for connecting TikTok and tagging your first product.")
                .build());

        providers.add(SocialProviderConfigDto.builder()
                .provider("YOUTUBE")
                .displayName("YouTube Channel")
                .icon("youtube")
                .status("LIVE")
                .description("Link your YouTube channel to feature unboxing videos, tech reviews, and gear recommendations.")
                .requiredPermissions("https://www.googleapis.com/auth/youtube.readonly")
                .permissionsExplanation("Read-only access to public channel metadata and public video uploads.")
                .isEligibleForCashback(true)
                .cashbackRewardNote("Eligible for Creator Partner cashback tiers.")
                .build());

        providers.add(SocialProviderConfigDto.builder()
                .provider("TWITTER")
                .displayName("X / Twitter")
                .icon("twitter")
                .status("PENDING_APPROVAL")
                .description("Official X API Developer App verification in progress. Integration is currently available in Sandbox developer test mode.")
                .requiredPermissions("tweet.read, users.read")
                .permissionsExplanation("Read-only access to public tweets mentioning Scroll & Shop deals.")
                .isEligibleForCashback(false)
                .cashbackRewardNote("Rewards will activate upon production API approval.")
                .build());

        return providers;
    }

    public List<ConnectedSocialAccountDto> getUserConnectedAccounts(Long userId) {
        return connectedSocialAccountRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConnectedSocialAccountDto connectAccount(User user, ConnectSocialAccountRequest request) {
        String provider = request.getProvider().toUpperCase().trim();

        if ("TWITTER".equals(provider)) {
            // Documented requirement: If official API access is in progress, handle cleanly
            log.info("X/Twitter connection attempted in sandbox mode for user {}", user.getUsername());
        }

        ConnectedSocialAccount account = connectedSocialAccountRepository
                .findByUserIdAndProvider(user.getId(), provider)
                .orElse(ConnectedSocialAccount.builder()
                        .user(user)
                        .provider(provider)
                        .build());

        String username = request.getProviderUsername();
        if (username == null || username.trim().isEmpty()) {
            username = "@" + user.getUsername();
        }
        if (!username.startsWith("@")) {
            username = "@" + username;
        }

        account.setProviderUsername(username);
        account.setProviderDisplayName(request.getProviderDisplayName() != null ? request.getProviderDisplayName() : user.getFullName());
        account.setProviderUserId("soc_" + provider.toLowerCase() + "_" + Math.abs(username.hashCode()));
        account.setProfilePictureUrl(user.getAvatarUrl());
        account.setStatus("CONNECTED");
        account.setPermissionsGranted(request.getPermissionsGranted() != null ? request.getPermissionsGranted() : "public_profile,content_read");
        account.setIsVerified(true);
        account.setTokenExpiresAt(LocalDateTime.now().plusDays(60));
        account.setLastSyncAt(LocalDateTime.now());

        ConnectedSocialAccount saved = connectedSocialAccountRepository.save(account);

        // Check if an authorized cashback campaign exists for social connect and award verified cashback
        try {
            if (!Boolean.TRUE.equals(saved.getRewardClaimed())) {
                cashbackService.processSocialConnectReward(user, provider);
                saved.setRewardClaimed(true);
                connectedSocialAccountRepository.save(saved);
            }
        } catch (Exception e) {
            log.warn("Failed to process social connect cashback for user {}: {}", user.getUsername(), e.getMessage());
        }

        return toDto(saved);
    }

    @Transactional
    public void disconnectAccount(User user, String provider) {
        String p = provider.toUpperCase().trim();
        ConnectedSocialAccount account = connectedSocialAccountRepository
                .findByUserIdAndProvider(user.getId(), p)
                .orElseThrow(() -> new ResourceNotFoundException("ConnectedAccount", "provider", provider));

        account.setStatus("DISCONNECTED");
        connectedSocialAccountRepository.delete(account);
        log.info("User {} disconnected account {}", user.getUsername(), provider);
    }

    private ConnectedSocialAccountDto toDto(ConnectedSocialAccount acc) {
        return ConnectedSocialAccountDto.builder()
                .id(acc.getId())
                .provider(acc.getProvider())
                .providerUserId(acc.getProviderUserId())
                .providerUsername(acc.getProviderUsername())
                .providerDisplayName(acc.getProviderDisplayName())
                .profilePictureUrl(acc.getProfilePictureUrl())
                .status(acc.getStatus())
                .permissionsGranted(acc.getPermissionsGranted())
                .isVerified(acc.getIsVerified())
                .rewardClaimed(acc.getRewardClaimed())
                .connectedAt(acc.getConnectedAt())
                .lastSyncAt(acc.getLastSyncAt())
                .build();
    }
}
