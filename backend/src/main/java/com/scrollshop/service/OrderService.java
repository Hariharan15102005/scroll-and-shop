package com.scrollshop.service;

import com.scrollshop.dto.CartAndOrderDtos.*;
import com.scrollshop.entity.*;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final UserInteractionRepository userInteractionRepository;

    @Transactional
    public Order createOrder(User user, CheckoutRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot create order with an empty cart");
        }

        // Validate stock for all products
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Product '" + product.getTitle() + "' only has " + product.getStockQuantity() + " items left in stock.");
            }
        }

        // Calculate pricing strictly on backend
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        String orderNumber = "SNS-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        User giftRecipient = null;
        if (Boolean.TRUE.equals(request.getIsGift()) && request.getGiftRecipientId() != null) {
            giftRecipient = userRepository.findById(request.getGiftRecipientId()).orElse(null);
        }

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(OrderStatus.PENDING)
                .subtotalAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .shippingName(request.getShippingName())
                .shippingAddressLine1(request.getShippingAddressLine1())
                .shippingAddressLine2(request.getShippingAddressLine2())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingPostalCode(request.getShippingPostalCode())
                .shippingPhone(request.getShippingPhone())
                .isGift(Boolean.TRUE.equals(request.getIsGift()))
                .giftRecipient(giftRecipient)
                .giftMessage(request.getGiftMessage())
                .giftWrappingOption(request.getGiftWrappingOption())
                .build();

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal unitPrice = product.getPrice(); // Trusted DB price
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .productTitle(product.getTitle())
                    .productImageUrl(product.getMainImageUrl())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));
        }

        BigDecimal shipping = (subtotal.compareTo(BigDecimal.valueOf(1000)) >= 0) ? BigDecimal.ZERO : BigDecimal.valueOf(99.00);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(shipping).add(tax);

        savedOrder.setSubtotalAmount(subtotal);
        savedOrder.setShippingFee(shipping);
        savedOrder.setTaxAmount(tax);
        savedOrder.setTotalAmount(total);
        savedOrder.setItems(orderItems);

        // Clear user cart once order snapshot is established
        cartItemRepository.deleteByUserId(user.getId());

        return orderRepository.save(savedOrder);
    }

    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getReceivedGifts(Long userId) {
        return orderRepository.findByGiftRecipientIdOrderByCreatedAtDesc(userId).stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.SHIPPED || o.getStatus() == OrderStatus.DELIVERED)
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }

    public OrderDto getOrderById(Long orderId, User currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        boolean isOwner = order.getUser().getId().equals(currentUser.getId());
        boolean isRecipient = order.getGiftRecipient() != null && order.getGiftRecipient().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isOwner && !isRecipient && !isAdmin) {
            throw new BadRequestException("Unauthorized access to order details");
        }

        return toOrderDto(order);
    }

    private final CashbackService cashbackService;

    @Transactional
    public void markOrderAsPaid(Order order, String razorpayPaymentId, String razorpaySignature) {
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        // Record eligible pending purchase cashback on backend
        cashbackService.recordPurchaseCashback(order);

        // Deduct inventory and record PURCHASE interaction
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int remainingStock = Math.max(0, product.getStockQuantity() - item.getQuantity());
            product.setStockQuantity(remainingStock);
            productRepository.save(product);

            if (Boolean.TRUE.equals(order.getUser().getIsPersonalizationEnabled())) {
                UserInteraction interaction = UserInteraction.builder()
                        .user(order.getUser())
                        .product(product)
                        .interactionType(InteractionType.PURCHASE)
                        .weight(InteractionType.PURCHASE.getBaseWeight())
                        .build();
                userInteractionRepository.save(interaction);
            }
        }
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, User currentUser, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new BadRequestException("Unauthorized to cancel this order");
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel an order that is already " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Reverse cashback for cancelled order
        cashbackService.reversePurchaseCashback(order, reason != null ? reason : "Order cancelled by customer");

        return toOrderDto(order);
    }

    public OrderDto toOrderDto(Order order) {
        List<OrderItemDto> itemDtos = (order.getItems() != null) ?
                order.getItems().stream().map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productTitle(item.getProductTitle())
                        .productImageUrl(item.getProductImageUrl())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build()).collect(Collectors.toList()) :
                List.of();

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .taxAmount(order.getTaxAmount())
                .shippingName(order.getShippingName())
                .shippingAddressLine1(order.getShippingAddressLine1())
                .shippingAddressLine2(order.getShippingAddressLine2())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingPhone(order.getShippingPhone())
                .isGift(order.getIsGift())
                .giftRecipientId(order.getGiftRecipient() != null ? order.getGiftRecipient().getId() : null)
                .giftRecipientUsername(order.getGiftRecipient() != null ? order.getGiftRecipient().getUsername() : null)
                .giftMessage(order.getGiftMessage())
                .giftWrappingOption(order.getGiftWrappingOption())
                .items(itemDtos)
                .paymentStatus(payment != null ? payment.getPaymentStatus().name() : "PENDING")
                .razorpayOrderId(payment != null ? payment.getRazorpayOrderId() : null)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
