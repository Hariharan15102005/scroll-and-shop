package com.scrollshop.service;

import com.scrollshop.dto.GiftDtos.*;
import com.scrollshop.dto.ProductDtos.ProductDto;
import com.scrollshop.entity.GiftWishlist;
import com.scrollshop.entity.Product;
import com.scrollshop.entity.User;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.FriendshipRepository;
import com.scrollshop.repository.GiftWishlistRepository;
import com.scrollshop.repository.ProductRepository;
import com.scrollshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GiftService {

    private final GiftWishlistRepository giftWishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final ProductService productService;
    private final RecommendationService recommendationService;

    public List<GiftWishlistDto> getUserWishlist(User user) {
        return giftWishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toWishlistDto)
                .collect(Collectors.toList());
    }

    public List<GiftWishlistDto> getFriendWishlist(User currentUser, Long friendId) {
        if (!friendshipRepository.existsByUserIdAndFriendId(currentUser.getId(), friendId)) {
            throw new BadRequestException("You can only view gift wishlists of accepted friends");
        }

        return giftWishlistRepository.findByUserIdAndIsPublicTrueOrderByCreatedAtDesc(friendId).stream()
                .map(this::toWishlistDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public GiftWishlistDto addToWishlist(User user, AddToWishlistRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Optional<GiftWishlist> existing = giftWishlistRepository.findByUserIdAndProductId(user.getId(), product.getId());
        if (existing.isPresent()) {
            GiftWishlist item = existing.get();
            item.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
            return toWishlistDto(giftWishlistRepository.save(item));
        }

        GiftWishlist item = GiftWishlist.builder()
                .user(user)
                .product(product)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .isReserved(false)
                .build();

        return toWishlistDto(giftWishlistRepository.save(item));
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        giftWishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    @Transactional
    public GiftWishlistDto reserveWishlistItem(User currentUser, Long wishlistId) {
        GiftWishlist item = giftWishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist Item", "id", wishlistId));

        if (!friendshipRepository.existsByUserIdAndFriendId(currentUser.getId(), item.getUser().getId())) {
            throw new BadRequestException("You can only reserve gifts for friends");
        }

        if (Boolean.TRUE.equals(item.getIsReserved()) && item.getReservedBy() != null && !item.getReservedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("This gift is already reserved by another friend");
        }

        boolean willBeReserved = !Boolean.TRUE.equals(item.getIsReserved());
        item.setIsReserved(willBeReserved);
        item.setReservedBy(willBeReserved ? currentUser : null);

        return toWishlistDto(giftWishlistRepository.save(item));
    }

    public FriendGiftIdeasDto getGiftIdeasForFriend(User currentUser, Long friendId) {
        if (!friendshipRepository.existsByUserIdAndFriendId(currentUser.getId(), friendId)) {
            throw new BadRequestException("You can only get gift suggestions for connected friends");
        }

        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend", "id", friendId));

        List<GiftWishlistDto> wishlist = giftWishlistRepository.findByUserIdAndIsPublicTrueOrderByCreatedAtDesc(friendId).stream()
                .map(this::toWishlistDto)
                .collect(Collectors.toList());

        List<ProductDto> recommendedGifts = recommendationService.getRecommendedProducts(friend, 8);

        return FriendGiftIdeasDto.builder()
                .friendId(friend.getId())
                .friendUsername(friend.getUsername())
                .friendFullName(friend.getFullName())
                .friendAvatar(friend.getAvatarUrl())
                .wishlistItems(wishlist)
                .recommendedGifts(recommendedGifts)
                .build();
    }

    private GiftWishlistDto toWishlistDto(GiftWishlist gw) {
        return GiftWishlistDto.builder()
                .id(gw.getId())
                .userId(gw.getUser().getId())
                .username(gw.getUser().getUsername())
                .product(productService.toProductDto(gw.getProduct(), null))
                .isPublic(gw.getIsPublic())
                .isReserved(gw.getIsReserved())
                .reservedByUserId(gw.getReservedBy() != null ? gw.getReservedBy().getId() : null)
                .reservedByUsername(gw.getReservedBy() != null ? gw.getReservedBy().getUsername() : null)
                .createdAt(gw.getCreatedAt())
                .build();
    }
}
