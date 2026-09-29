package com.scrollshop.controller;

import com.scrollshop.dto.AdminDtos.*;
import com.scrollshop.dto.AuthDtos.UserProfileDto;
import com.scrollshop.dto.CartAndOrderDtos.OrderDto;
import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.entity.OrderStatus;
import com.scrollshop.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderDto>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getOrders(status, page, size));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(adminService.updateOrderStatus(orderId, request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<UserProfileDto> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, request));
    }

    @PatchMapping("/products/{productId}/stock")
    public ResponseEntity<ProductDto> updateProductStock(
            @PathVariable Long productId,
            @RequestParam int stock) {
        return ResponseEntity.ok(adminService.updateProductStock(productId, stock));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody com.scrollshop.dto.ProductDtos.CreateProductRequest request) {
        return ResponseEntity.ok(adminService.createProduct(request));
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody com.scrollshop.dto.ProductDtos.CreateProductRequest request) {
        return ResponseEntity.ok(adminService.updateProduct(productId, request));
    }

    private final com.scrollshop.config.DataInitializer dataInitializer;

    @PostMapping("/seed-demo-data")
    public ResponseEntity<Map<String, String>> seedDemoData() {
        dataInitializer.seedAllData();
        return ResponseEntity.ok(Map.of("message", "Scroll & Shop demo database seeded successfully with expansive social commerce catalog."));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        adminService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}
