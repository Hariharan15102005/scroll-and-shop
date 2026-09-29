package com.scrollshop.controller;

import com.scrollshop.dto.ProductDtos.*;
import com.scrollshop.dto.SocialDtos.CommentDto;
import com.scrollshop.dto.SocialDtos.CreateCommentRequest;
import com.scrollshop.dto.SocialDtos.LikeResponse;
import com.scrollshop.entity.User;
import com.scrollshop.service.AuthService;
import com.scrollshop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<Page<ProductDto>> getProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;

        return ResponseEntity.ok(productService.searchProducts(
                q, categoryId, minPrice, maxPrice, sortBy, sortDir, page, size, currentUserId
        ));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDto>> getFeatured() {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(productService.getFeaturedProducts(currentUserId));
    }

    @GetMapping("/deals")
    public ResponseEntity<List<ProductDto>> getDeals() {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(productService.getDealsOfTheDay(currentUserId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @GetMapping("/{slugOrId}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable String slugOrId) {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(productService.getProductBySlugOrId(slugOrId, currentUserId, currentUser));
    }

    @GetMapping("/{productId}/likes")
    public ResponseEntity<LikeResponse> getLikes(@PathVariable Long productId) {
        User currentUser = authService.getCurrentUser();
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(productService.getProductLikes(productId, currentUserId));
    }

    @PostMapping({"/{productId}/like", "/{productId}/likes"})
    public ResponseEntity<LikeResponse> toggleLike(@PathVariable Long productId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(productService.toggleLike(productId, currentUser));
    }

    @DeleteMapping({"/{productId}/like", "/{productId}/likes"})
    public ResponseEntity<LikeResponse> removeLike(@PathVariable Long productId) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(productService.removeLike(productId, currentUser));
    }

    @GetMapping("/{productId}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductComments(productId));
    }

    @PostMapping("/{productId}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long productId,
            @Valid @RequestBody CreateCommentRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(productService.addComment(productId, currentUser, request));
    }

    @PutMapping("/{productId}/comments/{commentId}")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable Long productId,
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(productService.updateComment(productId, commentId, currentUser, request));
    }

    @DeleteMapping("/{productId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long productId,
            @PathVariable Long commentId) {
        User currentUser = authService.getCurrentUser();
        productService.deleteComment(productId, commentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{productId}/reviews")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductReviews(productId));
    }

    @PostMapping("/{productId}/reviews")
    public ResponseEntity<ReviewDto> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateReviewRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(productService.addReview(productId, currentUser, request));
    }

    @PutMapping("/{productId}/reviews/{reviewId}")
    public ResponseEntity<ReviewDto> updateReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @Valid @RequestBody CreateReviewRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(productService.updateReview(productId, reviewId, currentUser, request));
    }

    @DeleteMapping("/{productId}/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId) {
        User currentUser = authService.getCurrentUser();
        productService.deleteReview(productId, reviewId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }
}
