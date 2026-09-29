package com.scrollshop.dto;

import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.dto.VideoDtos.ShoppingVideoDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class SocialFeedDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FeedItemDto {
        private String id;
        private String itemType; // SOCIAL_POST, SHOPPING_PRODUCT, SHOPPING_VIDEO, DEAL_HIGHLIGHT
        private String contentRatioCategory; // "SOCIAL" or "SHOPPING"
        
        // If SOCIAL_POST
        private Long postId;
        private String creatorUsername;
        private String creatorFullName;
        private String creatorAvatar;
        private String creatorRole;
        private String postContent;
        private String postImageUrl;
        private Integer likeCount;
        private Integer commentCount;
        private Boolean isLikedByMe;
        
        // If SHOPPING_PRODUCT
        private ProductDto product;
        
        // If SHOPPING_VIDEO
        private ShoppingVideoDto video;
        
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SocialFeedResponseDto {
        private List<FeedItemDto> items;
        private int totalCount;
        private double socialRatio;
        private double shoppingRatio;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateSocialPostRequest {
        private String content;
        private String imageUrl;
        private Long taggedProductId;
        private String category;
    }
}
