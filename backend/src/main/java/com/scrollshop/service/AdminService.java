package com.scrollshop.service;

import com.scrollshop.dto.AdminDtos.*;
import com.scrollshop.dto.AuthDtos.UserProfileDto;
import com.scrollshop.dto.CartAndOrderDtos.OrderDto;
import com.scrollshop.dto.ProductDtos.CreateProductRequest;
import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.entity.Order;
import com.scrollshop.entity.OrderStatus;
import com.scrollshop.entity.Product;
import com.scrollshop.entity.User;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ShoppingVideoRepository videoRepository;
    private final AuthService authService;
    private final ProductService productService;
    private final OrderService orderService;

    public AdminDashboardStatsDto getDashboardStats() {
        long userCount = userRepository.count();
        long productCount = productRepository.count();
        long orderCount = orderRepository.count();
        long videoCount = videoRepository.count();

        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long paidOrders = orderRepository.countByStatus(OrderStatus.PAID);

        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.SHIPPED || o.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminDashboardStatsDto.builder()
                .totalUsers(userCount)
                .totalProducts(productCount)
                .totalOrders(orderCount)
                .totalVideos(videoCount)
                .totalRevenue(totalRevenue)
                .pendingOrders(pendingOrders)
                .paidOrders(paidOrders)
                .build();
    }

    public Page<OrderDto> getOrders(OrderStatus status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = (status != null) ?
                orderRepository.findByStatus(status, pageRequest) :
                orderRepository.findAll(pageRequest);

        return orderPage.map(orderService::toOrderDto);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(request.getStatus());
        return orderService.toOrderDto(orderRepository.save(order));
    }

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(u -> authService.getProfile(null, u.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserProfileDto updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setRole(request.getRole());
        userRepository.save(user);
        return authService.getProfile(null, user.getId());
    }

    @Transactional
    public ProductDto updateProductStock(Long productId, int newStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        product.setStockQuantity(newStock);
        return productService.toProductDto(productRepository.save(product), null);
    }

    public ProductDto createProduct(CreateProductRequest request) {
        return productService.createProduct(request);
    }

    public ProductDto updateProduct(Long productId, CreateProductRequest request) {
        return productService.updateProduct(productId, request);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        productRepository.delete(product);
    }
}
