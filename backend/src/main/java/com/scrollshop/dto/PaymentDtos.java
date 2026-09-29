package com.scrollshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class PaymentDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RazorpayOrderResponse {
        private String razorpayOrderId;
        private Long orderId;
        private String orderNumber;
        private BigDecimal amount;
        private String currency;
        private String keyId;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentVerifyRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotBlank(message = "Razorpay Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay Payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Razorpay Signature is required")
        private String razorpaySignature;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentVerifyResponse {
        private boolean success;
        private String message;
        private String orderNumber;
        private String paymentStatus;
    }
}
