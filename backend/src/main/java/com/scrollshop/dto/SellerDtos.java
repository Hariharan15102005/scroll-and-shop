package com.scrollshop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class SellerDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SellerRegistrationRequest {
        @NotBlank(message = "Store name is required")
        private String storeName;

        @NotBlank(message = "Store handle slug is required")
        private String storeHandle;

        private String businessType;
        private String businessCategory;
        private String storeDescription;
        private String businessEmail;
        private String businessPhone;
        private String businessAddress;
        private String pickupAddress;
        private String operatingRegion;
        private String shippingPreference;
        private String returnPolicy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SellerProfileDto {
        private Long id;
        private Long userId;
        private String storeName;
        private String storeHandle;
        private String businessType;
        private String businessCategory;
        private String storeDescription;
        private String businessEmail;
        private String businessPhone;
        private String businessAddress;
        private String pickupAddress;
        private String operatingRegion;
        private String shippingPreference;
        private String returnPolicy;
        private String verificationStatus;
        private LocalDateTime createdAt;
    }
}
