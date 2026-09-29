package com.scrollshop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class VideoDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShoppingVideoDto {
        private Long id;
        private Long creatorId;
        private String creatorUsername;
        private String creatorFullName;
        private String creatorAvatar;
        private String title;
        private String description;
        private String videoUrl;
        private String thumbnailUrl;
        private Integer likesCount;
        private Integer viewsCount;
        private List<ProductDtos.ProductDto> taggedProducts;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UploadVideoRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotBlank(message = "Video URL is required")
        private String videoUrl;

        private String thumbnailUrl;
        private List<Long> taggedProductIds;
    }
}
