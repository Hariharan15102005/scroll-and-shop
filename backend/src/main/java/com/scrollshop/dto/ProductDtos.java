package com.scrollshop.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDto {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductDto {
        private Long id;
        private String title;
        private String slug;
        private String description;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private Integer stockQuantity;
        private Long categoryId;
        private String categoryName;
        private String categorySlug;
        private String brand;
        private String mainImageUrl;
        private List<String> galleryImages;
        private Double ratingAverage;
        private Integer ratingCount;
        private Boolean isFeatured;
        private Boolean isDealOfTheDay;
        private String tags;
        private String searchKeywords;
        private boolean isLikedByCurrentUser;
        private long likeCount;
        private long commentCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateProductRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be positive")
        private BigDecimal price;

        private BigDecimal originalPrice;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock cannot be negative")
        private Integer stockQuantity;

        private Long categoryId;
        private String brand;

        @NotBlank(message = "Main image is required")
        private String mainImageUrl;

        private List<String> galleryImages;
        private Boolean isFeatured;
        private Boolean isDealOfTheDay;
        private String tags;
        private String searchKeywords;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewDto {
        private Long id;
        private Long productId;
        private Long userId;
        private String username;
        private String userAvatar;
        private Integer rating;
        private String title;
        private String comment;
        private Boolean isVerifiedPurchase;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateReviewRequest {
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Min rating is 1")
        private Integer rating;

        private String title;
        private String comment;
    }
}
