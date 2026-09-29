package com.scrollshop.repository;

import com.scrollshop.entity.GiftWishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GiftWishlistRepository extends JpaRepository<GiftWishlist, Long> {
    List<GiftWishlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<GiftWishlist> findByUserIdAndIsPublicTrueOrderByCreatedAtDesc(Long userId);
    Optional<GiftWishlist> findByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
}
