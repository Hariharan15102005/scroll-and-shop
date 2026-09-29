package com.scrollshop.controller;

import com.scrollshop.dto.GiftDtos.AddToWishlistRequest;
import com.scrollshop.dto.GiftDtos.GiftWishlistDto;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.GiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final GiftService giftService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<GiftWishlistDto>> getWishlist() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(giftService.getUserWishlist(currentUser));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<GiftWishlistDto> addToWishlist(
            @PathVariable Long productId,
            @RequestParam(required = false, defaultValue = "true") Boolean isPublic) {
        User currentUser = authService.getCurrentUser();
        AddToWishlistRequest request = new AddToWishlistRequest();
        request.setProductId(productId);
        request.setIsPublic(isPublic);
        return ResponseEntity.ok(giftService.addToWishlist(currentUser, request));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long productId) {
        User currentUser = authService.getCurrentUser();
        giftService.removeFromWishlist(currentUser, productId);
        return ResponseEntity.noContent().build();
    }
}
