package com.scrollshop.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class GiftDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GiftWishlistDto {
        private Long id;
        private Long userId;
        private String username;
        private ProductDtos.ProductDto product;
        private Boolean isPublic;
        private Boolean isReserved;
        private Long reservedByUserId;
        private String reservedByUsername;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddToWishlistRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;
        private Boolean isPublic;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FriendGiftIdeasDto {
        private Long friendId;
        private String friendUsername;
        private String friendFullName;
        private String friendAvatar;
        private List<GiftWishlistDto> wishlistItems;
        private List<ProductDtos.ProductDto> recommendedGifts;
    }
}
