package com.scrollshop.dto;

import com.scrollshop.dto.AddressDtos.AddressRequest;
import com.scrollshop.dto.SellerDtos.SellerProfileDto;
import com.scrollshop.dto.SellerDtos.SellerRegistrationRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AuthDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        private String username;

        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 12, max = 128, message = "Password must be between 12 and 128 characters")
        private String password;

        private String confirmPassword;
        private Boolean agreeTerms;

        private String fullName;
        private String bio;
        private String phoneNumber;

        private String accountType; // "CUSTOMER" or "SELLER"

        // Optional address provided during signup
        private AddressRequest address;

        // Seller details if accountType == "SELLER"
        private SellerRegistrationRequest sellerDetails;

        // Content preferences & Personalization
        private List<String> interests;
        private String feedPreference;
        private String preferredBrands;
        private String preferredPriceRange;
        private String connectedInstagramHandle;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        @Builder.Default
        private String type = "Bearer";
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String avatarUrl;
        private String role;
        private String phoneNumber;
        private Boolean isPersonalizationEnabled;
        private SellerProfileDto sellerProfile;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserProfileDto {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String bio;
        private String avatarUrl;
        private String role;
        private String phoneNumber;
        private Boolean isPersonalizationEnabled;
        private String interests;
        private String feedPreference;
        private String preferredBrands;
        private String preferredPriceRange;
        private int friendCount;
        private boolean isFriend;
        private boolean isPendingRequest;
        private boolean isBlocked;
        private SellerProfileDto sellerProfile;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateProfileRequest {
        private String fullName;
        private String bio;
        private String avatarUrl;
        private String email;
        private String phoneNumber;
        private Boolean isPersonalizationEnabled;
        private String interests;
        private String feedPreference;
        private String preferredBrands;
        private String preferredPriceRange;
    }
}
