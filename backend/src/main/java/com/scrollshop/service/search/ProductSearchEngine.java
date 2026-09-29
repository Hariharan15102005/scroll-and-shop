package com.scrollshop.service.search;

import com.scrollshop.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductSearchEngine {

    private final SearchSynonymService synonymService;

    public Page<Product> searchAndRank(
            List<Product> allCandidates,
            String rawQuery,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            String sortDirection,
            Pageable pageable) {

        // 1. Filter by category, minPrice, maxPrice
        List<Product> filtered = allCandidates.stream()
                .filter(p -> categoryId == null || (p.getCategory() != null && categoryId.equals(p.getCategory().getId())))
                .filter(p -> minPrice == null || (p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0))
                .filter(p -> maxPrice == null || (p.getPrice() != null && p.getPrice().compareTo(maxPrice) <= 0))
                .collect(Collectors.toList());

        String normQuery = synonymService.normalize(rawQuery);

        // If no search query, return with standard sorting
        if (normQuery.isEmpty()) {
            List<Product> sortedList = applyStandardSorting(filtered, sortBy, sortDirection);
            return paginate(sortedList, pageable);
        }

        // 2. Prepare query terms and synonyms
        String[] queryWords = normQuery.split("\\s+");
        Set<String> querySynonyms = synonymService.getSynonyms(normQuery);

        Map<String, Set<String>> wordSynonymsMap = new HashMap<>();
        for (String word : queryWords) {
            wordSynonymsMap.put(word, synonymService.getSynonyms(word));
        }

        // 3. Score each product for relevance
        List<ScoredProduct> scoredProducts = new ArrayList<>();

        for (Product product : filtered) {
            double score = computeRelevanceScore(product, normQuery, queryWords, querySynonyms, wordSynonymsMap);
            // Dynamic threshold: higher threshold for multi-word queries to avoid loose single modifier matches
            double minThreshold = (queryWords.length >= 2) ? 60.0 : 25.0;
            if (score >= minThreshold) {
                scoredProducts.add(new ScoredProduct(product, score));
            }
        }

        // 4. Sort results
        List<Product> finalSorted;
        boolean isExplicitSort = sortBy != null && !sortBy.equalsIgnoreCase("createdAt") && !sortBy.equalsIgnoreCase("relevance");

        if (isExplicitSort) {
            // Apply user-requested sorting (e.g. price, rating) among the relevant products
            List<Product> matchingProducts = scoredProducts.stream().map(ScoredProduct::getProduct).collect(Collectors.toList());
            finalSorted = applyStandardSorting(matchingProducts, sortBy, sortDirection);
        } else {
            // Rank by relevance score descending, then rating average, then ID
            scoredProducts.sort((a, b) -> {
                int cmp = Double.compare(b.getScore(), a.getScore());
                if (cmp != 0) return cmp;
                Double r1 = a.getProduct().getRatingAverage() != null ? a.getProduct().getRatingAverage() : 0.0;
                Double r2 = b.getProduct().getRatingAverage() != null ? b.getProduct().getRatingAverage() : 0.0;
                int rCmp = Double.compare(r2, r1);
                if (rCmp != 0) return rCmp;
                return Long.compare(b.getProduct().getId(), a.getProduct().getId());
            });
            finalSorted = scoredProducts.stream().map(ScoredProduct::getProduct).collect(Collectors.toList());
        }

        return paginate(finalSorted, pageable);
    }

    private double computeRelevanceScore(
            Product product,
            String normQuery,
            String[] queryWords,
            Set<String> querySynonyms,
            Map<String, Set<String>> wordSynonymsMap) {

        double score = 0.0;

        String title = synonymService.normalize(product.getTitle());
        String brand = synonymService.normalize(product.getBrand());
        String category = synonymService.normalize(product.getCategory() != null ? product.getCategory().getName() : "");
        String keywords = synonymService.normalize(product.getSearchKeywords());
        String tags = synonymService.normalize(product.getTags());
        String description = synonymService.normalize(product.getDescription());

        // --- DIRECT QUERY MATCHES (High Weights) ---
        // Title Exact & Phrase
        if (title.equals(normQuery)) {
            score += 1000.0;
        } else if (matchesTerm(title, normQuery)) {
            score += 500.0;
            if (title.startsWith(normQuery)) {
                score += 150.0;
            }
        }

        // Brand
        if (brand.equals(normQuery)) {
            score += 300.0;
        } else if (matchesTerm(brand, normQuery)) {
            score += 150.0;
        }

        // Search Keywords & Tags
        if (matchesTerm(keywords, normQuery)) {
            score += 350.0;
        }
        if (matchesTerm(tags, normQuery)) {
            score += 250.0;
        }

        // Category
        if (matchesTerm(category, normQuery)) {
            score += 120.0;
        }

        // Description
        if (matchesTerm(description, normQuery)) {
            score += 60.0;
        }

        // --- WORD-LEVEL DIRECT MATCHES ---
        int matchedWords = 0;
        for (String word : queryWords) {
            boolean wordMatched = false;
            if (matchesTerm(title, word)) {
                score += 120.0;
                wordMatched = true;
            }
            if (matchesTerm(brand, word)) {
                score += 80.0;
                wordMatched = true;
            }
            if (matchesTerm(keywords, word)) {
                score += 100.0;
                wordMatched = true;
            }
            if (matchesTerm(tags, word)) {
                score += 80.0;
                wordMatched = true;
            }
            if (matchesTerm(category, word)) {
                score += 50.0;
                wordMatched = true;
            }
            if (matchesTerm(description, word)) {
                score += 25.0;
                wordMatched = true;
            }
            if (wordMatched) {
                matchedWords++;
            }
        }

        // Multi-word coverage bonus
        if (queryWords.length > 1 && matchedWords == queryWords.length) {
            score += 200.0;
        }

        // --- SYNONYM MATCHES (Placed after direct matches) ---
        for (String syn : querySynonyms) {
            if (matchesTerm(title, syn)) {
                score += 80.0;
            }
            if (matchesTerm(keywords, syn)) {
                score += 65.0;
            }
            if (matchesTerm(tags, syn)) {
                score += 50.0;
            }
            if (matchesTerm(brand, syn)) {
                score += 40.0;
            }
            if (matchesTerm(category, syn)) {
                score += 35.0;
            }
            if (matchesTerm(description, syn)) {
                score += 15.0;
            }
        }

        // Word-level synonyms
        for (Map.Entry<String, Set<String>> entry : wordSynonymsMap.entrySet()) {
            for (String syn : entry.getValue()) {
                if (matchesTerm(title, syn)) {
                    score += 45.0;
                }
                if (matchesTerm(keywords, syn)) {
                    score += 35.0;
                }
                if (matchesTerm(tags, syn)) {
                    score += 30.0;
                }
                if (matchesTerm(category, syn)) {
                    score += 20.0;
                }
                if (matchesTerm(description, syn)) {
                    score += 10.0;
                }
            }
        }

        // --- FUZZY / TYPO MATCHING ---
        if (score == 0.0) {
            for (String word : queryWords) {
                if (word.length() >= 4) {
                    for (String tWord : title.split("\\s+")) {
                        if (synonymService.isFuzzyMatch(word, tWord)) {
                            score += 40.0;
                            break;
                        }
                    }
                    if (score == 0.0) {
                        for (String kWord : keywords.split("[\\s,]+")) {
                            if (synonymService.isFuzzyMatch(word, kWord)) {
                                score += 30.0;
                                break;
                            }
                        }
                    }
                }
            }
        }

        return score;
    }

    /**
     * Checks whether text contains the target word or phrase, with word boundary awareness
     * to avoid false substring matching (e.g. "phone" matching inside "headphones").
     */
    private boolean matchesTerm(String text, String term) {
        if (text == null || term == null || text.isEmpty() || term.isEmpty()) return false;
        if (term.contains(" ")) {
            return text.contains(term);
        }
        String padded = " " + text + " ";
        if (padded.contains(" " + term + " ")) return true;
        // Check word tokens with singular/plural support
        for (String w : text.split("[\\s,]+")) {
            if (w.equals(term)) return true;
            if (w.equals(term + "s") || w.equals(term + "es")) return true;
            if (term.endsWith("s") && term.substring(0, term.length() - 1).equals(w)) return true;
            if (term.endsWith("es") && term.substring(0, term.length() - 2).equals(w)) return true;
        }
        return false;
    }

    private List<Product> applyStandardSorting(List<Product> list, String sortBy, String sortDirection) {
        boolean isAsc = "ASC".equalsIgnoreCase(sortDirection);
        List<Product> sorted = new ArrayList<>(list);

        if ("price".equalsIgnoreCase(sortBy)) {
            sorted.sort((a, b) -> {
                BigDecimal p1 = a.getPrice() != null ? a.getPrice() : BigDecimal.ZERO;
                BigDecimal p2 = b.getPrice() != null ? b.getPrice() : BigDecimal.ZERO;
                return isAsc ? p1.compareTo(p2) : p2.compareTo(p1);
            });
        } else if ("ratingAverage".equalsIgnoreCase(sortBy) || "rating".equalsIgnoreCase(sortBy)) {
            sorted.sort((a, b) -> {
                Double r1 = a.getRatingAverage() != null ? a.getRatingAverage() : 0.0;
                Double r2 = b.getRatingAverage() != null ? b.getRatingAverage() : 0.0;
                return isAsc ? Double.compare(r1, r2) : Double.compare(r2, r1);
            });
        } else {
            // Default: createdAt DESC
            sorted.sort((a, b) -> {
                if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                return isAsc ? a.getCreatedAt().compareTo(b.getCreatedAt()) : b.getCreatedAt().compareTo(a.getCreatedAt());
            });
        }

        return sorted;
    }

    private Page<Product> paginate(List<Product> list, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());
        List<Product> pageContent = (start <= end && start < list.size()) ? list.subList(start, end) : Collections.emptyList();
        return new PageImpl<>(pageContent, pageable, list.size());
    }

    @lombok.Value
    private static class ScoredProduct {
        Product product;
        double score;
    }
}
