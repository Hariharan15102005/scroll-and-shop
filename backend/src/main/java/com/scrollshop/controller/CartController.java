package com.scrollshop.controller;

import com.scrollshop.dto.CartAndOrderDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<CartSummaryDto> getCart() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.getCartSummary(currentUser));
    }

    @PostMapping("/items")
    public ResponseEntity<CartSummaryDto> addToCart(@Valid @RequestBody AddToCartRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.addToCart(currentUser, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartSummaryDto> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.updateCartItem(currentUser, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartSummaryDto> removeCartItem(@PathVariable Long itemId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.removeCartItem(currentUser, itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        User currentUser = authService.getCurrentUser();
        cartService.clearCart(currentUser);
        return ResponseEntity.noContent().build();
    }
}
