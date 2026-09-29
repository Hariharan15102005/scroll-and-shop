package com.scrollshop.service;

import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.entity.Product;
import com.scrollshop.entity.User;
import com.scrollshop.entity.UserInteraction;
import com.scrollshop.repository.ProductRepository;
import com.scrollshop.repository.UserInteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserInteractionRepository userInteractionRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public List<ProductDto> getRecommendedProducts(User user, int limit) {
        // If user is null or disabled personalization, return featured and deal items
        if (user == null || Boolean.FALSE.equals(user.getIsPersonalizationEnabled())) {
            List<Product> defaults = productRepository.findByIsFeaturedTrue();
            if (defaults.isEmpty()) {
                defaults = productRepository.findAll(PageRequest.of(0, limit)).getContent();
            }
            return defaults.stream()
                    .limit(limit)
                    .map(p -> productService.toProductDto(p, user != null ? user.getId() : null))
                    .collect(Collectors.toList());
        }

        // Fetch user interactions from the last 30 days
        LocalDateTime sinceDate = LocalDateTime.now().minusDays(30);
        List<UserInteraction> interactions = userInteractionRepository.findRecentInteractionsByUser(user.getId(), sinceDate);

        if (interactions.isEmpty()) {
            return productRepository.findByIsFeaturedTrue().stream()
                    .limit(limit)
                    .map(p -> productService.toProductDto(p, user.getId()))
                    .collect(Collectors.toList());
        }

        // Compute scored preferences per category & product with recency decay
        Map<Long, Double> categoryScores = new HashMap<>();
        Map<Long, Double> productAffinityScores = new HashMap<>();
        Set<Long> interactedProductIds = new HashSet<>();

        LocalDateTime now = LocalDateTime.now();

        for (UserInteraction ui : interactions) {
            long daysOld = ChronoUnit.DAYS.between(ui.getCreatedAt(), now);
            // Recency decay factor: half-life ~ 10 days
            double recencyDecay = Math.exp(-0.07 * daysOld);
            double score = ui.getWeight() * recencyDecay;

            if (ui.getProduct().getCategory() != null) {
                Long catId = ui.getProduct().getCategory().getId();
                categoryScores.put(catId, categoryScores.getOrDefault(catId, 0.0) + score);
            }

            productAffinityScores.put(ui.getProduct().getId(), productAffinityScores.getOrDefault(ui.getProduct().getId(), 0.0) + score);
            interactedProductIds.add(ui.getProduct().getId());
        }

        // Rank all catalog products based on category affinity and rating
        List<Product> allProducts = productRepository.findAll();
        Map<Product, Double> candidateRankings = new HashMap<>();

        for (Product product : allProducts) {
            double productScore = 0.0;

            // Base product rating weight
            productScore += (product.getRatingAverage() != null ? product.getRatingAverage() : 3.0) * 1.5;

            // Category match weight
            if (product.getCategory() != null && categoryScores.containsKey(product.getCategory().getId())) {
                productScore += categoryScores.get(product.getCategory().getId()) * 3.0;
            }

            // If already purchased or viewed multiple times, slight novelty adjustment
            if (interactedProductIds.contains(product.getId())) {
                productScore += 1.0;
            }

            candidateRankings.put(product, productScore);
        }

        return candidateRankings.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(limit)
                .map(e -> productService.toProductDto(e.getKey(), user.getId()))
                .collect(Collectors.toList());
    }

    public List<ProductDto> getSimilarProducts(Long productId, int limit) {
        Product current = productRepository.findById(productId).orElse(null);
        if (current == null || current.getCategory() == null) {
            return productRepository.findByIsFeaturedTrue().stream()
                    .filter(p -> !p.getId().equals(productId))
                    .limit(limit)
                    .map(p -> productService.toProductDto(p, null))
                    .collect(Collectors.toList());
        }

        return productRepository.searchProducts(null, current.getCategory().getId(), null, null, PageRequest.of(0, limit + 1))
                .getContent().stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .map(p -> productService.toProductDto(p, null))
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void clearInteractionHistory(User user) {
        userInteractionRepository.deleteByUserId(user.getId());
    }
}
