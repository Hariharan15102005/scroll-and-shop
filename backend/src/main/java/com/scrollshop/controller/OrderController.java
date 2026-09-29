package com.scrollshop.controller;

import com.scrollshop.dto.CartAndOrderDtos.*;
import com.scrollshop.entity.Order;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CheckoutRequest request) {
        User currentUser = authService.getCurrentUser();
        Order order = orderService.createOrder(currentUser, request);
        return ResponseEntity.ok(orderService.toOrderDto(order));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getUserOrders() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.getUserOrders(currentUser.getId()));
    }

    @GetMapping("/gifts-received")
    public ResponseEntity<List<OrderDto>> getReceivedGifts() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.getReceivedGifts(currentUser.getId()));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.getOrderById(orderId, currentUser));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(@PathVariable Long orderId, @RequestParam(required = false) String reason) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.cancelOrder(orderId, currentUser, reason));
    }
}
