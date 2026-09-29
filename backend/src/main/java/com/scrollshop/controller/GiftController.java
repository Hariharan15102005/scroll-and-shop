package com.scrollshop.controller;

import com.scrollshop.dto.GiftDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.GiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gifts")
@RequiredArgsConstructor
public class GiftController {

    private final GiftService giftService;
    private final AuthService authService;

    @GetMapping("/wishlist")
    public ResponseEntity<List<GiftWishlistDto>> getMyWishlist() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(giftService.getUserWishlist(currentUser));
    }

    @PostMapping("/wishlist")
    public ResponseEntity<GiftWishlistDto> addToWishlist(@Valid @RequestBody AddToWishlistRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(giftService.addToWishlist(currentUser, request));
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        User currentUser = authService.getCurrentUser();
        giftService.removeFromWishlist(currentUser, productId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/wishlist/{wishlistId}/reserve")
    public ResponseEntity<GiftWishlistDto> toggleReserveWishlistItem(@PathVariable Long wishlistId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(giftService.reserveWishlistItem(currentUser, wishlistId));
    }

    @GetMapping("/friends/{friendId}/ideas")
    public ResponseEntity<FriendGiftIdeasDto> getFriendGiftIdeas(@PathVariable Long friendId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(giftService.getGiftIdeasForFriend(currentUser, friendId));
    }
}
