package com.scrollshop.service;

import com.scrollshop.dto.ProductDtos.*;
import com.scrollshop.dto.SocialDtos.*;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.*;
import com.scrollshop.service.search.ProductSearchEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository;
    private final ProductLikeRepository productLikeRepository;
    private final ProductCommentRepository productCommentRepository;
    private final UserInteractionRepository userInteractionRepository;
    private final ProductSearchEngine productSearchEngine;

    public Page<ProductDto> searchProducts(
            String query,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            String sortDirection,
            int page,
            int size,
            Long currentUserId) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection != null ? sortDirection : "DESC"), 
                sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        List<Product> allProducts = productRepository.findAll();
        Page<Product> productPage = productSearchEngine.searchAndRank(
                allProducts,
                query,
                categoryId,
                minPrice,
                maxPrice,
                sortBy,
                sortDirection,
                pageable
        );

        return productPage.map(product -> toProductDto(product, currentUserId));
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getFeaturedProducts(Long currentUserId) {
        return productRepository.findByIsFeaturedTrue().stream()
                .map(p -> toProductDto(p, currentUserId))
                .collect(Collectors.toList());
    }

    public List<ProductDto> getDealsOfTheDay(Long currentUserId) {
        return productRepository.findByIsDealOfTheDayTrue().stream()
                .map(p -> toProductDto(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto getProductBySlugOrId(String identifier, Long currentUserId, User user) {
        Product product;
        try {
            Long id = Long.parseLong(identifier);
            product = productRepository.findById(id)
                    .orElseGet(() -> productRepository.findBySlug(identifier)
                            .orElseThrow(() -> new ResourceNotFoundException("Product", "identifier", identifier)));
        } catch (NumberFormatException e) {
            product = productRepository.findBySlug(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", identifier));
        }

        // Record interaction if user is logged in and personalization is enabled
        if (user != null && Boolean.TRUE.equals(user.getIsPersonalizationEnabled())) {
            UserInteraction interaction = UserInteraction.builder()
                    .user(user)
                    .product(product)
                    .interactionType(InteractionType.VIEW)
                    .weight(InteractionType.VIEW.getBaseWeight())
                    .build();
            userInteractionRepository.save(interaction);
        }

        return toProductDto(product, currentUserId);
    }

    @Transactional
    public LikeResponse toggleLike(Long productId, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        boolean exists = productLikeRepository.existsByUserIdAndProductId(user.getId(), productId);
        boolean liked;

        if (exists) {
            productLikeRepository.deleteByUserIdAndProductId(user.getId(), productId);
            liked = false;
        } else {
            ProductLike like = ProductLike.builder()
                    .user(user)
                    .product(product)
                    .build();
            productLikeRepository.save(like);
            liked = true;

            if (Boolean.TRUE.equals(user.getIsPersonalizationEnabled())) {
                UserInteraction interaction = UserInteraction.builder()
                        .user(user)
                        .product(product)
                        .interactionType(InteractionType.LIKE)
                        .weight(InteractionType.LIKE.getBaseWeight())
                        .build();
                userInteractionRepository.save(interaction);
            }
        }

        long count = productLikeRepository.countByProductId(productId);
        return new LikeResponse(liked, count);
    }

    public LikeResponse getProductLikes(Long productId, Long currentUserId) {
        boolean liked = currentUserId != null && productLikeRepository.existsByUserIdAndProductId(currentUserId, productId);
        long count = productLikeRepository.countByProductId(productId);
        return new LikeResponse(liked, count);
    }

    @Transactional
    public LikeResponse removeLike(Long productId, User user) {
        if (productLikeRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            productLikeRepository.deleteByUserIdAndProductId(user.getId(), productId);
        }
        long count = productLikeRepository.countByProductId(productId);
        return new LikeResponse(false, count);
    }

    public List<CommentDto> getProductComments(Long productId) {
        return productCommentRepository.findByProductIdAndParentCommentIsNullOrderByCreatedAtDesc(productId).stream()
                .map(this::toCommentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long productId, User user, CreateCommentRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        ProductComment parent = null;
        if (request.getParentCommentId() != null) {
            parent = productCommentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentCommentId()));
        }

        ProductComment comment = ProductComment.builder()
                .product(product)
                .user(user)
                .parentComment(parent)
                .content(request.getContent().trim())
                .build();

        ProductComment saved = productCommentRepository.save(comment);

        if (Boolean.TRUE.equals(user.getIsPersonalizationEnabled())) {
            UserInteraction interaction = UserInteraction.builder()
                    .user(user)
                    .product(product)
                    .interactionType(InteractionType.SHARE)
                    .weight(InteractionType.SHARE.getBaseWeight())
                    .build();
            userInteractionRepository.save(interaction);
        }

        return toCommentDto(saved);
    }

    @Transactional
    public CommentDto updateComment(Long productId, Long commentId, User user, CreateCommentRequest request) {
        ProductComment comment = productCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getProduct().getId().equals(productId) || !comment.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access or invalid comment for product");
        }

        comment.setContent(request.getContent().trim());
        return toCommentDto(productCommentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long productId, Long commentId, User user) {
        ProductComment comment = productCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getProduct().getId().equals(productId) || (!comment.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN)) {
            throw new BadRequestException("Unauthorized access or invalid comment for product");
        }

        productCommentRepository.delete(comment);
    }

    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toReviewDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto addReview(Long productId, User user, CreateReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (reviewRepository.findByProductIdAndUserId(productId, user.getId()).isPresent()) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .isVerifiedPurchase(true)
                .build();

        Review saved = reviewRepository.save(review);

        // Recalculate average rating
        Double avg = reviewRepository.calculateAverageRating(productId);
        int count = reviewRepository.countByProductId(productId);
        product.setRatingAverage(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setRatingCount(count);
        productRepository.save(product);

        return toReviewDto(saved);
    }

    @Transactional
    public ReviewDto updateReview(Long productId, Long reviewId, User user, CreateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getProduct().getId().equals(productId) || !review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access or invalid review for product");
        }

        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        Review saved = reviewRepository.save(review);

        // Recalculate average rating
        Double avg = reviewRepository.calculateAverageRating(productId);
        int count = reviewRepository.countByProductId(productId);
        Product product = review.getProduct();
        product.setRatingAverage(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setRatingCount(count);
        productRepository.save(product);

        return toReviewDto(saved);
    }

    @Transactional
    public void deleteReview(Long productId, Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getProduct().getId().equals(productId) || (!review.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN)) {
            throw new BadRequestException("Unauthorized access or invalid review for product");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);

        // Recalculate average rating
        Double avg = reviewRepository.calculateAverageRating(productId);
        int count = reviewRepository.countByProductId(productId);
        product.setRatingAverage(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setRatingCount(count);
        productRepository.save(product);
    }

    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        String slug = generateSlug(request.getTitle());

        Product product = Product.builder()
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .stockQuantity(request.getStockQuantity())
                .category(category)
                .brand(request.getBrand())
                .mainImageUrl(request.getMainImageUrl())
                .isFeatured(Boolean.TRUE.equals(request.getIsFeatured()))
                .isDealOfTheDay(Boolean.TRUE.equals(request.getIsDealOfTheDay()))
                .tags(request.getTags())
                .searchKeywords(request.getSearchKeywords())
                .build();

        Product savedProduct = productRepository.save(product);

        if (request.getGalleryImages() != null) {
            int order = 1;
            for (String url : request.getGalleryImages()) {
                ProductImage image = ProductImage.builder()
                        .product(savedProduct)
                        .imageUrl(url)
                        .displayOrder(order++)
                        .build();
                productImageRepository.save(image);
            }
        }
        return toProductDto(savedProduct, null);
    }

    @Transactional
    public ProductDto updateProduct(Long productId, CreateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            product.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getBrand() != null) {
            product.setBrand(request.getBrand());
        }
        if (request.getMainImageUrl() != null) {
            product.setMainImageUrl(request.getMainImageUrl());
        }
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }
        if (request.getIsDealOfTheDay() != null) {
            product.setIsDealOfTheDay(request.getIsDealOfTheDay());
        }
        if (request.getTags() != null) {
            product.setTags(request.getTags());
        }
        if (request.getSearchKeywords() != null) {
            product.setSearchKeywords(request.getSearchKeywords());
        }

        Product updated = productRepository.save(product);
        return toProductDto(updated, null);
    }

    public ProductDto toProductDto(Product product, Long currentUserId) {
        boolean isLiked = currentUserId != null && productLikeRepository.existsByUserIdAndProductId(currentUserId, product.getId());
        long likes = productLikeRepository.countByProductId(product.getId());
        long comments = productCommentRepository.countByProductId(product.getId());

        List<String> gallery = productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId()).stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());

        return ProductDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .stockQuantity(product.getStockQuantity())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .brand(product.getBrand())
                .mainImageUrl(product.getMainImageUrl())
                .galleryImages(gallery)
                .ratingAverage(product.getRatingAverage())
                .ratingCount(product.getRatingCount())
                .isFeatured(product.getIsFeatured())
                .isDealOfTheDay(product.getIsDealOfTheDay())
                .tags(product.getTags())
                .searchKeywords(product.getSearchKeywords())
                .isLikedByCurrentUser(isLiked)
                .likeCount(likes)
                .commentCount(comments)
                .build();
    }

    public CategoryDto toCategoryDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .build();
    }

    public ReviewDto toReviewDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .userAvatar(review.getUser().getAvatarUrl())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public CommentDto toCommentDto(ProductComment comment) {
        List<CommentDto> replies = comment.getReplies() != null ?
                comment.getReplies().stream().map(this::toCommentDto).collect(Collectors.toList()) :
                List.of();

        return CommentDto.builder()
                .id(comment.getId())
                .productId(comment.getProduct().getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .userAvatar(comment.getUser().getAvatarUrl())
                .content(comment.getContent())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .replies(replies)
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private String generateSlug(String title) {
        String base = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        String slug = base;
        int count = 1;
        while (productRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + count++;
        }
        return slug;
    }
}
