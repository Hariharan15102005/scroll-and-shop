package com.scrollshop.service;

import com.scrollshop.dto.CartAndOrderDtos.AddToCartRequest;
import com.scrollshop.dto.CartAndOrderDtos.CartSummaryDto;
import com.scrollshop.dto.CartAndOrderDtos.UpdateCartRequest;
import com.scrollshop.dto.ProductDtos.CreateProductRequest;
import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.dto.ProductDtos.CreateReviewRequest;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductAndCartServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductLikeRepository productLikeRepository;

    @Mock
    private ProductCommentRepository productCommentRepository;

    @Mock
    private UserInteractionRepository userInteractionRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private com.scrollshop.service.search.ProductSearchEngine productSearchEngine;

    @InjectMocks
    private ProductService productService;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Category testCategory;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("testuser").build();
        testCategory = Category.builder().id(10L).name("Electronics").slug("electronics").build();
        testProduct = Product.builder()
                .id(100L)
                .title("Wireless Earbuds")
                .slug("wireless-earbuds")
                .price(new BigDecimal("1999.00"))
                .originalPrice(new BigDecimal("2999.00"))
                .stockQuantity(15)
                .category(testCategory)
                .mainImageUrl("https://image.url/earbuds.jpg")
                .ratingAverage(4.5)
                .ratingCount(10)
                .isFeatured(true)
                .isDealOfTheDay(false)
                .build();
    }

    @Test
    void searchProducts_ReturnsPagedProductDtos() {
        Page<Product> page = new PageImpl<>(List.of(testProduct));
        when(productRepository.findAll()).thenReturn(List.of(testProduct));
        when(productSearchEngine.searchAndRank(any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        Page<ProductDto> result = productService.searchProducts("earbuds", 10L, BigDecimal.ZERO, new BigDecimal("5000"), "price", "ASC", 0, 10, 1L);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Wireless Earbuds", result.getContent().get(0).getTitle());
    }

    @Test
    void getProduct_InvalidId_ThrowsResourceNotFoundException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());
        when(productRepository.findBySlug("999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductBySlugOrId("999", null, null));
    }

    @Test
    void addReview_DuplicateReview_ThrowsBadRequestException() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(testProduct));
        when(reviewRepository.findByProductIdAndUserId(100L, 1L)).thenReturn(Optional.of(Review.builder().id(1L).build()));

        CreateReviewRequest request = new CreateReviewRequest();
        request.setRating(5);
        request.setTitle("Great!");
        request.setComment("Loved this product.");

        assertThrows(BadRequestException.class, () -> productService.addReview(100L, testUser, request));
    }

    @Test
    void addToCart_Success_UpdatesQuantityAndSubtotal() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByUserIdAndProductId(1L, 100L)).thenReturn(Optional.empty());

        CartItem savedItem = CartItem.builder()
                .id(1L)
                .user(testUser)
                .product(testProduct)
                .quantity(2)
                .build();
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(savedItem);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(savedItem));

        AddToCartRequest req = new AddToCartRequest();
        req.setProductId(100L);
        req.setQuantity(2);

        CartSummaryDto summary = cartService.addToCart(testUser, req);

        assertNotNull(summary);
        assertEquals(1, summary.getItems().size());
        assertEquals(2, summary.getTotalItemCount());
        assertEquals(new BigDecimal("3998.00"), summary.getSubtotal());
    }

    @Test
    void addToCart_ExceedsStock_ThrowsBadRequestException() {
        testProduct.setStockQuantity(2);
        when(productRepository.findById(100L)).thenReturn(Optional.of(testProduct));

        AddToCartRequest req = new AddToCartRequest();
        req.setProductId(100L);
        req.setQuantity(5); // More than stock (2)

        assertThrows(BadRequestException.class, () -> cartService.addToCart(testUser, req));
    }

    @Test
    void updateCartItem_UpdatesQuantityCorrectly() {
        CartItem item = CartItem.builder()
                .id(1L)
                .user(testUser)
                .product(testProduct)
                .quantity(1)
                .build();
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(item);
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(item));

        UpdateCartRequest req = new UpdateCartRequest();
        req.setQuantity(3);

        CartSummaryDto summary = cartService.updateCartItem(testUser, 1L, req);

        assertNotNull(summary);
        assertEquals(3, item.getQuantity());
    }

    @Test
    void toggleLike_AddsAndRemovesLike() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(testProduct));
        when(productLikeRepository.existsByUserIdAndProductId(1L, 100L)).thenReturn(false);
        when(productLikeRepository.countByProductId(100L)).thenReturn(1L);

        var response1 = productService.toggleLike(100L, testUser);
        assertTrue(response1.isLiked());
        assertEquals(1L, response1.getTotalLikes());

        when(productLikeRepository.existsByUserIdAndProductId(1L, 100L)).thenReturn(true);
        when(productLikeRepository.countByProductId(100L)).thenReturn(0L);

        var response2 = productService.toggleLike(100L, testUser);
        assertFalse(response2.isLiked());
        assertEquals(0L, response2.getTotalLikes());
    }

    @Test
    void updateReview_UnauthorizedUser_ThrowsBadRequestException() {
        Review review = Review.builder()
                .id(50L)
                .product(testProduct)
                .user(User.builder().id(2L).username("otheruser").build()) // Owned by user 2
                .rating(4)
                .title("Good")
                .build();

        when(reviewRepository.findById(50L)).thenReturn(Optional.of(review));

        CreateReviewRequest updateReq = new CreateReviewRequest();
        updateReq.setRating(5);
        updateReq.setTitle("Hacked Title");

        // User 1 trying to edit user 2's review
        assertThrows(BadRequestException.class, () -> productService.updateReview(100L, 50L, testUser, updateReq));
    }
}
