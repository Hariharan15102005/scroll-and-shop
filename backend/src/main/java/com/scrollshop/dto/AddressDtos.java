package com.scrollshop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AddressDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressRequest {
        @NotBlank(message = "Recipient full name is required")
        private String recipientName;

        @NotBlank(message = "Contact phone number is required")
        private String phone;

        private String addressType; // HOME, WORK, OTHER

        @NotBlank(message = "House / Flat / Door number is required")
        private String houseNumber;

        private String buildingName;

        @NotBlank(message = "Street / Road is required")
        private String street;

        @NotBlank(message = "Area / Locality is required")
        private String area;

        private String landmark;

        @NotBlank(message = "City / Town is required")
        private String city;

        private String district;

        @NotBlank(message = "State / Union Territory is required")
        private String state;

        @NotBlank(message = "PIN / Postal code is required")
        private String postalCode;

        private String country;
        private Boolean isDefault;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressDto {
        private Long id;
        private String recipientName;
        private String phone;
        private String addressType;
        private String houseNumber;
        private String buildingName;
        private String street;
        private String area;
        private String landmark;
        private String city;
        private String district;
        private String state;
        private String postalCode;
        private String country;
        private Boolean isDefault;
        private LocalDateTime createdAt;
    }
}
