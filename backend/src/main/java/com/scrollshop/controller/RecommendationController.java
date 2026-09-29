package com.scrollshop.controller;

import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<ProductDto>> getRecommendations(@RequestParam(defaultValue = "10") int limit) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(recommendationService.getRecommendedProducts(currentUser, limit));
    }

    @GetMapping("/similar/{productId}")
    public ResponseEntity<List<ProductDto>> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(recommendationService.getSimilarProducts(productId, limit));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory() {
        User currentUser = authService.getCurrentUser();
        recommendationService.clearInteractionHistory(currentUser);
        return ResponseEntity.noContent().build();
    }
}
