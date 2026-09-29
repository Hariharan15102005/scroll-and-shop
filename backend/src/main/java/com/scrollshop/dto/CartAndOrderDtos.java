package com.scrollshop.dto;

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

public class CartAndOrderDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemDto {
        private Long id;
        private Long productId;
        private String productTitle;
        private String productSlug;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private Integer quantity;
        private Integer stockQuantity;
        private BigDecimal itemTotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartSummaryDto {
        private List<CartItemDto> items;
        private BigDecimal subtotal;
        private BigDecimal estimatedShipping;
        private BigDecimal estimatedTax;
        private BigDecimal total;
        private int totalItemCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddToCartRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateCartRequest {
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckoutRequest {
        @NotBlank(message = "Shipping name is required")
        private String shippingName;

        @NotBlank(message = "Address line 1 is required")
        private String shippingAddressLine1;

        private String shippingAddressLine2;

        @NotBlank(message = "City is required")
        private String shippingCity;

        @NotBlank(message = "State is required")
        private String shippingState;

        @NotBlank(message = "Postal code is required")
        private String shippingPostalCode;

        @NotBlank(message = "Phone number is required")
        private String shippingPhone;

        private Boolean isGift;
        private Long giftRecipientId;
        private String giftMessage;
        private String giftWrappingOption;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDto {
        private Long id;
        private Long productId;
        private String productTitle;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderDto {
        private Long id;
        private String orderNumber;
        private Long userId;
        private String username;
        private String status;
        private BigDecimal totalAmount;
        private BigDecimal subtotalAmount;
        private BigDecimal shippingFee;
        private BigDecimal taxAmount;
        private String shippingName;
        private String shippingAddressLine1;
        private String shippingAddressLine2;
        private String shippingCity;
        private String shippingState;
        private String shippingPostalCode;
        private String shippingPhone;
        private Boolean isGift;
        private Long giftRecipientId;
        private String giftRecipientUsername;
        private String giftMessage;
        private String giftWrappingOption;
        private List<OrderItemDto> items;
        private String paymentStatus;
        private String razorpayOrderId;
        private LocalDateTime createdAt;
    }
}
