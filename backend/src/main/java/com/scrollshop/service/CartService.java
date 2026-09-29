package com.scrollshop.service;

import com.scrollshop.dto.CartAndOrderDtos.*;
import com.scrollshop.entity.CartItem;
import com.scrollshop.entity.InteractionType;
import com.scrollshop.entity.Product;
import com.scrollshop.entity.User;
import com.scrollshop.entity.UserInteraction;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.CartItemRepository;
import com.scrollshop.repository.ProductRepository;
import com.scrollshop.repository.UserInteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserInteractionRepository userInteractionRepository;

    public CartSummaryDto getCartSummary(User user) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        List<CartItemDto> itemDtos = items.stream().map(item -> {
            BigDecimal unitPrice = item.getProduct().getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            return CartItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productTitle(item.getProduct().getTitle())
                    .productSlug(item.getProduct().getSlug())
                    .productImageUrl(item.getProduct().getMainImageUrl())
                    .unitPrice(unitPrice)
                    .quantity(item.getQuantity())
                    .stockQuantity(item.getProduct().getStockQuantity())
                    .itemTotal(itemTotal)
                    .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = itemDtos.stream()
                .map(CartItemDto::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Free shipping for orders over 1000 INR, else 99 INR
        BigDecimal estimatedShipping = (subtotal.compareTo(BigDecimal.valueOf(1000)) >= 0 || subtotal.compareTo(BigDecimal.ZERO) == 0)
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(99.00);

        // Standard 18% GST calculation
        BigDecimal estimatedTax = subtotal.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(estimatedShipping).add(estimatedTax);

        int totalCount = items.stream().mapToInt(CartItem::getQuantity).sum();

        return CartSummaryDto.builder()
                .items(itemDtos)
                .subtotal(subtotal)
                .estimatedShipping(estimatedShipping)
                .estimatedTax(estimatedTax)
                .total(total)
                .totalItemCount(totalCount)
                .build();
    }

    @Transactional
    public CartSummaryDto addToCart(User user, AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Total quantity in cart cannot exceed available stock (" + product.getStockQuantity() + ")");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(item);
        }

        // Record SAVE interaction for recommendation engine
        if (Boolean.TRUE.equals(user.getIsPersonalizationEnabled())) {
            UserInteraction interaction = UserInteraction.builder()
                    .user(user)
                    .product(product)
                    .interactionType(InteractionType.SAVE)
                    .weight(InteractionType.SAVE.getBaseWeight())
                    .build();
            userInteractionRepository.save(interaction);
        }

        return getCartSummary(user);
    }

    @Transactional
    public CartSummaryDto updateCartItem(User user, Long cartItemId, UpdateCartRequest request) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        if (request.getQuantity() > item.getProduct().getStockQuantity()) {
            throw new BadRequestException("Quantity exceeds available stock (" + item.getProduct().getStockQuantity() + ")");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return getCartSummary(user);
    }

    @Transactional
    public CartSummaryDto removeCartItem(User user, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(item);
        return getCartSummary(user);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUserId(user.getId());
    }
}
