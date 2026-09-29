package com.scrollshop.dto;

import com.scrollshop.entity.OrderStatus;
import com.scrollshop.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class AdminDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDashboardStatsDto {
        private long totalUsers;
        private long totalProducts;
        private long totalOrders;
        private long totalVideos;
        private BigDecimal totalRevenue;
        private long pendingOrders;
        private long paidOrders;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateOrderStatusRequest {
        @NotNull(message = "Status is required")
        private OrderStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateUserRoleRequest {
        @NotNull(message = "Role is required")
        private Role role;
    }
}
