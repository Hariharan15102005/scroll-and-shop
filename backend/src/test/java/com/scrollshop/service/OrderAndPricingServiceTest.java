package com.scrollshop.service;

import com.scrollshop.dto.CartAndOrderDtos.CheckoutRequest;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderAndPricingServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserInteractionRepository userInteractionRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Product testProduct;
    private CartItem testCartItem;
    private CheckoutRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("testuser").build();
        testProduct = Product.builder()
                .id(100L)
                .title("Test Headphones")
                .price(new BigDecimal("1000.00")) // Trusted DB price
                .stockQuantity(10)
                .mainImageUrl("https://image.url")
                .build();

        testCartItem = CartItem.builder()
                .id(50L)
                .user(testUser)
                .product(testProduct)
                .quantity(2)
                .build();

        checkoutRequest = CheckoutRequest.builder()
                .shippingName("John Doe")
                .shippingAddressLine1("123 Main St")
                .shippingCity("Bangalore")
                .shippingState("Karnataka")
                .shippingPostalCode("560001")
                .shippingPhone("9876543210")
                .isGift(false)
                .build();
    }

    @Test
    void createOrder_CalculatesPricingStrictlyFromDatabase() {
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testCartItem));

        Order mockOrder = Order.builder().id(200L).orderNumber("SNS-TEST").user(testUser).build();
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderItem mockOrderItem = OrderItem.builder().id(300L).build();
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(mockOrderItem);

        Order createdOrder = orderService.createOrder(testUser, checkoutRequest);

        assertNotNull(createdOrder);
        // Subtotal = 2 items * 1000 = 2000.00
        assertEquals(new BigDecimal("2000.00"), createdOrder.getSubtotalAmount());
        // Subtotal >= 1000 => free shipping
        assertEquals(BigDecimal.ZERO, createdOrder.getShippingFee());
        // Tax = 18% of 2000 = 360.00
        assertEquals(new BigDecimal("360.00"), createdOrder.getTaxAmount());
        // Total = 2000 + 0 + 360 = 2360.00
        assertEquals(new BigDecimal("2360.00"), createdOrder.getTotalAmount());

        verify(cartItemRepository, times(1)).deleteByUserId(1L);
    }

    @Test
    void createOrder_ExceedsStock_ThrowsBadRequestException() {
        testProduct.setStockQuantity(1); // Only 1 available, but cart has 2
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(testCartItem));

        assertThrows(BadRequestException.class, () -> orderService.createOrder(testUser, checkoutRequest));
        verify(orderRepository, never()).save(any(Order.class));
    }
}
